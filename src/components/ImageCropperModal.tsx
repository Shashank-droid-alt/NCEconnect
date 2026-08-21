import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Check, RotateCw, ZoomIn, ZoomOut, Crop, Move, RefreshCw } from 'lucide-react';
import { getCroppedImg } from '../utils/cropImage';

interface ImageCropperModalProps {
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedDataUrl: string) => void;
  aspectRatioPreset?: '1:1' | '16:9' | '4:3' | 'free';
}

type DragHandle = 'move' | 'nw' | 'ne' | 'se' | 'sw' | 'n' | 's' | 'e' | 'w';

interface DragState {
  handle: DragHandle;
  startX: number;
  startY: number;
  startCrop: { x: number; y: number; width: number; height: number };
  containerRect: DOMRect;
}

const getPresetRatio = (preset: '1:1' | '16:9' | '4:3' | 'free'): number | null => {
  switch (preset) {
    case '1:1':
      return 1;
    case '16:9':
      return 16 / 9;
    case '4:3':
      return 4 / 3;
    case 'free':
    default:
      return null;
  }
};

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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Position offset for panning and resizing (percentages 0-100)
  const [cropBox, setCropBox] = useState({ x: 10, y: 10, width: 80, height: 80 });
  const [dragState, setDragState] = useState<DragState | null>(null);

  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 1, height: 1 });

  // Draw image on canvas whenever imageSrc, rotation changes
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const isRotated90 = rotation % 180 !== 0;
      const displayW = isRotated90 ? img.naturalHeight : img.naturalWidth;
      const displayH = isRotated90 ? img.naturalWidth : img.naturalHeight;

      setImageSize({ width: displayW, height: displayH });

      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = displayW;
        canvas.height = displayH;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, displayW, displayH);
          ctx.save();
          ctx.translate(displayW / 2, displayH / 2);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
          ctx.restore();
        }
      }
    };
    img.src = imageSrc;
  }, [imageSrc, rotation]);

  // Recalculate default crop box to match aspect ratio
  const resetCropToAspect = useCallback(
    (targetAspect: '1:1' | '16:9' | '4:3' | 'free', w = imageSize.width, h = imageSize.height) => {
      const targetRatio = getPresetRatio(targetAspect);
      if (!targetRatio || w <= 0 || h <= 0) {
        setCropBox({ x: 5, y: 5, width: 90, height: 90 });
        return;
      }

      const imgRatio = w / h;
      let widthPct: number;
      let heightPct: number;

      if (targetRatio >= imgRatio) {
        // Crop is wider than or equal to image aspect ratio
        widthPct = 90;
        heightPct = Math.min(90, (90 * imgRatio) / targetRatio);
      } else {
        // Crop is taller than image aspect ratio
        heightPct = 90;
        widthPct = Math.min(90, (90 * targetRatio) / imgRatio);
      }

      const x = Math.max(0, (100 - widthPct) / 2);
      const y = Math.max(0, (100 - heightPct) / 2);

      setCropBox({
        x: parseFloat(x.toFixed(2)),
        y: parseFloat(y.toFixed(2)),
        width: parseFloat(widthPct.toFixed(2)),
        height: parseFloat(heightPct.toFixed(2)),
      });
    },
    [imageSize]
  );

  // When aspect ratio or image dimensions change, fit crop box
  useEffect(() => {
    if (imageSize.width > 1 && imageSize.height > 1) {
      resetCropToAspect(aspect, imageSize.width, imageSize.height);
    }
  }, [aspect, imageSize.width, imageSize.height, resetCropToAspect]);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    resetCropToAspect(aspect);
  };

  // Pointer drag start
  const handlePointerDown = (e: React.PointerEvent, handle: DragHandle) => {
    e.preventDefault();
    e.stopPropagation();

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    setDragState({
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startCrop: { ...cropBox },
      containerRect: rect,
    });

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  // Pointer drag movement
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState) return;
    e.preventDefault();

    const { handle, startX, startY, startCrop, containerRect } = dragState;
    if (containerRect.width === 0 || containerRect.height === 0) return;

    const deltaXPct = ((e.clientX - startX) / containerRect.width) * 100;
    const deltaYPct = ((e.clientY - startY) / containerRect.height) * 100;

    const MIN_SIZE_PCT = 12;

    if (handle === 'move') {
      const maxX = 100 - startCrop.width;
      const maxY = 100 - startCrop.height;
      const nextX = Math.min(Math.max(0, startCrop.x + deltaXPct), maxX);
      const nextY = Math.min(Math.max(0, startCrop.y + deltaYPct), maxY);

      setCropBox((prev) => ({
        ...prev,
        x: nextX,
        y: nextY,
      }));
      return;
    }

    // Handle corner/edge resizing
    const targetRatio = getPresetRatio(aspect);
    const ratioInPct = targetRatio ? (targetRatio * containerRect.height) / containerRect.width : null;

    let newX = startCrop.x;
    let newY = startCrop.y;
    let newW = startCrop.width;
    let newH = startCrop.height;

    if (aspect === 'free' || !ratioInPct) {
      // Freeform resizing
      if (handle.includes('e')) {
        newW = Math.min(Math.max(MIN_SIZE_PCT, startCrop.width + deltaXPct), 100 - startCrop.x);
      }
      if (handle.includes('w')) {
        const potentialX = Math.max(0, Math.min(startCrop.x + deltaXPct, startCrop.x + startCrop.width - MIN_SIZE_PCT));
        newW = startCrop.x + startCrop.width - potentialX;
        newX = potentialX;
      }
      if (handle.includes('s')) {
        newH = Math.min(Math.max(MIN_SIZE_PCT, startCrop.height + deltaYPct), 100 - startCrop.y);
      }
      if (handle.includes('n')) {
        const potentialY = Math.max(0, Math.min(startCrop.y + deltaYPct, startCrop.y + startCrop.height - MIN_SIZE_PCT));
        newH = startCrop.y + startCrop.height - potentialY;
        newY = potentialY;
      }
    } else {
      // Aspect-ratio locked resizing
      if (handle === 'se') {
        let candW = startCrop.width + deltaXPct;
        let candH = candW / ratioInPct;
        if (candH > 100 - startCrop.y) {
          candH = 100 - startCrop.y;
          candW = candH * ratioInPct;
        }
        if (candW > 100 - startCrop.x) {
          candW = 100 - startCrop.x;
          candH = candW / ratioInPct;
        }
        newW = Math.max(MIN_SIZE_PCT, candW);
        newH = newW / ratioInPct;
      } else if (handle === 'sw') {
        const rightEdge = startCrop.x + startCrop.width;
        let candW = startCrop.width - deltaXPct;
        let candH = candW / ratioInPct;
        if (candH > 100 - startCrop.y) {
          candH = 100 - startCrop.y;
          candW = candH * ratioInPct;
        }
        if (candW > rightEdge) {
          candW = rightEdge;
          candH = candW / ratioInPct;
        }
        newW = Math.max(MIN_SIZE_PCT, candW);
        newH = newW / ratioInPct;
        newX = rightEdge - newW;
      } else if (handle === 'ne') {
        const bottomEdge = startCrop.y + startCrop.height;
        let candW = startCrop.width + deltaXPct;
        let candH = candW / ratioInPct;
        if (candH > bottomEdge) {
          candH = bottomEdge;
          candW = candH * ratioInPct;
        }
        if (candW > 100 - startCrop.x) {
          candW = 100 - startCrop.x;
          candH = candW / ratioInPct;
        }
        newW = Math.max(MIN_SIZE_PCT, candW);
        newH = newW / ratioInPct;
        newY = bottomEdge - newH;
      } else if (handle === 'nw') {
        const rightEdge = startCrop.x + startCrop.width;
        const bottomEdge = startCrop.y + startCrop.height;
        let candW = startCrop.width - deltaXPct;
        let candH = candW / ratioInPct;
        if (candH > bottomEdge) {
          candH = bottomEdge;
          candW = candH * ratioInPct;
        }
        if (candW > rightEdge) {
          candW = rightEdge;
          candH = candW / ratioInPct;
        }
        newW = Math.max(MIN_SIZE_PCT, candW);
        newH = newW / ratioInPct;
        newX = rightEdge - newW;
        newY = bottomEdge - newH;
      }
    }

    setCropBox({
      x: Math.max(0, Math.min(100 - newW, newX)),
      y: Math.max(0, Math.min(100 - newH, newY)),
      width: Math.max(MIN_SIZE_PCT, Math.min(100, newW)),
      height: Math.max(MIN_SIZE_PCT, Math.min(100, newH)),
    });
  };

  // Pointer drag end
  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragState) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {
        // Safe ignore
      }
      setDragState(null);
    }
  };

  const handleSaveCrop = async () => {
    setIsProcessing(true);

    try {
      // Calculate actual pixel crop based on canvas/rotated image dimensions
      const pixelCrop = {
        x: (cropBox.x / 100) * imageSize.width,
        y: (cropBox.y / 100) * imageSize.height,
        width: (cropBox.width / 100) * imageSize.width,
        height: (cropBox.height / 100) * imageSize.height,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                Photo Editor & Cropper
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Drag the crop box to position, drag corner handles to resize
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cropping Canvas Viewport */}
        <div className="relative flex-1 min-h-[300px] sm:min-h-[360px] bg-slate-950 flex items-center justify-center overflow-hidden select-none p-4 sm:p-6">
          <div
            ref={containerRef}
            className="relative select-none touch-none inline-block max-w-full"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
              transition: dragState ? 'none' : 'transform 0.15s ease-out',
            }}
          >
            {/* Rendered Rotated Target Canvas */}
            <canvas
              ref={canvasRef}
              className="max-h-[340px] sm:max-h-[380px] max-w-full block rounded-lg shadow-2xl pointer-events-none select-none"
              style={{
                width: 'auto',
                height: 'auto',
                maxWidth: '100%',
                maxHeight: '340px',
              }}
            />

            {/* Interactive Crop Box Overlay Frame */}
            <div
              onPointerDown={(e) => handlePointerDown(e, 'move')}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              style={{
                left: `${cropBox.x}%`,
                top: `${cropBox.y}%`,
                width: `${cropBox.width}%`,
                height: `${cropBox.height}%`,
              }}
              className="absolute border-2 border-indigo-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] rounded cursor-move flex items-center justify-center group touch-none select-none z-10"
            >
              {/* 3x3 Rule of Thirds Grid lines */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity">
                <div className="border-r border-b border-white/60"></div>
                <div className="border-r border-b border-white/60"></div>
                <div className="border-b border-white/60"></div>
                <div className="border-r border-b border-white/60"></div>
                <div className="border-r border-b border-white/60"></div>
                <div className="border-b border-white/60"></div>
                <div className="border-r border-b border-white/60"></div>
                <div className="border-r border-b border-white/60"></div>
                <div></div>
              </div>

              {/* Corner L-Bracket Accents */}
              <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-white pointer-events-none" />
              <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-white pointer-events-none" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-white pointer-events-none" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-white pointer-events-none" />

              {/* Floating Center Badge */}
              <div className="bg-indigo-600/90 backdrop-blur-sm text-white text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1.5 font-semibold pointer-events-none shadow-lg opacity-90 group-hover:opacity-100 transition-opacity">
                <Move className="w-3 h-3" /> Drag & Move
              </div>

              {/* 4 Corner Resize Handles */}
              <div
                onPointerDown={(e) => handlePointerDown(e, 'nw')}
                className="absolute -top-2.5 -left-2.5 w-5 h-5 bg-white border-2 border-indigo-600 rounded-full shadow-md cursor-nwse-resize hover:scale-125 active:scale-125 transition-transform z-20"
                title="Resize Top-Left"
              />
              <div
                onPointerDown={(e) => handlePointerDown(e, 'ne')}
                className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-white border-2 border-indigo-600 rounded-full shadow-md cursor-nesw-resize hover:scale-125 active:scale-125 transition-transform z-20"
                title="Resize Top-Right"
              />
              <div
                onPointerDown={(e) => handlePointerDown(e, 'sw')}
                className="absolute -bottom-2.5 -left-2.5 w-5 h-5 bg-white border-2 border-indigo-600 rounded-full shadow-md cursor-nesw-resize hover:scale-125 active:scale-125 transition-transform z-20"
                title="Resize Bottom-Left"
              />
              <div
                onPointerDown={(e) => handlePointerDown(e, 'se')}
                className="absolute -bottom-2.5 -right-2.5 w-5 h-5 bg-white border-2 border-indigo-600 rounded-full shadow-md cursor-nwse-resize hover:scale-125 active:scale-125 transition-transform z-20"
                title="Resize Bottom-Right"
              />

              {/* Edge Handles for Freeform Cropping */}
              {aspect === 'free' && (
                <>
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'n')}
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-2.5 bg-white border border-indigo-600 rounded-full shadow cursor-ns-resize hover:scale-110 z-20"
                    title="Resize Top Edge"
                  />
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 's')}
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-2.5 bg-white border border-indigo-600 rounded-full shadow cursor-ns-resize hover:scale-110 z-20"
                    title="Resize Bottom Edge"
                  />
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'w')}
                    className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-2.5 h-6 bg-white border border-indigo-600 rounded-full shadow cursor-ew-resize hover:scale-110 z-20"
                    title="Resize Left Edge"
                  />
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'e')}
                    className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2.5 h-6 bg-white border border-indigo-600 rounded-full shadow cursor-ew-resize hover:scale-110 z-20"
                    title="Resize Right Edge"
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tools & Preset Controls */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 space-y-4">
          {/* Aspect Ratio Options and Rotate */}
          <div className="flex items-center justify-between flex-wrap gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Aspect Ratio:</span>
              <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl">
                {(['1:1', '4:3', '16:9', 'free'] as const).map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspect(ratio)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      aspect === ratio
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {ratio === '1:1' ? 'Square (1:1)' : ratio === '4:3' ? '4:3' : ratio === '16:9' ? '16:9' : 'Free'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRotate}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl transition-colors"
                title="Rotate 90° clockwise"
              >
                <RotateCw className="w-3.5 h-3.5" /> Rotate 90°
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl transition-colors"
                title="Reset crop to center"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </div>

          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <ZoomOut className="w-4 h-4 text-slate-400" />
            <input
              type="range"
              min="1"
              max="2.5"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-indigo-600 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
            <ZoomIn className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 min-w-[36px] text-right">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveCrop}
              disabled={isProcessing}
              className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
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
