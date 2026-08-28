import React from 'react';
import { CheckCircle2, Clock, ShieldCheck, UserCheck, CheckCheck, FileText } from 'lucide-react';

const getTimelineIcon = (status) => {
  switch (status) {
    case 'Submitted':
      return <FileText size={16} color="#0369a1" />;
    case 'Verified':
      return <ShieldCheck size={16} color="#92400e" />;
    case 'Assigned':
      return <UserCheck size={16} color="#86198f" />;
    case 'In Progress':
      return <Clock size={16} color="#3730a3" />;
    case 'Resolved':
      return <CheckCircle2 size={16} color="#166534" />;
    case 'Closed':
      return <CheckCheck size={16} color="#475569" />;
    default:
      return <Clock size={16} color="#0F4C81" />;
  }
};

export default function ComplaintTimeline({ timeline = [] }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div style={{ padding: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
        No timeline activity recorded yet.
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', paddingLeft: '1.5rem', margin: '1rem 0' }}>
      {/* Vertical Connecting Line */}
      <div
        style={{
          position: 'absolute',
          left: '11px',
          top: '8px',
          bottom: '8px',
          width: '2px',
          backgroundColor: '#cbd5e1',
          zIndex: 1
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {timeline.map((step, idx) => {
          const isLatest = idx === timeline.length - 1;
          return (
            <div key={idx} style={{ position: 'relative', zIndex: 2, display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              {/* Timeline Node Circle */}
              <div
                style={{
                  position: 'absolute',
                  left: '-1.5rem',
                  top: '0',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: isLatest ? '#ffffff' : '#f8fafc',
                  border: isLatest ? '2px solid #0F4C81' : '1.5px solid #cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isLatest ? '0 0 0 4px rgba(15, 76, 129, 0.15)' : 'none'
                }}
              >
                {getTimelineIcon(step.status)}
              </div>

              {/* Event Details */}
              <div style={{ flex: 1, backgroundColor: isLatest ? '#f0f9ff' : '#ffffff', border: isLatest ? '1px solid #bae6fd' : '1px solid #e2e8f0', borderRadius: '0.6rem', padding: '0.85rem 1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                  <strong style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 800 }}>
                    {step.status}
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                    {step.date}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0, lineHeight: 1.4 }}>
                  {step.note}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
