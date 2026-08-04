import { Router } from "express";
import {
  changePassword,
  forgotPassword,
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

const authRouter = Router();

authRouter.post("/register", validateSchema(registerSchema), register);
authRouter.post("/resend-otp", validateSchema(resendOtpSchema), resendOTP);
authRouter.post("/verify-email", validateSchema(verifyEmailSchema), verify);
authRouter.post("/login", validateSchema(loginSchema), login);
authRouter.post(
  "/forgot-password",
  validateSchema(forgotPasswordSchema),
  forgotPassword,
);
authRouter.post(
  "/reset-password",
  validateSchema(resetPasswordSchema),
  resetPassword,
);
authRouter.post(
  "/change-password",
  authorize,
  validateSchema(changePasswordSchema),
  changePassword,
);

export { authRouter };
