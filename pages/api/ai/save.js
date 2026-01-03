import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { connectToDatabase, s3 } from '../../../config';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
    responseLimit: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get user session
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: 'You must be logged in to save AI content' });
  }

  const { url, prompt, type } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    console.log(`Saving AI ${type} for user ${session.user.id}`);
    console.log(`Source URL: ${url.substring(0, 100)}...`);
    
    // Re-upload to S3 (Replicate URLs are temporary)
    const s3Url = await uploadToS3(url, type || 'image');
    console.log(`Uploaded to S3: ${s3Url}`);
    
    const savedImage = await saveToAIModel(s3Url, prompt, session.user.id, type || 'image');
    return res.status(200).json({
      success: true,
      savedImage
    });
  } catch (error) {
    console.error('Save error:', error);
    return res.status(500).json({ 
      error: 'Failed to save',
      details: error.message 
    });
  }
}

// Upload content from URL to S3
async function uploadToS3(sourceUrl, type) {
  // Fetch the content from Replicate
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch content: ${response.status}`);
  }
  
  const contentType = response.headers.get('content-type') || (type === 'video' ? 'video/mp4' : 'image/png');
  const buffer = Buffer.from(await response.arrayBuffer());
  
  // Generate unique filename
  const extension = type === 'video' ? 'mp4' : 'png';
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const key = `ai-generated/${uniqueSuffix}.${extension}`;
  
  // Upload to S3
  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  };
  
  await s3.upload(uploadParams).promise();
  
  // Return the S3 URL
  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

// Save generated content to AI model (doesn't participate in ratings)
async function saveToAIModel(url, prompt, userId, type) {
  const { db } = await connectToDatabase();
  
  // Find or create the AI model for this user
  let aiModel = await db.collection('models').findOne({ 
    userId: userId,
    name: 'AI',
    isAIModel: true
  });
  
  if (!aiModel) {
    // Create the AI model
    const newModel = {
      name: 'AI',
      username: 'AI',
      description: 'AI Generated Content',
      userId: userId,
      isActive: true,
      isPublic: false, // AI model is private
      isAIModel: true, // Special flag for AI model
      excludeFromRatings: true, // Exclude from ratings
      createdAt: new Date(),
      imageCount: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      elo: 1200,
      eloHistory: []
    };
    
    const result = await db.collection('models').insertOne(newModel);
    aiModel = { _id: result.insertedId, ...newModel };
  }
  
  // Save the generated content as an image/video
  const imageData = {
    url: url,
    name: prompt.substring(0, 100), // Use prompt as name (truncated)
    description: prompt,
    modelId: aiModel._id,
    modelName: 'AI',
    modelUsername: 'AI',
    userId: userId,
    createdAt: new Date(),
    isActive: true,
    isAIGenerated: true, // Flag for AI generated content
    aiType: type, // 'image' or 'video'
    excludeFromRatings: true, // Exclude from ratings
    averageScore: null,
    timesRated: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    elo: 1200,
    lastOpponents: []
  };
  
  const insertResult = await db.collection('images').insertOne(imageData);
  
  // Update model image count
  await db.collection('models').updateOne(
    { _id: aiModel._id },
    { $inc: { imageCount: 1 } }
  );
  
  return {
    id: insertResult.insertedId,
    ...imageData
  };
}

