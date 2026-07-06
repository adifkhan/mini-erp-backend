import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  // In serverless (Vercel), this function can be called on every invocation of a
  // warm container. Skip reconnecting if a connection already exists or is in progress.
  if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
    return;
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is not defined in environment variables");
  }

  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    throw error;
  }
};
