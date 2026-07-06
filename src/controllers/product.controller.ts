import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";
import { productService } from "../services/product.service";
import { AuthRequest } from "../middlewares/auth.middleware";

const toImagePath = (file?: Express.Multer.File): string | undefined => {
  if (!file) return undefined;
  return `/uploads/products/${file.filename}`;
};

export const createProduct = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const imagePath = toImagePath(req.file);
    if (!imagePath) throw ApiError.badRequest("Product image is required");

    const { name, sku, category, purchasePrice, sellingPrice, stockQuantity } =
      req.body;

    const product = await productService.createProduct({
      name,
      sku,
      category,
      purchasePrice,
      sellingPrice,
      stockQuantity,
      imagePath,
    });

    res
      .status(201)
      .json(new ApiResponse("Product created successfully", product));
  },
);

export const getProducts = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { data, meta } = await productService.getProducts(req.query);
    res
      .status(200)
      .json(
        new ApiResponse("Products fetched successfully", data, {
          pagination: meta,
        }),
      );
  },
);

export const getProductById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const product = await productService.getProductById(req.params.id);
    res
      .status(200)
      .json(new ApiResponse("Product fetched successfully", product));
  },
);

export const updateProduct = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const imagePath = toImagePath(req.file);
    const { name, sku, category, purchasePrice, sellingPrice, stockQuantity } =
      req.body;

    const product = await productService.updateProduct(req.params.id, {
      name,
      sku,
      category,
      purchasePrice,
      sellingPrice,
      stockQuantity,
      imagePath,
    });

    res
      .status(200)
      .json(new ApiResponse("Product updated successfully", product));
  },
);

export const deleteProduct = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    await productService.deleteProduct(req.params.id);
    res.status(200).json(new ApiResponse("Product deleted successfully", null));
  },
);
