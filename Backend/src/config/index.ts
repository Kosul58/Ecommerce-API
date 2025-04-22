import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const mongoURI: string = process.env.MONGODB_URI || "";

if (!mongoURI) {
  throw new Error("MONGODB_URI is not defined in the environment variables");
}

// Connect to MongoDB
const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected successfully");
  } catch (error: any) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1); // Exit process on failure
  }
};

// Close MongoDB connection
const closeConn = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  } catch (error: any) {
    console.error("MongoDB connection close error:", error.message);
  }
};

export default { connectDB, closeConn, mongoURI };
