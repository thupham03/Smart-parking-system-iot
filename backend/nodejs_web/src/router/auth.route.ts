import { Router } from "express";
import { login, logout, isAuthenticated } from "../controllers/auth.controller";
import {
  addUser,
  modifyUser,
  deleteUser,
  getUser,
} from "../controllers/user.controller";

const authRoutes = Router();

authRoutes.get("/login", (req, res) => {
  res.render("layouts/login", { layout: false });
});

authRoutes.post("/login", (req, res, next) => {
  Promise.resolve(login(req, res)).catch(next);
});
authRoutes.post("/addUser", isAuthenticated, addUser);
authRoutes.post("/modifyUser", isAuthenticated, modifyUser);
authRoutes.post("/deleteUser", isAuthenticated, deleteUser);
authRoutes.get("/getUser/:id", isAuthenticated, getUser);
authRoutes.post("/logout", logout);

authRoutes.get("/views", isAuthenticated, (req, res) => {
  res.render("layouts/main", { layout: false });
});
authRoutes.get("/views/cars", isAuthenticated, (req, res) => {
  res.render("layouts/cars", { layout: false });
});
authRoutes.get("/views/parking", isAuthenticated, (req, res) => {
  res.render("layouts/parking", { layout: false });
});
authRoutes.get("/views/analytics", isAuthenticated, (req, res) => {
  res.render("layouts/analytics", { layout: false });
});
authRoutes.get("/views/users", isAuthenticated, (req, res) => {
  res.render("layouts/users", { layout: false });
});

export default authRoutes;
