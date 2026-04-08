// src/components/input/ImageDropzone.jsx
import { useCallback, useState, useRef } from 'react';
import { ImagePlus, X, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const MAX_SIZE_MB = 10;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function compressImage(file, maxWidth = 1920) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => resolve(blob),
        file.type,
        0.85
      );
    };
    img.src = url;
  });
}

export default function ImageDropzone({ value, mimeType, onChange }) {
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const processFile = useCallback(async (file) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Only JPEG, PNG, or WebP images allowed');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Image too large (max ${MAX_SIZE_MB}MB)`);
      return;
    }

    try {
      const compressed = await compressImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result.split(',')[1];
        setPreview(e.target.result);
        onChange({ base64, mimeType: file.type });
      };
      reader.readAsDataURL(compressed);
    } catch {
      toast.error('Failed to process image');
    }
  }, [onChange]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const clear = () => {
    setPreview(null);
    onChange({ base64: null, mimeType: null });
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-teal/30 bg-teal/5">
          <img src={preview} alt="Uploaded sketch" className="w-full max-h-48 object-contain" />
          <div className="absolute top-2 right-2 flex items-center gap-2">
            <span className="flex items-center gap-1.5 bg-bg-3/90 px-2.5 py-1 rounded-full text-xs text-teal font-mono border border-teal/20">
              <CheckCircle size={11} /> Sketch uploaded
            </span>
            <button
              type="button"
              onClick={clear}
              className="w-7 h-7 rounded-full bg-bg-3/90 border border-white/10 flex items-center justify-center text-[#9999b8] hover:text-coral transition-colors"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-150 ${
            isDragging
              ? 'border-purple/60 bg-purple/10'
              : 'border-white/[0.1] hover:border-white/25 hover:bg-white/[0.02]'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-surface border border-white/[0.07] flex items-center justify-center">
            <ImagePlus size={18} className="text-[#5f5f80]" />
          </div>
          <div className="text-center">
            <p className="text-sm text-[#9999b8]">
              Drop your whiteboard sketch here
            </p>
            <p className="text-xs text-[#5f5f80] mt-1">JPEG, PNG or WebP · max {MAX_SIZE_MB}MB · auto-compressed</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
