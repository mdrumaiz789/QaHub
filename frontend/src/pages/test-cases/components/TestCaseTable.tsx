import { useNavigate } from "react-router-dom";
import type { TestCase } from "@/types/test-case";

interface Props {
  testCases: TestCase[];
}

const priorityColors = {
  Low: "bg-gray-100 text-gray-700",
  Medium: "bg-blue-100 text-blue-700",
  High: "bg-orange-100 text-orange-700",
  Critical: "bg-red-100 text-red-700",
};

const statusColors = {
  Draft: "bg-gray-100 text-gray-700",
  Ready: "bg-green-100 text-green-700",
  Deprecated: "bg-red-100 text-red-700",
};

export default function TestCaseTable({ testCases }: Props) {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <table className="w-full">
        <thead className="bg-slate-100">
          <tr className="text-left text-sm font-semibold text-slate-700">
            <th className="px-5 py-4">TC ID</th>
            <th className="px-5 py-4">Module</th>
            <th className="px-5 py-4">Feature Description</th>
            <th className="px-5 py-4">Priority</th>
            <th className="px-5 py-4">Status</th>
            <th className="px-5 py-4">Automation</th>
            <th className="px-5 py-4">Updated</th>
            <th className="px-5 py-4"></th>
          </tr>
        </thead>

        <tbody>
          {testCases.map((testCase) => (
            <tr
              key={testCase.id}
              onClick={() =>
                navigate(`/projects/${testCase.projectId}/testcases/${testCase.id}`)
              }
              className="cursor-pointer border-t transition hover:bg-slate-50"
            >
              <td className="px-5 py-4 font-medium text-blue-600">
                {testCase.testCaseId}
              </td>

              <td className="px-5 py-4">{testCase.module}</td>

              <td className="px-5 py-4">
                {testCase.featureDescription}
              </td>

              <td className="px-5 py-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    priorityColors[testCase.priority]
                  }`}
                >
                  {testCase.priority}
                </span>
              </td>

              <td className="px-5 py-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    statusColors[testCase.status]
                  }`}
                >
                  {testCase.status}
                </span>
              </td>

              <td className="px-5 py-4">
                {testCase.automation}
              </td>

              <td className="px-5 py-4">
                {testCase.updatedAt}
              </td>

              <td className="px-5 py-4 text-xl">
                →
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}