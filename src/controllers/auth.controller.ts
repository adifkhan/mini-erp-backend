import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponse";
import { authService } from "../services/auth.service";
import { AuthRequest } from "../middlewares/auth.middleware";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });
  res.status(200).json(new ApiResponse("Login successful", result));
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const profile = await authService.getProfile(req.user!.id);
  res
    .status(200)
    .json(new ApiResponse("Profile fetched successfully", profile));
});
