import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { Organisations } from '../pages/Organisations';
import { Dispensaires } from '../pages/Dispensaires';
import Patients from '../pages/Patients';
import { DataEntries } from '../pages/DataEntries';
import { Reports } from '../pages/Reports';
import Users from '../pages/Users';
import TestUserModal from '../pages/TestUserModal';
import TatitraPreview from '../pages/TatitraPreview';
import FitorianaStatsTest from '../pages/FitorianaStatsTest';
import PrescriptionSubFormExample from '../pages/PrescriptionSubFormExample';
import Settings from '../pages/Settings';
import Support from '../pages/Support';

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
        path="/patients"
        element={
          <ProtectedRoute>
            <Patients />
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
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tatitra-preview"
        element={
          <ProtectedRoute>
            <TatitraPreview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/fitoriana-stats-test"
        element={
          <ProtectedRoute>
            <FitorianaStatsTest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/prescription-example"
        element={
          <ProtectedRoute>
            <PrescriptionSubFormExample />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/support"
        element={
          <ProtectedRoute>
            <Support />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}