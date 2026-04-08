// src/components/shared/ConfirmModal.jsx
import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ isOpen, title, message, confirmLabel = 'Confirm', onConfirm, onCancel, danger = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-[#141420] border border-white/[0.12] rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fade-up">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${danger ? 'bg-coral/15 border border-coral/30' : 'bg-amber/15 border border-amber/30'}`}>
          <AlertTriangle size={18} className={danger ? 'text-coral' : 'text-amber'} />
        </div>
        <h3 className="font-display font-700 text-base text-[#e8e8f0] mb-2">{title}</h3>
        <p className="text-sm text-[#9999b8] mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={onConfirm}
            className={`flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-lg font-display font-600 text-sm transition-all duration-150 active:scale-95 ${
              danger
                ? 'bg-coral/20 text-coral-light border border-coral/30 hover:bg-coral/30'
                : 'bg-amber/20 text-amber-light border border-amber/30 hover:bg-amber/30'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
