import type { Request, Response } from "express";
import prisma from "../lib/prisma";

export const getDashboard = async (req: Request, res: Response) => {
  try {
    const projectId = Number(req.params.projectId);

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Invalid project id",
      });
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: req.user!.userId,
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }


    const testCases = await prisma.testCase.count({
      where: {
        projectId,
      },
    });


    return res.json({
      success: true,
      data: {
        project,
        metrics: {
          testCases,
          testRuns: 0,
          bugs: 0,
          automationCoverage: 0,
        },
      },
    });


  } catch(error){

    console.error(error);

    return res.status(500).json({
      success:false,
      message:"Unable to load dashboard",
    });

  }
};