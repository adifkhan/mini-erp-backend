import cloudinary from "../config/cloudinary";

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

export const uploadBufferToCloudinary = (
  buffer: Buffer,
  folder = "mini-erp/products",
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Cloudinary upload failed"));
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    uploadStream.end(buffer);
  });
};

export const deleteCloudinaryImage = async (
  publicId: string,
): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Failed to delete Cloudinary image:", err);
  }
};
