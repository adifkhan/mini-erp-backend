import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { User } from "../models/user.model";

const seed = async () => {
  await connectDB();

  const existingAdmin = await User.findOne({ email: "admin@minierp.com" });
  if (existingAdmin) {
    console.log("Admin already exists");
    await mongoose.disconnect();
    return;
  }

  await User.create({
    name: "Admin",
    email: "admin@minierp.com",
    password: "Admin@123",
    role: "admin",
  });

  console.log("✅ Admin user created: admin@minierp.com / Admin@123");
  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
