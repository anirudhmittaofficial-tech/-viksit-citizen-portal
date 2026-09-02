import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Loader2, Check, AlertCircle, Globe } from 'lucide-react';
import apiClient from '../../services/apiClient';

/**
 * Professional, Robust Speech-to-Text Component
 * Features:
 * - High accuracy Web Speech API (window.SpeechRecognition / window.webkitSpeechRecognition)
 * - Automatic Fallback: MediaRecorder + Backend transcription via Gemini AI
 * - Language switcher: English (en-IN) & Hindi (hi-IN)
 * - Live interim transcript display without losing or overwriting existing user text
 * - Clean state lifecycle: Ready -> Listening -> Processing -> Completed -> Error
 * - Auto-reconnect handling for pause resilience while preserving accumulated final text
 * - Fully editable text box with touch-friendly controls
 */
export default function SpeechInput({
  label,
  value = '',
  onChange,
  placeholder,
  rows = 1,
  type = 'text',
  required = false
}) {
  const [selectedLang, setSelectedLang] = useState('en-IN'); // 'en-IN' | 'hi-IN'
  const [micState, setMicState] = useState('ready'); // 'ready' | 'listening' | 'processing' | 'completed' | 'error'
  const [interimText, setInterimText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Refs for tracking mutable lifecycle state safely
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const mediaStreamRef = useRef(null);
  
  const isExplicitlyActiveRef = useRef(false);
  const initialTextAtStartRef = useRef('');
  const accumulatedFinalRef = useRef('');
  const statusTimerRef = useRef(null);

  const isTextArea = rows > 1;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isExplicitlyActiveRef.current = false;
      stopAllMedia();
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    };
  }, []);

  const stopAllMedia = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
      mediaRecorderRef.current = null;
    }
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      } catch (e) {}
      mediaStreamRef.current = null;
    }
  };

  // Helper to commit text to parent
  const commitTextToField = (newFinalSegment) => {
    if (!newFinalSegment) return;
    const base = initialTextAtStartRef.current.trim();
    const accumulated = accumulatedFinalRef.current.trim();

    let combined = base;
    if (accumulated) {
      combined = base ? `${base} ${accumulated}` : accumulated;
    }

    if (onChange) {
      onChange({ target: { value: combined } });
    }
  };

  // Helper to start Web Speech API
  const startBrowserSpeechRecognition = (SpeechRecognitionClass) => {
    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLang;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        if (!isExplicitlyActiveRef.current) return;
        setMicState('listening');
        setErrorMessage('');
      };

      recognition.onresult = (event) => {
        if (!isExplicitlyActiveRef.current) return;
        let currentInterim = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcriptSegment = result[0]?.transcript || '';
          if (result.isFinal) {
            const clean = transcriptSegment.trim();
            if (clean) {
              accumulatedFinalRef.current = accumulatedFinalRef.current
                ? `${accumulatedFinalRef.current} ${clean}`
                : clean;
              commitTextToField(clean);
            }
          } else {
            currentInterim += transcriptSegment;
          }
        }
        setInterimText(currentInterim);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error event:', event.error);
        const err = event.error;

        if (err === 'no-speech') {
          // If no speech is heard in a small pause and user still has mic on, don't kill unless terminated
          if (!isExplicitlyActiveRef.current) {
            setMicState('error');
            setErrorMessage('No speech detected. Please speak clearly and try again.');
          }
          return;
        }

        if (err === 'not-allowed' || err === 'service-not-allowed') {
          isExplicitlyActiveRef.current = false;
          setMicState('error');
          setErrorMessage('Microphone permission is required for voice reporting. Please allow microphone access in your browser settings.');
          stopAllMedia();
          return;
        }

        if (err === 'network') {
          console.log('Browser speech recognition network/service error. Switching to backend STT fallback...');
          // Trigger backend recording fallback
          fallbackToBackendRecording();
          return;
        }

        if (err === 'audio-capture') {
          isExplicitlyActiveRef.current = false;
          setMicState('error');
          setErrorMessage('Microphone could not be accessed. Please check your microphone hardware.');
          stopAllMedia();
          return;
        }

        if (err === 'language-not-supported') {
          isExplicitlyActiveRef.current = false;
          setMicState('error');
          setErrorMessage('Selected language recognition is not supported by your browser engine. Please try another language.');
          stopAllMedia();
          return;
        }

        if (err === 'aborted') {
          return;
        }

        // Generic fallback error
        setMicState('error');
        setErrorMessage('Speech recognition is temporarily unavailable. Please try again or type manually.');
      };

      recognition.onend = () => {
        // If user is still actively recording and browser ended due to brief silence, restart gracefully
        if (isExplicitlyActiveRef.current) {
          try {
            recognition.start();
          } catch (e) {
            // If restart fails, finish current speech
            finishRecordingSuccessfully();
          }
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Web Speech API failed to initialize, trying MediaRecorder fallback:', err);
      fallbackToBackendRecording();
    }
  };

  // Fallback: MediaRecorder + Backend API (/api/speech/transcribe)
  const fallbackToBackendRecording = async () => {
    try {
      stopAllMedia();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
        else if (MediaRecorder.isTypeSupported('audio/ogg')) mimeType = 'audio/ogg';
        else mimeType = '';
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstart = () => {
        setMicState('listening');
        setErrorMessage('');
      };

      recorder.onstop = async () => {
        if (audioChunksRef.current.length === 0) {
          setMicState('ready');
          return;
        }

        setMicState('processing');
        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });

        try {
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Data = reader.result;
            try {
              const res = await apiClient.post('/speech/transcribe', {
                audioBase64: base64Data,
                mimeType: recorder.mimeType || 'audio/webm',
                language: selectedLang
              });

              if (res.data && res.data.success && res.data.transcript) {
                const transcribed = res.data.transcript.trim();
                if (transcribed) {
                  accumulatedFinalRef.current = accumulatedFinalRef.current
                    ? `${accumulatedFinalRef.current} ${transcribed}`
                    : transcribed;
                  commitTextToField(transcribed);
                  setMicState('completed');
                  statusTimerRef.current = setTimeout(() => setMicState('ready'), 4000);
                } else {
                  setMicState('error');
                  setErrorMessage('No speech detected. Please speak clearly and try again.');
                }
              } else {
                setMicState('error');
                setErrorMessage('Could not recognize speech. Please try again.');
              }
            } catch (apiErr) {
              console.error('Server transcription error:', apiErr);
              setMicState('error');
              setErrorMessage('Speech recognition is temporarily unavailable. Please try again or type manually.');
            }
          };
        } catch (readErr) {
          setMicState('error');
          setErrorMessage('Could not process audio recording.');
        }
      };

      recorder.start(250);
      mediaRecorderRef.current = recorder;
    } catch (permErr) {
      isExplicitlyActiveRef.current = false;
      setMicState('error');
      if (permErr.name === 'NotAllowedError' || permErr.name === 'PermissionDeniedError') {
        setErrorMessage('Microphone permission is required for voice reporting. Please allow microphone access in your browser settings.');
      } else {
        setErrorMessage('Microphone could not be accessed. Please check your microphone hardware.');
      }
    }
  };

  // Main Handler: Start Voice Recording
  const handleStartRecording = async () => {
    if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    
    // Check for Secure Context (HTTPS or localhost)
    if (!window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      setMicState('error');
      setErrorMessage('Microphone access requires a secure HTTPS connection.');
      return;
    }

    isExplicitlyActiveRef.current = true;
    initialTextAtStartRef.current = value || '';
    accumulatedFinalRef.current = '';
    setInterimText('');
    setErrorMessage('');
    setMicState('listening');

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognitionClass) {
      startBrowserSpeechRecognition(SpeechRecognitionClass);
    } else {
      fallbackToBackendRecording();
    }
  };

  // Finish and teardown
  const finishRecordingSuccessfully = () => {
    isExplicitlyActiveRef.current = false;
    setInterimText('');
    stopAllMedia();

    if (accumulatedFinalRef.current.trim()) {
      setMicState('completed');
      statusTimerRef.current = setTimeout(() => {
        setMicState('ready');
      }, 4000);
    } else {
      setMicState('ready');
    }
  };

  // Main Handler: Stop Voice Recording
  const handleStopRecording = () => {
    isExplicitlyActiveRef.current = false;
    setInterimText('');

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
      return;
    }

    finishRecordingSuccessfully();
  };

  // Render computed preview value for live display
  const getDisplayValue = () => {
    if (micState === 'listening' && interimText) {
      const base = value.trim();
      return base ? `${base} ${interimText}` : interimText;
    }
    return value;
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>
            {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
          </label>

          {/* Voice Controls: Language Selector & Mic Button */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            
            {/* Language Switcher */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: '#f1f5f9',
                borderRadius: '0.5rem',
                padding: '2px',
                border: '1px solid #e2e8f0',
                fontSize: '0.75rem',
                fontWeight: 700
              }}
            >
              <button
                type="button"
                disabled={micState === 'listening' || micState === 'processing'}
                onClick={() => setSelectedLang('en-IN')}
                style={{
                  padding: '0.2rem 0.5rem',
                  borderRadius: '0.35rem',
                  border: 'none',
                  cursor: (micState === 'listening' || micState === 'processing') ? 'not-allowed' : 'pointer',
                  backgroundColor: selectedLang === 'en-IN' ? '#ffffff' : 'transparent',
                  color: selectedLang === 'en-IN' ? '#0F4C81' : '#64748b',
                  boxShadow: selectedLang === 'en-IN' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease'
                }}
                title="English (India)"
              >
                English
              </button>
              <button
                type="button"
                disabled={micState === 'listening' || micState === 'processing'}
                onClick={() => setSelectedLang('hi-IN')}
                style={{
                  padding: '0.2rem 0.5rem',
                  borderRadius: '0.35rem',
                  border: 'none',
                  cursor: (micState === 'listening' || micState === 'processing') ? 'not-allowed' : 'pointer',
                  backgroundColor: selectedLang === 'hi-IN' ? '#ffffff' : 'transparent',
                  color: selectedLang === 'hi-IN' ? '#0F4C81' : '#64748b',
                  boxShadow: selectedLang === 'hi-IN' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease'
                }}
                title="हिन्दी (India)"
              >
                हिन्दी
              </button>
            </div>

            {/* Microphone State Toggle Button */}
            {micState === 'listening' ? (
              <button
                type="button"
                onClick={handleStopRecording}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  border: '1.5px solid #dc2626',
                  padding: '0.32rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 0 0 4px rgba(220, 38, 38, 0.18)',
                  transition: 'all 0.2s ease'
                }}
                title="Click to Stop Recording"
              >
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#dc2626', animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
                <span>🔴 Stop Recording</span>
              </button>
            ) : micState === 'processing' ? (
              <button
                type="button"
                disabled
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: '#fef3c7',
                  color: '#b45309',
                  border: '1.5px solid #f59e0b',
                  padding: '0.32rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'wait'
                }}
              >
                <Loader2 size={14} className="animate-spin" />
                <span>⏳ Processing speech...</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartRecording}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: '#f0f9ff',
                  color: '#0F4C81',
                  border: '1.5px solid #0F4C81',
                  padding: '0.32rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                title="Tap to speak in English or Hindi"
              >
                <Mic size={14} />
                <span>🎙️ Tap to speak</span>
              </button>
            )}

          </div>
        </div>
      )}

      {/* Input / Textarea Field */}
      {isTextArea ? (
        <textarea
          required={required}
          rows={rows}
          placeholder={placeholder}
          value={getDisplayValue()}
          onChange={onChange}
          style={{
            width: '100%',
            padding: '0.85rem 1rem',
            border: micState === 'listening' ? '2px solid #ef4444' : '1.5px solid #cbd5e1',
            borderRadius: '0.6rem',
            fontSize: '0.95rem',
            outline: 'none',
            resize: 'vertical',
            transition: 'all 0.2s ease',
            backgroundColor: micState === 'listening' ? '#fff5f5' : '#ffffff',
            boxShadow: micState === 'listening' ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : 'none'
          }}
        />
      ) : (
        <input
          type={type}
          required={required}
          placeholder={placeholder}
          value={getDisplayValue()}
          onChange={onChange}
          style={{
            width: '100%',
            padding: '0.85rem 1rem',
            border: micState === 'listening' ? '2px solid #ef4444' : '1.5px solid #cbd5e1',
            borderRadius: '0.6rem',
            fontSize: '0.95rem',
            outline: 'none',
            transition: 'all 0.2s ease',
            backgroundColor: micState === 'listening' ? '#fff5f5' : '#ffffff',
            boxShadow: micState === 'listening' ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : 'none'
          }}
        />
      )}

      {/* Clear Visual Feedback & Status Indicators */}
      {micState === 'listening' && (
        <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: '#dc2626' }}>
          <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#dc2626' }} />
          <span>Listening ({selectedLang === 'hi-IN' ? 'हिन्दी' : 'English'}). Speak clearly at normal speed...</span>
        </div>
      )}

      {micState === 'completed' && (
        <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 700, color: '#16a34a' }}>
          <Check size={15} />
          <span>✓ Voice converted to text</span>
        </div>
      )}

      {micState === 'error' && errorMessage && (
        <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 700, color: '#b91c1c' }}>
          <AlertCircle size={15} />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
