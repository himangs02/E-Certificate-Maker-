import React, { useRef, useEffect, useState, useCallback } from 'react';
import { renderCertificate } from '../utils/canvasRenderer';
import { CANVAS_DIMENSIONS } from '../constants/defaultConfig';
import { downloadCanvasImage, exportCanvasToPDF } from '../utils/pdfExporter';
import { getVerificationUrl, createQrImageElement } from '../utils/qrGenerator';
import { saveCertificate } from '../services/supabase';
import confetti from 'canvas-confetti';
import { 
  Download, 
  FileDown, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Layers, 
  Move, 
  Users,
  Check,
  ChevronDown,
  QrCode,
  ShieldCheck
} from 'lucide-react';

export default function CertificatePreview({
  formData,
  config,
  onChangeConfig,
  baseImage,
  showGuides,
  setShowGuides,
  activeField,
  setActiveField,
  onOpenBatchModal
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedField, setDraggedField] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [exportState, setExportState] = useState({ active: false, label: '' });
  const [qrImage, setQrImage] = useState(null);

  // Pre-load dynamic QR code image when verification code or form data changes
  useEffect(() => {
    let isMounted = true;
    const code = formData.verification_code || 'GU-2026-PREVIEW';
    const verifyUrl = getVerificationUrl(code, formData);

    createQrImageElement(verifyUrl, { size: 256 }).then(img => {
      if (isMounted && img) {
        setQrImage(img);
      }
    });

    return () => { isMounted = false; };
  }, [formData.verification_code, formData.recipientName, formData.recipientDepartment, formData.actionAchievement]);

  // 1. Render certificate onto canvas whenever data, config, baseImage, or QR changes
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderCertificate(ctx, baseImage, formData, config, {
      showGuides,
      activeField: draggedField || activeField,
      qrImage
    });
  }, [baseImage, formData, config, showGuides, activeField, draggedField, qrImage]);

  useEffect(() => {
    const handleFontsReady = () => {
      render();
    };

    if (document.fonts) {
      document.fonts.ready.then(handleFontsReady);
      if (document.fonts.addEventListener) {
        document.fonts.addEventListener('loadingdone', handleFontsReady);
        return () => {
          document.fonts.removeEventListener('loadingdone', handleFontsReady);
        };
      }
    } else {
      render();
    }
  }, [render]);

  // Trigger celebration confetti
  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.85 },
        colors: ['#c59b27', '#475569', '#10B981', '#3b82f6']
      });
    } catch {
      // Confetti optional
    }
  };

  const notifyExport = (label) => {
    setExportState({ active: true, label });
    setTimeout(() => setExportState({ active: false, label: '' }), 2500);
  };

  // Helper to persist certificate to Supabase on export
  const persistToDatabase = async () => {
    const verifyUrl = getVerificationUrl(formData.verification_code, formData);
    await saveCertificate({
      ...formData,
      qr_code: verifyUrl
    });
  };

  // 2. Download Handlers with Supabase Record Sync
  const handleDownloadPNG = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    persistToDatabase();

    const cleanCanvas = document.createElement('canvas');
    cleanCanvas.width = CANVAS_DIMENSIONS.width;
    cleanCanvas.height = CANVAS_DIMENSIONS.height;
    const cleanCtx = cleanCanvas.getContext('2d');
    renderCertificate(cleanCtx, baseImage, formData, config, { showGuides: false, qrImage });

    const safeName = (formData.recipientName || 'Certificate').replace(/[^a-zA-Z0-9_-]/g, '_');
    downloadCanvasImage(cleanCanvas, `${safeName}_Certificate.png`, 'image/png');
    notifyExport('PNG Downloaded & Saved to Supabase');
    triggerCelebration();
  };

  const handleDownloadJPG = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    persistToDatabase();

    const cleanCanvas = document.createElement('canvas');
    cleanCanvas.width = CANVAS_DIMENSIONS.width;
    cleanCanvas.height = CANVAS_DIMENSIONS.height;
    const cleanCtx = cleanCanvas.getContext('2d');
    renderCertificate(cleanCtx, baseImage, formData, config, { showGuides: false, qrImage });

    const safeName = (formData.recipientName || 'Certificate').replace(/[^a-zA-Z0-9_-]/g, '_');
    downloadCanvasImage(cleanCanvas, `${safeName}_Certificate.jpg`, 'image/jpeg', 0.98);
    notifyExport('JPG Downloaded & Saved to Supabase');
    triggerCelebration();
  };

  const handleDownloadPDF = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    persistToDatabase();

    const cleanCanvas = document.createElement('canvas');
    cleanCanvas.width = CANVAS_DIMENSIONS.width;
    cleanCanvas.height = CANVAS_DIMENSIONS.height;
    const cleanCtx = cleanCanvas.getContext('2d');
    renderCertificate(cleanCtx, baseImage, formData, config, { showGuides: false, qrImage });

    const safeName = (formData.recipientName || 'Certificate').replace(/[^a-zA-Z0-9_-]/g, '_');
    exportCanvasToPDF(cleanCanvas, `${safeName}_Certificate.pdf`);
    notifyExport('PDF Downloaded & Saved to Supabase');
    triggerCelebration();
  };

  // 3. Canvas Mouse / Touch Coordinate helper
  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_DIMENSIONS.width / rect.width;
    const scaleY = CANVAS_DIMENSIONS.height / rect.height;

    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  // 4. Interactive Drag-to-Position on Canvas
  const handleMouseDown = (e) => {
    const { x, y } = getCanvasCoords(e);

    let targetKey = null;
    let closestDist = 80;

    for (const [key, item] of Object.entries(config)) {
      if (item.x !== undefined && item.y !== undefined) {
        const dx = x - item.x;
        const dy = y - item.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < closestDist) {
          closestDist = dist;
          targetKey = key;
        }
      }
    }

    if (targetKey) {
      setIsDragging(true);
      setDraggedField(targetKey);
      setActiveField(targetKey);
      setDragOffset({
        x: x - config[targetKey].x,
        y: y - config[targetKey].y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !draggedField) return;
    const { x, y } = getCanvasCoords(e);

    onChangeConfig(prev => ({
      ...prev,
      [draggedField]: {
        ...prev[draggedField],
        x: Math.round(x - dragOffset.x),
        y: Math.round(y - dragOffset.y)
      }
    }));
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setDraggedField(null);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3 min-h-0 select-none">
      {/* Top Floating Control Strip */}
      <div className="bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800/80 rounded-2xl p-2 px-3.5 shadow-xs flex flex-wrap items-center justify-between gap-2 shrink-0 transition-colors">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Preview</span>
          </div>

          <button
            onClick={() => setShowGuides(!showGuides)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              showGuides 
                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold border border-amber-500/30' 
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800'
            }`}
            title="Toggle Alignment Handles on Preview"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{showGuides ? 'Guides Active' : 'Show Guides'}</span>
          </button>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-stone-100 dark:bg-zinc-950 p-0.5 rounded-lg border border-stone-200 dark:border-zinc-800">
            <button
              onClick={() => setZoom(z => Math.max(0.4, Number((z - 0.1).toFixed(2))))}
              className="p-1 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 rounded transition-all"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono px-2 text-zinc-700 dark:text-zinc-300 select-none">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(z => Math.min(1.8, Number((z + 0.1).toFixed(2))))}
              className="p-1 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 rounded transition-all"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setZoom(1)}
            className="p-1 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-lg text-xs transition-all border border-stone-200/60 dark:border-zinc-800"
            title="Reset Zoom to 100%"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas Presentation Stage - Scales dynamically to fill available height */}
      <div 
        ref={containerRef}
        className="flex-1 min-h-0 bg-stone-100/70 dark:bg-zinc-950/60 border border-stone-200/80 dark:border-zinc-800/80 rounded-2xl p-3 sm:p-4 flex items-center justify-center overflow-hidden shadow-inner relative transition-colors"
      >
        <div 
          className="relative h-full max-h-full flex items-center justify-center transition-transform duration-100"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_DIMENSIONS.width}
            height={CANVAS_DIMENSIONS.height}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
            className={`h-full max-h-full w-auto aspect-[1200/1700] object-contain rounded-lg certificate-paper-shadow cursor-crosshair bg-white ${
              isDragging ? 'cursor-grabbing' : ''
            }`}
          />

          {showGuides && (
            <div className="absolute top-2.5 left-2.5 bg-white/95 dark:bg-zinc-900/95 text-zinc-700 dark:text-zinc-300 text-xs px-2.5 py-1 rounded-md border border-stone-200 dark:border-zinc-700 pointer-events-none flex items-center gap-1.5 shadow-sm backdrop-blur-sm">
              <Move className="w-3.5 h-3.5 text-amber-500" />
              <span>Drag to reposition</span>
            </div>
          )}
        </div>
      </div>

      {/* Export Actions Bar - Always pinned at bottom without scrolling */}
      <div className="bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800/80 rounded-2xl p-2.5 sm:p-3 shadow-xs shrink-0 transition-colors">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {/* Primary Action: Download PDF */}
          <button
            onClick={handleDownloadPDF}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1e293b] hover:bg-[#0f172a] dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all transform active:scale-98"
          >
            <FileDown className="w-4 h-4 text-amber-400 dark:text-amber-600" />
            <span>Download PDF (Print-Ready A4)</span>
          </button>

          {/* Secondary Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleDownloadPNG}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-semibold transition-all border border-stone-200/70 dark:border-zinc-700/70"
            >
              <Download className="w-3.5 h-3.5 text-zinc-500" />
              <span>PNG</span>
            </button>

            <button
              onClick={handleDownloadJPG}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-semibold transition-all border border-stone-200/70 dark:border-zinc-700/70"
            >
              <Download className="w-3.5 h-3.5 text-zinc-500" />
              <span>JPG</span>
            </button>

            <button
              onClick={() => {
                if (baseImage) {
                  const cleanCanvas = document.createElement('canvas');
                  cleanCanvas.width = CANVAS_DIMENSIONS.width;
                  cleanCanvas.height = CANVAS_DIMENSIONS.height;
                  const cleanCtx = cleanCanvas.getContext('2d');
                  cleanCtx.drawImage(baseImage, 0, 0, CANVAS_DIMENSIONS.width, CANVAS_DIMENSIONS.height);
                  downloadCanvasImage(cleanCanvas, 'Geeta_University_Blank_Template.png', 'image/png');
                  notifyExport('Blank Template Saved');
                }
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-2.5 bg-stone-100 hover:bg-stone-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 rounded-xl text-xs font-medium transition-all border border-stone-200/70 dark:border-zinc-700/70"
              title="Download blank background template image"
            >
              <span>Blank</span>
            </button>
          </div>
        </div>

        {/* Feedback notification */}
        {exportState.active && (
          <div className="mt-2 flex items-center justify-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 animate-fadeIn">
            <Check className="w-3.5 h-3.5" />
            <span>{exportState.label} successfully!</span>
          </div>
        )}
      </div>
    </div>
  );
}
