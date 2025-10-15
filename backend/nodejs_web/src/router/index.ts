import { Application } from "express";
import apiRoute from "./api.route";
import viewsRoute from "./views.route";

export default function handleRoute(app: Application) {
  app.use("/api", apiRoute);
  app.use("/views", viewsRoute);
}