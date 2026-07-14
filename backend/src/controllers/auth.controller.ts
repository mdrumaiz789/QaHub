import type { Request, Response } from "express";
import { ZodError } from "zod";
import { getUserById, loginUser, registerUser } from "../services/auth.service";
import { loginSchema, registerSchema } from "../validators/auth.validator";

const validationMessage = (error: ZodError) =>
  error.issues[0]?.message ?? "Invalid request data";

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, fullName } = registerSchema.parse(req.body);

    const result = await registerUser(
      username,
      password,
      fullName
    );

    return res.status(201).json({
      success: true,
      data: result,
    });

  } catch (error) {

    console.error("REGISTER ERROR:", error);

    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: validationMessage(error),
      });
    }

    if (
      error instanceof Error &&
      error.message === "Username already exists"
    ) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to register user",
    });
  }
};


export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = loginSchema.parse(req.body);

    const result = await loginUser(
      username,
      password
    );

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error) {

    console.error("LOGIN ERROR:", error);

    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: validationMessage(error),
      });
    }

    if (
      error instanceof Error &&
      error.message === "Invalid credentials"
    ) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to log in",
    });
  }
};


export const me = async (req: Request, res: Response) => {
  try {
    const user = await getUserById(req.user!.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user,
      },
    });

  } catch (error) {

    console.error("ME ERROR:", error);

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to fetch user",
    });
  }
};


export const logout = (_req: Request, res: Response) => {
  return res.status(204).send();
};