import { useState } from "react"
import type { FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { apiUrl, setToken } from "../../lib/auth"

function Login() {
  const navigate = useNavigate()
  const [isRegistering, setIsRegistering] = useState(false)
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
      const endpoint = isRegistering ? "/api/auth/register" : "/api/auth/login"
      const body = isRegistering ? { username, password, fullName } : { username, password }
      const response = await fetch(apiUrl(endpoint), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message ?? "Unable to authenticate")
      }

      setToken(result.data.token)
      navigate("/dashboard", { replace: true })
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to authenticate")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-3xl font-bold">{isRegistering ? "Create account" : "Login"}</h1>
        <p className="mb-6 text-sm text-slate-600">Access your QAHub workspace.</p>

        <form onSubmit={submit}>
          {isRegistering && (
            <input
              type="text"
              placeholder="Full name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="mb-4 w-full rounded-lg border p-3"
              required
            />
          )}

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="mb-4 w-full rounded-lg border p-3"
            autoComplete="username"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mb-4 w-full rounded-lg border p-3"
            autoComplete={isRegistering ? "new-password" : "current-password"}
            minLength={isRegistering ? 8 : undefined}
            required
          />

          {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          <button disabled={isSubmitting} className="w-full rounded-lg bg-slate-900 p-3 text-white disabled:opacity-60">
            {isSubmitting ? "Please wait…" : isRegistering ? "Create account" : "Login"}
          </button>
        </form>

        <button
          type="button"
          className="mt-4 w-full text-sm text-slate-700 underline"
          onClick={() => { setIsRegistering(!isRegistering); setError("") }}
        >
          {isRegistering ? "Already have an account? Login" : "Need an account? Register"}
        </button>

        <p className="mt-6 text-center text-sm">Back to <Link className="underline" to="/">home</Link></p>
      </div>
    </div>
  )
}

export default Login
