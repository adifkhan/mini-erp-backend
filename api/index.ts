import dotenv from "dotenv";
dotenv.config();

import { VercelRequest, VercelResponse } from "@vercel/node";
import app from "../src/app";
import { connectDB } from "../src/config/db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await connectDB();
  return (app as unknown as (req: VercelRequest, res: VercelResponse) => void)(
    req,
    res,
  );
}
