export interface TestStep {
  id: number;
  stepNumber: number;
  action: string;
  expectedResult: string;
  testData?: string;
}

export interface TestCase {
  id: number;
  testCaseId: string;
  projectId: number;

  module: string;

  featureDescription: string;

  preRequisite: string;

  expectedResult: string;

  actualResult?: string;

  comments?: string;

  priority: "Low" | "Medium" | "High" | "Critical";

  status: "Draft" | "Ready" | "Deprecated";

  automation: "Manual" | "Automated" | "Planned";

  steps: TestStep[];

  createdAt: string;

  updatedAt: string;
}