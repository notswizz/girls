import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get user session
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: 'You must be logged in' });
  }

  const { predictionId } = req.query;

  if (!predictionId) {
    return res.status(400).json({ error: 'Prediction ID is required' });
  }

  const apiKey = process.env.REPLICATE_API_TOKEN;
  if (!apiKey) {
    return res.status(500).json({ error: 'REPLICATE_API_TOKEN not configured' });
  }

  try {
    const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: { 'Authorization': `Token ${apiKey}` },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to poll prediction' });
    }

    const result = await response.json();

    if (result.status === 'succeeded') {
      const outputUrl = Array.isArray(result.output) ? result.output[0] : result.output;
      return res.status(200).json({
        success: true,
        status: 'succeeded',
        output: outputUrl,
      });
    } else if (result.status === 'failed' || result.status === 'canceled') {
      return res.status(200).json({
        success: false,
        status: result.status,
        error: result.error || 'Generation failed',
      });
    } else {
      // Still processing
      return res.status(200).json({
        success: true,
        status: result.status, // 'starting' or 'processing'
      });
    }
  } catch (error) {
    console.error('Poll error:', error);
    return res.status(500).json({ error: 'Failed to poll prediction' });
  }
}

