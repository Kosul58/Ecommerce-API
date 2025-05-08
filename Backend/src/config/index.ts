import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "../utils/logger";
dotenv.config();

const mongoURI: string = process.env.MONGODB_URI || "";

if (!mongoURI) {
  throw new Error("MONGODB_URI is not defined in the environment variables");
}

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(mongoURI);
    logger.info("MongoDB connected successfully");
  } catch (error: any) {
    logger.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
const closeConn = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info("MongoDB connection closed");
  } catch (error: any) {
    logger.error("MongoDB connection close error:", error.message);
  }
};

export default { connectDB, closeConn, mongoURI };
