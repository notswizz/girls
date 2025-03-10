import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { connectToDatabase } from "./index";

export function getMongoDBAdapter() {
  return MongoDBAdapter(
    // This function should return a Promise that resolves to a client
    async () => {
      const { client } = await connectToDatabase();
      return client;
    }, 
    {
      databaseName: process.env.MONGODB_DB,
    }
  );
} 