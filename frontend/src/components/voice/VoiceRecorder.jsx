import React from 'react';
import { Mic, MicOff, Play, Pause, Square, RotateCcw, Trash2, Globe, Sparkles } from 'lucide-react';

export default function VoiceRecorder({
  isListening,
  isPaused,
  recordingTime,
  confidence,
  detectedLanguage,
  selectedLanguage,
  onLanguageChange,
  onStart,
  onPause,
  onResume,
  onStop,
  onClear
}) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div
      className="card"
      style={{
        padding: '1.25rem 1.5rem',
        backgroundColor: isListening ? '#f0f9ff' : '#ffffff',
        border: isListening ? '2px solid #0F4C81' : '1px solid #e2e8f0',
        borderRadius: '0.75rem',
        marginBottom: '1rem',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Top Header & Language Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} color="#0F4C81" />
          <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
            AI Multilingual Voice Assistant
          </strong>
          {isListening && (
            <span style={{ backgroundColor: '#ef4444', color: '#ffffff', fontSize: '0.75rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '9999px', animation: 'pulse 1s infinite' }}>
              ● LIVE RECORDING
            </span>
          )}
        </div>

        {/* Language Selector Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Globe size={16} color="#64748b" />
          <select
            value={selectedLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '0.4rem',
              border: '1px solid #cbd5e1',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#0F4C81',
              outline: 'none',
              backgroundColor: '#ffffff'
            }}
          >
            <option value="auto">🌐 Auto Detect (Hindi / English)</option>
            <option value="en-IN">🇬🇧 English (India)</option>
            <option value="hi-IN">🇮🇳 हिन्दी (Hindi)</option>
          </select>
        </div>
      </div>

      {/* Center Waveform & Timer Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Mic Button & Waveform Animation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            type="button"
            onClick={isListening ? onPause : (isPaused ? onResume : onStart)}
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: isListening ? '#ef4444' : '#0F4C81',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isListening ? '0 0 0 8px rgba(239, 68, 68, 0.25)' : '0 6px 16px rgba(15, 76, 129, 0.3)',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            title={isListening ? 'Pause Recording' : 'Start Voice Recording'}
          >
            {isListening ? <Pause size={24} /> : <Mic size={24} />}
          </button>

          {/* Timer & Live Status */}
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: isListening ? '#ef4444' : '#0f172a', fontFamily: 'monospace' }}>
              ⏱️ {formatTime(recordingTime)}
            </div>
            <div style={{ fontSize: '0.775rem', color: '#64748b', fontWeight: 600 }}>
              {isListening ? (
                <span>Speaking... (Confidence: <strong>{confidence}%</strong>)</span>
              ) : isPaused ? (
                <span style={{ color: '#d97706' }}>Paused - Click Mic to Resume</span>
              ) : (
                <span>Click microphone to speak naturally in Hindi or English</span>
              )}
            </div>
          </div>
        </div>

        {/* Live Sound Wave Bar Animation */}
        {isListening && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '28px' }}>
            {[40, 75, 100, 60, 90, 45, 80, 50, 95, 30].map((h, i) => (
              <div
                key={i}
                style={{
                  width: '4px',
                  height: `${h}%`,
                  backgroundColor: '#0F4C81',
                  borderRadius: '2px',
                  animation: `pulse 0.6s infinite ease-in-out ${i * 0.1}s alternate`
                }}
              />
            ))}
          </div>
        )}

        {/* Action Controls (Stop, Clear) */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {isListening && (
            <button
              type="button"
              onClick={onStop}
              className="btn btn-outline"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', gap: '0.3rem', color: '#ef4444', borderColor: '#fca5a5' }}
            >
              <Square size={14} /> Stop
            </button>
          )}

          {(recordingTime > 0 || isPaused) && (
            <button
              type="button"
              onClick={onClear}
              className="btn btn-outline"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', gap: '0.3rem' }}
            >
              <Trash2 size={14} /> Reset
            </button>
          )}
        </div>

      </div>

      {/* Language Auto-Detection Badge */}
      {detectedLanguage && (
        <div style={{ marginTop: '0.75rem', fontSize: '0.775rem', color: '#0F4C81', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span>🗣️ Detected Language:</span>
          <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.15rem 0.5rem', borderRadius: '0.3rem' }}>
            {detectedLanguage}
          </span>
        </div>
      )}
    </div>
  );
}
