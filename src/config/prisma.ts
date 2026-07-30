import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { env } from "./env";
import { logger } from "./logger";

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const connectDB = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info("Database connection established successfully");
  } catch (error: any) {
    if (error.code === "ECONNREFUSED") {
      logger.fatal("Database is not running or unreachable");
    } else {
      logger.fatal("Database connection failed:", error.message);
    }

    process.exit(1);
  }
};

export { prisma, connectDB };
