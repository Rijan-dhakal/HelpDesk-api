import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { type ZodError, z } from "zod";

const formatZodError = (error: ZodError): string => {
  return error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join(", ");
};

const validateSchema = (schema: z.ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Request body is required" });
    }

    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res
        .status(400)
        .json({ success: false, message: formatZodError(result.error) });
    }

    next();
  };
};

export { validateSchema };
