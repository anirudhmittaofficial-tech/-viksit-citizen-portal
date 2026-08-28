import React, { useState } from 'react';
import { Sparkles, Check, X, Wand2 } from 'lucide-react';
import { improveComplaintGrammar } from '../../utils/aiSpeechUtils';

export default function AIGrammarCard({ rawText, onAccept, onReject }) {
  const [improvedText, setImprovedText] = useState('');
  const [hasImproved, setHasImproved] = useState(false);

  if (!rawText || rawText.trim().length < 5) return null;

  const handleRunImprovement = () => {
    const result = improveComplaintGrammar(rawText);
    setImprovedText(result);
    setHasImproved(true);
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1.5px solid #FFC107',
        borderRadius: '0.75rem',
        padding: '1.25rem',
        marginBottom: '1.25rem',
        boxShadow: '0 4px 14px rgba(255, 193, 7, 0.15)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Wand2 size={18} color="#d97706" />
          <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
            AI Complaint Enhancer (Grammar & Structure)
          </strong>
        </div>

        {!hasImproved && (
          <button
            type="button"
            onClick={handleRunImprovement}
            className="btn"
            style={{
              backgroundColor: '#FFC107',
              color: '#0f172a',
              padding: '0.35rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: 800,
              gap: '0.35rem'
            }}
          >
            <Sparkles size={14} /> Improve Complaint Structure
          </button>
        )}
      </div>

      {hasImproved && (
        <div>
          <div style={{ backgroundColor: '#fefce8', border: '1px solid #fef08a', padding: '1rem', borderRadius: '0.5rem', marginBottom: '0.85rem' }}>
            <div style={{ fontSize: '0.775rem', fontWeight: 800, color: '#854d0e', marginBottom: '0.35rem' }}>
              ENHANCED FORMAL COMPLAINT VERSION:
            </div>
            <p style={{ fontSize: '0.925rem', color: '#0f172a', fontWeight: 600, margin: 0, lineHeight: 1.5 }}>
              "{improvedText}"
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => onAccept(improvedText)}
              className="btn"
              style={{ backgroundColor: '#2E8B57', color: '#ffffff', padding: '0.35rem 0.85rem', fontSize: '0.8rem', fontWeight: 800, gap: '0.35rem' }}
            >
              <Check size={14} /> Accept Enhanced Text
            </button>
            
            <button
              type="button"
              onClick={() => {
                setHasImproved(false);
                if (onReject) onReject();
              }}
              className="btn btn-outline"
              style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem', gap: '0.35rem' }}
            >
              <X size={14} /> Keep Original
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
