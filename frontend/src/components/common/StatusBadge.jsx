import React from 'react';

export default function StatusBadge({ status }) {
  let badgeStyle = {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    borderColor: '#e2e8f0'
  };

  switch (status) {
    case 'Submitted':
      badgeStyle = {
        backgroundColor: '#f1f5f9',
        color: '#475569',
        borderColor: '#cbd5e1'
      };
      break;
    case 'Verified':
      badgeStyle = {
        backgroundColor: '#e0f2fe',
        color: '#0369a1',
        borderColor: '#bae6fd'
      };
      break;
    case 'Assigned':
      badgeStyle = {
        backgroundColor: '#f0f5ff',
        color: '#1d4ed8',
        borderColor: '#c7d2fe'
      };
      break;
    case 'In Progress':
    case 'Pending':
      badgeStyle = {
        backgroundColor: '#fffbe6',
        color: '#b45309',
        borderColor: '#fef08a'
      };
      break;
    case 'Resolved':
      badgeStyle = {
        backgroundColor: '#f0fdf4',
        color: '#166534',
        borderColor: '#bbf7d0'
      };
      break;
    case 'Closed':
      badgeStyle = {
        backgroundColor: '#f8fafc',
        color: '#64748b',
        borderColor: '#e2e8f0'
      };
      break;
    case 'Rejected':
      badgeStyle = {
        backgroundColor: '#fef2f2',
        color: '#991b1b',
        borderColor: '#fecaca'
      };
      break;
    default:
      break;
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.2rem 0.65rem',
        borderRadius: '0.375rem',
        fontSize: '0.75rem',
        fontWeight: 600,
        border: '1px solid',
        lineHeight: 1.2,
        letterSpacing: '0.01em',
        ...badgeStyle
      }}
    >
      {status}
    </span>
  );
}

