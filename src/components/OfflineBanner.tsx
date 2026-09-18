import React, { useState, useEffect } from "react";
import { usePermissions } from "../context/PermissionContext";
import { WifiOff, RefreshCw, AlertCircle, SignalHigh, Wifi } from "lucide-react";

export default function OfflineBanner() {
  const { network } = usePermissions();
  const [retrying, setRetrying] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  // If we transition from offline to online, show a temporary "Back Online" message
  useEffect(() => {
    if (network.online) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3500);
      return () => clearTimeout(timer);
    } else {
      setShowReconnected(false);
    }
  }, [network.online]);

  const handleManualRetry = () => {
    setRetrying(true);
    // Simulating endpoint ping check or navigator refresh
    setTimeout(() => {
      setRetrying(false);
      // Auto triggers online state if the browser has connected
      if (navigator.onLine) {
        window.dispatchEvent(new Event("online"));
      }
    }, 1200);
  };

  if (network.online && !showReconnected) {
    return null;
  }

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] w-[92%] max-w-md animate-bounce-slow">
      {showReconnected ? (
        <div className="bg-emerald-950/90 border border-emerald-500/20 backdrop-blur-md rounded-2xl p-3.5 shadow-2xl flex items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
              <Wifi className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black">Aloqa tiklandi • Online</h4>
              <p className="text-[10px] text-white/60">Tizim barqaror va ishlayapti.</p>
            </div>
          </div>
          <div className="text-[9px] uppercase tracking-wider font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            OK
          </div>
        </div>
      ) : (
        <div className="bg-red-950/90 border border-red-500/25 backdrop-blur-md rounded-2xl p-4 shadow-2xl flex flex-col gap-3 text-white">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
              <WifiOff className="w-5 h-5 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase tracking-wide text-red-400 flex items-center gap-1.5">
                <span>Internet aloqasi uzildi</span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
              </h4>
              <p className="text-[10px] text-white/60 leading-normal">
                Siz hozir oflayn rejimsiz. Yuk tashish buyurtmalarini ko'rish yoki yangi auksion joylash uchun internet aloqasini tekshiring. Tizim avtomatik ravishda qayta ulanishni sinab ko'rmoqda.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/5 pt-3">
            <div className="flex items-center gap-1.5 text-[9px] text-white/40 uppercase font-mono font-bold">
              <AlertCircle className="w-3.5 h-3.5 text-red-500/60" />
              <span>Avto-qayta ulanish faol</span>
            </div>

            <button
              onClick={handleManualRetry}
              disabled={retrying}
              className="px-3.5 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500 text-white font-black text-[10px] uppercase tracking-wide flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${retrying ? "animate-spin" : ""}`} />
              <span>{retrying ? "Tekshirilmoqda..." : "Qayta urinish"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
