import type { Request, Response } from "express";

const checkHealth = async (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
  });
};

export { checkHealth };
