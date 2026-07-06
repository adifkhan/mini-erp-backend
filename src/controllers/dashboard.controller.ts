import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponse";
import { dashboardService } from "../services/dashboard.service";
import { AuthRequest } from "../middlewares/auth.middleware";

export const getDashboardStats = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const stats = await dashboardService.getStats();
    res
      .status(200)
      .json(
        new ApiResponse("Dashboard statistics fetched successfully", stats),
      );
  },
);
