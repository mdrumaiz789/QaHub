import bcrypt from "bcrypt";
import type { User } from "@prisma/client";
import prisma from "../lib/prisma";
import { generateToken } from "../utils/jwt";

const publicUser = ({ password: _password, ...user }: User) => user;

export const registerUser = async (
  username: string,
  password: string,
  fullName: string
) => {
  const existing = await prisma.user.findUnique({
    where: { username },
  });

  if (existing) {
    throw new Error("Username already exists");
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      password: hashed,
      fullName,
    },
  });

  const token = generateToken({
    userId: user.id,
    username: user.username,
    role: user.role,
  });

  return { user: publicUser(user), token };
};

export const loginUser = async (
  username: string,
  password: string
) => {
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const match = await bcrypt.compare(
    password,
    user.password
  );

  if (!match) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken({
    userId: user.id,
    username: user.username,
    role: user.role,
  });

  return { user: publicUser(user), token };
};

export const getUserById = async (id: number) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      fullName: true,
      role: true,
      createdAt: true,
    },
  });
};
