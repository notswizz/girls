import { connectToDatabase } from '../../../config';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { db } = await connectToDatabase();
    
    const users = await db.collection('users').find({}).toArray();
    
    return res.status(200).json({
      success: true,
      count: users.length,
      users: users.map(u => ({
        id: u._id.toString(),
        email: u.email,
        name: u.name
      }))
    });
    
  } catch (error) {
    console.error('Error listing users:', error);
    return res.status(500).json({ error: 'Failed to list users', message: error.message });
  }
}

