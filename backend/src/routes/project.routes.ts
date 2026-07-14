import { Router } from "express";
import { getProjects, postProject } from "../controllers/project.controller";
import { authenticate } from "../middleware/auth.middleware";
import testCaseRouter from "./test-case.routes";

const projectRouter = Router();

projectRouter.use(authenticate);
projectRouter.get("/", getProjects);
projectRouter.post("/", postProject);
projectRouter.use("/:projectId/test-cases", testCaseRouter);

export default projectRouter;
