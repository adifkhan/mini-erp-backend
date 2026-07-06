import { productRepository } from "../repositories/product.repository";
import { ApiError } from "../utils/apiError";
import { QueryParams } from "../utils/queryBuilder";
import { IProduct } from "../models/product.model";
import { deleteCloudinaryImage } from "../utils/cloudinaryUpload";

interface CreateProductInput {
  name: string;
  sku: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
  imageUrl: string; // Cloudinary secure_url, set by controller after upload
  imagePublicId: string; // Cloudinary public_id, set by controller after upload
}

type UpdateProductInput = Partial<Omit<CreateProductInput, "imageUrl" | "imagePublicId">> & {
  imageUrl?: string;
  imagePublicId?: string;
};

class ProductService {
  async createProduct(input: CreateProductInput): Promise<IProduct> {
    if (!input.imageUrl) {
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
      image: input.imageUrl,
      imagePublicId: input.imagePublicId,
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

  async updateProduct(id: string, input: UpdateProductInput): Promise<IProduct> {
    const product = await productRepository.findById(id);
    if (!product) throw ApiError.notFound("Product not found");

    if (input.sku && input.sku.toUpperCase() !== product.sku) {
      const existing = await productRepository.findBySku(input.sku);
      if (existing) {
        throw ApiError.conflict(`Product with SKU "${input.sku}" already exists`);
      }
    }

    const updateData: Partial<IProduct> = {
      ...(input.name && { name: input.name }),
      ...(input.sku && { sku: input.sku.toUpperCase() }),
      ...(input.category && { category: input.category }),
      ...(input.purchasePrice !== undefined && { purchasePrice: input.purchasePrice }),
      ...(input.sellingPrice !== undefined && { sellingPrice: input.sellingPrice }),
      ...(input.stockQuantity !== undefined && { stockQuantity: input.stockQuantity }),
    };

    // If a new image was uploaded, swap it in and delete the old Cloudinary asset
    if (input.imageUrl && input.imagePublicId) {
      updateData.image = input.imageUrl;
      updateData.imagePublicId = input.imagePublicId;
      await deleteCloudinaryImage(product.imagePublicId);
    }

    const updated = await productRepository.updateById(id, updateData);
    return updated as IProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    const product = await productRepository.findById(id);
    if (!product) throw ApiError.notFound("Product not found");

    await productRepository.deleteById(id);
    await deleteCloudinaryImage(product.imagePublicId);
  }

  async getLowStockProducts(threshold = 5) {
    return productRepository.findLowStock(threshold);
  }
}

export const productService = new ProductService();
