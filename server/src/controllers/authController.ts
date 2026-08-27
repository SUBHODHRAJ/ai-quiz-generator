import { Request, Response } from "express";
import {
  getUserById,
  loginUser,
  registerUser,
  updateUserProfile,
  updateUserPassword
} from "../services/authService";
import { AuthenticatedRequest } from "../types/auth";

export const register = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: "Name, email and password are required."
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters."
      });
      return;
    }

    const normalizedRole =
      role === "TEACHER" ? "TEACHER" : "STUDENT";

    const result = await registerUser({
      name,
      email,
      password,
      role: normalizedRole
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: result
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Registration failed.";

    res.status(400).json({
      success: false,
      message
    });
  }
};

export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required."
      });
      return;
    }

    const result = await loginUser({
      email,
      password
    });

    res.status(200).json({
      success: true,
      message: "Login successful.",
      data: result
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Login failed.";

    res.status(401).json({
      success: false,
      message
    });
  }
};

export const me = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required."
      });
      return;
    }

    const user = await getUserById(req.user.userId);

    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to fetch user.";

    res.status(404).json({
      success: false,
      message
    });
  }
};

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required."
      });
      return;
    }

    const { name, avatar } = req.body;
    const user = await updateUserProfile(req.user.userId, { name, avatar });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: { user }
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update profile.";

    res.status(400).json({
      success: false,
      message
    });
  }
};

export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required."
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    await updateUserPassword(
      req.user.userId,
      currentPassword,
      newPassword
    );

    res.status(200).json({
      success: true,
      message: "Password changed successfully."
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to change password.";

    res.status(400).json({
      success: false,
      message
    });
  }
};
