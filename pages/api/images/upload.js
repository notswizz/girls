import { createRouter } from 'next-connect';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { ObjectId } from 'mongodb';
import { connectToDatabase, s3 } from '../../../config';
import Image from '../../../models/Image';

// Configure multer for S3 upload
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, 'images/' + uniqueSuffix + '-' + file.originalname);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only images
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Middleware to handle file upload
const uploadMiddleware = upload.single('image');

// Create a router with custom error handlers
const router = createRouter({
  onError: (err, req, res) => {
    console.error('Router error:', err);
    res.status(500).json({ error: 'Server error', message: err.message });
  },
  onNoMatch: (req, res) => {
    res.status(405).json({ error: `Method '${req.method}' not allowed` });
  },
});

// Middleware to authenticate admin access
const authenticateAdmin = async (req, res, next) => {
  // Implement admin authentication here
  // For simplicity, we're skipping it for now
  next();
};

// POST endpoint for uploading images
router.post(async (req, res) => {
  uploadMiddleware(req, res, async function (err) {
    if (err) {
      console.error('Upload middleware error:', err);
      return res.status(400).json({ error: err.message });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      console.log('File uploaded successfully:', req.file);
      
      const { db } = await connectToDatabase();
      
      // Get model information if modelId is provided
      let modelName = '';
      let modelUsername = '';
      const modelId = req.body.modelId;
      
      if (modelId) {
        try {
          const model = await db.collection('models').findOne({ 
            _id: new ObjectId(modelId) 
          });
          
          if (model) {
            modelName = model.name;
            modelUsername = model.username || model.name; // Use username if available, fallback to name
            
            // Increment the image count for this model
            await db.collection('models').updateOne(
              { _id: new ObjectId(modelId) },
              { $inc: { imageCount: 1 } }
            );
          }
        } catch (error) {
          console.error('Error finding model:', error);
          // Continue even if model is not found
        }
      }
      
      // Save image to database
      const imageData = {
        url: req.file.location,
        key: req.file.key,
        name: req.body.name || '',
        description: req.body.description || '',
        modelId: modelId ? new ObjectId(modelId) : null,
        modelName: modelName,
        modelUsername: modelUsername, // Set the username from the model
        createdAt: new Date(),
        isActive: true
      };

      // Create new image record
      const newImage = new Image(imageData);

      // Save to database
      const result = await db.collection('images').insertOne(newImage.toDatabase());
      
      // Send back the created image with id
      res.status(201).json({ 
        message: 'Image uploaded successfully',
        image: {
          id: result.insertedId,
          ...newImage.toDatabase()
        }
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Failed to upload image', message: error.message });
    }
  });
});

// Configure Next.js API to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default router.handler(); 