import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { connectToDatabase } from '../../../config';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get user session
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: 'You must be logged in to view creations' });
  }

  const { modelId, type, limit = 50, skip = 0, favoritesFirst, sortBy = 'recent' } = req.query;

  try {
    const { db } = await connectToDatabase();
    
    // Fetch from BOTH the new ai_creations collection AND the old images collection
    // (for backwards compatibility with previously saved AI content)
    
    // 1. Query for new ai_creations collection
    // Exclude extensions (videos with parentVideoId) - they'll be nested under parents
    const newQuery = {
      userId: session.user.id,
      isActive: { $ne: false },
      parentVideoId: { $eq: null } // Only get root videos, not extensions
    };

    // Filter by source model if specified
    if (modelId && modelId !== 'all') {
      newQuery.sourceModelId = new ObjectId(modelId);
    }

    // Filter by type (image/video)
    if (type && type !== 'all') {
      newQuery.type = type;
    }

    // 2. Query for old images collection (AI generated content)
    const oldQuery = {
      userId: session.user.id,
      isAIGenerated: true,
      isActive: { $ne: false }
    };

    // For old images, filter by aiType if type specified
    if (type && type !== 'all') {
      oldQuery.aiType = type;
    }

    // Fetch from both collections in parallel
    const [newCreations, oldCreations, allExtensions, userVotes] = await Promise.all([
      db.collection('ai_creations')
        .find(newQuery)
        .sort({ createdAt: -1 })
        .toArray(),
      db.collection('images')
        .find(oldQuery)
        .sort({ createdAt: -1 })
        .toArray(),
      // Fetch all extensions for this user to attach to parent videos
      db.collection('ai_creations')
        .find({ 
          userId: session.user.id, 
          parentVideoId: { $ne: null },
          isActive: { $ne: false }
        })
        .sort({ createdAt: 1 }) // Sort by creation order for playlist
        .toArray(),
      // Fetch user's votes on all creations
      db.collection('creation_votes')
        .find({ voterId: session.user.id })
        .toArray()
    ]);

    // Create a map of user's votes by creation ID
    const userVoteMap = {};
    for (const v of userVotes) {
      userVoteMap[v.creationId.toString()] = v.vote;
    }

    // Create a map of extensions by parent video ID
    const extensionsByParent = {};
    for (const ext of allExtensions) {
      const parentId = ext.parentVideoId.toString();
      if (!extensionsByParent[parentId]) {
        extensionsByParent[parentId] = [];
      }
      extensionsByParent[parentId].push(ext);
    }

    // Attach extensions to their parent videos + add vote data
    const newCreationsWithExtensions = newCreations.map(creation => ({
      ...creation,
      extensions: extensionsByParent[creation._id.toString()] || [],
      upvotes: creation.upvotes || 0,
      downvotes: creation.downvotes || 0,
      score: (creation.upvotes || 0) - (creation.downvotes || 0),
      userVote: userVoteMap[creation._id.toString()] || 0
    }));

    // Normalize old creations to match new format
    const normalizedOldCreations = oldCreations.map(img => ({
      _id: img._id,
      url: img.url,
      prompt: img.description || img.name || 'AI Generated',
      userId: img.userId,
      createdAt: img.createdAt,
      isActive: img.isActive,
      type: img.aiType || 'image',
      isFavorite: img.isFavorite || false,
      // Old creations don't have source model tracking
      sourceModelId: null,
      sourceModelName: null,
      // Mark as legacy for potential migration
      _isLegacy: true,
      // Vote data (legacy items start with 0)
      upvotes: 0,
      downvotes: 0,
      score: 0,
      userVote: userVoteMap[img._id.toString()] || 0
    }));

    // Merge all creations
    let allCreations = [...newCreationsWithExtensions, ...normalizedOldCreations];
    
    // Sort based on sortBy parameter
    if (sortBy === 'votes' || sortBy === 'upvotes') {
      // Sort by upvotes/score (highest first)
      allCreations.sort((a, b) => {
        const scoreDiff = (b.score || 0) - (a.score || 0);
        if (scoreDiff !== 0) return scoreDiff;
        // Tie-breaker: more total votes first
        const totalVotesA = (a.upvotes || 0) + (a.downvotes || 0);
        const totalVotesB = (b.upvotes || 0) + (b.downvotes || 0);
        if (totalVotesB !== totalVotesA) return totalVotesB - totalVotesA;
        // Final tie-breaker: date
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    } else if (favoritesFirst === 'true') {
      allCreations.sort((a, b) => {
        // Favorites first
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        // Then by date
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    } else {
      // Default: recent first
      allCreations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Apply pagination
    const paginatedCreations = allCreations.slice(parseInt(skip), parseInt(skip) + parseInt(limit));
    const total = allCreations.length;

    // Get unique source models for filter dropdown (only from new creations)
    const sourceModels = await db.collection('ai_creations').aggregate([
      { $match: { userId: session.user.id, sourceModelId: { $ne: null } } },
      { $group: { _id: '$sourceModelId', name: { $first: '$sourceModelName' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    return res.status(200).json({
      creations: paginatedCreations,
      total,
      sourceModels: sourceModels.map(m => ({
        id: m._id.toString(),
        name: m.name,
        count: m.count
      }))
    });
  } catch (error) {
    console.error('Error fetching AI creations:', error);
    return res.status(500).json({ error: 'Failed to fetch creations' });
  }
}
