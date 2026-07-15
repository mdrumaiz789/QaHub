import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";

import ProtectedRoute from "./ProtectedRoute";

import TestCasesPage from "../pages/test-cases";
import TestCaseDetailsPage from "../pages/test-case-details";
import ImportTestCasesPage from "../pages/import-test-cases";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Redirect root directly to Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />

        {/* Protected Application */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="test-cases" replace />} />

          <Route
            path="test-cases"
            element={<TestCasesPage />}
          />

          <Route
            path="test-cases/:testCaseId"
            element={<TestCaseDetailsPage />}
          />

          <Route
            path="test-cases/import"
            element={<ImportTestCasesPage />}
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;