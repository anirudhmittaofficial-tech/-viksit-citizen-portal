import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginCitizenApi, registerCitizenApi, getMeApi, loginGoogleApi, updateProfileApi } from '../services/authService';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext();

const SESSION_KEY = 'civic_session';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 'citizen' | 'admin' | null
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore and validate session on app start
  useEffect(() => {
    const validateSession = async () => {
      try {
        const savedSession = localStorage.getItem(SESSION_KEY);
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          if (parsed.token) {
            // Validate the token against the backend
            const res = await getMeApi();
            setUser(res.user);
            setRole(parsed.role);
            setToken(parsed.token);
          } else {
            throw new Error('No token found in saved session');
          }
        }
      } catch (e) {
        console.error('Session validation failed:', e.message);
        localStorage.removeItem(SESSION_KEY);
      } finally {
        setLoading(false);
      }
    };
    validateSession();
  }, []);

  // Listen for Supabase OAuth redirects on mount
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setLoading(true);
        try {
          await handleGoogleLogin(session.access_token);
          // Clear the URL hash
          if (window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname);
          }
          // Redirect to dashboard
          window.location.href = '/citizen/dashboard';
        } catch (err) {
          console.error('Google OAuth exchange failed:', err.message);
        } finally {
          setLoading(false);
        }
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleCitizenLogin = async (credentials) => {
    const res = await loginCitizenApi(credentials);
    const sessionData = { user: res.user, role: res.role, token: res.token };
    setUser(res.user);
    setRole(res.role);
    setToken(res.token);
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    return res;
  };

  const handleCitizenRegister = async (formData) => {
    const res = await registerCitizenApi(formData);
    return res;
  };

  const handleGoogleLogin = async (supabaseToken) => {
    const res = await loginGoogleApi(supabaseToken);
    const sessionData = { user: res.user, role: res.role, token: res.token };
    setUser(res.user);
    setRole(res.role);
    setToken(res.token);
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    return res;
  };

  const handleUpdateProfile = async (profileData) => {
    const res = await updateProfileApi(profileData);
    const savedSession = localStorage.getItem(SESSION_KEY);
    if (savedSession) {
      const parsed = JSON.parse(savedSession);
      parsed.user = res.user;
      localStorage.setItem(SESSION_KEY, JSON.stringify(parsed));
    }
    setUser(res.user);
    return res;
  };


  const logout = () => {
    setUser(null);
    setRole(null);
    setToken(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const value = {
    user,
    role,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    loginCitizen: handleCitizenLogin,
    registerCitizen: handleCitizenRegister,
    loginGoogle: handleGoogleLogin,
    updateProfile: handleUpdateProfile,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
