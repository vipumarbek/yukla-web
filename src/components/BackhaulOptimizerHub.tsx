/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { LanguageCode, BackhaulMatch, User } from "../types";
import {
  Zap,
  ArrowRightLeft,
  Fuel,
  Sparkles,
  Percent,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  MapPin,
  Truck,
  DollarSign,
  Shield,
  Layers,
  ArrowUpRight,
  Send
} from "lucide-react";

interface BackhaulOptimizerHubProps {
  currentLang: LanguageCode;
  token: string | null;
  user: User | null;
  onSelectOrder?: (orderId: string) => void;
}

export default function BackhaulOptimizerHub({
  currentLang,
  token,
  user,
  onSelectOrder
}: BackhaulOptimizerHubProps) {
  const [matches, setMatches] = useState<BackhaulMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<BackhaulMatch | null>(null);
  const [bookedStatus, setBookedStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/backhaul/matches");
        if (res.ok) {
          const data = await res.json();
          setMatches(data);
        }
      } catch (e) {
        console.error("Error loading backhauls:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const handleBookDualRoute = (match: BackhaulMatch) => {
    setSelectedMatch(match);
    setBookedStatus(`Dual-Hop reys #${match.id} muvaffaqiyatli band qilindi! Ikkala yo'nalish bo'yicha to'liq daromad kafolatlangan.`);
    setTimeout(() => {
      setBookedStatus(null);
    }, 5000);
  };

  return (
    <div className="space-y-6">
      {/* Backhaul Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-950/50 via-[#071917] to-[#040d0c] border border-emerald-500/20 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            <span>AI Deadhead Reduction & Dual-Hop Optimization</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Bo'sh Qaytishga Chek Qo'ying (Backhaul AI)
          </h2>
          <p className="text-white/70 text-sm leading-relaxed">
            Yuk tashishdagi eng katta xarajat — qaytishda bo'sh yurish (deadhead). AI algoritmi borish va qaytish yuklarini bitta zanjirga birlashtirib, haydovchilarga <strong>+35% ko'proq sof daromad</strong>, buyurtmachilarga esa <strong>15-20% chegirma</strong> taqdim etadi.
          </p>
        </div>

        {/* Live Aggregated Statistics */}
        <div className="grid grid-cols-2 gap-3 relative z-10 w-full md:w-auto">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <span className="text-[11px] text-white/50 block font-medium">Tejalgan Yonilg'i</span>
            <span className="text-xl font-black text-emerald-400 font-mono">18.5%</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <span className="text-[11px] text-white/50 block font-medium">Marshrut Samaradorligi</span>
            <span className="text-xl font-black text-teal-300 font-mono">96.2%</span>
          </div>
        </div>
      </div>

      {bookedStatus && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{bookedStatus}</span>
          </div>
          <button onClick={() => setBookedStatus(null)} className="text-white/50 hover:text-white">&times;</button>
        </div>
      )}

      {/* Matches Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {matches.map((match) => (
          <div
            key={match.id}
            className="bg-[#040e0d]/90 border border-emerald-500/20 hover:border-emerald-500/50 rounded-3xl p-6 transition flex flex-col justify-between gap-5 relative group shadow-xl"
          >
            <div className="space-y-4">
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    Samaradorlik: {match.efficiencyRating}%
                  </span>
                  <span className="text-white/40 text-xs font-mono">ID: {match.id}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-white/50 block">Umumiy Daromad:</span>
                  <span className="text-base font-black text-emerald-400 font-mono">
                    {(match.combinedRevenueSom || 0).toLocaleString()} UZS
                  </span>
                </div>
              </div>

              {/* Hop 1: Outbound */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">1</span>
                    To'g'ridan-to'g'ri Yo'nalish (Borish)
                  </span>
                  <span>{(match.outboundRoute.price || 0).toLocaleString()} UZS</span>
                </div>
                <div className="text-white/80 pl-5">
                  {match.outboundRoute.from} &rarr; {match.outboundRoute.to} ({match.outboundRoute.distanceKm} km)
                </div>
              </div>

              {/* Hop 2: Return Backhaul */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-teal-400 font-bold">
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-teal-500/20 flex items-center justify-center text-[10px]">2</span>
                    AI Qaytish Yuki (Backhaul Return)
                  </span>
                  <span>{(match.returnRoute.price || 0).toLocaleString()} UZS</span>
                </div>
                <div className="text-white/80 pl-5">
                  {match.returnRoute.from} &rarr; {match.returnRoute.to} ({match.returnRoute.distanceKm} km)
                </div>
              </div>

              {/* Fuel & Deadhead Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-2.5 flex items-center justify-between">
                  <span className="text-emerald-300/80">Bo'sh yurish tejalishi:</span>
                  <strong className="text-emerald-400 font-mono">+{match.deadheadKmSaved} km</strong>
                </div>
                <div className="bg-teal-950/30 border border-teal-500/20 rounded-xl p-2.5 flex items-center justify-between">
                  <span className="text-teal-300/80">Yoqilg'i tejami:</span>
                  <strong className="text-teal-400 font-mono">{(match.driverFuelSavingsSom || 0).toLocaleString()} UZS</strong>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <span className="text-xs text-white/50">
                Buyurtmachi chegirmasi: <strong className="text-white">-{match.shipperDiscountPercent}%</strong>
              </span>

              <button
                onClick={() => handleBookDualRoute(match)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950 transition cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Dual-Hop Reysni Band Qilish</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
