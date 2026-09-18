import React, { useRef, useState, useEffect } from "react";
import { PenTool, RotateCcw, Check, X, ShieldCheck, FileCheck } from "lucide-react";

interface DigitalSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSignature: (signatureDataUrl: string) => void;
  title?: string;
  orderNumber?: string;
}

export default function DigitalSignatureModal({
  isOpen,
  onClose,
  onConfirmSignature,
  title = "Elektron e-CMR Imzolash",
  orderNumber = "#YUK-6523"
}: DigitalSignatureModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.strokeStyle = "#a855f7";
            ctx.lineWidth = 3;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
          }
        }
      }, 100);
      setHasSignature(false);
    }
  }, [isOpen]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;
    const dataUrl = canvas.toDataURL("image/png");
    onConfirmSignature(dataUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[160] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-sans">
      <div className="bg-[#0e0722] border border-purple-500/20 rounded-3xl max-w-md w-full p-6 relative shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-900/50">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">{title}</h3>
              <span className="text-[10px] text-purple-400 font-mono">Buyurtma: {orderNumber}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-white/60 leading-relaxed">
          Ushbu elektron imzo raqamli e-CMR va yuk topshirish dalolatnomasini tasdiqlash uchun xizmat qiladi.
        </p>

        {/* Canvas Signature Pad */}
        <div className="bg-black/60 border border-purple-500/30 rounded-2xl p-2 relative overflow-hidden">
          <canvas
            ref={canvasRef}
            width={360}
            height={180}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-44 bg-[#070312] rounded-xl cursor-crosshair touch-none"
          />
          {!hasSignature && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-white/20 text-xs font-mono">
              Bu yerga barmoq yoki stylus bilan imzo qo'ying
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <button
            onClick={clearCanvas}
            className="flex items-center gap-1.5 text-white/60 hover:text-white px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Tozalash</span>
          </button>

          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>256-bit SHA e-CMR Vault</span>
          </span>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 min-h-[44px] bg-white/5 hover:bg-white/10 text-white/70 font-bold text-xs py-3 rounded-xl transition cursor-pointer"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleSave}
            disabled={!hasSignature}
            className="flex-1 min-h-[44px] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white font-extrabold text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-950/50 transition cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Tasdiqlash & Imzolash</span>
          </button>
        </div>
      </div>
    </div>
  );
}
