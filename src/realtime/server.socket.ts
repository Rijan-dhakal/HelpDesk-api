import { Server } from "socket.io";
import { logger } from "../config/logger";

const setupSocketHandler = (io: Server) => {
  io.on("connection", (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on("disconnect", () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });
};

export { setupSocketHandler };
