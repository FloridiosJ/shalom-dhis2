import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

// ✅ Changer les imports nommés en imports par défaut
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Organisations from "./pages/Organisations";
import Unauthorized from "./components/Unauthorized";
import DataEntries from "./pages/DataEntries";
import Dispensaires from "./pages/Dispensaires";
import Users from "./pages/Users";
import Patients from "./pages/Patients";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Routes publiques */}
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

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
                <ProtectedRoute roles={["admin"]}>
                  <Users />
                </ProtectedRoute>
              }
            />

            <Route
              path="/data-entries"
              element={
                <ProtectedRoute roles={["admin", "manager", "user"]}>
                  <DataEntries />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dispensaires"
              element={
                <ProtectedRoute roles={["admin", "manager", "user"]}>
                  <Dispensaires />
                </ProtectedRoute>
              }
            />

            <Route
              path="/reports"
              element={
                <ProtectedRoute roles={["admin", "manager", "user"]}>
                  <Dashboard />
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

            <Route
              path="/patients"
              element={
                <ProtectedRoute roles={["admin", "manager", "user"]}>
                  <Patients />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
