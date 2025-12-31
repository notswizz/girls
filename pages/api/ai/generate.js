import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

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
    return res.status(401).json({ error: 'You must be logged in to generate AI content' });
  }

  const { referenceImage, prompt, mode = 'image' } = req.body;

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
    // Choose model based on mode
    if (mode === 'video') {
      return await generateVideo(referenceImage, prompt, apiKey, res);
    } else {
      return await generateImage(referenceImage, prompt, apiKey, res);
    }

  } catch (error) {
    console.error('Generation error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate',
      details: error.message 
    });
  }
}

async function generateImage(referenceImage, prompt, apiKey, res) {
  const response = await fetch('https://api.replicate.com/v1/models/bytedance/seedream-4/predictions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
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
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.log('Seedream 4 error:', errorData);
    
    if (response.status === 429) {
      const parsed = JSON.parse(errorData);
      const waitTime = (parsed.retry_after || 3) + 1;
      
      console.log(`Rate limited, waiting ${waitTime}s and retrying...`);
      await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
      
      const retryResponse = await fetch('https://api.replicate.com/v1/models/bytedance/seedream-4/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
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
          },
        }),
      });

      if (!retryResponse.ok) {
        return res.status(429).json({
          error: 'Rate limited - add credit to Replicate',
          details: 'Free tier has strict limits.',
        });
      }

      const retryPrediction = await retryResponse.json();
      const retryResult = await pollPrediction(retryPrediction, apiKey);
      
      if (retryResult.status === 'succeeded') {
        const outputUrl = Array.isArray(retryResult.output) ? retryResult.output[0] : retryResult.output;
        return res.status(200).json({
          success: true,
          output: outputUrl,
          type: 'image',
        });
      }
    }

    return res.status(response.status).json({
      error: 'Image generation failed',
      details: errorData,
    });
  }

  const prediction = await response.json();
  const result = await pollPrediction(prediction, apiKey);
  
  if (result.status === 'succeeded') {
    const outputUrl = Array.isArray(result.output) ? result.output[0] : result.output;
    return res.status(200).json({
      success: true,
      output: outputUrl,
      type: 'image',
    });
  } else {
    return res.status(500).json({
      error: 'Image generation failed',
      details: result.error,
    });
  }
}

async function generateVideo(referenceImage, prompt, apiKey, res) {
  // Use Wan 2.2 i2v fast model for image-to-video
  const response = await fetch('https://api.replicate.com/v1/models/wan-video/wan-2.2-i2v-fast/predictions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
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
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.log('Wan video error:', errorData);
    
    if (response.status === 429) {
      const parsed = JSON.parse(errorData);
      return res.status(429).json({
        error: 'Rate limited - add credit to Replicate',
        details: `Try again in ${parsed.retry_after || 10} seconds`,
      });
    }

    return res.status(response.status).json({
      error: 'Video generation failed',
      details: errorData,
    });
  }

  const prediction = await response.json();
  const result = await pollPrediction(prediction, apiKey, 300); // 5 min timeout for video
  
  if (result.status === 'succeeded') {
    const outputUrl = Array.isArray(result.output) ? result.output[0] : result.output;
    return res.status(200).json({
      success: true,
      output: outputUrl,
      type: 'video',
    });
  } else {
    return res.status(500).json({
      error: 'Video generation failed',
      details: result.error,
    });
  }
}

async function pollPrediction(prediction, apiKey, maxAttempts = 180) {
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
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    
    if (!pollResponse.ok) {
      throw new Error('Failed to poll prediction');
    }
    
    result = await pollResponse.json();
    attempts++;
  }
  
  return result;
}
