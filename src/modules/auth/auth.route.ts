import { Router } from "express";
import { register } from "./auth.controller";
import { validateSchema } from "../../middleware/validate.middleware";
import { registerSchema } from "./auth.validation";

const authRouter = Router();

authRouter.post("/register", validateSchema(registerSchema), register);

export { authRouter };
