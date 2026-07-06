import { z } from "zod";

export const createCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Customer name is required"),
    phone: z.string().min(6, "Valid phone number is required"),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    address: z.string().optional(),
  }),
});

export const updateCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    phone: z.string().min(6).optional(),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    address: z.string().optional(),
  }),
});

export const customerIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Customer id is required"),
  }),
});
