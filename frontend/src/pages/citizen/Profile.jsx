import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Shield, Save, Key, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { complaints } = useComplaints();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Dynamically update form inputs when user changes
  React.useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSavedSuccess(false);
    try {
      await updateProfile({
        name: profileData.name,
        phone: profileData.phone,
        address: profileData.address
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile details.');
    } finally {
      setIsSaving(false);
    }
  };

  const myCount = complaints.length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
          Citizen Profile & Account Settings
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          Manage your personal contact details, residential ward address, and security preferences.
        </p>
      </div>

      {savedSuccess && (
        <div style={{ backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac', padding: '1rem', borderRadius: '0.6rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
          <CheckCircle2 size={18} /> Profile details saved successfully!
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', padding: '1rem', borderRadius: '0.6rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
        
        {/* Profile Card */}
        <form onSubmit={handleSaveProfile} className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={20} color="#0F4C81" /> Personal Information
          </h2>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>Full Name</label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #cbd5e1', borderRadius: '0.5rem', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>Email Address</label>
            <input
              type="email"
              disabled
              value={profileData.email}
              style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #cbd5e1', borderRadius: '0.5rem', backgroundColor: '#f1f5f9', color: '#64748b' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>Phone Number</label>
            <input
              type="text"
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #cbd5e1', borderRadius: '0.5rem', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>Residential Ward Address</label>
            <input
              type="text"
              value={profileData.address}
              onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
              style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #cbd5e1', borderRadius: '0.5rem', outline: 'none' }}
            />
          </div>

          <button type="submit" disabled={isSaving} className="btn btn-primary-citizen" style={{ gap: '0.4rem', marginTop: '0.5rem' }}>
            <Save size={16} /> {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        {/* Stats & Security Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          {/* Stats Box */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
              My Civic Participation Summary
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'center' }}>
              <div style={{ backgroundColor: '#f0f9ff', padding: '1rem', borderRadius: '0.6rem' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0F4C81' }}>{myCount}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>Total Complaints</div>
              </div>
              <div style={{ backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '0.6rem' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#166534' }}>{resolvedCount}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>Resolved Issues</div>
              </div>
            </div>
          </div>

          {/* Change Password Box */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Key size={18} color="#0F4C81" /> Security & Password
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <input
                type="password"
                placeholder="Current Password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                style={{ padding: '0.7rem 0.9rem', border: '1.5px solid #cbd5e1', borderRadius: '0.5rem', outline: 'none' }}
              />
              <input
                type="password"
                placeholder="New Password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                style={{ padding: '0.7rem 0.9rem', border: '1.5px solid #cbd5e1', borderRadius: '0.5rem', outline: 'none' }}
              />
              <button
                type="button"
                onClick={() => alert('Password update request processed!')}
                className="btn btn-outline"
                style={{ width: '100%', marginTop: '0.2rem' }}
              >
                Update Password
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
