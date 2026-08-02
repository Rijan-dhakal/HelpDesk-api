import { Router } from "express";
import { register, resendOTP, verify } from "./auth.controller";
import { validateSchema } from "../../middleware/validate.middleware";
import {
  registerSchema,
  resendOtpSchema,
  verifyEmailSchema,
} from "./auth.validation";

const authRouter = Router();

authRouter.post("/register", validateSchema(registerSchema), register);
authRouter.post("/resend-otp", validateSchema(resendOtpSchema), resendOTP);
authRouter.post("/verify-email", validateSchema(verifyEmailSchema), verify);

export { authRouter };
