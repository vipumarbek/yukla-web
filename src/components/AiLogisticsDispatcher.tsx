/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { LanguageCode, User } from "../types";
import {
  Sparkles,
  Zap,
  Mic,
  Send,
  FileText,
  Upload,
  CheckCircle2,
  Truck,
  DollarSign,
  MapPin,
  Clock,
  ShieldCheck,
  TrendingDown,
  ArrowRight,
  RefreshCw,
  PhoneCall,
  Star,
  FileCheck
} from "lucide-react";

interface AiLogisticsDispatcherProps {
  currentLang: LanguageCode;
  user: User | null;
  onBookOrder?: (orderParams: any) => void;
  onRequestAuth?: () => void;
}

export default function AiLogisticsDispatcher({
  currentLang,
  user,
  onBookOrder,
  onRequestAuth
}: AiLogisticsDispatcherProps) {
  const [promptInput, setPromptInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<any | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrDocument, setOcrDocument] = useState<any | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  // Preset quick prompt samples
  const promptSamples = [
    "Toshkent Sergelidan Buxoroga 18 tonna armatura kerak, Fura Tent, ertaga ertalab",
    "Samarqanddan Toshkentga 5 tonna muzlatilgan go'sht, Refrijerator kerak",
    "Andijondan Toshkent Chilonzorga 1.5 tonna trikotaj kiyimlar, Labo yoki Bongo"
  ];

  const handleAiDispatch = async (promptToUse?: string) => {
    const query = promptToUse || promptInput;
    if (!query.trim()) return;

    setLoading(true);
    setDispatchResult(null);
    setBookingSuccess(null);

    try {
      const res = await fetch("/api/ai/smart-dispatch-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          naturalPrompt: query,
          language: currentLang
        })
      });

      if (res.ok) {
        const data = await res.json();
        setDispatchResult(data);
      } else {
        throw new Error("AI Dispatch server javob bermadi.");
      }
    } catch (err) {
      console.error("AI Dispatch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateOcr = async () => {
    setOcrLoading(true);
    setOcrDocument(null);

    try {
      const res = await fetch("/api/ai/parse-cargo-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: "e-ttn-manifest-2026.pdf",
          docText: "TEXNOPARK MCHJ Toshkent -> Samarqand Real Savdo 14.2 tonna"
        })
      });

      if (res.ok) {
        const data = await res.json();
        setOcrDocument(data.document);
        // Also trigger AI quote for this document
        handleAiDispatch("Toshkentdan Samarqandga Texnopark mahsulotlari 14.2 tonna Fura");
      }
    } catch (e) {
      console.error("OCR parse error:", e);
    } finally {
      setOcrLoading(false);
    }
  };

  const handleConfirmDispatch = (driver: any) => {
    if (!user) {
      if (onRequestAuth) onRequestAuth();
      return;
    }

    setSelectedDriverId(driver.id);
    setBookingSuccess(`Buyurtma muvaffaqiyatli rasmiylashtirildi! Haydovchi ${driver.name} (${driver.phone}) ga avtomatik dispatch yuborildi.`);

    if (onBookOrder && dispatchResult) {
      onBookOrder({
        pickupAddress: dispatchResult.parsedCargo.origin,
        deliveryAddress: dispatchResult.parsedCargo.destination,
        cargoType: dispatchResult.parsedCargo.cargoType,
        weight: dispatchResult.parsedCargo.weightTons,
        vehicleType: driver.vehicleType,
        price: dispatchResult.pricingIndex.recommendedPriceSom,
        driverId: driver.id,
        driverName: driver.name,
        driverPhone: driver.phone
      });
    }
  };

  return (
    <section id="ai-dispatcher" className="py-24 relative px-4 lg:px-10 bg-[#090416] border-b border-white/5 overflow-hidden">
      {/* Decorative light flare */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-10 relative z-10">
        
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-mono font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>YUKLA AUTONOMOUS AI FREIGHT DISPATCHER</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Bir Qator Matn Yoki Hujjat Bilan Yukni Joylang
          </h2>
          <p className="text-xs sm:text-sm text-white/60">
            YukLa AI tabiiy tilda yozilgan matn yoki E-TTN hisob-fakturasini o'rganib, adolatli bozor narxini hisoblaydi va 30 soniyada yaqin atrofdagi eng yaxshi furalarni topadi.
          </p>
        </div>

        {/* Input Interactive Box */}
        <div className="bg-gradient-to-b from-[#12082b] to-[#0a0418] border border-purple-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          
          <div className="space-y-4">
            <label className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Yukingiz haqida istalgan tilda yozing:</span>
            </label>

            {/* Large Comfortable Textarea without overlapping controls */}
            <div className="w-full">
              <textarea
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Masalan: Ertaga ertalab Toshkent Sergelidan Buxoroga 18 tonna oziq-ovqat mahsulotlari kerak, Refrijerator yoki Fura..."
                className="w-full min-h-[190px] sm:min-h-[210px] bg-[#16131F] border border-white/[0.08] focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm text-white outline-none placeholder:text-zinc-500 transition-all font-sans leading-relaxed shadow-inner resize-y"
              />
            </div>

            {/* Bottom Action Row - Distinct below the textarea */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={handleSimulateOcr}
                disabled={ocrLoading}
                className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-mono border border-white/10 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
                title="E-TTN yoki Nakladnaya skan qilish"
              >
                <FileText className="w-4 h-4 text-purple-400" />
                <span>{ocrLoading ? "Skanerlanmoqda..." : "E-TTN / OCR Hujjat"}</span>
              </button>

              <button
                type="button"
                onClick={() => handleAiDispatch()}
                disabled={loading || !promptInput.trim()}
                className="min-h-[44px] flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-purple-900/40 disabled:opacity-50 active:scale-[0.98]"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{loading ? "Hisoblanmoqda..." : "AI Dispatch"}</span>
              </button>
            </div>
          </div>

          {/* Quick Preset Prompts */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[10px] text-white/40 font-mono uppercase">Tezkor namunalar:</span>
            {promptSamples.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPromptInput(sample);
                  handleAiDispatch(sample);
                }}
                className="px-3 py-1 bg-white/5 hover:bg-purple-500/20 border border-white/5 hover:border-purple-500/30 rounded-full text-[10px] text-white/70 hover:text-purple-300 transition cursor-pointer truncate max-w-xs"
              >
                {sample}
              </button>
            ))}
          </div>

          {/* OCR Document Preview if scanned */}
          {ocrDocument && (
            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4 space-y-2 animate-fade-in text-xs font-mono">
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4" />
                  <span>{ocrDocument.documentType} (#{ocrDocument.documentNumber})</span>
                </span>
                <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Tasdiqlangan Ishonchlilik: {Math.round(ocrDocument.confidenceScore * 100)}%
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-white/70 text-[11px] pt-1 border-t border-emerald-500/10">
                <div>Yuboruvchi: <span className="text-white font-bold">{ocrDocument.senderName}</span></div>
                <div>Qabul qiluvchi: <span className="text-white font-bold">{ocrDocument.receiverName}</span></div>
                <div>Massa & Hajm: <span className="text-emerald-300 font-bold">{ocrDocument.grossWeightKg / 1000} tonna ({ocrDocument.volumeM3} m³)</span></div>
              </div>
            </div>
          )}

          {/* Booking Success Toast */}
          {bookingSuccess && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/50 rounded-2xl flex items-center gap-3 text-emerald-300 text-xs animate-fade-in font-mono">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <p>{bookingSuccess}</p>
            </div>
          )}

          {/* AI DISPATCH RESULTS DISPLAY */}
          {dispatchResult && (
            <div className="space-y-6 pt-4 border-t border-white/10 animate-fade-in">
              
              {/* AI Recommendation Banner */}
              {dispatchResult.aiRecommendation && (
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-purple-200 leading-relaxed font-sans">
                    {dispatchResult.aiRecommendation}
                  </p>
                </div>
              )}

              {/* Parsed Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                
                {/* Route Card */}
                <div className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-1">
                  <span className="text-[10px] text-white/40 uppercase font-mono block">Marshrut & Masofa</span>
                  <p className="text-sm font-black text-white">
                    {dispatchResult.parsedCargo.origin} &rarr; {dispatchResult.parsedCargo.destination}
                  </p>
                  <p className="text-[11px] text-purple-300 font-mono">
                    {dispatchResult.parsedCargo.estimatedDistanceKm} km • ~{dispatchResult.parsedCargo.estimatedTransitHours} soat
                  </p>
                </div>

                {/* Pricing Card */}
                <div className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-1">
                  <span className="text-[10px] text-emerald-400 uppercase font-mono block">AI Tavsiya Narxi</span>
                  <p className="text-base font-black text-white font-mono">
                    {dispatchResult.pricingIndex.recommendedPriceSom.toLocaleString()} UZS
                  </p>
                  <p className="text-[10px] text-emerald-400">
                    Bozorga nisbatan {dispatchResult.pricingIndex.shipperSavingVsMarketSom.toLocaleString()} UZS tejamkorlik
                  </p>
                </div>

                {/* Vehicle & Specs */}
                <div className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-1">
                  <span className="text-[10px] text-white/40 uppercase font-mono block">Mos Mashina Turi</span>
                  <p className="text-sm font-black text-purple-300">
                    {dispatchResult.parsedCargo.vehicleType}
                  </p>
                  <p className="text-[10px] text-white/50">
                    Yuk: {dispatchResult.parsedCargo.cargoType} ({dispatchResult.parsedCargo.weightTons}t)
                  </p>
                </div>

                {/* Backhaul 0% Empty Miles Guarantee */}
                <div className="p-4 bg-gradient-to-br from-emerald-950/30 to-black border border-emerald-500/20 rounded-2xl space-y-1">
                  <span className="text-[10px] text-emerald-400 uppercase font-mono block">0% Bo'sh Qatnov Kafolati</span>
                  <p className="text-xs font-bold text-white">
                    Qaytish yuki topildi!
                  </p>
                  <p className="text-[10px] text-emerald-300/80 font-mono">
                    {dispatchResult.backhaulOpportunity.returnRoute}
                  </p>
                </div>

              </div>

              {/* Matched Verified Drivers List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-purple-400" />
                    <span>Yaqin Atrofdagi Mos Keluvchi Tasdiqlangan Furalar (30s ETA)</span>
                  </h4>
                  <span className="text-[10px] text-emerald-400 font-mono">● 100% Sug'urtalangan va Tekshirilgan</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {dispatchResult.matchedDrivers.map((driver: any) => (
                    <div
                      key={driver.id}
                      className="p-4 bg-white/5 hover:bg-white/[0.08] border border-white/10 hover:border-purple-500/40 rounded-2xl space-y-3 transition flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-300 font-mono">
                              {driver.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white">{driver.name}</p>
                              <div className="flex items-center gap-1 text-[10px] text-amber-400">
                                <Star className="w-3 h-3 fill-amber-400" />
                                <span>{driver.rating}</span>
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full font-mono">
                            ~{driver.etaMinutes} daqiqa
                          </span>
                        </div>

                        <div className="text-[11px] text-white/60 font-mono space-y-0.5 pt-2 border-t border-white/5">
                          <p>Mashina: <span className="text-white font-bold">{driver.vehicleType}</span></p>
                          <p>Raqami: <span className="text-white font-bold">{driver.vehiclePlates}</span></p>
                          <p>Telefon: <span className="text-purple-300">{driver.phone}</span></p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleConfirmDispatch(driver)}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Tanlash & Bron Qilish</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </section>
  );
}
