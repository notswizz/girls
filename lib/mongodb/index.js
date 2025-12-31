import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

if (!process.env.MONGODB_DB) {
  throw new Error('Please define the MONGODB_DB environment variable');
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

const options = {};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise for the adapter
export default clientPromise;

let cachedDb = null;

export async function connectToDatabase() {
  const client = await clientPromise;
  
  if (cachedDb) {
    return { client, db: cachedDb };
  }

  const db = client.db(dbName);
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