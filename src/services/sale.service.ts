import mongoose from "mongoose";
import { saleRepository } from "../repositories/sale.repository";
import { productRepository } from "../repositories/product.repository";
import { customerRepository } from "../repositories/customer.repository";
import { ApiError } from "../utils/apiError";
import { ISale, ISaleItem } from "../models/sale.model";
import { QueryParams } from "../utils/queryBuilder";

interface SaleItemInput {
  productId: string;
  quantity: number;
}

interface CreateSaleInput {
  customerId: string;
  items: SaleItemInput[];
  soldBy: string;
}

class SaleService {
  async createSale(input: CreateSaleInput): Promise<ISale> {
    if (!input.items || input.items.length === 0) {
      throw ApiError.badRequest("A sale must contain at least one product");
    }

    const mergedItemsMap = new Map<string, number>();
    for (const item of input.items) {
      if (item.quantity <= 0) {
        throw ApiError.badRequest(
          "Quantity must be greater than 0 for all items",
        );
      }
      mergedItemsMap.set(
        item.productId,
        (mergedItemsMap.get(item.productId) || 0) + item.quantity,
      );
    }

    const customer = await customerRepository.findById(input.customerId);
    if (!customer) throw ApiError.notFound("Customer not found");

    const session = await mongoose.startSession();

    try {
      let createdSale: ISale | null = null;

      await session.withTransaction(async () => {
        const saleItems: ISaleItem[] = [];
        let grandTotal = 0;

        for (const [productId, quantity] of mergedItemsMap) {
          const product = await productRepository.findByIdWithSession(
            productId,
            session,
          );
          if (!product) {
            throw ApiError.notFound(`Product not found: ${productId}`);
          }

          if (product.stockQuantity < quantity) {
            throw ApiError.badRequest(
              `Insufficient stock for "${product.name}". Available: ${product.stockQuantity}, requested: ${quantity}`,
            );
          }

          const updatedProduct =
            await productRepository.decrementStockIfAvailable(
              productId,
              quantity,
              session,
            );
          if (!updatedProduct) {
            throw ApiError.badRequest(
              `Insufficient stock for "${product.name}" (concurrent sale in progress)`,
            );
          }

          const subtotal = product.sellingPrice * quantity;
          grandTotal += subtotal;

          saleItems.push({
            product: product._id,
            productName: product.name,
            quantity,
            unitPrice: product.sellingPrice,
            subtotal,
          });
        }

        createdSale = await saleRepository.createWithSession(
          {
            customer: customer._id,
            items: saleItems,
            grandTotal,
            soldBy: input.soldBy as unknown as mongoose.Types.ObjectId,
          },
          session,
        );
      });

      if (!createdSale) {
        throw ApiError.internal(
          "Sale transaction completed without creating a sale record",
        );
      }

      return createdSale;
    } finally {
      await session.endSession();
    }
  }

  async getSales(queryParams: QueryParams) {
    return saleRepository.findPaginated(queryParams);
  }

  async getSaleById(id: string): Promise<ISale> {
    const sale = await saleRepository.findByIdPopulated(id);
    if (!sale) throw ApiError.notFound("Sale not found");
    return sale;
  }
}

export const saleService = new SaleService();
