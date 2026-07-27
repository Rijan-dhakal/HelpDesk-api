import Redis from "ioredis";
import { logger } from "./logger";
import { env } from "./env";

const redisClient = new Redis({
  host: env.REDIS_HOST,
  port: Number(env.REDIS_PORT),
});

redisClient.on("connect", () => {
  logger.info("Redis client connected");
});

redisClient.on("error", (err) => {
  logger.error({ err }, "Redis client error");
});

export { redisClient };
