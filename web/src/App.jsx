import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ToastProvider } from "./components/Toast";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Organisations from "./pages/Organisations";
import Unauthorized from "./components/Unauthorized";
import DataEntries from "./pages/DataEntries";
import Dispensaires from "./pages/Dispensaires";
import Users from "./pages/Users";
import Patients from "./pages/Patients";
import Reports from "./pages/Reports";
import TestUserModal from "./pages/TestUserModal";
import TatitraPreview from "./pages/TatitraPreview";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Avoid unnecessary refetches on window focus
      retry: 2, // Retry failed requests 2 times
      staleTime: 60 * 1000, // Consider data fresh for 1 minute by default
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Routes>
              {/* Routes publiques */}
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/test-user-modal" element={<TestUserModal />} />

              {/* Routes protégées */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Routes avec rôles spécifiques */}
              <Route
                path="/organisations"
                element={
                  <ProtectedRoute roles={["admin", "manager"]}>
                    <Organisations />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/users"
                element={
                  <ProtectedRoute roles={["admin", "manager"]}>
                    <Users />
                  </ProtectedRoute>
                }
              />

              {/* ✅ Routes accessibles aux agents */}
              <Route
                path="/data-entries"
                element={
                  <ProtectedRoute roles={["admin", "manager", "agent"]}>
                    <DataEntries />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dispensaires"
                element={
                  <ProtectedRoute roles={["admin", "manager"]}>
                    <Dispensaires />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/patients"
                element={
                  <ProtectedRoute roles={["admin", "manager", "agent"]}>
                    <Patients />
                  </ProtectedRoute>
                }
              />

              {/* ✅ Reports uniquement pour admin et manager */}
              <Route
                path="/reports"
                element={
                  <ProtectedRoute roles={["admin", "manager"]}>
                    <Reports />
                  </ProtectedRoute>
                }
              />

              {/* Tatitra Preview - accessible to all authenticated users */}
              <Route
                path="/tatitra-preview"
                element={
                  <ProtectedRoute roles={["admin", "manager", "agent"]}>
                    <TatitraPreview />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/settings"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
