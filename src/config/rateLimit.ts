import { RedisStore, type RedisReply } from "rate-limit-redis";
import { redisClient } from "./redis";

const redisStore = () =>
  new RedisStore({
    sendCommand: (command: string, ...args: string[]) =>
      redisClient.call(command, ...args) as Promise<RedisReply>,
  });

export { redisStore };
