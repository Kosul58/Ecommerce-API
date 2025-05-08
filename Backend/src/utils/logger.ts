import fs from "fs";
import path from "path";
import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}
const logFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.errors({ stack: true }),
  format.printf(({ timestamp, level, message, stack, ...rest }) => {
    let additionalData = "";
    if (Object.keys(rest).length > 0) {
      additionalData = `| Data: ${JSON.stringify(rest)}`;
    }
    return stack
      ? `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}${additionalData}`
      : `${timestamp} [${level.toUpperCase()}]: ${message}${additionalData}`;
  })
);

const isDev = process.env.NODE_ENV !== "production";

const logger = createLogger({
  level: isDev ? "debug" : "info",
  format: logFormat,
  transports: [
    new DailyRotateFile({
      filename: path.join(logDir, "combined-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "14d",
      level: "debug",
    }),
    new DailyRotateFile({
      filename: path.join(logDir, "error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxSize: "10m",
      maxFiles: "30d",
      level: "error",
    }),
  ],
  exitOnError: false,
});

if (isDev) {
  logger.add(
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.errors({ stack: true }),
        format.printf(({ timestamp, level, message, stack, ...rest }) => {
          let additionalData = "";
          if (Object.keys(rest).length > 0) {
            additionalData = `| Data: ${JSON.stringify(rest)}`;
          }
          return stack
            ? `${timestamp} [${level}]: ${message}\n${stack}${additionalData}`
            : `${timestamp} [${level}]: ${message}${additionalData}`;
        })
      ),
    })
  );
}

export default logger;
