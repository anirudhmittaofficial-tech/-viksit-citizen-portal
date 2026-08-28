import React from 'react';
import { FileText, Award, Layers } from 'lucide-react';

export default function TranscriptViewer({ transcript, interimTranscript, confidence, detectedLanguage }) {
  if (!transcript && !interimTranscript) return null;

  const totalWords = (transcript + ' ' + interimTranscript).trim().split(/\s+/).filter(Boolean).length;
  const totalChars = (transcript + interimTranscript).length;

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '0.75rem',
        padding: '1.25rem',
        marginBottom: '1.25rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={18} color="#0F4C81" />
          <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
            Live Speech Transcript
          </strong>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.775rem', color: '#64748b', fontWeight: 600 }}>
          <span>Words: <strong>{totalWords}</strong></span>
          <span>Chars: <strong>{totalChars}</strong></span>
          <span>Confidence: <strong style={{ color: confidence > 80 ? '#166534' : '#d97706' }}>{confidence}%</strong></span>
        </div>
      </div>

      <div
        style={{
          backgroundColor: '#f8fafc',
          border: '1.5px solid #cbd5e1',
          borderRadius: '0.5rem',
          padding: '1rem',
          fontSize: '0.95rem',
          color: '#1e293b',
          lineHeight: 1.6,
          minHeight: '60px'
        }}
      >
        <span>{transcript}</span>
        {interimTranscript && (
          <span style={{ color: '#94a3b8', fontStyle: 'italic', marginLeft: '4px' }}>
            {interimTranscript}...
          </span>
        )}
      </div>

      {detectedLanguage && (
        <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
          🗣️ Identified Speech Script: <strong>{detectedLanguage}</strong>
        </div>
      )}
    </div>
  );
}
