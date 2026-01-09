import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// Cost for video generation
const VIDEO_GENERATION_COST = 100;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
    responseLimit: false,
  },
  // Increase timeout for Vercel Pro (won't help on free tier but good to have)
  maxDuration: 60,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get user session
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: 'You must be logged in to generate AI content' });
  }

  const { referenceImage, prompt, mode = 'image' } = req.body;

  // For video generation, check and deduct tokens
  if (mode === 'video') {
    const { db } = await connectToDatabase();
    const users = db.collection('users');
    
    // Get user's current token balance
    let userId;
    try {
      userId = new ObjectId(session.user.id);
    } catch {
      userId = session.user.id;
    }
    
    const user = await users.findOne({ 
      $or: [
        { _id: userId },
        { email: session.user.email }
      ]
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const currentTokens = user.tokens || 0;
    
    if (currentTokens < VIDEO_GENERATION_COST) {
      return res.status(402).json({ 
        error: 'Insufficient tokens',
        message: `Video generation requires ${VIDEO_GENERATION_COST} tokens. You have ${currentTokens} tokens.`,
        required: VIDEO_GENERATION_COST,
        current: currentTokens,
      });
    }
    
    // Deduct tokens before starting generation
    await users.updateOne(
      { _id: user._id },
      { 
        $inc: { 
          tokens: -VIDEO_GENERATION_COST,
          tokensSpent: VIDEO_GENERATION_COST,
        }
      }
    );
    
    console.log(`[AI] Deducted ${VIDEO_GENERATION_COST} tokens from user ${user.email} for video generation`);
  }

  if (!referenceImage) {
    return res.status(400).json({ error: 'Reference image is required' });
  }

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const apiKey = process.env.REPLICATE_API_TOKEN;
  if (!apiKey) {
    return res.status(500).json({ error: 'REPLICATE_API_TOKEN not configured in .env' });
  }

  try {
    // Start generation and return prediction ID immediately (non-blocking)
    if (mode === 'video') {
      return await startVideoGeneration(referenceImage, prompt, apiKey, res);
    } else {
      return await startImageGeneration(referenceImage, prompt, apiKey, res);
    }

  } catch (error) {
    console.error('Generation error:', error);
    return res.status(500).json({ 
      error: 'Failed to start generation',
      details: error.message 
    });
  }
}

async function startImageGeneration(referenceImage, prompt, apiKey, res) {
  const response = await fetch('https://api.replicate.com/v1/models/bytedance/seedream-4/predictions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${apiKey}`,
    },
    body: JSON.stringify({
      input: {
        image_input: [referenceImage],
        prompt: prompt,
        size: "2K",
        width: 2048,
        height: 2048,
        max_images: 1,
        aspect_ratio: "1:1",
        enhance_prompt: true,
        sequential_image_generation: "disabled",
        // Disable safety checker
        disable_safety_checker: true,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.log('Seedream 4 error:', errorData);
    
    if (response.status === 429) {
      return res.status(429).json({
        error: 'Rate limited - add credit to Replicate',
        details: 'Free tier has strict limits.',
      });
    }

    return res.status(response.status).json({
      error: 'Image generation failed to start',
      details: errorData,
    });
  }

  const prediction = await response.json();
  
  // Return immediately with prediction ID for polling
  return res.status(200).json({
    success: true,
    status: 'starting',
    predictionId: prediction.id,
    pollUrl: prediction.urls?.get || `https://api.replicate.com/v1/predictions/${prediction.id}`,
    type: 'image',
  });
}

async function startVideoGeneration(referenceImage, prompt, apiKey, res) {
  const response = await fetch('https://api.replicate.com/v1/models/wan-video/wan-2.2-i2v-fast/predictions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${apiKey}`,
    },
    body: JSON.stringify({
      input: {
        image: referenceImage,
        prompt: prompt,
        go_fast: false,
        num_frames: 100,
        resolution: "480p",
        sample_shift: 12,
        frames_per_second: 16,
        interpolate_output: false,
        lora_scale_transformer: 1,
        lora_scale_transformer_2: 1,
        // Disable safety checker
        disable_safety_checker: true,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.log('Wan video error:', errorData);
    
    if (response.status === 429) {
      return res.status(429).json({
        error: 'Rate limited - add credit to Replicate',
        details: 'Free tier has strict limits.',
      });
    }

    return res.status(response.status).json({
      error: 'Video generation failed to start',
      details: errorData,
    });
  }

  const prediction = await response.json();
  
  // Return immediately with prediction ID for polling
  return res.status(200).json({
    success: true,
    status: 'starting',
    predictionId: prediction.id,
    pollUrl: prediction.urls?.get || `https://api.replicate.com/v1/predictions/${prediction.id}`,
    type: 'video',
  });
}
