import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { redisStore } from "../../config/rateLimit";

export const forgotPasswordAndResendOtpLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  keyGenerator: (req) =>
    `auth:forgot-password:${req.body.email?.trim().toLowerCase()}`,

  store: redisStore(),
});

export const authEmailBasedLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  keyGenerator: (req) => `auth:login:${req.body.email?.trim().toLowerCase()}`,

  store: redisStore(),
});

export const authIpBasedLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  keyGenerator: (req) => `auth:login:${ipKeyGenerator(req.ip!)}`,

  store: redisStore(),
});
