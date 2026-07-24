import express from "express";
import helmet from "helmet";
import cors from "cors";
import "dotenv/config";

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

export { app };
