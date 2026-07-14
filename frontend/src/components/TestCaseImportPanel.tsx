import { useRef, useState } from "react"
import type { ChangeEvent } from "react"
import { AlertTriangle, CheckCircle2, FileSpreadsheet, Upload } from "lucide-react"
import * as XLSX from "xlsx"
import { apiUrl, getToken } from "../lib/auth"

type ProjectOption = { id: number; name: string }
type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"

type ImportedTestCase = {
  sourceRow: number
  title: string
  description?: string
  preconditions?: string
  steps: string
  expectedResult: string
  priority: Priority
}

type Props = {
  projects: ProjectOption[]
  onUnauthorized: () => void
  onGoToProjects: () => void
}

const aliases = {
  title: ["title", "test case title", "test case", "test case name", "summary"],
  description: ["description", "details"],
  preconditions: ["preconditions", "precondition"],
  steps: ["steps", "test steps", "test step", "actions", "action"],
  expectedResult: ["expected result", "expected results", "expected outcome", "result"],
  priority: ["priority", "severity"],
}

const normalise = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "")

const priorityFor = (value: string): Priority => {
  const priorities: Record<string, Priority> = {
    low: "LOW",
    medium: "MEDIUM",
    normal: "MEDIUM",
    high: "HIGH",
    critical: "CRITICAL",
    p1: "CRITICAL",
    p2: "HIGH",
    p3: "MEDIUM",
    p4: "LOW",
  }
  return priorities[normalise(value)] ?? "MEDIUM"
}

function textFrom(row: Record<string, unknown>, acceptedHeaders: string[]) {
  const values = new Map(Object.entries(row).map(([key, value]) => [normalise(key), String(value ?? "").trim()]))
  for (const header of acceptedHeaders) {
    const value = values.get(normalise(header))
    if (value) return value
  }
  return ""
}

export default function TestCaseImportPanel({ projects, onUnauthorized, onGoToProjects }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [projectId, setProjectId] = useState("")
  const [fileName, setFileName] = useState("")
  const [sheetName, setSheetName] = useState("")
  const [testCases, setTestCases] = useState<ImportedTestCase[]>([])
  const [skippedRows, setSkippedRows] = useState(0)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isImporting, setIsImporting] = useState(false)

  const clearImport = () => {
    setFileName("")
    setSheetName("")
    setTestCases([])
    setSkippedRows(0)
    setSuccess("")
    if (inputRef.current) inputRef.current.value = ""
  }

  const readFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    clearImport()
    setError("")
    if (!file) return

    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" })
      const firstSheetName = workbook.SheetNames[0]
      if (!firstSheetName) throw new Error("The workbook has no sheets")
      const sheet = workbook.Sheets[firstSheetName]
      if (!sheet) throw new Error("Unable to read the first worksheet")
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" })

      if (rows.length === 0) throw new Error("The first worksheet has no data rows")
      if (rows.length > 500) throw new Error("This import contains more than 500 rows. Split it into smaller files.")

      const parsed = rows.map((row, index): ImportedTestCase => ({
        sourceRow: index + 2,
        title: textFrom(row, aliases.title),
        description: textFrom(row, aliases.description) || undefined,
        preconditions: textFrom(row, aliases.preconditions) || undefined,
        steps: textFrom(row, aliases.steps),
        expectedResult: textFrom(row, aliases.expectedResult),
        priority: priorityFor(textFrom(row, aliases.priority)),
      }))
      const valid = parsed.filter((testCase) => testCase.title.length >= 3 && testCase.steps.length >= 3 && testCase.expectedResult.length >= 3)

      if (valid.length === 0) {
        throw new Error("No valid rows found. Each row needs Title, Steps, and Expected Result columns.")
      }

      setFileName(file.name)
      setSheetName(firstSheetName)
      setTestCases(valid)
      setSkippedRows(parsed.length - valid.length)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to read this Excel file")
    }
  }

  const importCases = async () => {
    if (!projectId) {
      setError("Choose a project before importing")
      return
    }
    if (testCases.length === 0) return

    setError("")
    setSuccess("")
    setIsImporting(true)
    try {
      const response = await fetch(apiUrl(`/api/projects/${projectId}/test-cases/import`), {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          testCases: testCases.map(({ sourceRow: _sourceRow, ...testCase }) => testCase),
        }),
      })

      if (response.status === 401) {
        onUnauthorized()
        return
      }
      const result = await response.json()
      if (!response.ok) throw new Error(result.message ?? "Unable to import test cases")
      setSuccess(`${result.data.imported} test case${result.data.imported === 1 ? "" : "s"} imported successfully.`)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to import test cases")
    } finally {
      setIsImporting(false)
    }
  }

  if (projects.length === 0) {
    return <section className="rounded-2xl border bg-white p-8 shadow-sm"><FileSpreadsheet className="text-indigo-600" size={28} /><h2 className="mt-5 text-2xl font-semibold text-slate-950">Import test cases from Excel</h2><p className="mt-2 text-slate-600">Create a project first, then import its test cases into that project.</p><button onClick={onGoToProjects} className="mt-6 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white">Go to Projects</button></section>
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4"><div className="rounded-xl bg-emerald-50 p-3 text-emerald-600"><FileSpreadsheet size={24} /></div><div><h2 className="text-xl font-semibold text-slate-950">Import test cases from Excel</h2><p className="mt-1 text-sm leading-6 text-slate-600">Upload an Excel or CSV sheet, review the detected rows, then add them to a project.</p></div></div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">Destination project
            <select value={projectId} onChange={(event) => setProjectId(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"><option value="">Choose a project</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select>
          </label>
          <div className="text-sm font-medium text-slate-700">Supported files<p className="mt-1.5 rounded-lg bg-slate-50 px-3 py-2.5 font-normal text-slate-600">.xlsx, .xls, .csv · up to 500 rows</p></div>
        </div>

        <input ref={inputRef} className="sr-only" type="file" accept=".xlsx,.xls,.csv" onChange={(event) => void readFile(event)} />
        <button onClick={() => inputRef.current?.click()} className="mt-5 flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 px-6 py-10 text-center transition hover:border-indigo-400 hover:bg-indigo-50/30"><Upload className="text-indigo-600" size={24} /><span className="mt-3 font-medium text-slate-800">Choose an Excel file</span><span className="mt-1 text-sm text-slate-500">The first worksheet will be used.</span></button>

        {error && <p className="mt-5 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertTriangle size={16} />{error}</p>}
        {success && <p className="mt-5 flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700"><CheckCircle2 size={16} />{success}</p>}

        {testCases.length > 0 && <div className="mt-6"><div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-semibold text-slate-950">Ready to import</h3><p className="mt-1 text-sm text-slate-600">{fileName} · {sheetName}</p></div><button onClick={clearImport} className="text-sm font-medium text-slate-600 underline">Clear file</button></div><div className="mt-4 overflow-x-auto rounded-xl border"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Row</th><th className="px-4 py-3">Title</th><th className="px-4 py-3">Priority</th><th className="px-4 py-3">Expected result</th></tr></thead><tbody className="divide-y">{testCases.slice(0, 5).map((testCase) => <tr key={testCase.sourceRow}><td className="px-4 py-3 text-slate-500">{testCase.sourceRow}</td><td className="max-w-64 truncate px-4 py-3 font-medium text-slate-800">{testCase.title}</td><td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{testCase.priority.toLowerCase()}</span></td><td className="max-w-56 truncate px-4 py-3 text-slate-600">{testCase.expectedResult}</td></tr>)}</tbody></table></div>{testCases.length > 5 && <p className="mt-3 text-sm text-slate-500">Showing 5 of {testCases.length} valid rows.</p>}<button disabled={isImporting} onClick={() => void importCases()} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"><Upload size={17} />{isImporting ? "Importing…" : `Import ${testCases.length} test case${testCases.length === 1 ? "" : "s"}`}</button></div>}
      </section>

      <aside className="h-fit rounded-2xl border bg-white p-6 shadow-sm"><h2 className="font-semibold text-slate-950">Column mapping</h2><p className="mt-2 text-sm leading-6 text-slate-600">QAHub recognizes common header names automatically.</p><dl className="mt-5 space-y-3 text-sm"><MapRow label="Required" value="Title, Steps, Expected Result" /><MapRow label="Optional" value="Description, Preconditions, Priority" /><MapRow label="Priority" value="Low, Medium, High, Critical or P1–P4" /></dl>{skippedRows > 0 && <p className="mt-5 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{skippedRows} row{skippedRows === 1 ? " was" : "s were"} skipped because a required value was missing.</p>}<p className="mt-6 text-xs leading-5 text-slate-500">Each imported test case starts as a Draft. You can review and prepare them for execution in the next module.</p></aside>
    </div>
  )
}

function MapRow({ label, value }: { label: string; value: string }) {
  return <div><dt className="font-medium text-slate-800">{label}</dt><dd className="mt-0.5 leading-5 text-slate-600">{value}</dd></div>
}
