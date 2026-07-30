import http from "http";

import { app } from "./app";
import { connectDB } from "./config/prisma";
import { initSocket } from "./config/socket";
import { setupSocketHandler } from "./realtime/server.socket";
import { logger } from "./config/logger";

const port = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();

  const server = http.createServer(app);

  const io = initSocket(server);
  setupSocketHandler(io);

  server.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
  });
};

startServer().catch((e) => {
  logger.fatal(`Server failed to start: ${e}`);
  process.exit(1);
});
