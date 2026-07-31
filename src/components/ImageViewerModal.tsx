import React from 'react';
import { X, ExternalLink, Download } from 'lucide-react';

interface ImageViewerModalProps {
  src: string | null;
  title?: string;
  onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ src, title, onClose }) => {
  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Controls */}
        <div className="absolute -top-12 right-0 flex items-center gap-3">
          <a
            href={src}
            download="photo.jpg"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            title="Download / Open Full Size"
          >
            <Download className="w-5 h-5" />
          </a>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Title / Subtitle */}
        {title && (
          <div className="text-white/90 font-medium text-sm mb-3 bg-black/40 px-4 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
            {title}
          </div>
        )}

        {/* Image Display */}
        <div className="overflow-hidden rounded-2xl shadow-2xl border border-white/10 max-h-[80vh] flex items-center justify-center">
          <img
            src={src}
            alt={title || 'Full view'}
            className="max-h-[80vh] max-w-full object-contain rounded-2xl select-none"
          />
        </div>
      </div>
    </div>
  );
};
