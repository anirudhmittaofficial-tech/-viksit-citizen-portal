import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, Check } from 'lucide-react';
import { autoProcessSpeech } from '../../utils/aiSpeechUtils';

export default function SpeechInput({
  label,
  value,
  onChange,
  onAutoProcessed,
  placeholder,
  rows = 1,
  type = 'text',
  required = false
}) {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);
  const recognitionRef = useRef(null);

  const isTextArea = rows > 1;

  const startVoiceRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your browser. Please type manually.');
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN'; // Will pick up both English & Hindi speech

    let accumulatedText = '';

    recognition.onstart = () => {
      setIsListening(true);
      setStatusMessage('🎙️ Listening... Speak naturally in Hindi or English');
    };

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) {
          accumulatedText += res[0].transcript + ' ';
        } else {
          interim += res[0].transcript;
        }
      }
      setInterimText(interim);
    };

    recognition.onerror = (event) => {
      console.warn('Speech error:', event.error);
      setIsListening(false);
      setStatusMessage('⚠️ Microphone error. Manual typing enabled.');
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText('');

      const textToProcess = accumulatedText.trim() || interimText.trim();
      if (textToProcess) {
        // Run AI Auto-Detection & Auto-Grammar Correction
        const processed = autoProcessSpeech(textToProcess);

        // Update input field with clean auto-corrected text
        const eventObj = { target: { value: processed.text } };
        onChange(eventObj);

        setStatusMessage(`✨ AI Auto-corrected (${processed.language} Detected)`);

        if (onAutoProcessed && processed.category) {
          onAutoProcessed(processed);
        }

        setTimeout(() => setStatusMessage(null), 5000);
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      setIsListening(false);
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  };

  const handleMicToggle = () => {
    if (isListening) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>
            {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
          </label>

          {/* Voice Symbol Button */}
          <button
            type="button"
            onClick={handleMicToggle}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: isListening ? '#fee2e2' : '#f0f9ff',
              color: isListening ? '#ef4444' : '#0F4C81',
              border: isListening ? '1.5px solid #ef4444' : '1.5px solid #0F4C81',
              padding: '0.3rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: isListening ? '0 0 0 4px rgba(239, 68, 68, 0.2)' : 'none',
              transition: 'all 0.2s ease'
            }}
            title="Click to speak (Auto-detects Hindi & English and auto-corrects grammar)"
          >
            {isListening ? <MicOff size={14} className="animate-pulse" /> : <Mic size={14} />}
            {isListening ? 'Stop Listening 🎙️' : '🎙️ Voice to Text'}
          </button>
        </div>
      )}

      {/* Input / Textarea */}
      {isTextArea ? (
        <textarea
          required={required}
          rows={rows}
          placeholder={placeholder}
          value={isListening && interimText ? `${value} ${interimText}` : value}
          onChange={onChange}
          style={{
            width: '100%',
            padding: '0.8rem 1rem',
            border: isListening ? '2px solid #ef4444' : '1.5px solid #cbd5e1',
            borderRadius: '0.6rem',
            fontSize: '0.95rem',
            outline: 'none',
            resize: 'vertical',
            transition: 'all 0.2s ease',
            backgroundColor: isListening ? '#fff5f5' : '#ffffff'
          }}
        />
      ) : (
        <input
          type={type}
          required={required}
          placeholder={placeholder}
          value={isListening && interimText ? `${value} ${interimText}` : value}
          onChange={onChange}
          style={{
            width: '100%',
            padding: '0.8rem 1rem',
            border: isListening ? '2px solid #ef4444' : '1.5px solid #cbd5e1',
            borderRadius: '0.6rem',
            fontSize: '0.95rem',
            outline: 'none',
            transition: 'all 0.2s ease',
            backgroundColor: isListening ? '#fff5f5' : '#ffffff'
          }}
        />
      )}

      {/* Status Banner */}
      {statusMessage && (
        <div style={{ marginTop: '0.35rem', fontSize: '0.775rem', fontWeight: 700, color: isListening ? '#ef4444' : '#166534', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span>{statusMessage}</span>
        </div>
      )}
    </div>
  );
}
