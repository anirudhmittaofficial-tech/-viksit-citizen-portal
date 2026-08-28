import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Building2, Mail, Lock, LogIn, ArrowLeft, ShieldCheck, Heart, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabaseClient';

export default function CitizenLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { loginCitizen, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/citizen/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/citizen/login`
        }
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message || 'Google Sign-in failed to initialize.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await loginCitizen({ email, password });
      navigate('/citizen/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mobile-col" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      
      {/* Left Side Illustration & Message */}
      <div className="mobile-hidden" style={{
        flex: 1,
        background: 'linear-gradient(135deg, #0f766e 0%, #0284c7 100%)',
        color: '#ffffff',
        padding: '3rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', zIndex: 10 }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '0.65rem' }}>
            <Building2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>Smart Civic Resolution Platform</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>Citizen Portal</div>
          </div>
        </div>

        {/* Center Illustration Content */}
        <div style={{ maxWidth: '480px', margin: 'auto 0', zIndex: 10 }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem'
          }}>
            <Heart size={32} color="#34d399" />
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem' }}>
            Help improve your community by reporting civic issues.
          </h2>
          <p style={{ fontSize: '1.05rem', opacity: 0.9, lineHeight: 1.6 }}>
            Report road hazards, sanitation delays, water pipe leaks, and broken streetlights directly to municipal authorities.
          </p>


        </div>

        {/* Bottom Back Button */}
        <div style={{ zIndex: 10 }}>
          <Link to="/" style={{ color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem', opacity: 0.85 }}>
            <ArrowLeft size={16} /> Return to Main Landing Page
          </Link>
        </div>
      </div>

      {/* Right Side Form */}
      <div className="mobile-w-full mobile-p-4" style={{
        width: '520px',
        backgroundColor: '#ffffff',
        padding: '4rem 3rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>
          
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem' }}>
              Welcome Back
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Sign in to your account
            </p>
          </div>

          {error && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', marginBottom: '1.5rem', fontWeight: 600 }}>
              {error}
            </div>
          )}
          {successMessage && !error && (
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '0.75rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', marginBottom: '1.5rem', fontWeight: 600 }}>
              {successMessage}
            </div>
          )}



          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} autoComplete="off">
            
            {/* Email Address */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.6rem',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '0.5rem',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  style={{
                    width: '100%',
                    padding: '0.75rem 2.6rem 0.75rem 2.6rem',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '0.5rem',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.9rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.2rem'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Options */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember Me
              </label>
              <Link to="/forgot-password" style={{ color: '#0f766e', fontWeight: 700 }}>
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary-citizen"
              style={{ padding: '0.85rem', fontSize: '1rem', marginTop: '0.5rem' }}
            >
              <LogIn size={18} />
              {isSubmitting ? 'Authenticating...' : 'Sign In'}
            </button>

          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0', color: '#94a3b8' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>or</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
          </div>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            style={{
              width: '100%',
              padding: '0.85rem',
              border: '1.5px solid #cbd5e1',
              borderRadius: '0.5rem',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontSize: '0.95rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.borderColor = '#94a3b8';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: '#64748b' }}>
            Don't have an account?{' '}
            <Link to="/citizen/register" style={{ color: '#0f766e', fontWeight: 700 }}>
              Create Account
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}
