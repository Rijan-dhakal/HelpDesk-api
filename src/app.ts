import express from "express";
import helmet from "helmet";
import cors from "cors";
import "dotenv/config";
import { notFoundMiddleware } from "./middleware/notFound.middleware";
import { errorHandler } from "./middleware/error.middleware";
import { checkHealth } from "./modules/health/checkHealth";
import { authRouter } from "./modules/auth/auth.route";

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

//  Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

// Routes
app.get("/api/health", checkHealth);
app.use("/api/auth", authRouter);

// Global Middleware for handling errors
app.use(notFoundMiddleware);
app.use(errorHandler);

export { app };
