import React from 'react';
import { X } from 'lucide-react';
import { AuthScreen } from './AuthScreen';

export const AuthModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col my-auto">
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 z-50 p-2 bg-slate-800 text-white rounded-full hover:bg-rose-600 transition-colors shadow-2xl border border-white/20"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-full">
          <AuthScreen initialMode="register" />
        </div>
      </div>
    </div>
  );
};
