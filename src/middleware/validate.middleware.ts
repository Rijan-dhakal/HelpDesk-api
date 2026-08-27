import type { NextFunction, Request, Response } from "express";
import { type ZodError, z } from "zod";
import { ApiError } from "../utils/apiError";

const formatZodError = (error: ZodError): string => {
  return error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join(", ");
};

const validateSchema = (schema: z.ZodTypeAny) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new ApiError(400, "Request body is empty");
    }

    const result = schema.safeParse(req.body);

    if (!result.success) {
      throw new ApiError(400, formatZodError(result.error));
    }

    next();
  };
};

export { validateSchema };
