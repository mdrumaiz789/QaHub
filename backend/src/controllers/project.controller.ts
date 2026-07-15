import type { Request, Response } from "express";
import { ZodError } from "zod";
import { createProject, listProjects } from "../services/project.service";
import { createProjectSchema } from "../validators/project.validator";

export const getProjects = async (req: Request, res: Response) => {
  const projects = await listProjects(req.user!.userId);
  return res.status(200).json({ success: true, data: { projects } });
};

export const postProject = async (req: Request, res: Response) => {
  try {
    const { name, description } = createProjectSchema.parse(req.body);
    const project = await createProject(req.user!.userId, name, description);
    return res.status(201).json({ success: true, data: { project } });
  } catch (error) {
    console.error("CREATE PROJECT ERROR:", error);

    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: error.issues[0]?.message ?? "Invalid project data",
      });
    }

    return res.status(500).json({
      success: false,
      message: error instanceof Error
        ? error.message
        : "Unable to create project",
    });
  }
};
