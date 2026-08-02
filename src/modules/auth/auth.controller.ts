import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { registerUser, resendOtp } from "./auth.service";

const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, message } = await registerUser(req.body);
  res.status(200).json({
    success: true,
    message: message,
    email: email,
  });
});

const resendOTP = asyncHandler(async (req: Request, res: Response) => {
  const { email, message } = await resendOtp(req.body);
  res.status(200).json({
    success: true,
    message: message,
    email: email,
  });
});

export { register, resendOTP };
