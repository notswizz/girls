import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

if (!process.env.MONGODB_DB) {
  throw new Error('Please define the MONGODB_DB environment variable');
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  // If we already have a connection, use it
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // Connect to MongoDB
  const client = await MongoClient.connect(uri, {
    // useNewUrlParser and useUnifiedTopology are deprecated in the latest MongoDB driver
  });

  const db = client.db(dbName);

  // Cache the client and db for reuse
  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

// Helper function to get a specific collection
export async function getCollection(collectionName) {
  const { db } = await connectToDatabase();
  return db.collection(collectionName);
}

// Helper function for database operations
export async function dbOperation(collectionName, operation) {
  try {
    const collection = await getCollection(collectionName);
    return await operation(collection);
  } catch (error) {
    console.error(`Error in database operation on ${collectionName}:`, error);
    throw error;
  }
} 