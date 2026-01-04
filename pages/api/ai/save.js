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

  const { url, prompt, type, isExtractedFrame, sourceModelId, sourceModelName } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Prompt is optional - can be empty for extracted frames
  const finalPrompt = prompt || (isExtractedFrame ? 'Extracted video frame' : 'AI Generated');

  try {
    const saveType = isExtractedFrame ? 'image' : (type || 'image');
    console.log(`Saving AI ${saveType} for user ${session.user.id}${isExtractedFrame ? ' (extracted frame)' : ''}`);
    console.log(`Source URL: ${url.substring(0, 100)}...`);
    console.log(`Source Model: ${sourceModelId} (${sourceModelName})`);
    
    // Re-upload to S3 (Replicate URLs are temporary, data URLs need to be uploaded)
    const s3Url = await uploadToS3(url, saveType);
    console.log(`Uploaded to S3: ${s3Url}`);
    
    const savedImage = await saveToAICreations(s3Url, finalPrompt, session.user.id, saveType, sourceModelId, sourceModelName);
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

// Upload content from URL or data URL to S3
async function uploadToS3(sourceUrl, type) {
  let buffer;
  let contentType;
  
  // Check if it's a base64 data URL (from extracted frames)
  if (sourceUrl.startsWith('data:')) {
    // Parse data URL
    const matches = sourceUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      throw new Error('Invalid data URL format');
    }
    
    contentType = matches[1]; // e.g., 'image/jpeg'
    buffer = Buffer.from(matches[2], 'base64');
    console.log(`Uploading base64 data URL, content-type: ${contentType}, size: ${buffer.length} bytes`);
  } else {
    // Fetch the content from URL (Replicate or other)
    const response = await fetch(sourceUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch content: ${response.status}`);
    }
    
    contentType = response.headers.get('content-type') || (type === 'video' ? 'video/mp4' : 'image/png');
    buffer = Buffer.from(await response.arrayBuffer());
  }
  
  // Generate unique filename based on content type
  let extension = 'png';
  if (contentType.includes('jpeg') || contentType.includes('jpg')) {
    extension = 'jpg';
  } else if (contentType.includes('mp4') || type === 'video') {
    extension = 'mp4';
  } else if (contentType.includes('webp')) {
    extension = 'webp';
  }
  
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

// Save generated content to AI creations collection (doesn't participate in ratings)
async function saveToAICreations(url, prompt, userId, type, sourceModelId, sourceModelName) {
  const { db } = await connectToDatabase();
  const { ObjectId } = require('mongodb');
  
  // Save the generated content to the ai_creations collection
  const creationData = {
    url: url,
    prompt: prompt,
    userId: userId,
    createdAt: new Date(),
    isActive: true,
    type: type, // 'image' or 'video'
    // Track source model for filtering
    sourceModelId: sourceModelId ? new ObjectId(sourceModelId) : null,
    sourceModelName: sourceModelName || null,
  };
  
  const insertResult = await db.collection('ai_creations').insertOne(creationData);
  
  return {
    id: insertResult.insertedId,
    ...creationData
  };
}

