import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../../config';
import Image from '../../../models/Image';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { db } = await connectToDatabase();
    const { imageId, score, userId = 'anonymous' } = req.body;

    // Validate input
    if (!imageId || !score || score < 1 || score > 3) {
      return res.status(400).json({ 
        error: 'Invalid input', 
        message: 'ImageId and score (1-3) are required' 
      });
    }

    // Convert string ID to ObjectId
    let objectId;
    try {
      objectId = new ObjectId(imageId);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid image ID format' });
    }

    // Find the image in the database
    const imageData = await db.collection('images').findOne({ _id: objectId });
    
    if (!imageData) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Create Image instance with found data
    const image = new Image({
      id: imageData._id,
      ...imageData
    });

    // Add the new rating
    image.addRating(userId, parseInt(score));

    // Update in database
    await db.collection('images').updateOne(
      { _id: objectId },
      { 
        $set: {
          ratings: image.ratings,
          totalScore: image.totalScore,
          averageScore: image.averageScore,
          timesRated: image.timesRated
        } 
      }
    );

    res.status(200).json({ 
      message: 'Rating submitted successfully',
      imageId,
      newScore: image.averageScore,
      totalRatings: image.timesRated
    });
  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
} 