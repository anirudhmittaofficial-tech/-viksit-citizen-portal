import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Public Pages
import Home from '../pages/landing/Home';

// Auth Pages
import CitizenLogin from '../pages/auth/CitizenLogin';
import CitizenRegister from '../pages/auth/CitizenRegister';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

// Layouts & Protected Routes
import ProtectedRoute from '../components/common/ProtectedRoute';
import CitizenLayout from '../components/citizen/CitizenLayout';

// Citizen Pages
import CitizenDashboard from '../pages/citizen/Dashboard';
import ReportIssue from '../pages/citizen/ReportIssue';
import MyComplaints from '../pages/citizen/MyComplaints';
import Notifications from '../pages/citizen/Notifications';
import Profile from '../pages/citizen/Profile';


export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/citizen/login" element={<CitizenLogin />} />
      <Route path="/citizen/register" element={<CitizenRegister />} />

      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Protected Citizen Portal */}
      <Route
        path="/citizen"
        element={
          <ProtectedRoute allowedRole="citizen">
            <CitizenLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/citizen/dashboard" replace />} />
        <Route path="dashboard" element={<CitizenDashboard />} />
        <Route path="report-issue" element={<ReportIssue />} />
        <Route path="my-complaints" element={<MyComplaints />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
      </Route>


      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
