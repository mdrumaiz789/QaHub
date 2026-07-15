import { useState } from "react"
import type { FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  Eye,
  EyeOff,
  Lock,
  User,
  Sparkles,
  ClipboardCheck,
  Bug,
  Bot,
  Loader2,
} from "lucide-react"

import { apiUrl, setToken } from "../../lib/auth"

function Login() {
  const navigate = useNavigate()

  const [isRegistering, setIsRegistering] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")

  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setError("")
    setIsSubmitting(true)

    try {
      const endpoint = isRegistering
        ? "/api/auth/register"
        : "/api/auth/login"

      const body = isRegistering
        ? { username, password, fullName }
        : { username, password }

      const response = await fetch(apiUrl(endpoint), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message ?? "Unable to authenticate")
      }

      setToken(result.data.token)

      navigate("/dashboard", {
        replace: true,
      })

    } catch (caughtError) {

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to authenticate"
      )

    } finally {
      setIsSubmitting(false)
    }
  }


  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 flex items-center justify-center px-6">

      {/* Background glow */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-purple-600/30 blur-3xl" />


      <div className="grid w-full max-w-6xl gap-10 lg:grid-cols-2 items-center">


        {/* Left Branding */}
        <div className="hidden lg:block text-white">

          <div className="flex items-center gap-3 mb-8">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl font-bold shadow-lg">
              Q
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                QAHub
              </h1>

              <p className="text-slate-400">
                AI Powered QA Engineering
              </p>
            </div>

          </div>


          <h2 className="text-5xl font-bold leading-tight">
            Build better software
            <br />
            with intelligent testing
          </h2>


          <p className="mt-5 max-w-lg text-lg text-slate-400">
            Manage test cases, track bugs and accelerate
            quality engineering with AI assistance.
          </p>


          <div className="mt-10 space-y-5">

            <Feature
              icon={<ClipboardCheck />}
              text="Smart Test Case Management"
            />

            <Feature
              icon={<Bug />}
              text="Centralized Bug Tracking"
            />

            <Feature
              icon={<Bot />}
              text="AI Assisted Testing"
            />

          </div>

        </div>



        {/* Login Card */}
        <div className="mx-auto w-full max-w-md">

          <div className="rounded-3xl border border-white/20 bg-white/90 p-8 shadow-2xl backdrop-blur-xl">


            <div className="mb-8 text-center">

              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">

                <Sparkles size={30}/>

              </div>


              <h1 className="text-3xl font-bold text-slate-900">

                {isRegistering
                  ? "Create account"
                  : "Welcome back"}

              </h1>


              <p className="mt-2 text-sm text-slate-500">

                {isRegistering
                  ? "Create your QAHub workspace"
                  : "Login to your QA workspace"}

              </p>


            </div>



            <form onSubmit={submit} className="space-y-4">


              {isRegistering && (

                <Input
                  icon={<User size={18}/>}
                  placeholder="Full name"
                  value={fullName}
                  onChange={setFullName}
                />

              )}


              <Input
                icon={<User size={18}/>}
                placeholder="Username"
                value={username}
                onChange={setUsername}
              />



              <div className="relative">

                <Input
                  icon={<Lock size={18}/>}
                  placeholder="Password"
                  value={password}
                  type={showPassword ? "text" : "password"}
                  onChange={setPassword}
                />


                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-slate-500"
                >

                  {showPassword
                    ? <EyeOff size={18}/>
                    : <Eye size={18}/>
                  }

                </button>

              </div>



              {error && (

                <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>

              )}



              <button
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.02] disabled:opacity-60"
              >

                {isSubmitting && (
                  <Loader2 className="animate-spin" size={18}/>
                )}

                {isSubmitting
                  ? "Please wait..."
                  : isRegistering
                    ? "Create Account"
                    : "Sign In"}

              </button>


            </form>



            <button
              type="button"
              onClick={()=>{
                setIsRegistering(!isRegistering)
                setError("")
              }}
              className="mt-6 w-full text-sm text-slate-600 hover:text-indigo-600"
            >

              {isRegistering
                ? "Already have an account? Login"
                : "Need an account? Register"}

            </button>



            <p className="mt-6 text-center text-sm text-slate-500">

              Back to{" "}
              <Link
                className="font-medium text-indigo-600"
                to="/"
              >
                home
              </Link>

            </p>


          </div>

        </div>

      </div>

    </div>
  )
}


function Feature({
  icon,
  text,
}:{
  icon: React.ReactNode
  text:string
}){

  return (

    <div className="flex items-center gap-4">

      <div className="rounded-xl bg-white/10 p-3">
        {icon}
      </div>

      <span className="text-lg">
        {text}
      </span>

    </div>

  )
}



function Input({
  icon,
  placeholder,
  value,
  onChange,
  type="text",
}:any){

return (

<div className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3 focus-within:ring-2 focus-within:ring-indigo-500">

{icon}

<input
type={type}
placeholder={placeholder}
value={value}
onChange={(e)=>onChange(e.target.value)}
className="w-full outline-none"
/>

</div>

)

}


export default Login