import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { connectToDatabase } from '../../../config';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageUrl, imageId } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ error: 'Image URL is required' });
  }

  const apiKey = process.env.REPLICATE_API_TOKEN;
  if (!apiKey) {
    return res.status(500).json({ error: 'REPLICATE_API_TOKEN not configured' });
  }

  try {
    // Start the tagging prediction using correct API format
    console.log('Starting image tagging for:', imageUrl.substring(0, 50) + '...');
    
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${apiKey}`,
      },
      body: JSON.stringify({
        version: '5a3e65f223fe2291679a6c3c812ddb278aa6d43bbcf118c09530b4309aaac00e',
        input: {
          image: imageUrl,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Image tagger error:', response.status, errorData);
      return res.status(response.status).json({
        error: 'Tagging failed',
        details: errorData,
      });
    }

    const prediction = await response.json();
    
    // Poll for result (this model is fast, ~32 seconds on CPU)
    const result = await pollPrediction(prediction, apiKey, 60);
    
    if (result.status === 'succeeded' && result.output) {
      // Parse the tags from the output
      const tags = parseTagsFromOutput(result.output);
      
      // If imageId provided, save tags to database
      if (imageId) {
        await saveTagsToImage(imageId, tags);
      }
      
      return res.status(200).json({
        success: true,
        tags: tags,
        rawOutput: result.output,
      });
    } else {
      return res.status(500).json({
        error: 'Tagging failed',
        details: result.error || 'Unknown error',
      });
    }
  } catch (error) {
    console.error('Tagging error:', error);
    return res.status(500).json({
      error: 'Failed to tag image',
      details: error.message,
    });
  }
}

async function pollPrediction(prediction, apiKey, maxAttempts = 60) {
  let result = prediction;
  let attempts = 0;
  
  while (
    result.status !== 'succeeded' && 
    result.status !== 'failed' && 
    result.status !== 'canceled' && 
    attempts < maxAttempts
  ) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const pollUrl = result.urls?.get || `https://api.replicate.com/v1/predictions/${prediction.id}`;
    const pollResponse = await fetch(pollUrl, {
      headers: { 'Authorization': `Token ${apiKey}` },
    });
    
    if (!pollResponse.ok) {
      throw new Error('Failed to poll prediction');
    }
    
    result = await pollResponse.json();
    attempts++;
  }
  
  return result;
}

function parseTagsFromOutput(output) {
  // The image-tagger returns tags as a string or object
  // Parse it into a structured array with confidence scores
  if (typeof output === 'string') {
    // Parse comma-separated tags with optional scores
    // Format might be: "tag1: 0.95, tag2: 0.87" or just "tag1, tag2"
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
    // Handle object format
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
    // Handle dictionary format
    return Object.entries(output).map(([tag, confidence]) => ({
      tag: tag.toLowerCase(),
      confidence: typeof confidence === 'number' ? confidence : 1.0,
    }));
  }
  
  return [];
}

async function saveTagsToImage(imageId, tags) {
  try {
    const { db } = await connectToDatabase();
    
    await db.collection('images').updateOne(
      { _id: new ObjectId(imageId) },
      { 
        $set: { 
          tags: tags,
          taggedAt: new Date(),
        } 
      }
    );
  } catch (error) {
    console.error('Error saving tags:', error);
  }
}

