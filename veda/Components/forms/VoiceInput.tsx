'use client';

import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useToast } from '../ui/Toast';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
}

export default function VoiceInput({ onTranscript }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    // Check browser compatibility for Web Speech API
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onTranscript(transcript);
          showToast('success', 'Voice instruction transcribed successfully!');
        }
      };

      // Gracefully handle error events without causing Next.js dev overlay overlay screen crashes
      rec.onerror = (event: any) => {
        console.warn('⚠️ [speech] Recognition warning:', event.error);
        setIsListening(false);
        
        let message = 'Speech input failed';
        let toastMsg = 'Speech recognition failed. Please try again.';
        if (event.error === 'network') {
          message = 'Network required';
          toastMsg = '⚠️ speech recognition network issue. If you are using Brave, Brave blocks cloud Web Speech API by default. Please allow media authorization in Brave settings or use native macOS dictation shortcuts.';
        } else if (event.error === 'not-allowed') {
          message = 'Mic permission denied';
          toastMsg = '⚠️ Microphone access is blocked. Please grant microphone permissions in your browser address bar.';
        } else if (event.error === 'no-speech') {
          message = 'No speech detected';
          toastMsg = 'No speech detected. Please speak clearly into your microphone.';
        }
        
        setErrorMessage(message);
        showToast('warning', toastMsg, 6000);
        
        // Auto-clear toast alert after 3 seconds
        setTimeout(() => setErrorMessage(null), 3000);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, [onTranscript, showToast]);

  const toggleListening = () => {
    if (!supported || !recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (err) {
        console.warn('⚠️ [speech] Failed to start recognition instance:', err);
      }
    }
  };

  if (!supported) return null;

  return (
    <div className="absolute right-4.5 bottom-4">
      <button
        type="button"
        onClick={toggleListening}
        title={isListening ? 'Stop dictating' : 'Dictate additional instructions'}
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm cursor-pointer ${
          isListening 
            ? 'bg-red-500 text-white animate-pulse shadow-red-500/20 scale-105' 
            : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
        }`}
      >
        {isListening ? (
          <MicOff className="w-4 h-4" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </button>
      
      {/* Dynamic state notification bubble popups */}
      {isListening && (
        <span className="absolute bottom-11 right-0 bg-red-500 text-white font-bold text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider animate-bounce select-none whitespace-nowrap shadow-sm">
          Recording...
        </span>
      )}

      {errorMessage && (
        <span className="absolute bottom-11 right-0 bg-slate-800 text-white font-bold text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider select-none whitespace-nowrap shadow-sm animate-fade-in">
          ⚠️ {errorMessage}
        </span>
      )}
    </div>
  );
}
