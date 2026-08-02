import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { registerUser, resendOtp, verifyEmail } from "./auth.service";

const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, message } = await registerUser(req.body);
  res.status(200).json({
    success: true,
    message: message,
    data: {
      email,
    },
  });
});

const resendOTP = asyncHandler(async (req: Request, res: Response) => {
  const { email, message } = await resendOtp(req.body);
  res.status(200).json({
    success: true,
    message: message,
    data: {
      email,
    },
  });
});

const verify = asyncHandler(async (req: Request, res: Response) => {
  const { message, user } = await verifyEmail(req.body);
  res.status(200).json({
    success: true,
    message,
    data: user,
  });
});

export { register, resendOTP, verify };
