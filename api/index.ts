import dotenv from "dotenv";
dotenv.config();

import { VercelRequest, VercelResponse } from "@vercel/node";
import app from "../src/app";
import { connectDB } from "../src/config/db";

/**
 * Vercel invokes this on every request. `connectDB` is idempotent (see config/db.ts),
 * so on a warm container this is a no-op — the Mongoose connection is reused rather
 * than re-established every time.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await connectDB();
  // Express apps are callable as (req, res) request handlers, so we can hand off
  // directly to the same app used for local dev via server.ts.
  return (app as unknown as (req: VercelRequest, res: VercelResponse) => void)(req, res);
}
