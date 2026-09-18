/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { LanguageCode } from "../types";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Fuel,
  Compass,
  MapPin,
  Truck,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Zap,
  Layers,
  Thermometer,
  Wind,
  Navigation2,
  BarChart3,
  RefreshCw
} from "lucide-react";

interface CentralAsiaFreightTerminalProps {
  currentLang: LanguageCode;
  onRequestQuote?: (origin: string, destination: string) => void;
}

interface CorridorData {
  id: string;
  name: string;
  distanceKm: number;
  avgDurationHours: number;
  currentRateSom: number;
  rateTrend: "up" | "down" | "stable";
  rateTrendPercent: number;
  activeTrucks: number;
  roadQuality: "A+" | "A" | "B";
  qamchiqPassInvolved: boolean;
  status: "smooth" | "moderate" | "heavy";
}

export default function CentralAsiaFreightTerminal({
  currentLang,
  onRequestQuote
}: CentralAsiaFreightTerminalProps) {
  const [selectedCorridorId, setSelectedCorridorId] = useState<string>("corr-1");
  const [activeTab, setActiveTab] = useState<"corridors" | "pass_radar" | "fuel_index" | "capacity_heatmap">("corridors");
  const [liveTimestamp, setLiveTimestamp] = useState<string>(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTimestamp(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const corridors: CorridorData[] = [
    {
      id: "corr-1",
      name: "Toshkent — Samarqand — Buxoro",
      distanceKm: 580,
      avgDurationHours: 7.5,
      currentRateSom: 9800,
      rateTrend: "up",
      rateTrendPercent: 2.8,
      activeTrucks: 142,
      roadQuality: "A+",
      qamchiqPassInvolved: false,
      status: "smooth"
    },
    {
      id: "corr-2",
      name: "Toshkent — Farg'ona vodiysi (A373)",
      distanceKm: 330,
      avgDurationHours: 5.2,
      currentRateSom: 12400,
      rateTrend: "up",
      rateTrendPercent: 4.1,
      activeTrucks: 98,
      roadQuality: "A",
      qamchiqPassInvolved: true,
      status: "smooth"
    },
    {
      id: "corr-3",
      name: "Toshkent — Olmaota (Qozog'iston)",
      distanceKm: 810,
      avgDurationHours: 14.0,
      currentRateSom: 13900,
      rateTrend: "down",
      rateTrendPercent: 1.5,
      activeTrucks: 76,
      roadQuality: "A",
      qamchiqPassInvolved: false,
      status: "moderate"
    },
    {
      id: "corr-4",
      name: "Buxoro — Urganch — Nukus",
      distanceKm: 560,
      avgDurationHours: 8.0,
      currentRateSom: 11200,
      rateTrend: "stable",
      rateTrendPercent: 0.3,
      activeTrucks: 44,
      roadQuality: "A",
      qamchiqPassInvolved: false,
      status: "smooth"
    },
    {
      id: "corr-5",
      name: "Qashg'ar (Xitoy) — O'sh — Andijon — Toshkent",
      distanceKm: 920,
      avgDurationHours: 22.0,
      currentRateSom: 23500,
      rateTrend: "up",
      rateTrendPercent: 6.4,
      activeTrucks: 58,
      roadQuality: "B",
      qamchiqPassInvolved: true,
      status: "moderate"
    }
  ];

  const selectedCorridor = corridors.find(c => c.id === selectedCorridorId) || corridors[0];

  const fuelStations = [
    { name: "UNG Petro (Dizel Evro-5)", price: 12600, location: "Respublika bo'ylab", trend: "stabil" },
    { name: "Lukoil Uzbekistan (Dizel Evro-6)", price: 13900, location: "Toshkent & M39", trend: "+200 UZS" },
    { name: "Mustang / IBR (Dizel)", price: 12400, location: "Samarqand & Buxoro", trend: "stabil" },
    { name: "CNG Metan Gaz (m³)", price: 3800, location: "Respublika bo'ylab 840+ AGTKSH", trend: "stabil" },
    { name: "LNG Suyuqlantirilgan Gaz", price: 6200, location: "Trassalarda", trend: "stabil" }
  ];

  return (
    <section id="freight-terminal" className="py-20 relative px-4 lg:px-10 bg-[#060212] border-b border-white/5 overflow-hidden">
      {/* Decorative ambient gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-purple-600/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* Terminal Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-mono font-bold uppercase tracking-widest">
              <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>MARKAZIY OSIYO FREIGHT CONTROL TOWER & RADAR</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              YukLa Jonli Logistika Terminali
            </h2>
            <p className="text-xs text-white/50 max-w-xl">
              14 ta viloyat va xalqaro tranzit koridorlari bo'yicha real-vaqt spot narxlari, Qamchiq dovoni telemetriyasi va dizel barometri.
            </p>
          </div>

          {/* Live Heartbeat & Telemetry Status */}
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-white/80">JONLI TELEMETRIYA:</span>
            <span className="text-purple-400 font-bold">{liveTimestamp}</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto gap-2 border-b border-white/10 pb-3 no-scrollbar">
          {[
            { key: "corridors", label: "Tranzit Koridorlari & Spot Indeks", icon: Compass },
            { key: "pass_radar", label: "Qamchiq Dovoni Radari (A373)", icon: AlertTriangle },
            { key: "fuel_index", label: "Dizel & Metan Barometri", icon: Fuel },
            { key: "capacity_heatmap", label: "Hududiy Furalar Zaxirasi", icon: BarChart3 }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-900/30"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: CORRIDORS & SPOT RATE MATRIX */}
        {activeTab === "corridors" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Corridor Selection List (7 Cols) */}
            <div className="lg:col-span-7 space-y-3">
              {corridors.map((c) => {
                const isSelected = c.id === selectedCorridorId;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCorridorId(c.id)}
                    className={`p-4 rounded-2xl border transition duration-200 cursor-pointer ${
                      isSelected
                        ? "bg-purple-950/40 border-purple-500/50 shadow-xl"
                        : "bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/[0.08]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-purple-400" />
                          <h4 className="text-sm font-bold text-white">{c.name}</h4>
                          {c.qamchiqPassInvolved && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                              ⛰️ Dovon (2,268m)
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-white/50 font-mono">
                          {c.distanceKm} km • ~{c.avgDurationHours} soat tranzit • {c.activeTrucks} ta faol yuk mashinasi
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-mono font-black text-white">
                          {c.currentRateSom.toLocaleString()} <span className="text-[10px] text-white/50">UZS/km</span>
                        </div>
                        <div className="flex items-center justify-end gap-1 text-[10px] font-mono">
                          {c.rateTrend === "up" ? (
                            <span className="text-emerald-400 flex items-center">
                              <TrendingUp className="w-3 h-3 mr-0.5" /> +{c.rateTrendPercent}%
                            </span>
                          ) : c.rateTrend === "down" ? (
                            <span className="text-indigo-400 flex items-center">
                              <TrendingDown className="w-3 h-3 mr-0.5" /> -{c.rateTrendPercent}%
                            </span>
                          ) : (
                            <span className="text-white/40">Stabil</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Detailed Corridor Telemetry & Instant Action (5 Cols) */}
            <div className="lg:col-span-5 bg-gradient-to-b from-[#100726] to-[#0a0418] border border-purple-500/30 rounded-3xl p-6 space-y-6 shadow-2xl">
              <div className="space-y-1 border-b border-white/10 pb-4">
                <span className="text-[10px] text-purple-400 font-mono uppercase tracking-widest">
                  Tanlangan Koridor Ko'rsatkichlari
                </span>
                <h3 className="text-lg font-black text-white">{selectedCorridor.name}</h3>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-1">
                  <span className="text-[10px] text-white/40 uppercase block">O'rtacha Fura Narxi</span>
                  <p className="text-base font-black text-white font-mono">
                    {(selectedCorridor.distanceKm * selectedCorridor.currentRateSom).toLocaleString()} UZS
                  </p>
                  <span className="text-[9px] text-emerald-400">18-22 tonna fura uchun</span>
                </div>

                <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-1">
                  <span className="text-[10px] text-white/40 uppercase block">Bo'sh Fura Sig'imi</span>
                  <p className="text-base font-black text-purple-300 font-mono">
                    {selectedCorridor.activeTrucks} ta yuk mashinasi
                  </p>
                  <span className="text-[9px] text-white/40">Radar radiusida</span>
                </div>

                <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-1">
                  <span className="text-[10px] text-white/40 uppercase block">Trassa Sifati</span>
                  <p className="text-base font-black text-emerald-400 font-mono">
                    Klass {selectedCorridor.roadQuality} (Yuqori)
                  </p>
                  <span className="text-[9px] text-white/40">M-39 / A-373</span>
                </div>

                <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-1">
                  <span className="text-[10px] text-white/40 uppercase block">O'rtacha Tezlik</span>
                  <p className="text-base font-black text-white font-mono">
                    {Math.round(selectedCorridor.distanceKm / selectedCorridor.avgDurationHours)} km/soat
                  </p>
                  <span className="text-[9px] text-white/40">GPS Telemetriya</span>
                </div>
              </div>

              {/* Instant Action CTA */}
              <div className="pt-2">
                <a
                  href="#ai-dispatcher"
                  className="w-full bg-white hover:bg-purple-600 text-black hover:text-white font-extrabold text-xs uppercase tracking-widest py-3.5 px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xl"
                >
                  <Zap className="w-4 h-4" />
                  <span>Ushbu Yo'nalishda AI Yuk Bron Qilish</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: QAMCHIQ PASS MOUNTAIN RADAR */}
        {activeTab === "pass_radar" && (
          <div className="bg-gradient-to-r from-amber-950/30 via-[#140b24] to-[#0a0518] border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono uppercase font-bold">
                    A373 Xalqaro Trassasi
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                    ● DOVON OCHIQ
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Qamchiq Tog' Dovoni Jonli Holati (Balandlik: 2,268m)
                </h3>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-white/40 font-mono uppercase block">Oxirgi Yangilanish</span>
                <span className="text-xs font-mono font-bold text-amber-400">{liveTimestamp}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-black/50 border border-white/10 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-white/50 text-xs">
                  <span>Havo Harorati</span>
                  <Thermometer className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-2xl font-black text-white font-mono">+12°C</p>
                <p className="text-[10px] text-white/50">Tunda: +4°C gacha tushishi kutilmoqda</p>
              </div>

              <div className="p-4 bg-black/50 border border-white/10 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-white/50 text-xs">
                  <span>Shamol & Yog'ingarchilik</span>
                  <Wind className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-2xl font-black text-white font-mono">4.2 m/s</p>
                <p className="text-[10px] text-emerald-400">Yog'ingarchilik yo'q, yo'l quruq</p>
              </div>

              <div className="p-4 bg-black/50 border border-white/10 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-white/50 text-xs">
                  <span>Vazn Nazorat Kutish Vaqti</span>
                  <Clock className="w-4 h-4 text-indigo-400" />
                </div>
                <p className="text-2xl font-black text-white font-mono">6 daqiqa</p>
                <p className="text-[10px] text-white/50">KamAZ & Furalar oqimi normal</p>
              </div>

              <div className="p-4 bg-black/50 border border-white/10 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-white/50 text-xs">
                  <span>Muzlama & Zanjir Talabi</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-2xl font-black text-emerald-400 font-mono">Kerak Emas</p>
                <p className="text-[10px] text-white/50">Yo'l xizmatlari navbatchilikda</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FUEL INDEX */}
        {activeTab === "fuel_index" && (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">Respublika Yonilg'i va Metan Gaz Barometri</h3>
                <p className="text-xs text-white/50">Yuk tashish tannarxini hisoblash uchun rasmiy monitoring</p>
              </div>
              <span className="text-xs font-mono text-purple-400">1 litr / 1 m³ UZS</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {fuelStations.map((f, i) => (
                <div key={i} className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-white">{f.name}</h4>
                    <span className="text-[10px] font-mono text-emerald-400">{f.trend}</span>
                  </div>
                  <p className="text-xl font-black text-purple-300 font-mono">
                    {f.price.toLocaleString()} <span className="text-xs text-white/50">so'm</span>
                  </p>
                  <p className="text-[10px] text-white/40">{f.location}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CAPACITY HEATMAP */}
        {activeTab === "capacity_heatmap" && (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="space-y-1 border-b border-white/10 pb-4">
              <h3 className="text-xl font-bold text-white">Viloyatlar Bo'yicha Bo'sh Fura va Yuk Mashinalari Zaxirasi</h3>
              <p className="text-xs text-white/50">YukLa platformasida faol tasdiqlangan transport vositalari soni</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
              {[
                { region: "Toshkent", trucks: 412, capacity: "8,200 tonna", color: "text-emerald-400" },
                { region: "Samarqand", trucks: 245, capacity: "4,900 tonna", color: "text-purple-400" },
                { region: "Farg'ona vodiysi", trucks: 318, capacity: "6,300 tonna", color: "text-emerald-400" },
                { region: "Buxoro", trucks: 164, capacity: "3,200 tonna", color: "text-purple-400" },
                { region: "Navoiy & Qarshi", trucks: 142, capacity: "2,800 tonna", color: "text-indigo-400" },
                { region: "Xorazm & Nukus", trucks: 96, capacity: "1,900 tonna", color: "text-amber-400" }
              ].map((r, i) => (
                <div key={i} className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-1">
                  <span className="text-xs font-bold text-white block truncate">{r.region}</span>
                  <p className={`text-xl font-black font-mono ${r.color}`}>{r.trucks}</p>
                  <span className="text-[10px] text-white/40 block">mashina</span>
                  <span className="text-[9px] font-mono text-purple-300 block pt-1 border-t border-white/5">{r.capacity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
