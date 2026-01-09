import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export const config = {
  api: {
    responseLimit: '50mb',
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { videoUrl } = req.body;

  if (!videoUrl) {
    return res.status(400).json({ error: 'Video URL is required' });
  }

  try {
    console.log('[Extract Frame Proxy] Fetching video from:', videoUrl);
    
    // Fetch the video with appropriate headers
    const videoResponse = await fetch(videoUrl, {
      headers: {
        'Accept': 'video/mp4,video/*',
      }
    });
    
    if (!videoResponse.ok) {
      throw new Error(`Failed to fetch video: ${videoResponse.status}`);
    }

    const contentType = videoResponse.headers.get('content-type');
    const videoBuffer = await videoResponse.arrayBuffer();
    console.log('[Extract Frame Proxy] Video fetched, size:', videoBuffer.byteLength, 'type:', contentType);

    // Convert video buffer to base64 data URL for client to use
    // This is a workaround - ideally we'd use ffmpeg to extract the actual last frame
    // But for now, we return the video as a data URL which the client can then process
    
    // Actually, let's try a different approach - fetch just the last portion of the video
    // For most short AI videos, the whole thing is small enough to convert
    
    const base64 = Buffer.from(videoBuffer).toString('base64');
    const dataUrl = `data:${contentType || 'video/mp4'};base64,${base64}`;
    
    console.log('[Extract Frame Proxy] Returning video as data URL');
    
    return res.status(200).json({ 
      success: true,
      // Return as video data URL - client will handle frame extraction
      videoDataUrl: dataUrl,
      frameUrl: null // Client needs to extract frame from video data URL
    });

  } catch (error) {
    console.error('[Extract Frame Proxy] Error:', error);
    return res.status(500).json({ 
      error: 'Failed to proxy video',
      details: error.message 
    });
  }
}

