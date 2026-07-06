import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponse";
import { customerService } from "../services/customer.service";
import { AuthRequest } from "../middlewares/auth.middleware";

export const createCustomer = asyncHandler(async (req: AuthRequest, res: Response) => {
  const customer = await customerService.createCustomer(req.body);
  res.status(201).json(new ApiResponse("Customer created successfully", customer));
});

export const getCustomers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { data, meta } = await customerService.getCustomers(req.query);
  res.status(200).json(new ApiResponse("Customers fetched successfully", data, { pagination: meta }));
});

export const getCustomerById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const customer = await customerService.getCustomerById(req.params.id);
  res.status(200).json(new ApiResponse("Customer fetched successfully", customer));
});

export const updateCustomer = asyncHandler(async (req: AuthRequest, res: Response) => {
  const customer = await customerService.updateCustomer(req.params.id, req.body);
  res.status(200).json(new ApiResponse("Customer updated successfully", customer));
});

export const deleteCustomer = asyncHandler(async (req: AuthRequest, res: Response) => {
  await customerService.deleteCustomer(req.params.id);
  res.status(200).json(new ApiResponse("Customer deleted successfully", null));
});
