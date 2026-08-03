import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { env } from "../../config/env";
import {
  forgotPasswordService,
  loginUserService,
  registerUserService,
  resendOtpService,
  resetPasswordService,
  verifyEmailService,
} from "./auth.service";
import { resetPasswordQuerySchema } from "./auth.validation";

const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, message } = await registerUserService(req.body);
  res.status(200).json({
    success: true,
    message: message,
    data: {
      email,
    },
  });
});

const resendOTP = asyncHandler(async (req: Request, res: Response) => {
  const { email, message } = await resendOtpService(req.body);
  res.status(200).json({
    success: true,
    message: message,
    data: {
      email,
    },
  });
});

const verify = asyncHandler(async (req: Request, res: Response) => {
  const { message, user } = await verifyEmailService(req.body);
  res.status(200).json({
    success: true,
    message,
    data: user,
  });
});

const login = asyncHandler(async (req: Request, res: Response) => {
  const { message, token, user } = await loginUserService(req.body);
  res.cookie("access_token", token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).json({
    success: true,
    message,
    data: user,
  });
});

const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { message } = await forgotPasswordService(req.body);
  res.status(200).json({
    success: true,
    message,
  });
});

const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { newPassword } = req.body;

  const result = resetPasswordQuerySchema.safeParse(req.query);
  if (!result.success) {
    const issue = result.error.issues[0];
    return res.status(400).json({
      success: false,
      message: issue
        ? ` ${issue.path.join(".")}: ${issue.message}`
        : "Token not found in query",
    });
  }

  const parsedData = result.data;

  const { message } = await resetPasswordService({
    token: parsedData.token,
    newPassword,
  });

  return res.status(200).json({
    success: true,
    message,
  });
});

export { register, resendOTP, verify, login, forgotPassword, resetPassword };
