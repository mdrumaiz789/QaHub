
import cors from "cors";
import express from "express";
import { env } from "./config/env";
import authRouter from "./routes/auth.routes";
import projectRouter from "./routes/project.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({ success: true, message: "QAHub API is running" });
});

app.use("/api/auth", authRouter);
app.use("/api/projects", projectRouter);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.listen(Number(env.PORT), () => {
  console.log(`QAHub API listening on http://localhost:${env.PORT}`);
});
