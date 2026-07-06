import express, { Application } from "express";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes";
import {
  notFoundHandler,
  globalErrorHandler,
} from "./middlewares/error.middleware";

const app: Application = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Product images live on Cloudinary now (see utils/cloudinaryUpload.ts) — no local
// static file serving needed, which also means this works unmodified on Vercel's
// read-only serverless filesystem.

app.get("/health", (_req, res) => {
  res.status(200).json({ success: true, message: "Mini ERP API is running" });
});

app.use("/api/v1", routes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
