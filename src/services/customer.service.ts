import { customerRepository } from "../repositories/customer.repository";
import { ApiError } from "../utils/apiError";
import { QueryParams } from "../utils/queryBuilder";
import { ICustomer } from "../models/customer.model";

interface CustomerInput {
  name: string;
  email?: string;
  phone: string;
  address?: string;
}

class CustomerService {
  async createCustomer(input: CustomerInput): Promise<ICustomer> {
    const existing = await customerRepository.findByPhone(input.phone);
    if (existing) {
      throw ApiError.conflict(`Customer with phone "${input.phone}" already exists`);
    }
    return customerRepository.create(input);
  }

  async getCustomers(queryParams: QueryParams) {
    return customerRepository.findPaginated(queryParams);
  }

  async getCustomerById(id: string): Promise<ICustomer> {
    const customer = await customerRepository.findById(id);
    if (!customer) throw ApiError.notFound("Customer not found");
    return customer;
  }

  async updateCustomer(id: string, input: Partial<CustomerInput>): Promise<ICustomer> {
    const customer = await customerRepository.findById(id);
    if (!customer) throw ApiError.notFound("Customer not found");

    if (input.phone && input.phone !== customer.phone) {
      const existing = await customerRepository.findByPhone(input.phone);
      if (existing) {
        throw ApiError.conflict(`Customer with phone "${input.phone}" already exists`);
      }
    }

    const updated = await customerRepository.updateById(id, input);
    return updated as ICustomer;
  }

  async deleteCustomer(id: string): Promise<void> {
    const customer = await customerRepository.findById(id);
    if (!customer) throw ApiError.notFound("Customer not found");
    await customerRepository.deleteById(id);
  }
}

export const customerService = new CustomerService();
