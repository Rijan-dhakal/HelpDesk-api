import { Router } from "express";
import {
  forgotPassword,
  login,
  register,
  resendOTP,
  verify,
} from "./auth.controller";
import { validateSchema } from "../../middleware/validate.middleware";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resendOtpSchema,
  verifyEmailSchema,
} from "./auth.validation";

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

export { authRouter };
