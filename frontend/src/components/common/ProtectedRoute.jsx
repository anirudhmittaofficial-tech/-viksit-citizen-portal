import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, allowedRole }) {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e2e8f0',
            borderTopColor: '#0284c7',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <div style={{ fontWeight: 600, color: '#64748b' }}>Authorizing portal access...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated user to citizen login page
    return <Navigate to="/citizen/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    // Role mismatch: redirect to citizen dashboard
    return <Navigate to="/citizen/dashboard" replace />;
  }

  return children;
}
