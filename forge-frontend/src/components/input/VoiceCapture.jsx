// src/components/input/VoiceCapture.jsx
import { Mic, MicOff, Loader2, Trash2 } from 'lucide-react';
import { useVoiceInput } from '../../hooks/useVoiceInput.js';

export default function VoiceCapture({ value, onChange }) {
  const {
    transcript,
    setTranscript,
    isListening,
    isProcessing,
    isSupported,
    toggleListening,
    clearTranscript,
  } = useVoiceInput();

  // sync local transcript to parent
  const handleTranscriptChange = (val) => {
    setTranscript(val);
    onChange(val);
  };

  // when voice updates transcript, push to parent
  const handleVoiceToggle = () => {
    toggleListening();
  };

  // After stopping, sync final transcript
  const syncedTranscript = transcript || value || '';

  return (
    <div className="space-y-3">
      {/* Mic button + waveform */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleVoiceToggle}
          disabled={isProcessing}
          className={`relative flex items-center justify-center w-11 h-11 rounded-xl border transition-all duration-200 flex-shrink-0 ${
            isListening
              ? 'bg-coral/20 border-coral/40 text-coral-light'
              : 'bg-surface border-white/[0.07] text-[#9999b8] hover:border-white/20 hover:text-[#e8e8f0]'
          } disabled:opacity-50`}
        >
          {isProcessing ? (
            <Loader2 size={18} className="animate-spin" />
          ) : isListening ? (
            <MicOff size={18} />
          ) : (
            <Mic size={18} />
          )}
          {isListening && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-coral rounded-full animate-ping" />
          )}
        </button>

        {isListening ? (
          <div className="flex items-center gap-1 h-8">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-coral/70 rounded-full waveform-bar"
                style={{ height: '20px', animationDelay: `${i * 0.1}s` }}
              />
            ))}
            <span className="ml-2 text-xs text-coral font-mono">Recording…</span>
          </div>
        ) : (
          <div className="text-xs text-[#5f5f80]">
            {isSupported ? 'Click mic to record your idea' : 'Type your idea below (mic unavailable in this browser)'}
          </div>
        )}
      </div>

      {/* Transcript textarea */}
      <div className="relative">
        <textarea
          rows={4}
          className="input-base resize-none font-mono text-xs leading-relaxed"
          placeholder={isListening ? 'Listening…' : 'Your voice transcript will appear here, or type directly…'}
          value={syncedTranscript}
          onChange={(e) => handleTranscriptChange(e.target.value)}
        />
        {syncedTranscript && (
          <button
            type="button"
            onClick={() => handleTranscriptChange('')}
            className="absolute top-2 right-2 p-1 rounded text-[#5f5f80] hover:text-coral transition-colors"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {!isSupported && (
        <p className="text-[11px] text-amber font-mono">
          ⚠ Using server-side transcription fallback (MediaRecorder → Gemini)
        </p>
      )}
    </div>
  );
}
