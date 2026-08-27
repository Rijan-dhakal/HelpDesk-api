import type { NextFunction, Response } from "express";
import type { Role } from "../generated/prisma/enums";
import type { AuthRequest } from "../modules/auth/auth.types";
import { ApiError } from "../utils/apiError";

export const roleMiddleware = (...allowedRoles: Role[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, "Unauthorized"));
    }
    if (!allowedRoles.includes(req.user.role as Role)) {
      return next(new ApiError(403, "Forbidden"));
    }
    next();
  };
};
