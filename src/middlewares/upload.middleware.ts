import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import { ApiError } from "../utils/apiError";

const storage = multer.memoryStorage();

const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        "Only .jpg, .jpeg, .png, and .webp image formats are allowed",
      ),
    );
  }
};

export const uploadProductImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 4 * 1024 * 1024 }, // 4MB
}).single("image");
