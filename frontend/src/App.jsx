import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ComplaintProvider } from './context/ComplaintContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ComplaintProvider>
          <AppRoutes />
        </ComplaintProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
