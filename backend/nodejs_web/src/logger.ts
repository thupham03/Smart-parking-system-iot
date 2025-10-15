// src/services/logger.ts
import winston from "winston";
import path from "path";

const logDir = path.join(__dirname, "../../logs");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(
      (info) =>
        `[${info.timestamp}] [${info.level.toUpperCase()}] ${info.message}`
    )
  ),
  transports: [
    new winston.transports.File({
      filename: `${logDir}/error.log`,
      level: "error",
    }),
    new winston.transports.File({ filename: `${logDir}/combined.log` }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(new winston.transports.Console());
}

export default logger;
