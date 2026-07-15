import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import {
  ArrowUpRight,
  Bot,
  Bug,
  ClipboardCheck,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  PlayCircle
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { apiUrl, clearToken, getToken } from "../../lib/auth";
import TestCaseImportPanel from "../../components/TestCaseImportPanel";


type Project = {
  id: number;
  name: string;
  description: string | null;
  status: "ACTIVE" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
};


type Module =
  | "overview"
  | "projects"
  | "testCases"
  | "testRuns"
  | "bugs"
  | "ai";


type NavItem = {
  id: Module;
  label: string;
  icon: typeof LayoutDashboard;
};


const navigation: NavItem[] = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    id: "projects",
    label: "Projects",
    icon: FolderKanban,
  },
  {
    id: "testCases",
    label: "Test Cases",
    icon: ClipboardCheck,
  },
  {
    id: "testRuns",
    label: "Test Runs",
    icon: PlayCircle,
  },
  {
    id: "bugs",
    label: "Bugs",
    icon: Bug,
  },
  {
    id: "ai",
    label: "AI Assistant",
    icon: Bot,
  },
];


function Dashboard() {

  const navigate = useNavigate();


  const [activeModule, setActiveModule] =
    useState<Module>("overview");


  const [projects, setProjects] =
    useState<Project[]>([]);


  const [selectedProject, setSelectedProject] =
    useState<number | null>(null);


  const [dashboardMetrics, setDashboardMetrics] =
    useState({
      testCases: 0,
      testRuns: 0,
      bugs: 0,
      automationCoverage: 0,
    });

  const [, setIsLoading] = useState(true);

  const [error, setError] =
    useState("");



  const request = async (
    path: string,
    options: RequestInit = {}
  ) => {

    const response = await fetch(
      apiUrl(path),
      {
        ...options,

        headers: {
          Authorization:
            `Bearer ${getToken()}`,

          "Content-Type":
            "application/json",

          ...options.headers,
        },
      }
    );


    if(response.status === 401){

      clearToken();

      navigate("/login", {
        replace:true,
      });

      throw new Error(
        "Session expired. Please login again."
      );

    }


    const result =
      await response.json();


    if(!response.ok){

      throw new Error(
        result.message ?? "Request failed"
      );

    }


    return result;

  };



  const loadProjects = async () => {

    try {

      setError("");

      const result =
        await request("/api/projects");


      const loadedProjects =
        result.data.projects;


      setProjects(
        loadedProjects
      );


      if(loadedProjects.length > 0){

        setSelectedProject(
          loadedProjects[0].id
        );

      }


    } catch(error){

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load projects"
      );


    } finally {

      setIsLoading(false);

    }

  };



  const loadDashboard = async (
    projectId:number
  ) => {

    try {

      const result =
        await request(
          `/api/dashboard/${projectId}`
        );


      setDashboardMetrics(
        result.data.metrics
      );


    } catch(error){

      console.error(error);

    }

  };



  useEffect(()=>{

    void loadProjects();

  },[]);



  useEffect(()=>{

    if(selectedProject){

      void loadDashboard(
        selectedProject
      );

    }

  },[selectedProject]);

  const logout = () => {

    clearToken();

    navigate(
      "/login",
      {
        replace:true,
      }
    );

  };



  const heading =
    navigation.find(
      item=>item.id===activeModule
    )?.label ?? "Overview";



  const overview = (

    <>

      <div className="mb-6 flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-bold text-slate-900">
            QAHub Dashboard
          </h2>

          <p className="text-sm text-slate-500">
            Quality insights by product
          </p>

        </div>



        <select

          value={selectedProject ?? ""}

          onChange={(e)=>
            setSelectedProject(
              Number(e.target.value)
            )
          }

          className="
          rounded-xl
          border
          bg-white
          px-4
          py-2
          shadow-sm
          "

        >

          {
            projects.map(project=>(

              <option
                key={project.id}
                value={project.id}
              >
                {project.name}
              </option>

            ))
          }

        </select>


      </div>




      <section className="
      grid
      gap-5
      sm:grid-cols-2
      xl:grid-cols-4
      ">


        <Metric
          label="Test Cases"
          value={String(dashboardMetrics.testCases)}
          icon={<ClipboardCheck size={20}/>}
          tone="indigo"
        />


        <Metric
          label="Test Runs"
          value={String(dashboardMetrics.testRuns)}
          icon={<PlayCircle size={20}/>}
          tone="violet"
        />


        <Metric
          label="Open Bugs"
          value={String(dashboardMetrics.bugs)}
          icon={<Bug size={20}/>}
          tone="rose"
        />


        <Metric
          label="Automation"
          value={`${dashboardMetrics.automationCoverage}%`}
          icon={<Bot size={20}/>}
          tone="sky"
        />


      </section>





      <section className="
      mt-8
      grid
      gap-6
      xl:grid-cols-[1.5fr_1fr]
      ">


        <div className="
        rounded-2xl
        border
        bg-white
        p-6
        shadow-sm
        ">


          <div className="
          flex
          items-center
          justify-between
          ">


            <div>

              <h2 className="
              font-semibold
              text-slate-900
              ">
                Recent Projects
              </h2>


              <p className="
              text-sm
              text-slate-500
              ">
                Your QA workspaces
              </p>

            </div>


            <button

              onClick={()=>
                setActiveModule("projects")
              }

              className="
              text-sm
              font-medium
              text-indigo-600
              "

            >

              View all

              <ArrowUpRight
                size={15}
                className="inline ml-1"
              />

            </button>


          </div>




          <div className="mt-5 divide-y">


            {
              projects
              .slice(0,5)
              .map(project=>(

                <ProjectRow
                  key={project.id}
                  project={project}
                />

              ))
            }


          </div>


        </div>






        <div className="
        rounded-2xl
        bg-gradient-to-br
        from-indigo-600
        to-purple-700
        p-6
        text-white
        shadow-lg
        ">


          <div className="
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-xl
          bg-white/20
          ">

            <Bot size={25}/>

          </div>



          <h2 className="
          mt-5
          text-xl
          font-bold
          ">

            AI Quality Assistant

          </h2>



          <p className="
          mt-3
          text-sm
          text-indigo-100
          ">

            Generate test cases,
            analyse coverage gaps,
            and improve QA productivity.

          </p>



          <button

            onClick={()=>
              setActiveModule("ai")
            }

            className="
            mt-6
            rounded-xl
            bg-white
            px-4
            py-2
            text-sm
            font-semibold
            text-indigo-700
            "

          >

            Explore AI

          </button>


        </div>



      </section>


    </>

  );



  const content: Record<Module, ReactNode> = {

    overview,

    projects:
      <Placeholder
        title="Projects"
        description="Create and manage your QA products."
        icon={<FolderKanban size={22}/>}
      />,


    testCases:
      <TestCaseImportPanel
        projects={projects}
        onUnauthorized={logout}
        onGoToProjects={()=>
          setActiveModule("projects")
        }
      />,


    testRuns:
      <Placeholder
        title="Test Runs"
        description="Execute test cases and track results."
        icon={<PlayCircle size={22}/>}
      />,


    bugs:
      <Placeholder
        title="Bug Tracking"
        description="Manage defects and quality risks."
        icon={<Bug size={22}/>}
      />,


    ai:
      <Placeholder
        title="AI Assistant"
        description="Generate and improve test scenarios."
        icon={<Bot size={22}/>}
      />

  };



  return (

    <div className="
    min-h-screen
    bg-slate-50
    text-slate-900
    ">


      <aside className="
      fixed
      inset-y-0
      left-0
      hidden
      w-64
      bg-slate-950
      p-4
      text-slate-300
      lg:flex
      lg:flex-col
      ">


        <div className="
        flex
        items-center
        gap-3
        px-3
        py-4
        ">

          <div className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          bg-indigo-500
          font-bold
          text-white
          ">

            Q

          </div>


          <span className="
          text-xl
          font-bold
          text-white
          ">
            QAHub
          </span>

        </div>



        <nav className="
        mt-8
        space-y-1
        ">


        {
          navigation.map(item=>{

            const Icon=item.icon;

            return (

              <button

              key={item.id}

              onClick={()=>
                setActiveModule(item.id)
              }

              className={`
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              px-3
              py-2.5
              text-sm
              ${
                activeModule===item.id
                ?"bg-indigo-500 text-white"
                :"hover:bg-slate-800"
              }
              `}

              >

                <Icon size={18}/>

                {item.label}

              </button>

            )

          })
        }


        </nav>



        <button

        onClick={logout}

        className="
        mt-auto
        flex
        items-center
        gap-2
        rounded-xl
        px-3
        py-3
        text-sm
        hover:bg-slate-800
        "

        >

          <LogOut size={18}/>

          Logout

        </button>


      </aside>





      <main className="lg:pl-64">


        <header className="
        border-b
        bg-white
        px-6
        py-5
        ">


          <h1 className="
          text-2xl
          font-bold
          ">
            {heading}
          </h1>


        </header>



        <div className="
        mx-auto
        max-w-7xl
        px-6
        py-8
        ">


          {error && (

            <div className="
            mb-5
            rounded-xl
            bg-red-50
            p-3
            text-red-600
            ">

              {error}

            </div>

          )}



          {content[activeModule]}


        </div>


      </main>


    </div>

  );

}



function Metric({
  label,
  value,
  icon,
  tone
}: {
  label: string;
  value: string;
  icon: ReactNode;
  tone: string;
}) {


return (

<div className="
rounded-2xl
border
bg-white
p-5
shadow-sm
">


<div className="
flex
justify-between
">

<p className="text-sm text-slate-500">
{label}
</p>


<div
  className={`
    rounded-xl
    p-2
    ${
      tone === "rose"
        ? "bg-rose-50 text-rose-600"
        : tone === "violet"
        ? "bg-violet-50 text-violet-600"
        : tone === "sky"
        ? "bg-sky-50 text-sky-600"
        : "bg-indigo-50 text-indigo-600"
    }
  `}
>

{icon}

</div>


</div>


<p className="
mt-5
text-3xl
font-bold
">

{value}

</p>


</div>

)

}



function ProjectRow({
project
}:{
project:Project
}){


return (

<div className="
flex
justify-between
py-4
">

<div>

<p className="
font-medium
">
{project.name}
</p>


<p className="
text-sm
text-slate-500
">

{project.description || "No description"}

</p>

</div>


<span className="
rounded-full
bg-emerald-50
px-3
py-1
text-xs
text-emerald-700
">

{project.status}

</span>


</div>

)

}



function Placeholder({
title,
description,
icon
}:{
title:string;
description:string;
icon:ReactNode;
}){

return (

<div className="
rounded-2xl
border
bg-white
p-8
shadow-sm
">

<div className="
h-12
w-12
rounded-xl
bg-indigo-50
p-3
text-indigo-600
">

{icon}

</div>


<h2 className="
mt-5
text-xl
font-bold
">

{title}

</h2>


<p className="
mt-2
text-slate-500
">

{description}

</p>


</div>

)

}


export default Dashboard;