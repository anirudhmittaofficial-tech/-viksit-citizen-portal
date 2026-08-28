import React from 'react';
import { Bell, CheckCheck, CheckCircle2, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import { useComplaints } from '../../context/ComplaintContext';
import EmptyState from '../../components/common/EmptyState';

export default function Notifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useComplaints();

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
              Notifications & Alerts
            </h1>
            {unreadCount > 0 && (
              <span style={{ backgroundColor: '#ef4444', color: '#ffffff', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 800 }}>
                {unreadCount} New
              </span>
            )}
          </div>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Real-time status updates, field officer dispatch alerts, and resolution notices.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="btn btn-outline"
            style={{ gap: '0.4rem', fontSize: '0.85rem' }}
          >
            <CheckCheck size={16} /> Mark All as Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell size={28} />}
          title="No new notifications"
          message="You'll receive real-time alerts whenever officers are assigned or your complaints change status."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notifications.map((item) => (
            <div
              key={item.id || item._id}
              onClick={() => markNotificationRead(item.id || item._id)}
              className="card"
              style={{
                padding: '1.25rem 1.5rem',
                borderLeft: item.unread ? '4px solid #0F4C81' : '1px solid #e2e8f0',
                backgroundColor: item.unread ? '#f0f9ff' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {item.type === 'resolved' ? (
                    <CheckCircle2 size={18} color="#166534" />
                  ) : item.type === 'assigned' ? (
                    <ShieldCheck size={18} color="#86198f" />
                  ) : (
                    <Bell size={18} color="#0F4C81" />
                  )}
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                    {item.title}
                  </h3>
                </div>

                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                  {item.date ? new Date(item.date).toLocaleString() : 'Just now'}
                </span>
              </div>

              <p style={{ color: '#475569', fontSize: '0.9rem', margin: 0, paddingLeft: '1.6rem' }}>
                {item.message}
              </p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
