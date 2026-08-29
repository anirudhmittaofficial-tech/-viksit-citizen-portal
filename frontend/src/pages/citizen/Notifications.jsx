import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle2, Clock, ShieldCheck, FileText, ArrowLeft } from 'lucide-react';
import { useComplaints } from '../../context/ComplaintContext';
import EmptyState from '../../components/common/EmptyState';

export default function Notifications() {
  const { notifications, markAllNotificationsRead } = useComplaints();
  const navigate = useNavigate();

  // Automatically mark all notifications as read when the citizen opens the notifications page
  useEffect(() => {
    markAllNotificationsRead();
  }, []);

  const formatNotificationTime = (dateVal) => {
    if (!dateVal) return 'Recent';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return String(dateVal);
      return d.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* Back Button */}
      <div style={{ marginBottom: '1.25rem' }}>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-outline"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.45rem 0.9rem',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 700,
            cursor: 'pointer',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            color: '#334155'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
          Notifications & Alerts
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.25rem' }}>
          Real-time status updates, field officer dispatch alerts, and resolution notices.
        </p>
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell size={28} />}
          title="No notifications yet"
          message="You'll receive real-time alerts whenever complaints are registered, officers are assigned, or issue statuses change."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notifications.map((item) => {
            const rawTime = item.createdAt || item.created_at || item.date || item.timestamp;
            return (
              <div
                key={item.id || item._id}
                className="card"
                style={{
                  padding: '1.25rem 1.5rem',
                  borderLeft: '4px solid #0f766e',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    {item.type === 'resolved' ? (
                      <CheckCircle2 size={18} color="#166534" />
                    ) : item.type === 'assigned' ? (
                      <ShieldCheck size={18} color="#86198f" />
                    ) : (
                      <FileText size={18} color="#0f766e" />
                    )}
                    <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      {item.title}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
                    <Clock size={13} />
                    <span>{formatNotificationTime(rawTime)}</span>
                  </div>
                </div>

                <p style={{ color: '#475569', fontSize: '0.9rem', margin: 0, paddingLeft: '1.75rem', lineHeight: 1.5 }}>
                  {item.message}
                </p>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
