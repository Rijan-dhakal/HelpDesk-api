import { Worker } from "bullmq";
import { bullmqRedisConnection } from "../config/redis";

new Worker(
  "email",
  async (job) => {
    // send email logic here
    console.log(job.name);
  },
  {
    connection: bullmqRedisConnection,
  },
);
