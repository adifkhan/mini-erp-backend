import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import { ApiError } from "../utils/apiError";

// Memory storage, not disk: Vercel's serverless filesystem is read-only (except /tmp,
// which is ephemeral and not shared across function instances), so the file buffer is
// held in memory just long enough to stream it to Cloudinary — never written to disk.
const storage = multer.memoryStorage();

const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Only .jpg, .jpeg, .png, and .webp image formats are allowed"));
  }
};

export const uploadProductImage = multer({
  storage,
  fileFilter,
  // Kept under Vercel's default request body size limit (4.5MB on Hobby plans).
  limits: { fileSize: 4 * 1024 * 1024 }, // 4MB
}).single("image");
