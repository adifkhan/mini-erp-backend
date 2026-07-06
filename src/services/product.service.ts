import fs from "fs";
import path from "path";
import { productRepository } from "../repositories/product.repository";
import { ApiError } from "../utils/apiError";
import { QueryParams } from "../utils/queryBuilder";
import { IProduct } from "../models/product.model";

interface CreateProductInput {
  name: string;
  sku: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
  imagePath: string;
}

type UpdateProductInput = Partial<Omit<CreateProductInput, "imagePath">> & {
  imagePath?: string;
};

class ProductService {
  async createProduct(input: CreateProductInput): Promise<IProduct> {
    if (!input.imagePath) {
      throw ApiError.badRequest("Product image is required");
    }

    const existing = await productRepository.findBySku(input.sku);
    if (existing) {
      throw ApiError.conflict(`Product with SKU "${input.sku}" already exists`);
    }

    return productRepository.create({
      name: input.name,
      sku: input.sku.toUpperCase(),
      category: input.category,
      purchasePrice: input.purchasePrice,
      sellingPrice: input.sellingPrice,
      stockQuantity: input.stockQuantity,
      image: input.imagePath,
    });
  }

  async getProducts(queryParams: QueryParams) {
    return productRepository.findPaginated(queryParams);
  }

  async getProductById(id: string): Promise<IProduct> {
    const product = await productRepository.findById(id);
    if (!product) throw ApiError.notFound("Product not found");
    return product;
  }

  async updateProduct(
    id: string,
    input: UpdateProductInput,
  ): Promise<IProduct> {
    const product = await productRepository.findById(id);
    if (!product) throw ApiError.notFound("Product not found");

    if (input.sku && input.sku.toUpperCase() !== product.sku) {
      const existing = await productRepository.findBySku(input.sku);
      if (existing) {
        throw ApiError.conflict(
          `Product with SKU "${input.sku}" already exists`,
        );
      }
    }

    const updateData: Partial<IProduct> = {
      ...(input.name && { name: input.name }),
      ...(input.sku && { sku: input.sku.toUpperCase() }),
      ...(input.category && { category: input.category }),
      ...(input.purchasePrice !== undefined && {
        purchasePrice: input.purchasePrice,
      }),
      ...(input.sellingPrice !== undefined && {
        sellingPrice: input.sellingPrice,
      }),
      ...(input.stockQuantity !== undefined && {
        stockQuantity: input.stockQuantity,
      }),
    };

    // If a new image was uploaded, replace it and delete the old file
    if (input.imagePath) {
      updateData.image = input.imagePath;
      this.deleteImageFile(product.image);
    }

    const updated = await productRepository.updateById(id, updateData);
    return updated as IProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    const product = await productRepository.findById(id);
    if (!product) throw ApiError.notFound("Product not found");

    await productRepository.deleteById(id);
    this.deleteImageFile(product.image);
  }

  async getLowStockProducts(threshold = 5) {
    return productRepository.findLowStock(threshold);
  }

  private deleteImageFile(imagePath: string) {
    try {
      const fullPath = path.join(
        __dirname,
        "..",
        "..",
        imagePath.replace(/^\/+/, ""),
      );
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (err) {
      console.error("Failed to delete product image file:", err);
    }
  }
}

export const productService = new ProductService();
