import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";
import { saleService } from "../services/sale.service";
import { AuthRequest } from "../middlewares/auth.middleware";

export const createSale = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user) throw ApiError.unauthorized("Authentication required");

    const { customerId, items } = req.body;

    const sale = await saleService.createSale({
      customerId,
      items,
      soldBy: req.user.id,
    });

    res.status(201).json(new ApiResponse("Sale created successfully", sale));
  },
);

export const getSales = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { data, meta } = await saleService.getSales(req.query);
    res
      .status(200)
      .json(
        new ApiResponse("Sales fetched successfully", data, {
          pagination: meta,
        }),
      );
  },
);

export const getSaleById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const sale = await saleService.getSaleById(req.params.id);
    res.status(200).json(new ApiResponse("Sale fetched successfully", sale));
  },
);
