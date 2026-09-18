import React, { useEffect, useState } from "react";
import { Order, OrderStatus } from "../types";
import { useTranslation } from "../context/LanguageContext";
import { 
  Navigation, 
  Map, 
  Compass, 
  User, 
  CheckCircle2, 
  Award, 
  Phone,
  MessageSquare
} from "lucide-react";

interface DriverActiveMissionProps {
  activeOrder: Order | null;
  simStepsCompleted: number;
  currentCoord: { lat: number; lng: number };
  gpsLog: string[];
  globalLoading: boolean;
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  onOpenCancelModal: (orderId: string) => void;
  onOpenChat?: (orderId: string) => void;
}

export default function DriverActiveMission({
  activeOrder,
  simStepsCompleted,
  currentCoord,
  gpsLog,
  globalLoading,
  onUpdateStatus,
  onOpenCancelModal,
  onOpenChat
}: DriverActiveMissionProps) {
  const { t } = useTranslation();

  if (!activeOrder) {
    return (
      <div className="text-center py-16 bg-[#120b2e]/20 border border-dashed border-white/10 rounded-3xl space-y-3">
        <span className="text-5xl block animate-bounce">📦</span>
        <h3 className="font-extrabold text-base text-white/80">Faol bajarilayotgan reys</h3>
        <p className="text-white/40 text-xs max-w-md mx-auto">
          Hozirda sizda bajarilayotgan faol yuk yo'q. Bo'sh yuklar bo'limidan yangi buyurtma qabul qilishingiz mumkin.
        </p>
      </div>
    );
  }

  const grossPay = activeOrder.price;
  const netIncome = grossPay * 0.97;
  const commission = grossPay * 0.03;

  // Status Stepper list helpers
  const steps = [
    { key: OrderStatus.ACCEPTED, label: t("statusAccepted") },
    { key: OrderStatus.IN_TRANSIT, label: t("statusInTransit") },
    { key: OrderStatus.DELIVERED, label: t("statusDelivered") }
  ];

  return (
    <div className="bg-gradient-to-br from-[#12052c] to-[#0a0517] border border-purple-500/25 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden animate-fade-in">
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-white/5 gap-4">
        <div className="space-y-1">
          <span className="px-3 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[9px] uppercase font-bold tracking-widest animate-pulse inline-block">
            Aktiv tashuv jarayoni • Ongoing Mission
          </span>
          <h3 className="text-2xl font-black text-white mt-1.5 flex items-center gap-2">
            <span>Buyurtma #{activeOrder.id.substring(0, 8).toUpperCase()}</span>
          </h3>
        </div>

        <div className="flex gap-2">
          <span className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-widest font-mono">
            Yo'nalish Statusi: {activeOrder.status}
          </span>
        </div>
      </div>

      {/* Stepper Progression Timeline */}
      <div className="pt-6 pb-2 border-b border-white/5">
        <div className="flex justify-between items-center max-w-2xl mx-auto relative px-4">
          <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-0.5 bg-white/5 -z-10"></div>
          {steps.map((st, i) => {
            const isCompleted = 
              activeOrder.status === OrderStatus.DELIVERED ||
              (activeOrder.status === OrderStatus.IN_TRANSIT && i <= 1) ||
              (activeOrder.status === OrderStatus.ACCEPTED && i === 0);

            const isActive = activeOrder.status === st.key;

            return (
              <div key={st.key} className="flex flex-col items-center space-y-1 z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border transition-all ${
                  isActive ? "bg-purple-600 text-white scale-110 border-purple-400 font-black shadow-lg shadow-purple-500/40" :
                  isCompleted ? "bg-emerald-500/20 text-emerald-400 border-emerald-500" :
                  "bg-[#0f041d] text-white/30 border-white/10"
                }`}>
                  {isCompleted && !isActive ? "✓" : i + 1}
                </div>
                <span className={`text-[10px] font-bold ${isActive ? "text-purple-400" : isCompleted ? "text-emerald-400" : "text-white/40"}`}>{st.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
        {/* Left Column in Grid */}
        <div className="space-y-5">
          <div className="bg-white/5 p-4 rounded-3xl border border-white/5 space-y-3">
            <h4 className="text-[10px] font-bold uppercase text-white/40 tracking-wider font-mono">Yuk Jo'natuvchi (Shipper Client)</h4>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/10 flex items-center justify-center">
                <User className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">{activeOrder.customerName}</p>
                <p className="text-xs text-purple-400 font-mono mt-0.5 flex items-center gap-1">
                  <Phone className="w-3" />
                  {activeOrder.phoneNumber || "+998 90 123 45 67"}
                </p>
              </div>
            </div>
            {onOpenChat && (
              <button 
                type="button" 
                onClick={() => onOpenChat(activeOrder.id)}
                className="w-full mt-2 bg-purple-650 hover:bg-purple-550 border border-purple-500/20 text-white font-bold text-xs py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Mijoz bilan chat</span>
              </button>
            )}
          </div>

          <div className="bg-white/5 p-4 rounded-3xl border border-white/5 space-y-4">
            <h4 className="text-[10px] font-bold uppercase text-white/40 tracking-wider">Tafsilotlar & Manzillar</h4>
            
            <div className="space-y-3 text-xs leading-relaxed">
              <div>
                <span className="font-bold text-emerald-400 uppercase text-[9px] flex items-center gap-1">
                  <span>Yuklash nuqtasi (Pickup):</span>
                </span>
                <p className="text-white/80 font-medium mt-0.5">{activeOrder.pickupAddress}</p>
                <span className="bg-emerald-500/10 text-emerald-300 text-[8.5px] px-1.5 py-0.5 rounded font-mono font-bold mt-1 inline-block">
                  {activeOrder.pickupRegion} • {activeOrder.pickupDistrict}
                </span>
              </div>

              <hr className="border-white/5 animate-pulse" />

              <div>
                <span className="font-bold text-purple-400 uppercase text-[9px] flex items-center gap-1">
                  <span>Yetkazish manzili (Destination):</span>
                </span>
                <p className="text-white/80 font-medium mt-0.5">{activeOrder.deliveryAddress}</p>
                <span className="bg-purple-500/10 text-purple-300 text-[8.5px] px-1.5 py-0.5 rounded font-mono font-bold mt-1 inline-block">
                  {activeOrder.deliveryRegion} • {activeOrder.deliveryDistrict}
                </span>
              </div>
            </div>

            <div className="p-3 bg-black/40 rounded-2xl text-xs border border-white/5 space-y-1">
              <p className="font-bold text-white text-[13px]">{activeOrder.cargoType}</p>
              <span className="text-[10px] text-white/40 block leading-tight">Og'irligi: {activeOrder.weight} kg • Hajmi: {activeOrder.volume} m³</span>
              {activeOrder.comment && (
                <p className="text-[11px] text-purple-300 italic mt-1.5 leading-snug">"{activeOrder.comment}"</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Columns (SVG Map, Simulation metrics & controls) */}
        <div className="lg:col-span-2 flex flex-col justify-between space-y-6">
          <div className="bg-black/30 border border-white/5 p-5 rounded-3xl space-y-4">
            <h4 className="text-[10px] font-bold uppercase text-white/40 tracking-wider flex justify-between">
              <span>Moliyaviy parametrlar (SaaS Gross Tracker)</span>
              <span className="text-green-400 capitalize font-bold font-mono">To'lov: {activeOrder.paymentMethod}</span>
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5">
                <span className="text-[9px] text-white/40 uppercase block">Kafolatlangan gross narx</span>
                <span className="text-sm font-extrabold text-white font-mono mt-0.5 block">{grossPay.toLocaleString()} UZS</span>
              </div>

              <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5">
                <span className="text-[9px] text-purple-300 uppercase block">Komissiya (3%)</span>
                <span className="text-sm font-extrabold text-rose-450 font-mono mt-0.5 block">{commission.toLocaleString()} UZS</span>
              </div>
            </div>

            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex justify-between items-center text-xs">
              <div>
                <span className="text-[10px] text-green-405 uppercase font-black tracking-widest block">Siz oladigan net sof balans daromadi</span>
                <span className="text-white/40 text-[9.5px]">Yetkazib bergan zahoti kassa hamyonga tushadi</span>
              </div>
              <span className="text-xl font-black text-green-450 font-mono">{netIncome.toLocaleString()} UZS</span>
            </div>
          </div>

          {/* Interactive GPS vector visualization */}
          <div className="bg-[#05020c] border border-white/5 rounded-3xl p-5 space-y-4 relative overflow-hidden" style={{ minHeight: "220px" }}>
            <div className="flex justify-between items-center text-[10px] font-mono text-white/40 border-b border-white/5 pb-2">
              <span className="flex items-center gap-1">🛰️ Satellites: Connected</span>
              <span>Coordinates: {currentCoord.lat.toFixed(5)}, {currentCoord.lng.toFixed(5)}</span>
            </div>

            <div className="relative flex items-center justify-center py-2">
              <svg className="w-full max-w-sm h-36" viewBox="0 0 400 180">
                <g stroke="white" strokeWidth="0.5" strokeOpacity="0.05" fill="none">
                  <line x1="20" y1="20" x2="20" y2="160" />
                  <line x1="80" y1="20" x2="80" y2="160" />
                  <line x1="140" y1="20" x2="140" y2="160" />
                  <line x1="200" y1="20" x2="200" y2="160" />
                  <line x1="260" y1="20" x2="260" y2="160" />
                  <line x1="320" y1="20" x2="320" y2="160" />
                  <line x1="380" y1="20" x2="380" y2="160" />
                </g>

                {/* Simulated Road route line path */}
                <path d="M 50,110 Q 150,50 200,110 T 350,110" fill="none" stroke="#2e1065" strokeWidth="4" />
                <path d="M 50,110 Q 150,50 200,110 T 350,110" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="5,5" />

                {/* Points A & B */}
                <circle cx="50" cy="110" r="6" fill="#10b981" />
                <text x="45" y="125" fill="#10b981" fontSize="8" fontWeight="bold">Pickup</text>

                <circle cx="350" cy="110" r="6" fill="#8b5cf6" />
                <text x="330" y="125" fill="#8b5cf6" fontSize="8" fontWeight="bold">Delivery</text>

                {/* Simulated live moving truck pointer based on steps */}
                <g transform={`translate(${
                  50 + (350 - 50) * Math.min(1.0, simStepsCompleted / 24)
                }, ${
                  110 - Math.sin((simStepsCompleted / 24) * Math.PI) * 15
                })`}>
                  <circle cx="0" cy="0" r="12" fill="#8b5cf6" fillOpacity="0.2" className="animate-ping" />
                  <rect x="-7" y="-5" width="14" height="10" rx="2" fill="#8b5cf6" stroke="white" strokeWidth="1" />
                  <polygon points="1,-3 4,-3 4,3 1,3" fill="white" fillOpacity="0.5" />
                </g>
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center font-mono">
              <div className="bg-white/5 p-2 rounded-xl">
                <span className="text-[8.5px] uppercase text-white/30 block mb-0.5">Qolgan Masofa</span>
                <span className="text-xs font-bold text-white">{Math.max(1, 15 - simStepsCompleted)} km</span>
              </div>
              <div className="bg-white/5 p-2 rounded-xl">
                <span className="text-[8.5px] uppercase text-white/30 block mb-0.5">Kutilayotgan ETA</span>
                <span className="text-xs font-bold text-white">{Math.max(3, 40 - simStepsCompleted * 2)} daq.</span>
              </div>
            </div>
          </div>

          {/* Action Dispatches */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {activeOrder.status === OrderStatus.ACCEPTED && (
              <button
                disabled={globalLoading}
                onClick={() => onUpdateStatus(activeOrder.id, OrderStatus.IN_TRANSIT)}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-650 hover:from-purple-500 hover:to-indigo-550 text-white font-extrabold py-3.5 px-5 rounded-2xl transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-purple-900/15 text-[10.5px] uppercase tracking-wider"
              >
                <Navigation className="w-4 h-4 animate-bounce" />
                <span>Safarni boshlash (Start Delivery)</span>
              </button>
            )}

            {activeOrder.status === OrderStatus.IN_TRANSIT && (
              <button
                disabled={globalLoading}
                onClick={() => onUpdateStatus(activeOrder.id, OrderStatus.DELIVERED)}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-extrabold py-3.5 px-5 rounded-2xl transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-green-950/20 text-[10.5px] uppercase tracking-wider"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mijozga topshirildi (Complete Delivery)</span>
              </button>
            )}

            <button
              disabled={globalLoading}
              onClick={() => onOpenCancelModal(activeOrder.id)}
              className="bg-rose-950/25 border border-rose-500/20 hover:bg-rose-900/35 text-rose-400 font-bold px-4 py-3.5 rounded-2xl text-[10px] uppercase tracking-wider transition cursor-pointer"
            >
              Bekor Qilish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
