import { Request, Response } from "express";
import User from "../models/user.model";

export const addUser = async (req: Request, res: Response) => {
  const { username, password, role } = req.body;
  try {
    const newUser = new User({ username, password, role });
    await newUser.save();
    res.status(201).json({ message: "Người dùng đã được thêm thành công!" });
  } catch (error) {
    res.status(400).json({ error: (error as any).message });
  }
};

export const modifyUser = async (req: Request, res: Response) => {
  const { id, username, password, role } = req.body;
  try {
    await User.findByIdAndUpdate(id, { username, password, role });
    res
      .status(200)
      .json({ message: "Người dùng đã được cập nhật thành công!" });
  } catch (error) {
    res.status(400).json({ error: (error as any).message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.body;
  try {
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "Người dùng đã được xóa thành công!" });
  } catch (error) {
    res.status(400).json({ error: (error as any).message });
  }
};

export const getUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: (error as any).message });
  }
};
