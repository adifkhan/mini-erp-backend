import { ClientSession } from "mongoose";
import { BaseRepository } from "./base.repository";
import { Sale, ISale } from "../models/sale.model";
import { QueryBuilder, QueryParams, PaginationMeta } from "../utils/queryBuilder";

class SaleRepository extends BaseRepository<ISale> {
  constructor() {
    super(Sale);
  }

  async createWithSession(data: Partial<ISale>, session: ClientSession): Promise<ISale> {
    const docs = await this.model.create([data], { session });
    return docs[0];
  }

  async findPaginated(queryParams: QueryParams): Promise<{ data: ISale[]; meta: PaginationMeta }> {
    const builder = new QueryBuilder<ISale>(
      this.model.find().populate("customer", "name phone").populate("soldBy", "name email"),
      queryParams
    )
      .sort()
      .paginate();

    const [data, meta] = await Promise.all([builder.query.exec(), builder.getPaginationMeta(this.model)]);

    return { data, meta };
  }

  async findByIdPopulated(id: string): Promise<ISale | null> {
    return this.model
      .findById(id)
      .populate("customer", "name phone email")
      .populate("soldBy", "name email")
      .exec();
  }

  async countAll(): Promise<number> {
    return this.model.countDocuments();
  }
}

export const saleRepository = new SaleRepository();
