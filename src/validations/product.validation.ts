import { z } from "zod";

// Fields come from multipart/form-data (image upload), so numeric fields arrive as strings.
export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Product name is required"),
    sku: z.string().min(1, "SKU is required"),
    category: z.string().min(1, "Category is required"),
    purchasePrice: z.coerce.number().nonnegative("Purchase price must be >= 0"),
    sellingPrice: z.coerce.number().nonnegative("Selling price must be >= 0"),
    stockQuantity: z.coerce
      .number()
      .int()
      .nonnegative("Stock quantity must be >= 0"),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    sku: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
    purchasePrice: z.coerce.number().nonnegative().optional(),
    sellingPrice: z.coerce.number().nonnegative().optional(),
    stockQuantity: z.coerce.number().int().nonnegative().optional(),
  }),
});

export const productIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Product id is required"),
  }),
});
