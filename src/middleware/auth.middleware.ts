import jwt, { type JwtPayload } from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import type { AuthRequest } from "../modules/auth/auth.types";

const authorize = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.access_token;

    if (!token) {
      throw new ApiError(401, "Access denied. No token provided");
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, role: true },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    req.user = {
      userId: user.id,
      role: user.role,
    };

    next();
  },
);

export { authorize };
