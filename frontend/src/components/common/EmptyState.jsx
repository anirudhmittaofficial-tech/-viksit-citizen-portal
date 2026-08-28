import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'No Data Found', message = 'There are no records matching your criteria.', icon, actionButton }) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '3.5rem 1.5rem',
        backgroundColor: '#ffffff',
        borderRadius: '0.75rem',
        border: '1px dashed #cbd5e1',
        margin: '1rem 0'
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#f1f5f9',
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem'
        }}
      >
        {icon || <Inbox size={28} />}
      </div>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: '400px', margin: '0 auto 1.25rem' }}>
        {message}
      </p>
      {actionButton}
    </div>
  );
}
