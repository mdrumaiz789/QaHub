import { z } from "zod";

export const testCaseInputSchema = z.object({
  title: z.string().trim().min(3, "Test case title must be at least 3 characters").max(200),
  description: z.string().trim().max(2_000).optional(),
  preconditions: z.string().trim().max(2_000).optional(),
  steps: z.string().trim().min(3, "Test steps are required").max(10_000),
  expectedResult: z.string().trim().min(3, "Expected result is required").max(5_000),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
});

export const importTestCasesSchema = z.object({
  testCases: z.array(testCaseInputSchema).min(1, "Add at least one valid test case").max(500, "A single import is limited to 500 rows"),
});
