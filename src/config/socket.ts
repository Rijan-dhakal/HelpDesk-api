import http from "http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { redisClient } from "./redis";
import { logger } from "./logger";

let io: Server;

const initSocket = (httpServer: http.Server) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  try {
    const pubClient = redisClient.duplicate();
    const subClient = redisClient.duplicate();
    io.adapter(createAdapter(pubClient, subClient));
    logger.info("Socket.io Redis adapter initialized successfully.");
  } catch (error) {
    logger.error({ error }, "Error initializing Socket.io Redis adapter.");
  }

  return io;
};

const getSocket = () => {
  if (!io) {
    throw new Error(
      "Socket.io has not been initialized. Call initSocket first.",
    );
  }
  return io;
};

export { initSocket, getSocket };
