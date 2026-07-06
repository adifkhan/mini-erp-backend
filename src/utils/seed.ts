import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { User } from "../models/user.model";

const seed = async () => {
  await connectDB();

  const users = [
    {
      name: "Admin",
      email: "admin@minierp.com",
      password: "Admin@123",
      role: "admin",
    },
    {
      name: "Manager",
      email: "manager@minierp.com",
      password: "Manager@123",
      role: "manager",
    },
    {
      name: "Employee",
      email: "employee@minierp.com",
      password: "Employee@123",
      role: "employee",
    },
  ];

  for (const u of users) {
    const exists = await User.findOne({ email: u.email });

    if (exists) {
      console.log(`${u.role} already exists: ${u.email}`);
      continue;
    }

    await User.create(u);
    console.log(`${u.role} created: ${u.email} / ${u.password}`);
  }

  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
