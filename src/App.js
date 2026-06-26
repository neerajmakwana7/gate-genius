import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import SecretaryDashboard from './pages/secretary/Dashboard';
import WatchmanDashboard from './pages/watchman/Dashboard';
import ResidentDashboard from './pages/resident/Dashboard';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/login" />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/secretary/dashboard" element={
        <ProtectedRoute allowedRole="SECRETARY">
          <SecretaryDashboard />
        </ProtectedRoute>
      } />
      <Route path="/watchman/dashboard" element={
        <ProtectedRoute allowedRole="WATCHMAN">
          <WatchmanDashboard />
        </ProtectedRoute>
      } />
      <Route path="/resident/dashboard" element={
        <ProtectedRoute allowedRole="RESIDENT">
          <ResidentDashboard />
        </ProtectedRoute>
      } />
      <Route path="/" element={
        !user ? <Navigate to="/login" /> :
        user.role === 'SECRETARY' ? <Navigate to="/secretary/dashboard" /> :
        user.role === 'WATCHMAN' ? <Navigate to="/watchman/dashboard" /> :
        <Navigate to="/resident/dashboard" />
      } />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;