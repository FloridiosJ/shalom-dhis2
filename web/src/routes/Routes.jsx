import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Login } from '@/pages/Login';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<div>Home</div>} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <div>Dashboard</div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}