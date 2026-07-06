import { ClientSession } from "mongoose";
import { BaseRepository } from "./base.repository";
import { Product, IProduct } from "../models/product.model";
import { QueryBuilder, QueryParams, PaginationMeta } from "../utils/queryBuilder";

class ProductRepository extends BaseRepository<IProduct> {
  constructor() {
    super(Product);
  }

  async findBySku(sku: string): Promise<IProduct | null> {
    return this.model.findOne({ sku: sku.toUpperCase() });
  }

  async findPaginated(queryParams: QueryParams): Promise<{ data: IProduct[]; meta: PaginationMeta }> {
    const builder = new QueryBuilder<IProduct>(this.model.find(), queryParams)
      .search(["name", "sku", "category"])
      .filter(["category"])
      .sort()
      .paginate();

    const [data, meta] = await Promise.all([builder.query.exec(), builder.getPaginationMeta(this.model)]);

    return { data, meta };
  }

  async findLowStock(threshold: number): Promise<IProduct[]> {
    return this.model.find({ stockQuantity: { $lt: threshold } }).sort({ stockQuantity: 1 });
  }

  async decrementStock(productId: string, quantity: number): Promise<IProduct | null> {
    return this.model.findByIdAndUpdate(
      productId,
      { $inc: { stockQuantity: -quantity } },
      { new: true }
    );
  }

  async findByIdWithSession(productId: string, session: ClientSession): Promise<IProduct | null> {
    return this.model.findById(productId).session(session);
  }

  /**
   * Atomically decrements stock only if enough stock is available.
   * Returns null if the product doesn't exist or stock is insufficient,
   * so the caller can distinguish "not found" from "insufficient stock" by re-checking.
   * Runs inside the given transaction session.
   */
  async decrementStockIfAvailable(
    productId: string,
    quantity: number,
    session: ClientSession
  ): Promise<IProduct | null> {
    return this.model.findOneAndUpdate(
      { _id: productId, stockQuantity: { $gte: quantity } },
      { $inc: { stockQuantity: -quantity } },
      { new: true, session }
    );
  }
}

export const productRepository = new ProductRepository();
