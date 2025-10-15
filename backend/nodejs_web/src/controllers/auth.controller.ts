import { Request, Response } from "express";
import { Session } from "express-session";
import User from "../models/user.model"; // Import the User model
import bcrypt from "bcryptjs";

declare module "express-session" {
  interface Session {
    user?: { username: string; role?: string };
    isAuthenticated?: boolean;
  }
}

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).send("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send("Invalid credentials");
    }

    req.session.user = { username: user.username, role: user.role };
    req.session.isAuthenticated = true;

    return res.status(200).json({
      message: "Login successful",
      user: { username: user.username, role: user.role },
    });
  } catch (error) {
    res.status(500).send("Internal server error");
  }
};

export const logout = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Could not log out.");
    }

    res.clearCookie("connect.sid"); // Clear the session cookie
    res.status(200).send("Logged out");
  });
};

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: Function
) => {
  if (req.session.isAuthenticated) {
    return next();
  }
  res.redirect("/auth/login");
};
