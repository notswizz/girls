import { MongoClient } from 'mongodb';
import AWS from 'aws-sdk';

// MongoDB configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'hotornot';

// AWS S3 configuration
// Using AWS SDK v2 which is compatible with multer-s3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase(retries = 3) {
  // Check if cached connection is still valid
  if (cachedClient && cachedDb) {
    try {
      // Verify connection is still alive
      await cachedDb.command({ ping: 1 });
      return { client: cachedClient, db: cachedDb };
    } catch (e) {
      // Connection is stale, clear cache and reconnect
      console.log('Cached MongoDB connection stale, reconnecting...');
      cachedClient = null;
      cachedDb = null;
    }
  }

  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const client = await MongoClient.connect(MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        tls: true,
        tlsAllowInvalidCertificates: false,
      });

      const db = client.db(MONGODB_DB);
      
      cachedClient = client;
      cachedDb = db;
      
      return { client, db };
    } catch (error) {
      lastError = error;
      console.log(`MongoDB connection attempt ${attempt}/${retries} failed:`, error.message);
      if (attempt < retries) {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
  
  throw lastError;
}

export {
  connectToDatabase,
  s3,
  MONGODB_URI,
  MONGODB_DB,
}; 