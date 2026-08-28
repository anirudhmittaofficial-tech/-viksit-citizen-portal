import React from 'react';

export default function SkeletonLoader({ count = 3, type = 'card' }) {
  const items = Array.from({ length: count });

  if (type === 'table') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {items.map((_, i) => (
          <div
            key={i}
            style={{
              height: '48px',
              backgroundColor: '#e2e8f0',
              borderRadius: '0.5rem',
              animation: 'pulse 1.5s infinite ease-in-out'
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
      {items.map((_, i) => (
        <div
          key={i}
          className="card"
          style={{
            height: '180px',
            backgroundColor: '#f1f5f9',
            animation: 'pulse 1.5s infinite ease-in-out'
          }}
        />
      ))}
    </div>
  );
}
