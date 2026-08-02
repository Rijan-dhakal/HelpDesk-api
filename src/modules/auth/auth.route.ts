import { Router } from "express";
import { register, resendOTP } from "./auth.controller";
import { validateSchema } from "../../middleware/validate.middleware";
import { registerSchema, resendOtpSchema } from "./auth.validation";

const authRouter = Router();

authRouter.post("/register", validateSchema(registerSchema), register);
authRouter.post("/resend-otp", validateSchema(resendOtpSchema), resendOTP);

export { authRouter };
