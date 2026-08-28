import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, UserCheck, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, role, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid #e2e8f0',
      padding: '0.9rem 0'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0f766e, #0284c7)',
            color: '#ffffff',
            padding: '0.55rem',
            borderRadius: '0.65rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Building2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              CivicPulse<span style={{ color: '#0284c7' }}>.gov</span>
            </div>
            <div style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 600 }}>
              Smart Civic Resolution Platform
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="mobile-hidden" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <a href="/#home" style={{ fontWeight: 600, color: '#334155', fontSize: '0.925rem' }}>Home</a>
          <a href="/#how-it-works" style={{ fontWeight: 600, color: '#334155', fontSize: '0.925rem' }}>How It Works</a>
          <a href="/#track" style={{ fontWeight: 600, color: '#334155', fontSize: '0.925rem' }}>Track Complaint</a>
        </nav>

        {/* Actions / Auth Buttons */}
        <div className="mobile-hidden" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link
                to="/citizen/dashboard"
                className="btn btn-primary-citizen"
              >
                <LayoutDashboard size={16} />
                Citizen Dashboard
              </Link>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="btn btn-outline"
                title="Logout"
                style={{ padding: '0.65rem' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <>
              <Link to="/citizen/login" className="btn btn-primary-citizen">
                <UserCheck size={17} />
                Citizen Login
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button 
          className="desktop-hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{ background: 'none', border: 'none', padding: '0.5rem', cursor: 'pointer', color: '#0f172a' }}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="desktop-hidden" style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '1rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <a href="/#home" onClick={() => setIsMobileMenuOpen(false)} style={{ fontWeight: 600, color: '#334155', padding: '0.5rem 0' }}>Home</a>
          <a href="/#how-it-works" onClick={() => setIsMobileMenuOpen(false)} style={{ fontWeight: 600, color: '#334155', padding: '0.5rem 0' }}>How It Works</a>
          <a href="/#track" onClick={() => setIsMobileMenuOpen(false)} style={{ fontWeight: 600, color: '#334155', padding: '0.5rem 0' }}>Track Complaint</a>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
            {isAuthenticated ? (
              <>
                <Link
                  to="/citizen/dashboard"
                  className="btn btn-primary-citizen"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ justifyContent: 'center' }}
                >
                  <LayoutDashboard size={16} />
                  Citizen Dashboard
                </Link>
                <button
                  onClick={() => { logout(); setIsMobileMenuOpen(false); navigate('/'); }}
                  className="btn btn-outline"
                  style={{ justifyContent: 'center' }}
                >
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/citizen/login" onClick={() => setIsMobileMenuOpen(false)} className="btn btn-primary-citizen" style={{ justifyContent: 'center' }}>
                  <UserCheck size={17} /> Citizen Login
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
