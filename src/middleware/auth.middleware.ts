import jwt, { type JwtPayload } from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { env } from "../config/env";
import type { AuthRequest } from "../modules/auth/auth.types";

const authorize = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.access_token;

    if (!token) {
      throw new ApiError(401, "Access denied. No token provided");
    }

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;

    const userId = decoded.sub;
    const role: string = decoded.role;

    if (!userId || !role) {
      throw new ApiError(401, "Invalid token");
    }

    req.user = {
      userId,
      role,
    };

    next();
  },
);

export { authorize };
