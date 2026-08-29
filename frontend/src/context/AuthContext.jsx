import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginCitizenApi, registerCitizenApi, getMeApi, loginGoogleApi, updateProfileApi } from '../services/authService';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext();

const SESSION_KEY = 'civic_session';

export function AuthProvider({ children }) {
  // Read session synchronously on initialization to eliminate loading flicker
  const getInitialSession = () => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.token && parsed.user) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return null;
  };

  const initialSession = getInitialSession();

  const [user, setUser] = useState(initialSession ? initialSession.user : null);
  const [role, setRole] = useState(initialSession ? initialSession.role : null); // 'citizen' | 'admin' | null
  const [token, setToken] = useState(initialSession ? initialSession.token : null);
  const [loading, setLoading] = useState(false);

  // Background token freshness check (non-blocking)
  useEffect(() => {
    if (token) {
      getMeApi()
        .then((res) => {
          if (res?.user) {
            setUser(res.user);
          }
        })
        .catch((e) => {
          // If token is explicitly unauthorized (401), clear session
          if (e?.message?.includes('401') || e?.response?.status === 401) {
            console.warn('Session expired:', e.message);
            logout();
          }
        });
    }
  }, []);

  // Listen for Supabase OAuth redirects on mount
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.access_token) {
        const currentSession = localStorage.getItem(SESSION_KEY);
        // Only trigger exchange if citizen session is not already established
        if (!currentSession || !JSON.parse(currentSession)?.token) {
          setLoading(true);
          try {
            await handleGoogleLogin(session.access_token);
            if (window.location.hash) {
              window.history.replaceState(null, '', window.location.pathname);
            }
          } catch (err) {
            console.error('Google OAuth exchange failed:', err.message);
          } finally {
            setLoading(false);
          }
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
