import { BaseRepository } from "./base.repository";
import { Customer, ICustomer } from "../models/customer.model";
import {
  QueryBuilder,
  QueryParams,
  PaginationMeta,
} from "../utils/queryBuilder";

class CustomerRepository extends BaseRepository<ICustomer> {
  constructor() {
    super(Customer);
  }

  async findByPhone(phone: string): Promise<ICustomer | null> {
    return this.model.findOne({ phone });
  }

  async findPaginated(
    queryParams: QueryParams,
  ): Promise<{ data: ICustomer[]; meta: PaginationMeta }> {
    const builder = new QueryBuilder<ICustomer>(this.model.find(), queryParams)
      .search(["name", "phone", "email"])
      .sort()
      .paginate();

    const [data, meta] = await Promise.all([
      builder.query.exec(),
      builder.getPaginationMeta(this.model),
    ]);

    return { data, meta };
  }
}

export const customerRepository = new CustomerRepository();
