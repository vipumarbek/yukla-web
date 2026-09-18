import React, { useState } from "react";
import {
  Sparkles,
  Mic,
  QrCode,
  PenTool,
  PhoneCall,
  X,
  Zap,
  Layers,
  ChevronUp
} from "lucide-react";

interface MobileQuickActionFABProps {
  onOpenVoice: () => void;
  onOpenScanner: () => void;
  onOpenSignature: () => void;
  onOpenSupport?: () => void;
  onOpenCalculator?: () => void;
}

export default function MobileQuickActionFAB({
  onOpenVoice,
  onOpenScanner,
  onOpenSignature,
  onOpenSupport,
  onOpenCalculator
}: MobileQuickActionFABProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => {
    try {
      if ("vibrate" in navigator) {
        navigator.vibrate(15);
      }
    } catch {
      // ignore
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-20 right-4 z-40 lg:hidden font-sans">
      {/* Expanded Speed Dial Menu */}
      {isOpen && (
        <div className="flex flex-col items-end gap-2.5 mb-3 animate-fade-in">
          {/* Voice Order */}
          <button
            onClick={() => {
              setIsOpen(false);
              onOpenVoice();
            }}
            className="flex items-center gap-2.5 bg-[#120b2e]/95 border border-purple-500/30 text-white px-3.5 py-2.5 rounded-2xl shadow-xl backdrop-blur-md active:scale-95 transition hover:border-purple-400"
          >
            <span className="text-xs font-bold">Ovozli Buyurtma</span>
            <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-900/50">
              <Mic className="w-4 h-4" />
            </div>
          </button>

          {/* QR / e-CMR Scanner */}
          <button
            onClick={() => {
              setIsOpen(false);
              onOpenScanner();
            }}
            className="flex items-center gap-2.5 bg-[#120b2e]/95 border border-purple-500/30 text-white px-3.5 py-2.5 rounded-2xl shadow-xl backdrop-blur-md active:scale-95 transition hover:border-purple-400"
          >
            <span className="text-xs font-bold">QR / e-CMR Skaner</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-900/50">
              <QrCode className="w-4 h-4" />
            </div>
          </button>

          {/* Digital Signature */}
          <button
            onClick={() => {
              setIsOpen(false);
              onOpenSignature();
            }}
            className="flex items-center gap-2.5 bg-[#120b2e]/95 border border-purple-500/30 text-white px-3.5 py-2.5 rounded-2xl shadow-xl backdrop-blur-md active:scale-95 transition hover:border-purple-400"
          >
            <span className="text-xs font-bold">Elektron Imzo</span>
            <div className="w-9 h-9 rounded-xl bg-fuchsia-600 flex items-center justify-center text-white shadow-md shadow-fuchsia-900/50">
              <PenTool className="w-4 h-4" />
            </div>
          </button>

          {/* SOS / Support Hotline */}
          <button
            onClick={() => {
              setIsOpen(false);
              if (onOpenSupport) {
                onOpenSupport();
              } else {
                window.location.href = "tel:+998712000000";
              }
            }}
            className="flex items-center gap-2.5 bg-[#120b2e]/95 border border-red-500/30 text-white px-3.5 py-2.5 rounded-2xl shadow-xl backdrop-blur-md active:scale-95 transition hover:border-red-400"
          >
            <span className="text-xs font-bold text-red-300">24/7 SOS & Dispetcher</span>
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-900/50">
              <PhoneCall className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        onClick={toggle}
        aria-label="Quick Actions Menu"
        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-all duration-300 transform active:scale-90 border-2 ${
          isOpen
            ? "bg-zinc-800 border-white/20 rotate-90"
            : "bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-indigo-600 border-purple-400/50 shadow-purple-900/80 animate-bounce-subtle"
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
      </button>
    </div>
  );
}
