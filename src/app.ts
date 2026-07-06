import express, { Application } from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
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

// Serve uploaded product images statically
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/", (_req, res) => {
  res.status(200).json({ success: true, message: "Mini ERP API is running" });
});
app.get("/health", (_req, res) => {
  res.status(200).json({ success: true, message: "Mini ERP API is running" });
});

app.use("/api/v1", routes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
