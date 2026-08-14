import { Router } from "express";
import {
  changePassword,
  forgotPassword,
  generateAccessToken,
  getMe,
  login,
  register,
  resendOTP,
  resetPassword,
  verify,
} from "./auth.controller";
import { validateSchema } from "../../middleware/validate.middleware";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resendOtpSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "./auth.validation";
import { authorize } from "../../middleware/auth.middleware";
import {
  authEmailBasedLimiter,
  authIpBasedLimiter,
  forgotPasswordAndResendOtpLimiter,
} from "../../middleware/rate-limit/auth";

const authRouter = Router();

authRouter.post(
  "/register",
  authEmailBasedLimiter,
  authIpBasedLimiter,
  validateSchema(registerSchema),
  register,
);

authRouter.post(
  "/resend-otp",
  forgotPasswordAndResendOtpLimiter,
  authIpBasedLimiter,
  validateSchema(resendOtpSchema),
  resendOTP,
);

authRouter.post(
  "/verify-email",
  authEmailBasedLimiter,
  authIpBasedLimiter,
  validateSchema(verifyEmailSchema),
  verify,
);

authRouter.post(
  "/login",
  authEmailBasedLimiter,
  authIpBasedLimiter,
  validateSchema(loginSchema),
  login,
);

authRouter.post(
  "/forgot-password",
  forgotPasswordAndResendOtpLimiter,
  authIpBasedLimiter,
  validateSchema(forgotPasswordSchema),
  forgotPassword,
);

authRouter.post(
  "/reset-password",
  authIpBasedLimiter,
  validateSchema(resetPasswordSchema),
  resetPassword,
);

authRouter.post(
  "/change-password",
  authorize,
  validateSchema(changePasswordSchema),
  changePassword,
);

authRouter.get("/me", authorize, getMe);

authRouter.post("/generate-access-token", generateAccessToken);

export { authRouter };
