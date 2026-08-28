import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  FileText, 
  Bell, 
  User, 
  LogOut, 
  Building2,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';

export default function CitizenLayout() {
  const { user, logout } = useAuth();
  const { notifications } = useComplaints();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const unreadCount = notifications.filter(n => n.unread).length;

  const sidebarItems = [
    { label: 'Dashboard', path: '/citizen/dashboard', icon: LayoutDashboard },
    { label: 'Report Issue', path: '/citizen/report-issue', icon: PlusCircle },
    { label: 'My Complaints', path: '/citizen/my-complaints', icon: FileText },
    { label: 'Notifications', path: '/citizen/notifications', icon: Bell, badge: unreadCount }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="layout-root" style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex' }}>
      
      {/* 1. Left Sidebar (Desktop Only) */}
      <aside className="desktop-sidebar" style={{
        width: sidebarCollapsed ? '75px' : '260px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 40,
        padding: sidebarCollapsed ? '4rem 0.5rem 1.5rem 0.5rem' : '4rem 1.25rem 1.5rem 1.25rem',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        {/* Toggle Arrow Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={{
            position: 'absolute',
            right: '-12px',
            top: '20px',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
            color: '#475569',
            zIndex: 45
          }}
        >
          {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Sidebar Nav Items */}
        <nav style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          alignItems: sidebarCollapsed ? 'center' : 'stretch'
        }}>
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={sidebarCollapsed ? item.label : undefined}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: sidebarCollapsed ? '0' : '0.75rem',
                  padding: '0.75rem 1rem',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  borderRadius: '0.5rem',
                  fontWeight: isActive ? 700 : 600,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  color: isActive ? '#0F4C81' : '#475569',
                  backgroundColor: isActive ? '#e0f2fe' : 'transparent',
                  width: sidebarCollapsed ? '42px' : '100%',
                  height: '42px',
                  position: 'relative'
                })}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                {!sidebarCollapsed && (
                  <span style={{ flex: 1, whiteSpace: 'nowrap' }} className="animate-fade-in">{item.label}</span>
                )}
                {item.badge > 0 && (
                  sidebarCollapsed ? (
                    <span style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      fontSize: '0.6rem',
                      fontWeight: 800,
                      borderRadius: '50%',
                      width: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {item.badge}
                    </span>
                  ) : (
                    <span style={{
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      borderRadius: '9999px',
                      padding: '0.1rem 0.45rem'
                    }}>
                      {item.badge}
                    </span>
                  )
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Logout button at the bottom of the sidebar */}
        <button
          onClick={handleLogout}
          title={sidebarCollapsed ? 'Logout' : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: sidebarCollapsed ? '0' : '0.75rem',
            padding: '0.75rem 1rem',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            borderRadius: '0.5rem',
            fontWeight: 600,
            fontSize: '0.9rem',
            color: '#991b1b',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            width: sidebarCollapsed ? '42px' : '100%',
            height: '42px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            alignSelf: 'center'
          }}
        >
          <LogOut size={18} style={{ flexShrink: 0 }} />
          {!sidebarCollapsed && (
            <span className="animate-fade-in" style={{ whiteSpace: 'nowrap' }}>Logout</span>
          )}
        </button>
      </aside>

      {/* Right Content Area (Sidebar is next to this) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* 2. Topbar (Desktop Only) */}
        <header className="desktop-topbar" style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          zIndex: 30,
          padding: '0.75rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          height: '64px'
        }}>
          {/* Left Side: Logo & Brand Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #0F4C81, #2E8B57)',
              color: '#ffffff',
              width: '32px',
              height: '32px',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(15, 76, 129, 0.15)'
            }}>
              <Building2 size={18} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0F4C81' }}>Smart Civic</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, borderLeft: '1px solid #cbd5e1', paddingLeft: '0.4rem' }}>Citizen Portal</span>
            </div>
          </div>

          {/* Right Side: Profile & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            
            {/* Quick Actions (e.g. + Report Issue) */}
            <NavLink
              to="/citizen/report-issue"
              className="btn btn-primary-citizen"
              style={{
                padding: '0.45rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 800,
                borderRadius: '0.5rem',
                whiteSpace: 'nowrap'
              }}
            >
              <PlusCircle size={14} />
              <span>+ Report Issue</span>
            </NavLink>

            {/* Profile Dropdown/Link */}
            <NavLink
              to="/citizen/profile"
              style={({ isActive }) => ({
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: isActive ? '#e0f2fe' : '#f8fafc',
                border: '1px solid #cbd5e1',
                padding: '0.45rem 0.85rem',
                borderRadius: '0.5rem',
                color: isActive ? '#0F4C81' : '#334155',
                fontSize: '0.85rem',
                fontWeight: 700,
                textDecoration: 'none'
              })}
            >
              <User size={16} color="#0F4C81" />
              <span>{user?.name?.split(' ')[0] || 'Profile'}</span>
            </NavLink>
          </div>
        </header>

        {/* 3. Mobile Header (Mobile Only) */}
        <header className="mobile-header" style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          padding: '0.75rem 1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          display: 'none',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '60px'
        }}>
          {/* Left: Hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#334155',
              padding: '0.4rem',
              display: 'inline-flex',
              alignItems: 'center',
              cursor: 'pointer'
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Center: Mobile Logo */}
          <Link to="/citizen/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}>
            <div style={{
              background: 'linear-gradient(135deg, #0F4C81, #2E8B57)',
              color: '#ffffff',
              width: '30px',
              height: '30px',
              borderRadius: '0.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Building2 size={16} />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0F4C81' }}>Smart Civic</span>
          </Link>

          {/* Right: Profile Shortcut */}
          <NavLink
            to="/citizen/profile"
            style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              padding: '0.4rem',
              borderRadius: '0.4rem',
              color: '#334155',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <User size={16} color="#0F4C81" />
          </NavLink>

          {/* 4. Mobile Navigation Menu Dropdown (nested inside header for absolute positioning context) */}
          {mobileMenuOpen && (
            <div className="mobile-menu-drawer animate-fade-in" style={{
              backgroundColor: '#ffffff',
              borderBottom: '1px solid #e2e8f0',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              position: 'absolute',
              top: '60px',
              left: 0,
              right: 0,
              zIndex: 45,
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
            }}>
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '0.5rem',
                      fontWeight: isActive ? 700 : 600,
                      fontSize: '0.9rem',
                      textDecoration: 'none',
                      color: isActive ? '#0F4C81' : '#475569',
                      backgroundColor: isActive ? '#e0f2fe' : '#f8fafc'
                    })}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge > 0 && (
                      <span style={{
                        backgroundColor: '#ef4444',
                        color: '#ffffff',
                        fontSize: '0.725rem',
                        fontWeight: 800,
                        borderRadius: '9999px',
                        padding: '0.15rem 0.5rem'
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
              
              {/* Mobile Profile & Logout */}
              <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '0.5rem 0' }} />
              
              <NavLink
                to="/citizen/profile"
                onClick={() => setMobileMenuOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '0.5rem',
                  fontWeight: isActive ? 700 : 600,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  color: isActive ? '#0F4C81' : '#475569',
                  backgroundColor: isActive ? '#e0f2fe' : '#f8fafc'
                })}
              >
                <User size={18} color="#0F4C81" />
                <span>Profile Settings</span>
              </NavLink>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: '#991b1b',
                  backgroundColor: '#fef2f2',
                  textAlign: 'left',
                  width: '100%',
                  cursor: 'pointer',
                  border: 'none',
                  outline: 'none'
                }}
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </header>

        {/* 5. Main Content Outlet */}
        <main className="main-content" style={{ flex: 1, padding: '2rem 1.5rem', width: '100%', minHeight: 0 }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .layout-root {
            flex-direction: column !important;
          }
          .desktop-sidebar {
            display: none !important;
          }
          .desktop-topbar {
            display: none !important;
          }
          .mobile-header {
            display: flex !important;
          }
          .main-content {
            padding: 1.5rem 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}
