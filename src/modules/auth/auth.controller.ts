import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { registerUser } from "./auth.service";

const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, message } = await registerUser(req.body);
  res.status(200).json({
    success: true,
    message: message,
    email: email,
  });
});

export { register };
