import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "../Home"
import Login from "../pages/Login"
import Dashboard from "../pages/Dashboard"
import ProtectedRoute from "./ProtectedRoute"

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes