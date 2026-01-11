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
        let publicModels = null;
        
        // Filter by user unless allUsers is explicitly requested (for public views)
        // If user is logged in and not requesting all users, filter by their userId
        if (session?.user?.id && allUsers !== 'true') {
          query.userId = session.user.id;
        } else {
          // For public views (homepage, not logged in), only show images from PUBLIC models
          // Only fetch public models (not all models) - much faster query
          publicModels = await db.collection('models')
            .find({ isActive: true, isPublic: { $ne: false } })
            .project({ _id: 1, username: 1 }) // Only fetch needed fields
            .toArray();
          
          const publicModelIds = publicModels.map(m => m._id);
          const publicModelIdsStr = publicModels.map(m => m._id.toString());
          
          // Only show images from public models
          query.$or = [
            { modelId: { $in: publicModelIds } },
            { modelId: { $in: publicModelIdsStr } }
          ];
          
          // Also exclude AI generated content from public view
          query.$and = query.$and || [];
          query.$and.push({
            $or: [
              { isAIGenerated: { $exists: false } },
              { isAIGenerated: false },
              { isAIGenerated: null }
            ]
          });
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
        let images = await db
          .collection('images')
          .find(query)
          .sort(sortOptions)
          .skip(numOffset)
          .limit(numLimit)
          .toArray();
        
        // Add model username for public views
        if (publicModels) {
          const modelMap = {};
          publicModels.forEach(m => {
            modelMap[m._id.toString()] = m;
          });
          
          images = images.map(img => {
            const imgModelId = img.modelId?.toString() || img.modelId;
            return {
              ...img,
              modelUsername: modelMap[imgModelId]?.username || null
            };
          });
        }
        
        // Add cache headers for public views (1 minute cache)
        if (allUsers === 'true') {
          res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
        }
        
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