import type { Request, Response } from "express";
import { ZodError } from "zod";
import { getProjectForOwner, importTestCases, listTestCases } from "../services/test-case.service";
import { importTestCasesSchema } from "../validators/test-case.validator";

const projectIdFrom = (req: Request) => Number(req.params.projectId);

const getOwnedProject = async (req: Request, res: Response) => {
  const projectId = projectIdFrom(req);
  if (!Number.isInteger(projectId) || projectId < 1) {
    res.status(400).json({ success: false, message: "Invalid project ID" });
    return null;
  }

  const project = await getProjectForOwner(projectId, req.user!.userId);
  if (!project) {
    res.status(404).json({ success: false, message: "Project not found" });
    return null;
  }

  return project;
};

export const getTestCases = async (req: Request, res: Response) => {
  const project = await getOwnedProject(req, res);
  if (!project) return;

  const testCases = await listTestCases(project.id);
  return res.status(200).json({ success: true, data: { testCases } });
};

export const postTestCaseImport = async (req: Request, res: Response) => {
  const project = await getOwnedProject(req, res);
  if (!project) return;

  try {
    const { testCases } = importTestCasesSchema.parse(req.body);
    const result = await importTestCases(project.id, testCases);
    return res.status(201).json({ success: true, data: { imported: result.count } });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: error.issues[0]?.message ?? "Invalid test case data",
      });
    }
    return res.status(500).json({ success: false, message: "Unable to import test cases" });
  }
};
