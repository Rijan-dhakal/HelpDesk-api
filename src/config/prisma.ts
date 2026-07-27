import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { env } from "./env";

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const connectDB = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("Database connected successfully");
  } catch (error: any) {
    if (error.code === "ECONNREFUSED") {
      console.error("Database is not running or unreachable");
    } else {
      console.error("Database connection failed:", error.message);
    }

    process.exit(1);
  }
};

export { prisma, connectDB };
