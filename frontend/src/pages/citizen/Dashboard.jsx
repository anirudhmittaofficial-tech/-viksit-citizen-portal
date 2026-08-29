import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Search, 
  MapPin, 
  Eye, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  FileText,
  Camera,
  ShieldCheck,
  Send,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { useComplaints } from '../../context/ComplaintContext';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import ComplaintDetail from './ComplaintDetail';

export default function CitizenDashboard() {
  const { complaints, addComment } = useComplaints();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [trackIdInput, setTrackIdInput] = useState('');
  const [trackedResult, setTrackedResult] = useState(null);
  const [trackError, setTrackError] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All'); // 'All' | 'Submitted' | 'In Progress' | 'Resolved'
  const [locationViewScope, setLocationViewScope] = useState('nearby'); // 'nearby' | 'all'

  // User-specific complaints for dashboard metrics
  const userEmail = user?.email?.toLowerCase();
  const userId = String(user?.id || user?._id || '');
  const userAddressRaw = (user?.address || '').toLowerCase().trim();

  // Extract meaningful address keywords (e.g., "shadnagar", "pocharam", "hyderabad")
  const userAddressTokens = userAddressRaw
    .split(/[\s,.-]+/)
    .filter(token => token.length >= 3 && !['road', 'street', 'near', 'flat', 'house', 'plot', 'lane', 'no', 'h.no'].includes(token));

  const myComplaintsList = complaints.filter(item => {
    if (!user) return false;
    const itemEmail = (item.citizenEmail || item.citizen_email || item.email || '').toLowerCase();
    const itemCitizen = String(item.citizen || item.citizenId || item.citizen_id || item.userId || '');
    return (userEmail && itemEmail === userEmail) || (userId && itemCitizen === userId);
  });

  // Dynamic complaint counts from user's personal complaints
  const submittedCount = myComplaintsList.filter(c => c.status === 'Submitted' || c.status === 'Verified').length;
  const inProgressCount = myComplaintsList.filter(c => c.status === 'In Progress' || c.status === 'Assigned' || c.status === 'Pending').length;
  const resolvedCount = myComplaintsList.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;

  // Filter complaints based on user's location + status filter
  const filteredRecentComplaints = complaints.filter(c => {
    // 1. Status Filter
    const matchesStatus = (
      activeFilter === 'All' ||
      (activeFilter === 'Submitted' && (c.status === 'Submitted' || c.status === 'Verified')) ||
      (activeFilter === 'In Progress' && (c.status === 'In Progress' || c.status === 'Assigned' || c.status === 'Pending')) ||
      (activeFilter === 'Resolved' && (c.status === 'Resolved' || c.status === 'Closed'))
    );
    if (!matchesStatus) return false;

    // 2. Location Filter (if scope is 'nearby')
    if (locationViewScope === 'nearby') {
      const itemEmail = (c.citizenEmail || c.citizen_email || c.email || '').toLowerCase();
      const itemCitizen = String(c.citizen || c.citizenId || c.citizen_id || c.userId || '');
      const isMyOwn = (userEmail && itemEmail === userEmail) || (userId && itemCitizen === userId);
      
      // Always show user's own issues
      if (isMyOwn) return true;

      // Match against user address keywords
      if (userAddressTokens.length > 0) {
        const compLocationText = (
          (c.location || '') + ' ' +
          (c.formattedAddress || '') + ' ' +
          (c.area || '') + ' ' +
          (c.locality || '') + ' ' +
          (c.city || '') + ' ' +
          (c.district || '') + ' ' +
          (c.landmark || '')
        ).toLowerCase();

        return userAddressTokens.some(token => compLocationText.includes(token));
      }

      // If user has no address set, show their own complaints by default
      return isMyOwn;
    }

    return true;
  });

  // Track complaint handler with smooth loading
  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (!trackIdInput || !trackIdInput.trim()) {
      setTrackError('Please enter a valid Complaint ID.');
      setTrackedResult(null);
      return;
    }

    setIsTracking(true);
    setTrackError('');
    setTrackedResult(null);

    setTimeout(() => {
      const cleanSearch = trackIdInput.trim().toLowerCase();
      const found = complaints.find(c => 
        (c.complaintId && c.complaintId.toLowerCase() === cleanSearch) ||
        (c.id && c.id.toLowerCase() === cleanSearch) ||
        (c._id && c._id.toLowerCase() === cleanSearch) ||
        (c.complaintId && c.complaintId.toLowerCase().includes(cleanSearch))
      );

      if (found) {
        setTrackedResult(found);
        setTrackError('');
      } else {
        setTrackedResult(null);
        setTrackError(`No complaint found with ID "${trackIdInput.trim()}". Please verify your Complaint ID.`);
      }
      setIsTracking(false);
    }, 350);
  };

  const scrollToTrackSection = () => {
    const el = document.getElementById('track-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/citizen/my-complaints');
    }
  };

  const formatDateStr = (dateVal) => {
    if (!dateVal) return 'Recently';
    try {
      return new Date(dateVal).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return String(dateVal);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
      
      {/* 2. MAIN WELCOME CARD */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0F4C81 0%, #0a3861 60%, #2E8B57 100%)',
          color: '#ffffff',
          padding: '2.5rem 2rem',
          borderRadius: '1rem',
          boxShadow: '0 10px 25px rgba(15, 76, 129, 0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}
      >
        <div style={{ flex: '1 1 320px' }}>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 800, margin: '0 0 0.5rem 0', lineHeight: 1.2 }}>
            Welcome back, {user?.name?.split(' ')[0] || 'Citizen'} 👋
          </h1>
          <p style={{ color: '#e2e8f0', fontSize: '1.05rem', margin: 0, opacity: 0.95, maxWidth: '580px' }}>
            Report civic problems in your area and track their resolution.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Visually Dominant Primary CTA Button */}
          <Link
            to="/citizen/report-issue"
            style={{
              backgroundColor: '#2E8B57',
              color: '#ffffff',
              padding: '0.9rem 1.8rem',
              fontSize: '1.05rem',
              fontWeight: 800,
              borderRadius: '0.65rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(46, 139, 87, 0.4)',
              transition: 'transform 0.15s ease, boxShadow 0.15s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <span>📍 Report an Issue</span>
          </Link>

          {/* Secondary Button */}
          <button
            onClick={scrollToTrackSection}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              border: '1.5px solid rgba(255, 255, 255, 0.4)',
              padding: '0.9rem 1.4rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              borderRadius: '0.65rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            Track My Complaints
          </button>
        </div>
      </div>

      {/* 4. SIMPLE "MY COMPLAINTS" SECTION */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            My Complaints
          </h2>
          {activeFilter !== 'All' && (
            <button
              onClick={() => setActiveFilter('All')}
              style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0F4C81', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Clear Filter (Show All)
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          
          {/* Submitted Card */}
          <div
            onClick={() => setActiveFilter(activeFilter === 'Submitted' ? 'All' : 'Submitted')}
            className="card"
            style={{
              cursor: 'pointer',
              padding: '1.25rem',
              border: activeFilter === 'Submitted' ? '2px solid #0F4C81' : '1px solid #e2e8f0',
              backgroundColor: activeFilter === 'Submitted' ? '#f0f9ff' : '#ffffff',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569' }}>Submitted</span>
              <span style={{ fontSize: '1.2rem' }}>🔵</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0F4C81' }}>{submittedCount}</div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Number of complaints submitted</span>
          </div>

          {/* In Progress Card */}
          <div
            onClick={() => setActiveFilter(activeFilter === 'In Progress' ? 'All' : 'In Progress')}
            className="card"
            style={{
              cursor: 'pointer',
              padding: '1.25rem',
              border: activeFilter === 'In Progress' ? '2px solid #d97706' : '1px solid #e2e8f0',
              backgroundColor: activeFilter === 'In Progress' ? '#fffbeb' : '#ffffff',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569' }}>In Progress</span>
              <span style={{ fontSize: '1.2rem' }}>🟡</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#d97706' }}>{inProgressCount}</div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Number currently being handled</span>
          </div>

          {/* Resolved Card */}
          <div
            onClick={() => setActiveFilter(activeFilter === 'Resolved' ? 'All' : 'Resolved')}
            className="card"
            style={{
              cursor: 'pointer',
              padding: '1.25rem',
              border: activeFilter === 'Resolved' ? '2px solid #2E8B57' : '1px solid #e2e8f0',
              backgroundColor: activeFilter === 'Resolved' ? '#f0fdf4' : '#ffffff',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569' }}>Resolved</span>
              <span style={{ fontSize: '1.2rem' }}>🟢</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#2E8B57' }}>{resolvedCount}</div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Number successfully resolved</span>
          </div>

        </div>
      </div>

      {/* 5. ADD "TRACK A COMPLAINT" */}
      <div id="track-section" className="card" style={{ padding: '1.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
          Track Your Complaint
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.925rem', marginBottom: '1.25rem' }}>
          Enter your complaint ID to check the latest status.
        </p>

        <form onSubmit={handleTrackSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', maxWidth: '600px' }}>
          <input
            type="text"
            placeholder="Enter Complaint ID (e.g. CMP-2026-8901)"
            value={trackIdInput}
            onChange={(e) => setTrackIdInput(e.target.value)}
            style={{
              flex: 1,
              minWidth: '240px',
              padding: '0.75rem 1rem',
              border: '1.5px solid #cbd5e1',
              borderRadius: '0.5rem',
              fontSize: '0.95rem',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            disabled={isTracking}
            className="btn btn-primary-citizen"
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: isTracking ? 0.8 : 1,
              cursor: isTracking ? 'wait' : 'pointer'
            }}
          >
            {isTracking ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#ffffff',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }} />
                <span>Locating Ticket...</span>
              </>
            ) : (
              <span>Track Complaint</span>
            )}
          </button>
        </form>

        {trackError && (
          <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', color: '#991b1b', fontSize: '0.875rem' }}>
            ⚠️ {trackError}
          </div>
        )}

        {/* Search Result display */}
        {trackedResult && (
          <div style={{ marginTop: '1.5rem', padding: '1.25rem', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F4C81' }}>
                  #{trackedResult.complaintId || trackedResult.id}
                </span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0' }}>
                  {trackedResult.title}
                </h3>
              </div>
              <StatusBadge status={trackedResult.status} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.875rem', color: '#334155' }}>
              <div><strong>Submitted:</strong> {formatDateStr(trackedResult.createdAt)}</div>
              <div><strong>Department:</strong> {trackedResult.department || 'Civic Department'}</div>
              <div><strong>Location:</strong> {trackedResult.location || 'Reported Location'}</div>
              <div><strong>Assigned Officer:</strong> {trackedResult.assignedOfficer || 'Pending Assignment'}</div>
            </div>

            {trackedResult.timeline && trackedResult.timeline.length > 0 && (
              <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '0.75rem', fontSize: '0.85rem', color: '#475569' }}>
                <strong>Latest Update:</strong> {trackedResult.timeline[trackedResult.timeline.length - 1]?.note || 'Processing complaint'}
              </div>
            )}

            <div style={{ marginTop: '0.5rem' }}>
              <button
                onClick={() => setSelectedComplaint(trackedResult)}
                className="btn btn-outline"
                style={{ fontSize: '0.85rem', padding: '0.45rem 1rem', color: '#0F4C81', borderColor: '#0F4C81' }}
              >
                <Eye size={14} /> View Full Audit Details →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 6. RECENT COMPLAINTS */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {locationViewScope === 'nearby' ? 'Complaints in Your Location' : 'All Recent Complaints'}
              </h2>
              {user?.address && (
                <span style={{ backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '0.15rem 0.55rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
                  📍 {user.address}
                </span>
              )}
            </div>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
              {locationViewScope === 'nearby' ? 'Showing issues matching your residential ward & registered location.' : 'Showing all municipal issues.'}
            </p>
          </div>

          {/* Scope Toggle & View All Link */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '0.2rem', borderRadius: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setLocationViewScope('nearby')}
                style={{
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.78rem',
                  fontWeight: locationViewScope === 'nearby' ? 800 : 600,
                  backgroundColor: locationViewScope === 'nearby' ? '#ffffff' : 'transparent',
                  color: locationViewScope === 'nearby' ? '#0f766e' : '#64748b',
                  border: 'none',
                  borderRadius: '0.4rem',
                  cursor: 'pointer',
                  boxShadow: locationViewScope === 'nearby' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                📍 My Location
              </button>
              <button
                type="button"
                onClick={() => setLocationViewScope('all')}
                style={{
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.78rem',
                  fontWeight: locationViewScope === 'all' ? 800 : 600,
                  backgroundColor: locationViewScope === 'all' ? '#ffffff' : 'transparent',
                  color: locationViewScope === 'all' ? '#0f766e' : '#64748b',
                  border: 'none',
                  borderRadius: '0.4rem',
                  cursor: 'pointer',
                  boxShadow: locationViewScope === 'all' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                🌐 All Areas
              </button>
            </div>

            <Link to="/citizen/my-complaints" style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F4C81', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              My Complaints →
            </Link>
          </div>
        </div>

        {filteredRecentComplaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '0.5rem', border: '1px dashed #cbd5e1' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: 800, color: '#0f172a' }}>
              {locationViewScope === 'nearby' ? `No other complaints in ${user?.address || 'your location'} yet` : 'No complaints yet'}
            </h3>
            <p style={{ margin: '0 0 1.25rem 0' }}>You can report a new issue or switch to "All Areas" to view city-wide complaints.</p>
            <Link to="/citizen/report-issue" className="btn btn-primary-citizen" style={{ fontSize: '0.85rem' }}>
              📍 Report Issue in My Location
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredRecentComplaints.slice(0, 3).map((item) => (
              <div
                key={item.id || item.complaintId}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1.1rem 1.25rem',
                  backgroundColor: '#ffffff',
                  borderRadius: '0.75rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div style={{ flex: '1 1 260px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F4C81' }}>
                      #{item.complaintId || item.id}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                  <h3 style={{ fontSize: '1.025rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0' }}>
                    {item.title}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
                    <span>📍 {item.location || 'Hyderabad'}</span>
                    <span>•</span>
                    <span>Submitted: {formatDateStr(item.createdAt)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedComplaint(item)}
                  className="btn btn-outline"
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#0F4C81',
                    borderColor: '#cbd5e1'
                  }}
                >
                  View Details →
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link
            to="/citizen/my-complaints"
            className="btn btn-outline"
            style={{ width: '100%', maxWidth: '280px', padding: '0.7rem 1.25rem', fontSize: '0.9rem', fontWeight: 700 }}
          >
            View All Complaints
          </Link>
        </div>
      </div>

      {/* 7. SIMPLE "HOW IT WORKS" SECTION */}
      <div className="card" style={{ padding: '1.75rem', backgroundColor: '#ffffff' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem', textAlign: 'center' }}>
          How It Works
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          
          <div style={{ textAlign: 'center', padding: '1.25rem 1rem', backgroundColor: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>1️⃣</div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
              1. Report
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
              Take a photo and describe the issue.
            </p>
          </div>

          <div style={{ textAlign: 'center', padding: '1.25rem 1rem', backgroundColor: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>2️⃣</div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
              2. Track
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
              Follow your complaint status.
            </p>
          </div>

          <div style={{ textAlign: 'center', padding: '1.25rem 1rem', backgroundColor: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>3️⃣</div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
              3. Resolve
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
              Receive updates when the issue is resolved.
            </p>
          </div>

        </div>
      </div>

      {/* Complaint Detail Modal View */}
      {selectedComplaint && (
        <ComplaintDetail
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          onAddComment={addComment}
        />
      )}

    </div>
  );
}
