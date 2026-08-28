import { useState, useEffect, useRef, useCallback } from 'react';
import { detectLanguage } from '../utils/aiSpeechUtils';

export function useSpeechRecognition({ defaultLang = 'auto', onSpeechEnd } = {}) {
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [detectedLanguage, setDetectedLanguage] = useState('English');
  const [selectedLanguage, setSelectedLanguage] = useState(defaultLang);
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const silenceTimerRef = useRef(null);

  // Check browser support for Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Web Speech API is not supported by this browser. Manual typing enabled.');
    }
  }, []);

  // Timer Ticker
  useEffect(() => {
    if (isListening && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isListening, isPaused]);

  // Handle Silence Auto-Stop
  const resetSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      if (recognitionRef.current && isListening) {
        console.log('Silence detected - pausing speech recognition');
        pauseListening();
      }
    }, 6000); // Stop after 6 seconds of silence
  }, [isListening]);

  const startListening = useCallback((langOverride) => {
    setError(null);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Speech Recognition is not supported in this browser.');
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    const targetLang = langOverride || selectedLanguage;
    if (targetLang === 'hi-IN') {
      recognition.lang = 'hi-IN';
    } else if (targetLang === 'en-IN') {
      recognition.lang = 'en-IN';
    } else {
      // Auto detect default
      recognition.lang = 'en-IN';
    }

    recognition.onstart = () => {
      setIsListening(true);
      setIsPaused(false);
      resetSilenceTimer();
    };

    recognition.onresult = (event) => {
      resetSilenceTimer();
      let currentFinal = '';
      let currentInterim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          currentFinal += result[0].transcript + ' ';
          if (result[0].confidence) {
            setConfidence(Math.round(result[0].confidence * 100));
          }
        } else {
          currentInterim += result[0].transcript;
        }
      }

      if (currentFinal) {
        setTranscript(prev => {
          const updated = (prev + ' ' + currentFinal).trim();
          // Auto detect language
          const detected = detectLanguage(updated);
          setDetectedLanguage(detected);
          return updated;
        });
      }

      setInterimTranscript(currentInterim);
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setError('Microphone permission denied. Please allow microphone access.');
      } else if (event.error !== 'no-speech') {
        setError(`Speech recognition error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (onSpeechEnd) onSpeechEnd();
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
      setError('Could not start microphone recording.');
    }
  }, [selectedLanguage, resetSilenceTimer, onSpeechEnd]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
    setIsPaused(false);
    setInterimTranscript('');
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
  }, []);

  const pauseListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
    setIsPaused(true);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
  }, []);

  const resumeListening = useCallback(() => {
    startListening();
  }, [startListening]);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setRecordingTime(0);
    setConfidence(0);
  }, []);

  return {
    transcript,
    interimTranscript,
    isListening,
    isPaused,
    recordingTime,
    confidence: confidence || (isListening ? 92 : 0),
    detectedLanguage,
    selectedLanguage,
    setSelectedLanguage,
    error,
    isSupported,
    startListening,
    stopListening,
    pauseListening,
    resumeListening,
    clearTranscript,
    setTranscript
  };
}
