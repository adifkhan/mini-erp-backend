import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  if (
    mongoose.connection.readyState === 1 ||
    mongoose.connection.readyState === 2
  ) {
    return;
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("Invalid MONGO URI");
  }

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
};
