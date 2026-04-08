// src/components/shared/IterationModal.jsx
import { useState, useRef, useEffect } from 'react';
import { Loader2, ChevronRight, Sparkles, AlertCircle, Mic, Image as ImageIcon, MessageSquare, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function IterationModal({ isOpen, projectName, onConfirm, onCancel, isLoading }) {
  const [inputType, setInputType] = useState('text');
  const [userFeedback, setUserFeedback] = useState('');
  const [voiceBase64, setVoiceBase64] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [selectedFocus, setSelectedFocus] = useState('general');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setUserFeedback('');
      setVoiceBase64('');
      setImageBase64('');
      setSelectedFocus('general');
      setInputType('text');
      setIsRecording(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const focusOptions = [
    { value: 'general', label: 'General Refinement', emoji: '🔄', desc: 'Improve overall quality' },
    { value: 'performance', label: 'Performance', emoji: '⚡', desc: 'Optimize for speed' },
    { value: 'security', label: 'Security', emoji: '🔒', desc: 'Enhance security' },
    { value: 'scalability', label: 'Scalability', emoji: '📈', desc: 'Better architecture' },
    { value: 'ux', label: 'UX/Design', emoji: '🎨', desc: 'Improve user experience' },
  ];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setVoiceBase64(reader.result.split(',')[1]);
          toast.success('Voice recorded successfully!');
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      toast.error('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result.split(',')[1]);
        toast.success('Image uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!userFeedback.trim() && !voiceBase64 && !imageBase64) {
      toast.error('Please provide at least one input: text, voice, or image');
      return;
    }

    const payload = {
      textinput: userFeedback.trim() || `Focus on ${focusOptions.find(o => o.value === selectedFocus).label}`,
      voiceTranscript: voiceBase64 || undefined,
      imageBase64: imageBase64 || undefined,
      focusArea: selectedFocus,
      iterationType: selectedFocus,
    };

    onConfirm(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-50">
      <div className="bg-bg-2 border border-white/10 rounded-3xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden backdrop-blur-xl bg-gradient-to-br from-bg-2 via-bg-2 to-bg-3/30">
        <div className="bg-gradient-to-r from-purple/15 via-teal/10 to-purple/15 border-b border-white/10 px-6 py-8 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple/30 to-teal/20 border border-white/20 shadow-glow-md">
              <Sparkles size={20} className="text-purple-light animate-float" />
            </div>
            <h2 className="text-2xl font-display font-700 bg-gradient-to-r from-purple-light to-teal text-transparent bg-clip-text">
              Create New Iteration
            </h2>
          </div>
          <p className="text-sm text-[#9999b8]">
            Refine your blueprint for <span className="text-purple-light font-semibold">{projectName}</span>
          </p>
        </div>

        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-semibold text-white mb-3">How would you like to provide feedback?</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 'text', icon: MessageSquare, label: 'Text', desc: 'Write feedback' },
                { type: 'voice', icon: Mic, label: 'Voice', desc: 'Record audio' },
                { type: 'image', icon: ImageIcon, label: 'Image', desc: 'Upload screenshot' },
              ].map(({ type, icon: Icon, label, desc }) => (
                <button
                  key={type}
                  onClick={() => setInputType(type)}
                  className={`group p-3 rounded-xl border-2 transition-all duration-300 ${
                    inputType === type
                      ? 'border-purple bg-gradient-to-br from-purple/20 to-purple/10 shadow-lg shadow-purple/20'
                      : 'border-white/10 hover:border-purple/50 hover:bg-gradient-to-br hover:from-purple/10 hover:to-transparent'
                  }`}
                >
                  <Icon size={18} className={`mx-auto mb-1 transition-all ${inputType === type ? 'text-purple-light scale-110' : 'text-[#9999b8] group-hover:text-purple-light'}`} />
                  <div className={`text-xs font-semibold transition-colors ${inputType === type ? 'text-white' : 'text-[#9999b8] group-hover:text-white'}`}>{label}</div>
                  <div className="text-xs text-[#5f5f80]">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {inputType === 'text' && (
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Your feedback</label>
              <textarea
                value={userFeedback}
                onChange={(e) => setUserFeedback(e.target.value)}
                placeholder="e.g., Add more authentication methods, improve mobile experience, enhance security, etc."
                className="w-full p-4 bg-bg-3/50 border border-white/10 rounded-xl text-sm text-white placeholder-[#5f5f80] focus:border-purple focus:ring-2 focus:ring-purple/30 outline-none resize-none transition-all duration-300 hover:border-white/20 backdrop-blur-sm"
                rows={4}
              />
            </div>
          )}

          {inputType === 'voice' && (
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Record your feedback</label>
              <div className="p-4 bg-bg-3/50 border border-white/10 rounded-xl backdrop-blur-sm">
                {!voiceBase64 ? (
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-full py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                      isRecording ? 'bg-gradient-to-r from-coral to-coral/70 text-white animate-pulse shadow-lg shadow-coral/50' : 'bg-gradient-to-r from-purple to-violet-600 text-white hover:scale-105 hover:shadow-lg hover:shadow-purple/50 active:scale-95'
                    }`}
                  >
                    <Mic size={16} className="animate-bounce" />
                    {isRecording ? 'Recording... Click to stop' : 'Start Recording'}
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-teal/20 to-emerald/10 rounded-lg border border-teal/30 shadow-lg shadow-teal/10">
                      <span className="text-xs text-teal font-semibold">✓ Voice recorded</span>
                    </div>
                    <button onClick={() => setVoiceBase64('')} className="w-full py-2 text-xs font-semibold text-[#9999b8] hover:text-white border border-white/10 rounded-lg transition-all duration-300 hover:bg-white/5 hover:border-white/20">
                      Record Again
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {inputType === 'image' && (
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Upload a screenshot or image</label>
              <div className="p-4 bg-bg-3/50 border-2 border-dashed border-white/10 rounded-xl backdrop-blur-sm transition-all duration-300 hover:border-purple/50 hover:bg-purple/5">
                {!imageBase64 ? (
                  <button onClick={() => fileInputRef.current?.click()} className="group w-full py-8 rounded-lg transition-all flex flex-col items-center justify-center gap-2">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-purple/20 to-teal/10 border border-white/10 group-hover:border-purple/50 group-hover:from-purple/30 group-hover:to-teal/20 transition-all">
                      <ImageIcon size={32} className="text-purple-light group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-sm font-semibold text-white group-hover:text-purple-light transition-colors">Click to upload</div>
                    <div className="text-xs text-[#5f5f80]">PNG, JPG, or WebP (max 5MB)</div>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-teal/20 to-emerald/10 rounded-lg border border-teal/30 shadow-lg shadow-teal/10">
                      <span className="text-xs text-teal font-semibold">✓ Image uploaded</span>
                      <button onClick={() => setImageBase64('')} className="text-teal hover:text-white transition-colors hover:scale-110">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-white mb-3">What's the main focus?</label>
            <div className="grid grid-cols-2 gap-2">
              {focusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedFocus(option.value)}
                  className={`group p-3 rounded-xl border-2 transition-all duration-300 text-left ${
                    selectedFocus === option.value
                      ? 'border-purple bg-gradient-to-br from-purple/20 to-purple/10 shadow-lg shadow-purple/20'
                      : 'border-white/10 hover:border-white/30 hover:bg-white/5'
                  }`}
                >
                  <div className="text-lg mb-1 group-hover:scale-110 transition-transform">{option.emoji}</div>
                  <div className={`text-xs font-semibold transition-colors ${selectedFocus === option.value ? 'text-white' : 'text-[#9999b8]'}`}>{option.label}</div>
                  <div className="text-xs text-[#5f5f80] mt-0.5">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 px-6 py-4 flex gap-3 justify-end bg-gradient-to-r from-bg-3/50 to-bg-2/50 backdrop-blur-sm">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-2.5 text-sm font-semibold text-[#9999b8] hover:text-white border border-white/10 rounded-lg transition-all duration-300 hover:bg-white/5 hover:border-white/20 disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2.5 text-sm font-semibold bg-gradient-to-r from-purple to-teal text-white rounded-lg hover:scale-105 hover:shadow-glow-lg transition-all duration-300 disabled:opacity-40 active:scale-95 flex items-center gap-2 border border-white/10"
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles size={14} className="animate-float" />
                Create Iteration
                <ChevronRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}