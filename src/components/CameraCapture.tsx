import React, { useRef, useState, useEffect } from "react";
import { Camera, RefreshCw, Check, X, AlertTriangle, VideoOff, Upload } from "lucide-react";
import { usePermissions } from "../context/PermissionContext";

interface CameraCaptureProps {
  onCapture: (base64Img: string) => void;
  onClose?: () => void;
  initialPhoto?: string;
  className?: string;
}

export default function CameraCapture({
  onCapture,
  onClose,
  initialPhoto,
  className = "",
}: CameraCaptureProps) {
  const { requestPermission } = usePermissions();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionState, setPermissionState] = useState<"prompt" | "granted" | "denied" | "loading">("prompt");
  const [photo, setPhoto] = useState<string | null>(initialPhoto || null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasMediaDevices = typeof navigator !== "undefined" && Boolean(navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === "function");

  // Stop camera helper
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  // Start camera helper
  const startCamera = async () => {
    if (!hasMediaDevices) {
      setPermissionState("denied");
      setErrorMessage("Qurilmangizda kamera apparati topilmadi yoki brauzer uni qo'llab-quvvatlamaydi. Iltimos, fayl tanlash orqali yuklang.");
      return;
    }

    setPermissionState("loading");
    setErrorMessage(null);
    
    // Request permission contextually with explainers
    const allowed = await requestPermission("camera", "Yuk rasmlarini yuklash yoki haydovchilik guvohnomasini verifikatsiya qilish");
    if (!allowed) {
      setPermissionState("denied");
      setErrorMessage("Kameraga ruxsat berilmadi. Fayl tanlash tugmasi orqali rasm yuklashingiz mumkin.");
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 400 },
          height: { ideal: 400 },
          facingMode: "user",
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setPermissionState("granted");
      setIsCameraActive(true);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setPermissionState("denied");
      setIsCameraActive(false);
      setErrorMessage(
        err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
          ? "Kameraga kirish taqiqlangan. Iltimos, faylni galereyadan yuklang."
          : "Kamera topilmadi yoki boshqa dastur tomonidan band qilingan."
      );
    }
  };

  // File Picker Fallback Handler (For document / photo uploads)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Faqat rasm formatidagi fayllarni yuklash mumkin (JPG, PNG, WEBP)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setPhoto(result);
        onCapture(result);
        stopCamera();
        setErrorMessage(null);
      }
    };
    reader.onerror = () => {
      setErrorMessage("Faylni o'qishda xatolik yuz berdi.");
    };
    reader.readAsDataURL(file);
  };

  // Capture photo
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        const size = Math.min(video.videoWidth, video.videoHeight);
        canvas.width = 300;
        canvas.height = 300;

        // Crop centered square
        const sx = (video.videoWidth - size) / 2;
        const sy = (video.videoHeight - size) / 2;

        context.drawImage(video, sx, sy, size, size, 0, 0, 300, 300);

        try {
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          setPhoto(dataUrl);
          onCapture(dataUrl);
          stopCamera();
        } catch (err) {
          console.error("Canvas toDataURL error:", err);
          setErrorMessage("Rasm olishda xatolik yuz berdi.");
        }
      }
    }
  };

  // Reset/retake photo
  const retakePhoto = () => {
    setPhoto(null);
    startCamera();
  };

  // Auto clean up on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className={`p-4 bg-purple-950/20 border border-white/5 rounded-2xl flex flex-col items-center justify-center space-y-3 ${className}`}>
      {/* Photo display / Camera viewport */}
      <div className="relative w-40 h-40 rounded-2xl overflow-hidden bg-[#0a0515] border border-white/10 flex items-center justify-center shadow-inner">
        {photo ? (
          <img
            src={photo}
            alt="Profile snap"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        ) : isCameraActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-3 space-y-1.5 text-white/40">
            <VideoOff className="w-6 h-6 text-white/20" />
            <span className="text-[10px] font-medium leading-tight">Kamera faol emas</span>
          </div>
        )}

        {/* Live Status indicator */}
        {isCameraActive && !photo && (
          <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-red-500/80 px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider text-white animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
            <span>LIVE</span>
          </div>
        )}
      </div>

      {/* Canvas for rendering snapshot (hidden) */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Error Message */}
      {errorMessage && (
        <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-start gap-1.5 text-[10px] max-w-xs leading-normal">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Hidden file input for document and photo upload fallback */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Interactive controls */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {!isCameraActive && !photo && (
          <>
            <button
              type="button"
              onClick={startCamera}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] uppercase tracking-wide flex items-center gap-1.5 transition cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Kamerani yoqish</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white font-bold text-[10px] uppercase tracking-wide flex items-center gap-1.5 transition cursor-pointer border border-white/15"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Fayl yuklash</span>
            </button>
          </>
        )}

        {isCameraActive && !photo && (
          <>
            <button
              type="button"
              onClick={capturePhoto}
              className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] uppercase tracking-wide flex items-center gap-1.5 transition cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Rasmga tushish</span>
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 transition cursor-pointer"
              title="Kamerani o'chirish"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </>
        )}

        {photo && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={retakePhoto}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-semibold text-[10px] flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Qayta tushish</span>
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-xl bg-purple-650 hover:bg-purple-550 text-white font-bold text-[10px] uppercase transition cursor-pointer"
              >
                Tasdiqlash
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
