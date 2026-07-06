import { productRepository } from "../repositories/product.repository";
import { customerRepository } from "../repositories/customer.repository";
import { saleRepository } from "../repositories/sale.repository";

const LOW_STOCK_THRESHOLD = 5;

class DashboardService {
  async getStats() {
    const [totalProducts, totalCustomers, totalSales, lowStockProducts] =
      await Promise.all([
        productRepository.count(),
        customerRepository.count(),
        saleRepository.countAll(),
        productRepository.findLowStock(LOW_STOCK_THRESHOLD),
      ]);

    return {
      totalProducts,
      totalCustomers,
      totalSales,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
    };
  }
}

export const dashboardService = new DashboardService();
