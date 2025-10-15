import express from "express";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import morgan from "morgan";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import path from "path";
import session from "express-session";
import dotenv from "dotenv";
import { create } from "express-handlebars";
import logger from "./services/logger.service";

import handleRoute from "./router";
import authRoutes from "./router/auth.route";
import chartRoutes from "./router/chart.route";
import analyticsRoutes from "./router/analytics.route";
import { isAuthenticated } from "./middlewares/auth.middleware";

dotenv.config();

const app = express();

const hbs = create({
  extname: ".hbs",
  helpers: {
    inc: (value: string) => parseInt(value) + 1,
    formatCurrency: (value: number) =>
      new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(value),
    formatDate: (dateString: string) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      const localDate = new Date(date.getTime() - 7 * 60 * 60 * 1000);
      return `${String(localDate.getDate()).padStart(2, "0")}/${String(
        localDate.getMonth() + 1
      ).padStart(2, "0")}/${localDate.getFullYear()} ${String(
        localDate.getHours()
      ).padStart(2, "0")}:${String(localDate.getMinutes()).padStart(
        2,
        "0"
      )}:${String(localDate.getSeconds()).padStart(2, "0")}`;
    },
  },
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
});

app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");
app.set("views", path.join(__dirname, "./views"));

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(cors({ origin: "*", credentials: true }));
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../public")));

app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "smart_parking_secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use("/auth", authRoutes);
app.use("/chart", chartRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/public", express.static(path.join(__dirname, "../public")));

app.use("/views", isAuthenticated, (req, res, next) => next());
handleRoute(app);

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date(),
  });
});

app.use((err: any, req: express.Request, res: express.Response, next: any) => {
  logger.error("❌ Unhandled error: " + (err.stack || err.message));
  res.status(500).json({ message: "Internal Server Error" });
});

export default app;
