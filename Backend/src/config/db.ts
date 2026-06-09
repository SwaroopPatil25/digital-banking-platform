import mongoose from "mongoose";
import { env } from "./env.js";

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host} [${env.NODE_ENV}]`);
  } catch (error: any) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    if (env.isProduction) {
      console.error("   Retrying in 5 seconds...");
      await new Promise((r) => setTimeout(r, 5000));
      return connectDB();
    }
    process.exit(1);
  }
};

export default connectDB;
