import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, ArrowLeft, ShieldCheck, Heart, Send } from 'lucide-react';
import { forgotPasswordApi } from '../../services/authService';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    
    try {
      const data = await forgotPasswordApi(email);
      setMessage(data.message || 'If an account exists with this email, a password reset link has been sent. Please check your inbox.');
    } catch (err) {
      setError(err.message || 'Unable to send reset link. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      
      {/* Left Side Illustration */}
      <div style={{
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

        {/* Center Content */}
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
            <ShieldCheck size={32} color="#34d399" />
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem' }}>
            Secure Password Recovery
          </h2>
          <p style={{ fontSize: '1.05rem', opacity: 0.9, lineHeight: 1.6 }}>
            Don't worry if you've forgotten your password. We'll securely send you a link to get back into your account.
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
      <div style={{
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
              Forgot Password
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Enter your email to receive a password reset link.
            </p>
          </div>
          
          {message && (
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '0.75rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', marginBottom: '1.5rem', fontWeight: 600 }}>
              {message}
            </div>
          )}

          {error && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', marginBottom: '1.5rem', fontWeight: 600 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} autoComplete="off">
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
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

            <button
              type="submit"
              disabled={loading || !email}
              className="btn btn-primary-citizen"
              style={{ padding: '0.85rem', fontSize: '1rem', marginTop: '0.5rem' }}
            >
              <Send size={18} />
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
          
          <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: '#64748b' }}>
            Remembered your password?{' '}
            <Link to="/citizen/login" style={{ color: '#0f766e', fontWeight: 700 }}>
              Back to Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
