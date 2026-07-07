import {
  Model,
  Document,
  FilterQuery,
  UpdateQuery,
  PopulateOptions,
} from "mongoose";

export class BaseRepository<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }

  async findById(
    id: string,
    populate?: PopulateOptions | (string | PopulateOptions)[],
  ): Promise<T | null> {
    const query = this.model.findById(id);
    if (populate) query.populate(populate);
    return query.exec();
  }

  async findOne(
    filter: FilterQuery<T>,
    selectFields?: string,
  ): Promise<T | null> {
    const query = this.model.findOne(filter);
    if (selectFields) query.select(selectFields);
    return query.exec();
  }

  async findAll(
    filter: FilterQuery<T> = {},
    options: {
      skip?: number;
      limit?: number;
      sort?: Record<string, 1 | -1>;
    } = {},
  ): Promise<T[]> {
    const query = this.model.find(filter);
    if (options.sort) query.sort(options.sort);
    if (options.skip !== undefined) query.skip(options.skip);
    if (options.limit !== undefined) query.limit(options.limit);
    return query.exec();
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(filter);
  }

  async updateById(id: string, data: UpdateQuery<T>): Promise<T | null> {
    return this.model
      .findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .exec();
  }

  async deleteById(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec();
  }
}
