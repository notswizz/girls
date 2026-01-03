import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { connectToDatabase } from '../../../config';

// This endpoint queues images for tagging
// It returns immediately and the tagging happens asynchronously
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: 'Must be logged in' });
  }

  const { db } = await connectToDatabase();
  const userId = session.user.id;

  try {
    // Find all images for this user that don't have tags yet
    const untaggedImages = await db.collection('images').find({
      userId: userId,
      tags: { $exists: false },
      isActive: true,
    }).limit(50).toArray();

    if (untaggedImages.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'All images already tagged',
        queued: 0,
      });
    }

    // Queue these for tagging (mark them as pending)
    const imageIds = untaggedImages.map(img => img._id);
    
    await db.collection('images').updateMany(
      { _id: { $in: imageIds } },
      { $set: { taggingStatus: 'pending' } }
    );

    // Start tagging in background (fire and forget)
    // We don't await this - it runs after response is sent
    tagImagesInBackground(untaggedImages.map(img => ({
      id: img._id.toString(),
      url: img.url,
    })));

    return res.status(200).json({
      success: true,
      message: `Queued ${untaggedImages.length} images for tagging`,
      queued: untaggedImages.length,
    });
  } catch (error) {
    console.error('Batch tag error:', error);
    return res.status(500).json({ error: 'Failed to queue images for tagging' });
  }
}

// Background tagging function
async function tagImagesInBackground(images) {
  const apiKey = process.env.REPLICATE_API_TOKEN;
  if (!apiKey) {
    console.error('No REPLICATE_API_TOKEN for background tagging');
    return;
  }

  const { db } = await connectToDatabase();

  for (const image of images) {
    try {
      // Start tagging using image-tagger model with correct API format
      console.log(`Tagging image ${image.id}: ${image.url.substring(0, 50)}...`);
      
      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${apiKey}`,
        },
        body: JSON.stringify({
          version: '5a3e65f223fe2291679a6c3c812ddb278aa6d43bbcf118c09530b4309aaac00e',
          input: { 
            image: image.url 
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to start tagging for ${image.id}: ${response.status} - ${errorText}`);
        continue;
      }

      const prediction = await response.json();
      
      // Poll for result
      let result = prediction;
      let attempts = 0;
      const maxAttempts = 60;

      while (
        result.status !== 'succeeded' && 
        result.status !== 'failed' && 
        result.status !== 'canceled' && 
        attempts < maxAttempts
      ) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const pollResponse = await fetch(
          result.urls?.get || `https://api.replicate.com/v1/predictions/${prediction.id}`,
          { headers: { 'Authorization': `Token ${apiKey}` } }
        );
        
        if (pollResponse.ok) {
          result = await pollResponse.json();
        }
        attempts++;
      }

      if (result.status === 'succeeded' && result.output) {
        const tags = parseTagsFromOutput(result.output);
        
        // Save tags to image
        const { ObjectId } = require('mongodb');
        await db.collection('images').updateOne(
          { _id: new ObjectId(image.id) },
          { 
            $set: { 
              tags: tags,
              taggedAt: new Date(),
              taggingStatus: 'completed',
            } 
          }
        );
        
        console.log(`Tagged image ${image.id}: ${tags.length} tags`);
      } else {
        // Mark as failed
        const { ObjectId } = require('mongodb');
        await db.collection('images').updateOne(
          { _id: new ObjectId(image.id) },
          { $set: { taggingStatus: 'failed' } }
        );
      }

      // Small delay between images to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`Error tagging image ${image.id}:`, error);
    }
  }
}

function parseTagsFromOutput(output) {
  if (typeof output === 'string') {
    const parts = output.split(',').map(s => s.trim()).filter(Boolean);
    return parts.map(part => {
      const match = part.match(/^(.+?)(?::\s*([\d.]+))?$/);
      if (match) {
        return {
          tag: match[1].trim().toLowerCase(),
          confidence: match[2] ? parseFloat(match[2]) : 1.0,
        };
      }
      return { tag: part.toLowerCase(), confidence: 1.0 };
    });
  } else if (typeof output === 'object') {
    if (Array.isArray(output)) {
      return output.map(item => {
        if (typeof item === 'string') {
          return { tag: item.toLowerCase(), confidence: 1.0 };
        }
        return {
          tag: (item.tag || item.label || item.name || '').toLowerCase(),
          confidence: item.confidence || item.score || 1.0,
        };
      });
    }
    return Object.entries(output).map(([tag, confidence]) => ({
      tag: tag.toLowerCase(),
      confidence: typeof confidence === 'number' ? confidence : 1.0,
    }));
  }
  return [];
}

