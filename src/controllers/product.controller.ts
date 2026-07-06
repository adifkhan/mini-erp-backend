import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";
import { productService } from "../services/product.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload";

export const createProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) throw ApiError.badRequest("Product image is required");

  const { name, sku, category, purchasePrice, sellingPrice, stockQuantity } = req.body;

  const { url, publicId } = await uploadBufferToCloudinary(req.file.buffer);

  const product = await productService.createProduct({
    name,
    sku,
    category,
    purchasePrice,
    sellingPrice,
    stockQuantity,
    imageUrl: url,
    imagePublicId: publicId,
  });

  res.status(201).json(new ApiResponse("Product created successfully", product));
});

export const getProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { data, meta } = await productService.getProducts(req.query);
  res.status(200).json(new ApiResponse("Products fetched successfully", data, { pagination: meta }));
});

export const getProductById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const product = await productService.getProductById(req.params.id);
  res.status(200).json(new ApiResponse("Product fetched successfully", product));
});

export const updateProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, sku, category, purchasePrice, sellingPrice, stockQuantity } = req.body;

  let imageUrl: string | undefined;
  let imagePublicId: string | undefined;
  if (req.file) {
    const uploaded = await uploadBufferToCloudinary(req.file.buffer);
    imageUrl = uploaded.url;
    imagePublicId = uploaded.publicId;
  }

  const product = await productService.updateProduct(req.params.id, {
    name,
    sku,
    category,
    purchasePrice,
    sellingPrice,
    stockQuantity,
    imageUrl,
    imagePublicId,
  });

  res.status(200).json(new ApiResponse("Product updated successfully", product));
});

export const deleteProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  await productService.deleteProduct(req.params.id);
  res.status(200).json(new ApiResponse("Product deleted successfully", null));
});
