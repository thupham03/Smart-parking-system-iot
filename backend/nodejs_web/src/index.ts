import http from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import dotenv from "dotenv";
import logger from "./services/logger.service";
import app from "./app";

dotenv.config();

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
app.set("io", io);

io.on("connection", (socket) => {
  logger.info(`⚡ Client connected: ${socket.id}`);
  socket.emit("welcome", { message: "Welcome to Smart Parking 🚗" });
  socket.on("disconnect", () =>
    logger.info(`❌ Client disconnected: ${socket.id}`)
  );
});

mongoose
  .connect(process.env.MONGO_URL || "")
  .then(() => logger.info("✅ MongoDB Connected"))
  .catch((err) => logger.error("❌ MongoDB Error: " + err));

process.on("uncaughtException", (err) => {
  logger.error("💥 Uncaught Exception: " + err);
});

process.on("unhandledRejection", (reason) => {
  logger.error("💥 Unhandled Rejection: " + reason);
});

const PORT = Number(process.env.PORT) || 3000;
server.listen(PORT, "0.0.0.0", () => {
  logger.info(`🚀 Server running at http://localhost:${PORT}`);
});
