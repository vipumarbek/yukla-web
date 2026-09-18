/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { LanguageCode, SilkRoadCorridor, SpotRateIndexRecord, User } from "../types";
import {
  Globe2,
  TrendingUp,
  TrendingDown,
  Clock,
  ShieldCheck,
  Truck,
  Fuel,
  DollarSign,
  Compass,
  ArrowRight,
  FileCheck,
  Sparkles,
  MapPin
} from "lucide-react";

interface SilkRoadCorridorHubProps {
  currentLang: LanguageCode;
  token: string | null;
  user: User | null;
}

export default function SilkRoadCorridorHub({
  currentLang,
  token,
  user
}: SilkRoadCorridorHubProps) {
  const [corridors, setCorridors] = useState<SilkRoadCorridor[]>([]);
  const [spotData, setSpotData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Customs Calculator State
  const [selectedCorridor, setSelectedCorridor] = useState<string>("corr-02");
  const [cargoValueUsd, setCargoValueUsd] = useState<string>("25000");
  const [cargoWeightTons, setCargoWeightTons] = useState<string>("18");
  const [calculatedDuty, setCalculatedDuty] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [corrRes, spotRes] = await Promise.all([
          fetch("/api/silkroad/corridors"),
          fetch("/api/market/spot-index")
        ]);
        if (corrRes.ok) setCorridors(await corrRes.json());
        if (spotRes.ok) setSpotData(await spotRes.json());
      } catch (e) {
        console.error("Error loading Silk Road corridors:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCalculateCustoms = (e: React.FormEvent) => {
    e.preventDefault();
    const corr = corridors.find((c) => c.id === selectedCorridor);
    const value = Number(cargoValueUsd) || 20000;
    const weight = Number(cargoWeightTons) || 10;
    
    // Dynamic customs estimate algorithm
    const dutyPercent = corr?.destinationCountry === "O'zbekiston" ? 0.05 : 0.08;
    const baseDuty = value * dutyPercent;
    const tirCarnetFee = 120;
    const ecoFee = weight * 15;
    const totalCustomsUsd = Math.round(baseDuty + tirCarnetFee + ecoFee);

    setCalculatedDuty({
      corridorName: corr?.name || "Toshkent - Olmaota",
      estimatedDutyUsd: totalCustomsUsd,
      tirCarnetFee,
      ecoFee,
      borderClearanceTime: corr?.avgBorderWaitHours ? `${corr.avgBorderWaitHours} soat` : "Green Corridor (Tezkor)",
      complianceStatus: "TIR Carnet & Green Customs Compliant"
    });
  };

  return (
    <div className="space-y-6">
      {/* Silk Road Hub Banner */}
      <div className="bg-gradient-to-r from-blue-950/60 via-[#0a1428] to-[#040814] border border-blue-500/20 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-mono font-bold uppercase tracking-wider">
            <Globe2 className="w-3.5 h-3.5" />
            <span>Silk Road Multimodal Trade & Green Customs Corridor</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Xalqaro Ipak Yo'li Logistika Yo'laklari
          </h2>
          <p className="text-white/70 text-sm leading-relaxed">
            Markaziy Osiyo, Xitoy, Turkiya va Yevroosiyo tranzit yo'nalishlarida yagona raqamli tir-CMR, onlayn bojxona kalkulyatori va real vaqt rejimidagi spot stavkalar birjasi.
          </p>
        </div>

        {/* Live Spot Market Summary */}
        {spotData && (
          <div className="grid grid-cols-2 gap-3 relative z-10 w-full md:w-auto">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <span className="text-[11px] text-white/50 block font-medium">Bozor Aylanmasi</span>
              <span className="text-xl font-black text-blue-400 font-mono">
                ${spotData.silkRoadMarketVolumeMillionsUsd}M+
              </span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <span className="text-[11px] text-white/50 block font-medium">Dizel Indeksi</span>
              <span className="text-xl font-black text-amber-300 font-mono">
                {(spotData.nationalDieselIndexAverageSom || 12900).toLocaleString()} UZS
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Corridors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {corridors.map((corr) => (
          <div
            key={corr.id}
            className="bg-[#050b18]/90 border border-blue-500/20 hover:border-blue-500/50 rounded-3xl p-6 transition flex flex-col justify-between gap-5 relative group shadow-xl"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-blue-500/20 text-blue-300 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-blue-500/30">
                      {corr.originCountry} &rarr; {corr.destinationCountry}
                    </span>
                    {corr.greenCorridorCertified && (
                      <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Green Corridor
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition">
                    {corr.name}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-xs text-white/50 block">Spot Narx / km:</span>
                  <span className="text-sm font-black text-blue-400 font-mono">
                    {(corr.spotRatePerKmSom || 0).toLocaleString()} UZS
                  </span>
                </div>
              </div>

              {/* Corridor Metrics */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-white/80">
                  <span className="text-white/40">Masofa & Vaqt:</span>
                  <span className="font-semibold text-white">{corr.distanceKm} km (~{corr.avgTransitDays} kun)</span>
                </div>
                <div className="flex items-center justify-between text-white/80">
                  <span className="text-white/40">Bojxona kutish vaqti:</span>
                  <span className="font-semibold text-amber-300">{corr.avgBorderWaitHours ? `${corr.avgBorderWaitHours} soat` : "Cheklovsiz (Ichki)"}</span>
                </div>
                <div className="flex items-center justify-between text-white/80">
                  <span className="text-white/40">Faol Yuk Mashinalari:</span>
                  <span className="font-semibold text-emerald-400">{corr.activeTrucksCount} ta fura</span>
                </div>
                <div className="pt-2 border-t border-white/5 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-white/50">Ommabop yuklar:</span>
                  {corr.popularCargos.map((cargo, idx) => (
                    <span key={idx} className="bg-white/10 text-white/80 px-2 py-0.5 rounded-lg text-[10px]">
                      {cargo}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-white/50">
                TIR Carnet & CMR integratsiyasi yoqilgan
              </span>
              <button
                onClick={() => {
                  setSelectedCorridor(corr.id);
                  const el = document.getElementById("customs-calc");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-3.5 py-2 rounded-xl bg-blue-600/80 hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer"
              >
                <span>Bojxona & Xarajatni Hisoblash</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Customs & Duty Calculator */}
      <div id="customs-calc" className="bg-[#071020] border border-blue-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-400" />
              <span>Raqamli Bojxona & Tranzit Xarajatlari Kalkulyatori</span>
            </h3>
            <p className="text-xs text-white/60">
              Chegara o'tish to'lovlari, TIR Carnet va ekologik to'lovlarni bir zumda hisoblang.
            </p>
          </div>
        </div>

        <form onSubmit={handleCalculateCustoms} className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="text-white/70 block mb-1 font-semibold">Xalqaro Yo'lak</label>
            <select
              value={selectedCorridor}
              onChange={(e) => setSelectedCorridor(e.target.value)}
              className="w-full bg-[#121c33] border border-white/10 rounded-xl px-3 py-2.5 text-white outline-none"
            >
              {corridors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-white/70 block mb-1 font-semibold">Yuk Qiymati (USD)</label>
            <input
              type="number"
              min="1000"
              value={cargoValueUsd}
              onChange={(e) => setCargoValueUsd(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white outline-none"
            />
          </div>

          <div>
            <label className="text-white/70 block mb-1 font-semibold">Yuk Og'irligi (Tonna)</label>
            <input
              type="number"
              min="1"
              max="40"
              value={cargoWeightTons}
              onChange={(e) => setCargoWeightTons(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg transition cursor-pointer"
            >
              Hisoblash
            </button>
          </div>
        </form>

        {calculatedDuty && (
          <div className="bg-blue-950/40 border border-blue-500/30 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs animate-fade-in">
            <div className="space-y-1">
              <span className="text-white/50 block">Umumiy Bojxona & Tranzit:</span>
              <span className="text-xl font-black text-blue-400 font-mono">
                ${calculatedDuty.estimatedDutyUsd} USD
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-white/50 block">TIR Carnet & Eko Yig'im:</span>
              <span className="text-sm font-bold text-white">
                ${calculatedDuty.tirCarnetFee + calculatedDuty.ecoFee} USD
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-white/50 block">Bojxona Chegara Holati:</span>
              <span className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                {calculatedDuty.complianceStatus}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
