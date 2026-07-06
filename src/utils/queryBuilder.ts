import { Query, Document, FilterQuery } from "mongoose";

export interface QueryParams {
  page?: string;
  limit?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: unknown;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Generic, reusable query builder for Mongoose queries.
 * Handles: text search, arbitrary field filters, sorting, and pagination.
 *
 * Usage:
 *   const features = new QueryBuilder(Product.find(), req.query)
 *     .search(["name", "sku", "category"])
 *     .filter(["category"])
 *     .sort()
 *     .paginate();
 *   const data = await features.query;
 *   const meta = await features.getPaginationMeta(Product);
 */
export class QueryBuilder<T extends Document> {
  public query: Query<T[], T>;
  private queryParams: QueryParams;
  private appliedFilter: FilterQuery<T> = {};
  private page: number;
  private limit: number;

  constructor(mongooseQuery: Query<T[], T>, queryParams: QueryParams) {
    this.query = mongooseQuery;
    this.queryParams = queryParams;
    this.page = Math.max(1, parseInt(queryParams.page || "1", 10) || 1);
    this.limit = Math.max(1, parseInt(queryParams.limit || "10", 10) || 10);
  }

  search(fields: string[]): this {
    const { search } = this.queryParams;
    if (search && fields.length > 0) {
      const regex = new RegExp(search.trim(), "i");
      const orConditions = fields.map((field) => ({ [field]: regex }));
      this.appliedFilter = { ...this.appliedFilter, $or: orConditions } as FilterQuery<T>;
      this.query = this.query.find(this.appliedFilter);
    }
    return this;
  }

  filter(allowedFields: string[]): this {
    const extraFilter: Record<string, unknown> = {};
    allowedFields.forEach((field) => {
      const value = this.queryParams[field];
      if (value !== undefined && value !== "") {
        extraFilter[field] = value;
      }
    });
    if (Object.keys(extraFilter).length > 0) {
      this.appliedFilter = { ...this.appliedFilter, ...extraFilter } as FilterQuery<T>;
      this.query = this.query.find(extraFilter as FilterQuery<T>);
    }
    return this;
  }

  sort(defaultSort = "-createdAt"): this {
    const { sortBy, sortOrder } = this.queryParams;
    if (sortBy) {
      const order = sortOrder === "desc" ? "-" : "";
      this.query = this.query.sort(`${order}${sortBy}`);
    } else {
      this.query = this.query.sort(defaultSort);
    }
    return this;
  }

  paginate(): this {
    const skip = (this.page - 1) * this.limit;
    this.query = this.query.skip(skip).limit(this.limit);
    return this;
  }

  getFilter(): FilterQuery<T> {
    return this.appliedFilter;
  }

  async getPaginationMeta(model: { countDocuments: (f: FilterQuery<T>) => Promise<number> }): Promise<PaginationMeta> {
    const total = await model.countDocuments(this.appliedFilter);
    return {
      total,
      page: this.page,
      limit: this.limit,
      totalPages: Math.ceil(total / this.limit) || 1,
    };
  }
}
