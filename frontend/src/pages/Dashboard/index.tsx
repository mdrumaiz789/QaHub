import { useEffect, useState } from "react"
import type { FormEvent, ReactNode } from "react"
import {
  ArrowUpRight,
  Bot,
  Bug,
  ChevronRight,
  ClipboardCheck,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  PlayCircle,
  Plus,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { apiUrl, clearToken, getToken } from "../../lib/auth"
import TestCaseImportPanel from "../../components/TestCaseImportPanel"

type Project = {
  id: number
  name: string
  description: string | null
  status: "ACTIVE" | "ARCHIVED"
  createdAt: string
  updatedAt: string
}

type Module = "overview" | "projects" | "testCases" | "testRuns" | "bugs" | "ai"

type NavItem = {
  id: Module
  label: string
  icon: typeof LayoutDashboard
}

const navigation: NavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "testCases", label: "Test Cases", icon: ClipboardCheck },
  { id: "testRuns", label: "Test Runs", icon: PlayCircle },
  { id: "bugs", label: "Bugs", icon: Bug },
  { id: "ai", label: "AI Assistant", icon: Bot },
]

function Placeholder({ title, description, icon }: { title: string; description: string; icon: ReactNode }) {
  return (
    <section className="rounded-2xl border bg-white p-8 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">{icon}</div>
      <h2 className="mt-5 text-2xl font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 max-w-xl text-slate-600">{description}</p>
      <div className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600">Coming next <ChevronRight size={16} /></div>
    </section>
  )
}

function Dashboard() {
  const navigate = useNavigate()
  const [activeModule, setActiveModule] = useState<Module>("overview")
  const [projects, setProjects] = useState<Project[]>([])
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState("")

  const request = async (path: string, options: RequestInit = {}) => {
    const response = await fetch(apiUrl(path), {
      ...options,
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (response.status === 401) {
      clearToken()
      navigate("/login", { replace: true })
      throw new Error("Your session has expired. Please login again.")
    }

    const result = await response.json()
    if (!response.ok) throw new Error(result.message ?? "Request failed")
    return result
  }

  const loadProjects = async () => {
    try {
      setError("")
      const result = await request("/api/projects")
      setProjects(result.data.projects)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to load projects")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadProjects()
  }, [])

  const createProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setIsCreating(true)

    try {
      const result = await request("/api/projects", {
        method: "POST",
        body: JSON.stringify({ name, description }),
      })
      setProjects((current) => [result.data.project, ...current])
      setName("")
      setDescription("")
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to create project")
    } finally {
      setIsCreating(false)
    }
  }

  const logout = () => {
    clearToken()
    navigate("/login", { replace: true })
  }

  const heading = navigation.find((item) => item.id === activeModule)?.label ?? "Overview"

  const overview = (
    <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Active projects" value={String(projects.filter((project) => project.status === "ACTIVE").length)} icon={<FolderKanban size={18} />} tone="indigo" />
        <Metric label="Test cases" value="—" icon={<ClipboardCheck size={18} />} tone="sky" />
        <Metric label="Test runs" value="—" icon={<PlayCircle size={18} />} tone="violet" />
        <Metric label="Open bugs" value="—" icon={<Bug size={18} />} tone="rose" />
      </section>

      <section className="mt-7 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-950">Recent projects</h2>
              <p className="mt-1 text-sm text-slate-600">Your QA workspaces in one place.</p>
            </div>
            <button onClick={() => setActiveModule("projects")} className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700">View all <ArrowUpRight size={16} /></button>
          </div>
          {isLoading ? (
            <p className="py-10 text-sm text-slate-500">Loading projects…</p>
          ) : projects.length === 0 ? (
            <div className="py-10 text-center">
              <p className="font-medium text-slate-800">No projects yet</p>
              <button onClick={() => setActiveModule("projects")} className="mt-3 text-sm font-medium text-indigo-600">Create your first project</button>
            </div>
          ) : (
            <div className="mt-5 divide-y">
              {projects.slice(0, 4).map((project) => <ProjectRow key={project.id} project={project} />)}
            </div>
          )}
        </div>

        <div className="rounded-2xl border bg-slate-950 p-6 text-white shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-indigo-200"><Bot size={20} /></div>
          <h2 className="mt-5 text-lg font-semibold">AI-powered QA, ready next</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">Generate test ideas from requirements, spot coverage gaps, and turn bugs into actionable test cases.</p>
          <button onClick={() => setActiveModule("ai")} className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-indigo-200 hover:text-white">Explore AI Assistant <ChevronRight size={16} /></button>
        </div>
      </section>
    </>
  )

  const projectsPanel = (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <section className="h-fit rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">Create project</h2>
        <p className="mt-1 text-sm text-slate-600">Start a workspace for your test cases and runs.</p>
        <form className="mt-6 space-y-4" onSubmit={createProject}>
          <label className="block text-sm font-medium text-slate-700">Project name
            <input value={name} onChange={(event) => setName(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" placeholder="e.g. Customer Portal" minLength={2} maxLength={100} required />
          </label>
          <label className="block text-sm font-medium text-slate-700">Description <span className="font-normal text-slate-400">(optional)</span>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="mt-1.5 min-h-28 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" placeholder="What will this project cover?" maxLength={1000} />
          </label>
          <button disabled={isCreating} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"><Plus size={18} />{isCreating ? "Creating…" : "Create project"}</button>
        </form>
      </section>

      <section>
        <div className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b px-6 py-5"><h2 className="font-semibold text-slate-950">All projects</h2><p className="mt-1 text-sm text-slate-600">{projects.length} {projects.length === 1 ? "project" : "projects"}</p></div>
          {isLoading ? <p className="p-6 text-slate-600">Loading projects…</p> : projects.length === 0 ? <p className="p-6 text-slate-600">No projects yet. Use the form to create one.</p> : <div className="divide-y">{projects.map((project) => <ProjectRow key={project.id} project={project} large />)}</div>}
        </div>
      </section>
    </div>
  )

  const content: Record<Module, ReactNode> = {
    overview,
    projects: projectsPanel,
    testCases: <TestCaseImportPanel projects={projects} onUnauthorized={logout} onGoToProjects={() => setActiveModule("projects")} />,
    testRuns: <Placeholder title="Test Runs" description="Create a run, execute selected test cases, and track passed, failed, blocked, and skipped results." icon={<PlayCircle size={23} />} />,
    bugs: <Placeholder title="Bug Tracking" description="Capture defects from failed tests, set priority and status, and keep the team focused on quality risks." icon={<Bug size={23} />} />,
    ai: <Placeholder title="AI Assistant" description="Use AI to propose test scenarios, improve test coverage, and transform requirements into test cases." icon={<Bot size={23} />} />,
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-800 bg-slate-950 p-4 text-slate-300 lg:flex lg:flex-col">
        <div className="flex items-center gap-3 px-3 py-4"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 font-bold text-white">Q</div><span className="text-lg font-semibold text-white">QAHub</span></div>
        <p className="mt-8 px-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Workspace</p>
        <nav className="mt-3 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            const selected = activeModule === item.id
            return <button key={item.id} onClick={() => setActiveModule(item.id)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${selected ? "bg-indigo-500 text-white" : "hover:bg-slate-800 hover:text-white"}`}><Icon size={18} />{item.label}</button>
          })}
        </nav>
        <div className="mt-auto rounded-xl bg-slate-900 p-4"><p className="text-sm font-medium text-white">Build quality with clarity.</p><p className="mt-1 text-xs leading-5 text-slate-400">Projects first. Test cases, runs, bugs, and AI follow.</p></div>
      </aside>

      <main className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b bg-white/95 px-6 py-5 backdrop-blur lg:px-10"><div className="mx-auto flex max-w-7xl items-center justify-between"><div><p className="text-sm text-slate-500">QA workspace</p><h1 className="mt-0.5 text-2xl font-semibold text-slate-950">{heading}</h1></div><button onClick={logout} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"><LogOut size={16} />Logout</button></div></header>
        <div className="border-b bg-white px-4 py-2 lg:hidden"><div className="flex gap-1 overflow-x-auto">{navigation.map((item) => <button key={item.id} onClick={() => setActiveModule(item.id)} className={`shrink-0 rounded-md px-3 py-1.5 text-sm ${activeModule === item.id ? "bg-indigo-50 font-medium text-indigo-700" : "text-slate-600"}`}>{item.label}</button>)}</div></div>
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">{error && <p className="mb-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}{content[activeModule]}</div>
      </main>
    </div>
  )
}

function Metric({ label, value, icon, tone }: { label: string; value: string; icon: ReactNode; tone: "indigo" | "sky" | "violet" | "rose" }) {
  const tones = { indigo: "bg-indigo-50 text-indigo-600", sky: "bg-sky-50 text-sky-600", violet: "bg-violet-50 text-violet-600", rose: "bg-rose-50 text-rose-600" }
  return <article className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><p className="text-sm font-medium text-slate-600">{label}</p><span className={`rounded-lg p-2 ${tones[tone]}`}>{icon}</span></div><p className="mt-6 text-3xl font-semibold text-slate-950">{value}</p><p className="mt-1 text-xs text-slate-400">Module ready for setup</p></article>
}

function ProjectRow({ project, large = false }: { project: Project; large?: boolean }) {
  return <article className={`flex items-center justify-between gap-4 ${large ? "px-6 py-5" : "py-4"}`}><div className="min-w-0"><h3 className="truncate font-medium text-slate-900">{project.name}</h3><p className="mt-1 truncate text-sm text-slate-500">{project.description || "No description yet"}</p></div><div className="shrink-0 text-right"><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">{project.status.toLowerCase()}</span><p className="mt-2 text-xs text-slate-400">{new Date(project.createdAt).toLocaleDateString()}</p></div></article>
}

export default Dashboard
