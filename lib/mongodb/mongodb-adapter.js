import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "./index";

export function getMongoDBAdapter() {
  return MongoDBAdapter(clientPromise);
} 