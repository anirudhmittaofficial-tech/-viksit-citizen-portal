import React from 'react';
import { MapPin, Building2, Tag, Compass } from 'lucide-react';
import { extractLandmarksAndCategory } from '../../utils/aiSpeechUtils';

export default function ExtractedLocationCard({ speechText, onApplyExtracted }) {
  if (!speechText || speechText.trim().length < 8) return null;

  const extracted = extractLandmarksAndCategory(speechText);
  if (!extracted) return null;

  return (
    <div
      style={{
        backgroundColor: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: '0.75rem',
        padding: '1.25rem',
        marginBottom: '1.25rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <Compass size={18} color="#166534" />
        <strong style={{ fontSize: '0.95rem', color: '#166534' }}>
          AI Extracted Speech Entities (NLP Landmark & Department Routing)
        </strong>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', marginBottom: '0.85rem' }}>
        
        <div style={{ backgroundColor: '#ffffff', padding: '0.65rem 0.85rem', borderRadius: '0.4rem', border: '1px solid #dcfce7' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>LANDMARK / LOCATION</span>
          <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            <MapPin size={14} color="#0F4C81" /> {extracted.landmark}
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '0.65rem 0.85rem', borderRadius: '0.4rem', border: '1px solid #dcfce7' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>CATEGORY INFERRED</span>
          <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0F4C81', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            <Tag size={14} color="#0F4C81" /> {extracted.category}
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '0.65rem 0.85rem', borderRadius: '0.4rem', border: '1px solid #dcfce7' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>AUTO-ROUTED DEPARTMENT</span>
          <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            <Building2 size={14} color="#166534" /> {extracted.department}
          </div>
        </div>

      </div>

      {onApplyExtracted && (
        <button
          type="button"
          onClick={() => onApplyExtracted(extracted)}
          className="btn"
          style={{ backgroundColor: '#2E8B57', color: '#ffffff', padding: '0.35rem 0.85rem', fontSize: '0.8rem', fontWeight: 800, gap: '0.35rem' }}
        >
          ✓ Auto Fill Category & Department from Speech
        </button>
      )}
    </div>
  );
}
