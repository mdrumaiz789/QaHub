import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().trim().min(3).max(50),
  password: z.string().min(8).max(128),
  fullName: z.string().trim().min(3).max(100),
});

export const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});
