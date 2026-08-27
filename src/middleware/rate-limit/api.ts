import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { redisStore } from "../../config/rateLimit";

export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  keyGenerator: (req) => `api:${ipKeyGenerator(req.ip!)}`,

  store: redisStore(),
});

export const authenticatedUserRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  keyGenerator: (req) => `user:${req.user!.userId}`,

  store: redisStore(),
});
