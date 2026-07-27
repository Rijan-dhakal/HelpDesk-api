import type { NextFunction } from "express";
import { ApiError } from "../utils/apiError";
import { type ZodError, z } from "zod";

const formatZodError = (error: ZodError): string => {
  return error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join(", ");
};

const validate = (schema: z.ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      return next(new ApiError(400, "Request body is required"));
    }

    const result = schema.safeParse(req.body);

    if (!result.success) {
      return next(new ApiError(400, formatZodError(result.error)));
    }

    next();
  };
};
