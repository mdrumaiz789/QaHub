import prisma from "../lib/prisma";

export const listProjects = (ownerId: number) =>
  prisma.project.findMany({
    where: { ownerId },
    orderBy: { updatedAt: "desc" },
  });

export const createProject = (ownerId: number, name: string, description?: string) =>
  prisma.project.create({
    data: {
      ownerId,
      name,
      description: description || null,
    },
  });
