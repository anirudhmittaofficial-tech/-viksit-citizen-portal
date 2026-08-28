import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Building2, Lock, ArrowLeft, CheckCircle2, Eye, EyeOff, Save } from 'lucide-react';
import { resetPasswordApi } from '../../services/authService';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Simple password strength check
  const isStrong = password.length >= 6 && /[A-Z]/.test(password) && /[0-9]/.test(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const data = await resetPasswordApi(token, password);
      setMessage(data.message || 'Password reset successful. You can now log in.');
      setTimeout(() => navigate('/citizen/login'), 3000);
    } catch (err) {
      setError(err.message || 'Invalid or expired token.');
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', zIndex: 10 }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '0.65rem' }}>
            <Building2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>Smart Civic Resolution Platform</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>Citizen Portal</div>
          </div>
        </div>

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
            <CheckCircle2 size={32} color="#34d399" />
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem' }}>
            Set a New Password
          </h2>
          <p style={{ fontSize: '1.05rem', opacity: 0.9, lineHeight: 1.6 }}>
            Please create a strong new password for your account. Make sure it contains uppercase letters, numbers, and is at least 6 characters long.
          </p>
        </div>

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
              Reset Password
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Create a new secure password
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

          {!message && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} autoComplete="off">
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
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
                {password && (
                  <p style={{ fontSize: '0.75rem', marginTop: '0.4rem', fontWeight: 600, color: isStrong ? '#10b981' : '#f59e0b' }}>
                    {isStrong ? 'Strong password' : 'Weak password (should contain uppercase, numbers, and be 6+ chars)'}
                  </p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      padding: '0.75rem 2.6rem 0.75rem 2.6rem',
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
                disabled={loading || !password || !confirmPassword}
                className="btn btn-primary-citizen"
                style={{ padding: '0.85rem', fontSize: '1rem', marginTop: '0.5rem' }}
              >
                <Save size={18} />
                {loading ? 'Resetting...' : 'Save New Password'}
              </button>
            </form>
          )}
          
          <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: '#64748b' }}>
            <Link to="/citizen/login" style={{ color: '#0f766e', fontWeight: 700 }}>
              Back to Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
