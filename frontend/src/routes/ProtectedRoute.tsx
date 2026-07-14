import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { getToken } from "../lib/auth"

type Props = {
  children: ReactNode
}

function ProtectedRoute({ children }: Props) {
  const isAuthenticated = Boolean(getToken())

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
