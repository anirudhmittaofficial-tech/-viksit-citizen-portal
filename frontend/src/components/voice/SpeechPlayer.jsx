import React, { useState, useEffect } from 'react';
import { Volume2, Play, Pause, Square } from 'lucide-react';
import { detectLanguage } from '../../utils/aiSpeechUtils';

export default function SpeechPlayer({ text }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!text || text.trim().length === 0) return null;

  const handlePlay = () => {
    if (!window.speechSynthesis) {
      alert('Text-to-Speech is not supported by your browser.');
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const lang = detectLanguage(text);
    
    utterance.lang = lang === 'Hindi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f1f5f9', padding: '0.3rem 0.75rem', borderRadius: '9999px' }}>
      <Volume2 size={16} color="#0F4C81" />
      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>Read Aloud:</span>
      
      {!isPlaying ? (
        <button
          type="button"
          onClick={handlePlay}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0F4C81', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.8rem', fontWeight: 800 }}
        >
          <Play size={14} /> {isPaused ? 'Resume' : 'Play'}
        </button>
      ) : (
        <button
          type="button"
          onClick={handlePause}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d97706', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.8rem', fontWeight: 800 }}
        >
          <Pause size={14} /> Pause
        </button>
      )}

      {(isPlaying || isPaused) && (
        <button
          type="button"
          onClick={handleStop}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.8rem', fontWeight: 800 }}
        >
          <Square size={12} /> Stop
        </button>
      )}
    </div>
  );
}
