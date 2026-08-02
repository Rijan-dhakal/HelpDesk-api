import { Queue } from "bullmq";
import { bullmqRedisConnection } from "../config/redis";

const emailQueue = new Queue("email", {
  connection: bullmqRedisConnection,
});

export { emailQueue };
