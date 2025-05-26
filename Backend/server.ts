import "reflect-metadata";
import express from "express";
import cors from "cors";
import routes from "./src/routes/router";
import db from "./src/config/index";
import "./src/config/dependencyConfig";
import ErrorMiddleware from "./src/middlewares/errorMiddleware";
import { container } from "tsyringe";
import dotenv from "dotenv";
import {
  requestLogger,
  responseLogger,
} from "./src/middlewares/morganMiddleware";
import logger from "./src/utils/logger";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
// app.use(cors());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use(requestLogger);
app.use(responseLogger);
app.use("/api", routes);

const errorMiddleware = container.resolve(ErrorMiddleware);
app.use(errorMiddleware.notFoundHandler.bind(errorMiddleware));
app.use(errorMiddleware.handle.bind(errorMiddleware));

const server = app.listen(PORT, async () => {
  try {
    logger.info(`Server running on port ${PORT}`);
    await db.connectDB();
  } catch (err: any) {
    logger.error("Failed to connect to the database: " + err.message);
    process.exit(1);
  }
});

process.on("SIGINT", async () => {
  await db.closeConn();
  server.close(() => {
    logger.info("Server and DB connection closed");
    process.exit(0);
  });
});
