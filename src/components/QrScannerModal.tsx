import React, { useState, useEffect, useRef } from "react";
import { QrCode, Camera, X, Check, Flashlight, RefreshCw, AlertCircle } from "lucide-react";

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanResult: (code: string) => void;
  title?: string;
}

export default function QrScannerModal({
  isOpen,
  onClose,
  onScanResult,
  title = "QR / e-CMR Hujjat Skaneri"
}: QrScannerModalProps) {
  const [hasCamera, setHasCamera] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [isScanning, setIsScanning] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setHasCamera(true);
      }
    } catch (err) {
      console.warn("Camera access not available or blocked in iframe:", err);
      setHasCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const handleSimulateScan = (code: string) => {
    try {
      if ("vibrate" in navigator) {
        navigator.vibrate([20, 40, 20]);
      }
    } catch {
      // ignore
    }
    onScanResult(code);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[160] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-sans">
      <div className="bg-[#0e0722] border border-purple-500/20 rounded-3xl max-w-md w-full p-6 relative shadow-2xl space-y-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-900/50">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">{title}</h3>
              <span className="text-[10px] text-purple-400 font-mono">Digital Waybill & Cargo QR</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder Canvas / Video Frame */}
        <div className="relative w-full h-56 bg-black/80 rounded-2xl border border-purple-500/30 overflow-hidden flex items-center justify-center">
          {hasCamera ? (
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center p-4 space-y-2">
              <Camera className="w-8 h-8 text-purple-400/50 mx-auto" />
              <p className="text-xs text-white/60">
                Kamera ko'rinishi faol emas yoki simulyatsiya rejimida.
              </p>
              <p className="text-[10px] text-purple-300 font-mono">
                YukLa AI Scanner Ready
              </p>
            </div>
          )}

          {/* Targeting Box Overlays */}
          <div className="absolute inset-8 border-2 border-purple-500/60 rounded-xl pointer-events-none flex flex-col justify-between p-2">
            <div className="w-full flex justify-between">
              <div className="w-4 h-4 border-t-2 border-l-2 border-purple-400" />
              <div className="w-4 h-4 border-t-2 border-r-2 border-purple-400" />
            </div>
            {/* Animated Laser Scanning Line */}
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent animate-pulse" />
            <div className="w-full flex justify-between">
              <div className="w-4 h-4 border-b-2 border-l-2 border-purple-400" />
              <div className="w-4 h-4 border-b-2 border-r-2 border-purple-400" />
            </div>
          </div>
        </div>

        {/* Fast Test QR presets for logistics */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider block">
            Tezkor e-CMR QR-kodini tanlang:
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleSimulateScan("eCMR-UZ-99824-TASHKENT")}
              className="bg-white/5 hover:bg-purple-600/20 border border-white/5 hover:border-purple-500/30 p-2.5 rounded-xl text-left transition"
            >
              <span className="font-bold text-purple-300 block">📄 e-CMR Tashkent</span>
              <span className="text-[9.5px] text-white/40 font-mono">#eCMR-99824</span>
            </button>
            <button
              onClick={() => handleSimulateScan("TIR-CARNET-SAMARQAND-881")}
              className="bg-white/5 hover:bg-purple-600/20 border border-white/5 hover:border-purple-500/30 p-2.5 rounded-xl text-left transition"
            >
              <span className="font-bold text-emerald-300 block">🌐 TIR Carnet SilkRoad</span>
              <span className="text-[9.5px] text-white/40 font-mono">#TIR-881-SAM</span>
            </button>
          </div>
        </div>

        {/* Manual Code Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (manualCode.trim()) {
              handleSimulateScan(manualCode.trim());
            }
          }}
          className="flex gap-2 pt-1"
        >
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="yoki QR kod raqamini qo'lda yozing"
            className="flex-1 bg-black/40 border border-white/10 h-11 px-3.5 text-xs rounded-xl text-white outline-none focus:border-purple-500 font-mono"
          />
          <button
            type="submit"
            disabled={!manualCode.trim()}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold text-xs px-4 rounded-xl transition"
          >
            Qidirish
          </button>
        </form>
      </div>
    </div>
  );
}
