import dotenv from "dotenv";

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("JWT_SECRET is required.");
}

export const env = {
  PORT: process.env.PORT || "5000",
  JWT_SECRET: jwtSecret,
};
