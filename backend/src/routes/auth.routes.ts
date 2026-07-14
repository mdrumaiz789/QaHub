import { Router } from "express";
import { login, logout, me, register } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/me", authenticate, me);
authRouter.post("/logout", authenticate, logout);

export default authRouter;
