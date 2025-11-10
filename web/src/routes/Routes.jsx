import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { Organisations } from '../pages/Organisations';
import { Dispensaires } from '../pages/Dispensaires';
import { DataEntries } from '../pages/DataEntries';
import TestUserModal from '../pages/TestUserModal';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/test-user-modal" element={<TestUserModal />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/organisations"
        element={
          <ProtectedRoute>
            <Organisations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dispensaires"
        element={
          <ProtectedRoute>
            <Dispensaires />
          </ProtectedRoute>
        }
      />
      <Route
        path="/data-entries"
        element={
          <ProtectedRoute>
            <DataEntries />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}