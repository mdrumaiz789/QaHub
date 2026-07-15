import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { apiUrl, getToken, clearToken } from "../lib/auth";

type Project = {
  id: number;
  name: string;
};

type TestCase = {
  id: number;
  title: string;
  description: string | null;
  preconditions: string | null;
  steps: string;
  expectedResult: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  createdAt: string;
  updatedAt: string;
};

type Props = {
  projects: Project[];
  onUnauthorized: () => void;
  onGoToProjects: () => void;
};

export default function TestCaseImportPanel({
  projects,
  onUnauthorized,
  onGoToProjects,
}: Props) {
  const [selectedProject, setSelectedProject] = useState<number | "">("");
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (projects.length > 0) {
      setSelectedProject(projects[0].id);
    }
  }, [projects]);

  useEffect(() => {
    if (selectedProject) {
      loadTestCases();
    }
  }, [selectedProject]);

  const loadTestCases = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        apiUrl(`/api/projects/${selectedProject}/test-cases`),
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (response.status === 401) {
        clearToken();
        onUnauthorized();
        return;
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      setTestCases(result.data.testCases);

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load test cases"
      );
    } finally {
      setLoading(false);
    }
  };


  const filteredCases = testCases.filter((testCase) =>
    testCase.title
      .toLowerCase()
      .includes(search.toLowerCase())
  );


  if (projects.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center">
        <h2 className="text-xl font-semibold">
          Create a project first
        </h2>

        <button
          onClick={onGoToProjects}
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-white"
        >
          Go to Projects
        </button>
      </div>
    );
  }


  return (
    <div className="space-y-6">

      <section className="rounded-2xl border bg-white p-6 shadow-sm">

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <h2 className="text-xl font-semibold">
              Test Cases
            </h2>

            <p className="text-sm text-slate-500">
              Manage and review your test cases
            </p>
          </div>


          <select
            value={selectedProject}
            onChange={(e) =>
              setSelectedProject(Number(e.target.value))
            }
            className="rounded-lg border px-3 py-2"
          >
            {projects.map((project) => (
              <option
                key={project.id}
                value={project.id}
              >
                {project.name}
              </option>
            ))}
          </select>

        </div>


        <div className="mt-6 flex items-center gap-2 rounded-lg border px-3">

          <Search size={18} className="text-slate-400" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search test cases..."
            className="w-full py-2 outline-none"
          />

        </div>

      </section>


      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}


      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">

        <table className="w-full">

          <thead className="border-b bg-slate-50">
            <tr>
              <th className="p-4 text-left">Title</th>
              <th className="p-4 text-left">Priority</th>
              <th className="p-4 text-left">Updated</th>
            </tr>
          </thead>


          <tbody>

            {loading ? (

              <tr>
                <td
                  colSpan={3}
                  className="p-6 text-center"
                >
                  Loading...
                </td>
              </tr>

            ) : filteredCases.length === 0 ? (

              <tr>
                <td
                  colSpan={3}
                  className="p-6 text-center text-slate-500"
                >
                  No test cases found
                </td>
              </tr>

            ) : (

              filteredCases.map((testCase) => (

                <tr
                  key={testCase.id}
                  className="border-b hover:bg-slate-50"
                >

                  <td className="p-4">
                    <p className="font-medium">
                      {testCase.title}
                    </p>

                    <p className="text-sm text-slate-500">
                      {testCase.description}
                    </p>
                  </td>


                  <td className="p-4">
                    {testCase.priority}
                  </td>


                  <td className="p-4 text-sm text-slate-500">
                    {new Date(
                      testCase.updatedAt
                    ).toLocaleDateString()}
                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </section>

    </div>
  );
}