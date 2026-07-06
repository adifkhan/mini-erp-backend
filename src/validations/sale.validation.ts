import { z } from "zod";

export const createSaleSchema = z.object({
  body: z.object({
    customerId: z.string().min(1, "Customer is required"),
    items: z
      .array(
        z.object({
          productId: z.string().min(1, "Product is required"),
          quantity: z.coerce
            .number()
            .int()
            .positive("Quantity must be greater than 0"),
        }),
      )
      .min(1, "At least one product is required"),
  }),
});

export const saleIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Sale id is required"),
  }),
});
