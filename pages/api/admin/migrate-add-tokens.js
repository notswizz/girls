// Migration script to add tokens and revealHistory to all users
// Usage: node pages/api/admin/migrate-add-tokens.js (or run via custom migration runner)

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri || !dbName) {
  console.error('Missing MONGODB_URI or MONGODB_DB in environment');
  process.exit(1);
}

async function migrate() {
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db(dbName);
    const users = db.collection('users');

    // Update all users: add tokens: 0, revealHistory: [] if not present
    const result = await users.updateMany(
      {
        $or: [
          { tokens: { $exists: false } },
          { revealHistory: { $exists: false } }
        ]
      },
      {
        $set: { tokens: 0, revealHistory: [] }
      }
    );

    console.log(`Migration complete. Modified ${result.modifiedCount} users.`);
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await client.close();
  }
}

migrate();
