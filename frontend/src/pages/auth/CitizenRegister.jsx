import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, User, Mail, Phone, Lock, MapPin, UserPlus, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabaseClient';

export default function CitizenRegister() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: ''
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { registerCitizen } = useAuth();
  const navigate = useNavigate();

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 10) {
        setFormData({ ...formData, [name]: numericValue });
      }
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify both password fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await registerCitizen({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        address: formData.address
      });
      navigate('/citizen/login', { state: { message: 'Account created successfully. Please sign in.' } });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '3rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* Brand Header */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '2rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #0f766e, #0284c7)', color: '#fff', padding: '0.5rem', borderRadius: '0.65rem' }}>
          <Building2 size={24} />
        </div>
        <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>Smart Civic Resolution Platform</span>
      </Link>

      <div className="card glass-card" style={{ maxWidth: '560px', width: '100%', padding: '2.5rem', boxShadow: '0 12px 36px rgba(0,0,0,0.08)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginTop: '0.4rem' }}>
            Create Your Account
          </h1>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', marginBottom: '1.5rem', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} autoComplete="off">
          
          {/* Full Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="#94a3b8" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Aarav Sharma"
                autoComplete="off"
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.6rem', border: '1.5px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.95rem', outline: 'none' }}
              />
            </div>
          </div>

          {/* Email & Phone grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.6rem', border: '1.5px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.95rem', outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>Phone Number *</label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} color="#94a3b8" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="tel"
                  name="phone"
                  required
                  maxLength={10}
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  autoComplete="off"
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.6rem', border: '1.5px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.95rem', outline: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.6rem', border: '1.5px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.95rem', outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.6rem', border: '1.5px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.95rem', outline: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>Residential Address *</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={18} color="#94a3b8" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                placeholder="House No., Street Name, Ward Number"
                autoComplete="off"
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.6rem', border: '1.5px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.95rem', outline: 'none' }}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary-citizen"
            style={{ padding: '0.85rem', fontSize: '1rem', marginTop: '0.5rem' }}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
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

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/citizen/login" style={{ color: '#0f766e', fontWeight: 700 }}>
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
