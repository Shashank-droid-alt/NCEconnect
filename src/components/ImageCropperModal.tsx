import React, { useState, useRef, useEffect } from 'react';
import { X, Check, RotateCw, ZoomIn, ZoomOut, Crop, Move } from 'lucide-react';
import { getCroppedImg } from '../utils/cropImage';

interface ImageCropperModalProps {
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedDataUrl: string) => void;
  aspectRatioPreset?: '1:1' | '16:9' | '4:3' | 'free';
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  imageSrc,
  onClose,
  onCropComplete,
  aspectRatioPreset = '1:1',
}) => {
  const [aspect, setAspect] = useState<'1:1' | '16:9' | '4:3' | 'free'>(aspectRatioPreset);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Position offset for panning
  const [cropBox, setCropBox] = useState({ x: 10, y: 10, width: 80, height: 80 }); // percents
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Reset crop box when aspect ratio changes
    if (aspect === '1:1') {
      setCropBox({ x: 20, y: 10, width: 60, height: 60 });
    } else if (aspect === '16:9') {
      setCropBox({ x: 10, y: 25, width: 80, height: 45 });
    } else if (aspect === '4:3') {
      setCropBox({ x: 15, y: 15, width: 70, height: 52.5 });
    } else {
      setCropBox({ x: 10, y: 10, width: 80, height: 80 });
    }
  }, [aspect]);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleSaveCrop = async () => {
    if (!imageRef.current) return;
    setIsProcessing(true);

    try {
      const img = imageRef.current;
      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;

      // Calculate actual pixel crop based on percentages
      const pixelCrop = {
        x: (cropBox.x / 100) * naturalWidth,
        y: (cropBox.y / 100) * naturalHeight,
        width: (cropBox.width / 100) * naturalWidth,
        height: (cropBox.height / 100) * naturalHeight,
      };

      const cropped = await getCroppedImg(imageSrc, pixelCrop, rotation);
      onCropComplete(cropped);
    } catch (err) {
      console.error('Failed to crop image', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Crop className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Photo Editor & Cropper</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cropping Canvas Viewport */}
        <div
          ref={containerRef}
          className="relative flex-1 min-h-[320px] bg-slate-950 flex items-center justify-center overflow-hidden select-none p-4"
        >
          <div className="relative max-w-full max-h-[450px] flex items-center justify-center">
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop target"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transition: isDragging ? 'none' : 'transform 0.2s ease',
              }}
              className="max-h-[380px] max-w-full object-contain pointer-events-none rounded"
            />

            {/* Overlay Crop Box Frame */}
            <div
              style={{
                left: `${cropBox.x}%`,
                top: `${cropBox.y}%`,
                width: `${cropBox.width}%`,
                height: `${cropBox.height}%`,
              }}
              className="absolute border-2 border-indigo-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] rounded cursor-move flex items-center justify-center group"
            >
              {/* Grid lines */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                <div className="border-r border-b border-white/50"></div>
                <div className="border-r border-b border-white/50"></div>
                <div className="border-b border-white/50"></div>
                <div className="border-r border-b border-white/50"></div>
                <div className="border-r border-b border-white/50"></div>
                <div className="border-b border-white/50"></div>
                <div className="border-r border-white/50"></div>
                <div className="border-r border-white/50"></div>
                <div></div>
              </div>

              <div className="bg-indigo-600/80 text-white text-[10px] px-2 py-0.5 rounded flex items-center gap-1 font-medium pointer-events-none">
                <Move className="w-3 h-3" /> Drag & Adjust
              </div>
            </div>
          </div>
        </div>

        {/* Tools & Preset Controls */}
        <div className="p-5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 space-y-4">
          {/* Aspect Ratio Options */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Aspect Ratio:</span>
            <div className="flex items-center gap-1.5 bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
              {(['1:1', '4:3', '16:9', 'free'] as const).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspect(ratio)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    aspect === ratio
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {ratio === '1:1' ? 'Square (1:1)' : ratio === '4:3' ? '4:3' : ratio === '16:9' ? '16:9' : 'Free'}
                </button>
              ))}
            </div>

            <button
              onClick={handleRotate}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" /> Rotate 90°
            </button>
          </div>

          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <ZoomOut className="w-4 h-4 text-slate-400" />
            <input
              type="range"
              min="1"
              max="2.5"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-indigo-600 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
            <ZoomIn className="w-4 h-4 text-slate-400" />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveCrop}
              disabled={isProcessing}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Apply Crop & Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
