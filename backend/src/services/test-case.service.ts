import type { Prisma, TestCasePriority } from "@prisma/client";
import prisma from "../lib/prisma";

export const getProjectForOwner = (projectId: number, ownerId: number) =>
  prisma.project.findFirst({ where: { id: projectId, ownerId } });

export const listTestCases = (projectId: number) =>
  prisma.testCase.findMany({
    where: { projectId },
    orderBy: { updatedAt: "desc" },
  });

type TestCaseImport = {
  title: string;
  description?: string | undefined;
  preconditions?: string | undefined;
  steps: string;
  expectedResult: string;
  priority: TestCasePriority;
};

export const createTestCase = (
  projectId: number,
  testCase: TestCaseImport
) =>
  prisma.testCase.create({
    data: {
      projectId,
      title: testCase.title,
      description: testCase.description || null,
      preconditions: testCase.preconditions || null,
      steps: testCase.steps,
      expectedResult: testCase.expectedResult,
      priority: testCase.priority,
    },
  });

export const importTestCases = (
  projectId: number,
  testCases: TestCaseImport[]
) =>
  prisma.testCase.createMany({
    data: testCases.map((testCase) => ({
      projectId,
      title: testCase.title,
      description: testCase.description || null,
      preconditions: testCase.preconditions || null,
      steps: testCase.steps,
      expectedResult: testCase.expectedResult,
      priority: testCase.priority,
    })) satisfies Prisma.TestCaseCreateManyInput[],
  });