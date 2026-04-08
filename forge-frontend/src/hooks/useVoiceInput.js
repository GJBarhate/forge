// src/hooks/useVoiceInput.js
import { useState, useRef, useCallback, useEffect } from 'react';
import { audioService } from '../services/forgeService.js';
import toast from 'react-hot-toast';

export const useVoiceInput = () => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const full = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join('');
      setTranscript(full);
    };

    recognition.onerror = (e) => {
      console.error('SpeechRecognition error:', e.error);
      setIsListening(false);
      if (e.error === 'not-allowed') {
        toast.error('Microphone permission denied');
      }
    };

    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
  }, []);

  const startNative = useCallback(() => {
    if (!recognitionRef.current) return;
    setTranscript('');
    recognitionRef.current.start();
    setIsListening(true);
  }, []);

  const stopNative = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  // Fallback: MediaRecorder → backend Gemini transcription
  const startFallback = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setIsProcessing(true);
        try {
          const text = await audioService.transcribe(blob);
          setTranscript(text);
        } catch {
          toast.error('Transcription failed. Please type your input instead.');
        } finally {
          setIsProcessing(false);
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsListening(true);
    } catch {
      toast.error('Could not access microphone');
    }
  }, []);

  const stopFallback = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (isSupported) startNative();
    else startFallback();
  }, [isSupported, startNative, startFallback]);

  const stopListening = useCallback(() => {
    if (isSupported) stopNative();
    else stopFallback();
  }, [isSupported, stopNative, stopFallback]);

  const toggleListening = useCallback(() => {
    if (isListening) stopListening();
    else startListening();
  }, [isListening, startListening, stopListening]);

  const clearTranscript = useCallback(() => setTranscript(''), []);

  return {
    transcript,
    setTranscript,
    isListening,
    isProcessing,
    isSupported,
    toggleListening,
    startListening,
    stopListening,
    clearTranscript,
  };
};
