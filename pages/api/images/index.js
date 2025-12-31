import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../../config';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { db } = await connectToDatabase();
        
        // Get user session
        const session = await getServerSession(req, res, authOptions);
        
        // Parse query parameters
        const { modelId, limit = 100, offset = 0, sort = 'newest', allUsers = 'false' } = req.query;
        
        // Build query object
        const query = { isActive: true };
        
        // Filter by user unless allUsers is explicitly requested (for public views)
        // If user is logged in and not requesting all users, filter by their userId
        if (session?.user?.id && allUsers !== 'true') {
          query.userId = session.user.id;
        }
        
        // Add modelId filter if provided
        if (modelId) {
          try {
            query.modelId = new ObjectId(modelId);
          } catch (err) {
            return res.status(400).json({ success: false, message: 'Invalid model ID format' });
          }
        }
        
        // Determine sort order
        let sortOptions = { createdAt: -1 }; // default newest first
        
        switch (sort) {
          case 'oldest':
            sortOptions = { createdAt: 1 };
            break;
          case 'highest-elo':
            sortOptions = { elo: -1 };
            break;
          case 'lowest-elo':
            sortOptions = { elo: 1 };
            break;
          case 'most-wins':
            sortOptions = { wins: -1 };
            break;
          case 'best-win-rate':
            sortOptions = { winRate: -1 };
            break;
          // default is already set to newest
        }
        
        // Convert limit and offset to numbers
        const numLimit = parseInt(limit, 10);
        const numOffset = parseInt(offset, 10);
        
        // Get total count for pagination
        const total = await db.collection('images').countDocuments(query);
        
        // Fetch images
        const images = await db
          .collection('images')
          .find(query)
          .sort(sortOptions)
          .skip(numOffset)
          .limit(numLimit)
          .toArray();
        
        return res.status(200).json({
          success: true,
          images,
          pagination: {
            total,
            limit: numLimit,
            offset: numOffset,
            hasMore: total > numOffset + numLimit
          }
        });
      } catch (error) {
        console.error('Error fetching images:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch images' });
      }
      break;
      
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
} 