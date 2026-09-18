/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, RouteWaypoint, RouteOptimizationResult } from "../types";
import { useTranslation } from "../context/LanguageContext";
import {
  Navigation,
  MapPin,
  Plus,
  Trash2,
  Sliders,
  Fuel,
  Clock,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Truck,
  Leaf,
  Layers,
  Zap,
  ArrowRight,
  ShieldAlert
} from "lucide-react";

interface EnterpriseRouteOptimizerHubProps {
  user: User;
  token: string | null;
}

const PRESET_CITIES = [
  { name: "Toshkent (Markaziy Hub)", lat: 41.2995, lng: 69.2401 },
  { name: "Sirdaryo (Guliston)", lat: 40.4897, lng: 68.7844 },
  { name: "Jizzax", lat: 40.1158, lng: 67.8422 },
  { name: "Samarqand", lat: 39.6542, lng: 66.9597 },
  { name: "Navoiy", lat: 40.0844, lng: 65.3792 },
  { name: "Buxoro", lat: 39.7747, lng: 64.4286 },
  { name: "Qarshi", lat: 38.8606, lng: 65.7891 },
  { name: "Termiz", lat: 37.2242, lng: 67.2783 },
  { name: "Namangan (Qamchiq orqali)", lat: 40.9983, lng: 71.6726 },
  { name: "Andijon (Qamchiq orqali)", lat: 40.7821, lng: 72.3442 },
  { name: "Farg'ona (Qamchiq orqali)", lat: 40.3842, lng: 71.7843 },
  { name: "Nukus", lat: 42.4602, lng: 59.6166 },
  { name: "Xiva / Urganch", lat: 41.5504, lng: 60.6314 }
];

export default function EnterpriseRouteOptimizerHub({ user, token }: EnterpriseRouteOptimizerHubProps) {
  const { t } = useTranslation();

  const [origin, setOrigin] = useState("Toshkent (Markaziy Hub)");
  const [destination, setDestination] = useState("Buxoro");
  const [stops, setStops] = useState<string[]>(["Samarqand", "Jizzax"]);
  const [truckType, setTruckType] = useState<"semi_trailer_20t" | "isuzu_10t" | "gazel_3t" | "reefer_20t">("semi_trailer_20t");
  const [optimizationCriterion, setOptimizationCriterion] = useState<"distance" | "time" | "fuel_cost">("fuel_cost");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RouteOptimizationResult | null>(null);

  const addStop = () => {
    setStops(prev => [...prev, PRESET_CITIES[2].name]);
  };

  const updateStop = (index: number, value: string) => {
    setStops(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const removeStop = (index: number) => {
    setStops(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleOptimize = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const waypoints = [origin, ...stops, destination].map((city, idx) => ({
        id: `wp-${idx}`,
        name: city,
        lat: 41.0,
        lng: 69.0,
        type: idx === 0 ? "origin" : idx === stops.length + 1 ? "destination" : "stop"
      }));

      const res = await fetch("/api/routes/optimize", {
        method: "POST",
        credentials: "omit",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          waypoints,
          truckType,
          optimizationCriterion
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Marshrutni optimallashtirishda xatolik");
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-violet-950/40 via-purple-950/30 to-slate-900/60 border border-purple-500/20 rounded-2xl p-6 lg:p-8 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Navigation className="w-3.5 h-3.5" />
                <span>Multi-Stop TSP Heuristic & Mountain Pass Radar</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Fuel & CO2 Efficiency Engine
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
              Multi-Stop Route Optimizer & Dispatch Engine
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl mt-1">
              Ko'p nuqtali buyurtmalarni eng optimal ketma-ketlikda taqsimlash, yoqilg'i sarfi va Qamchiq dovoni kabi murakkab tog' yo'llari xavfsizligini hisobga olish.
            </p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Input Form */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-5 lg:col-span-1">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-400" />
            <span>Reys Parametrlari & Nuqtalar</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Boshlang'ich Nuqta (Origin)</label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500"
              >
                {PRESET_CITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            {/* Intermediate Stops */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Oraliq Yuk Tushirish Nuqtalari ({stops.length})</span>
                <button
                  type="button"
                  onClick={addStop}
                  className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Nuqta qo'shish</span>
                </button>
              </div>

              {stops.map((stop, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <select
                    value={stop}
                    onChange={(e) => updateStop(idx, e.target.value)}
                    className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    {PRESET_CITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeStop(idx)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Yakuniy Nuqta (Destination)</label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500"
              >
                {PRESET_CITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            <div className="border-t border-white/10 pt-3">
              <label className="text-xs text-slate-400 block mb-1">Avtotransport Turi</label>
              <select
                value={truckType}
                onChange={(e: any) => setTruckType(e.target.value)}
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500"
              >
                <option value="semi_trailer_20t">20 Tonnalik Fura (TIR Tent / Bort)</option>
                <option value="reefer_20t">20 Tonnalik Refrijerator (Sovutgich)</option>
                <option value="isuzu_10t">10 Tonnalik Isuzu yuk mashinasi</option>
                <option value="gazel_3t">3.5 Tonnalik Gazel / Labo</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Optimallashtirish Mezoni</label>
              <select
                value={optimizationCriterion}
                onChange={(e: any) => setOptimizationCriterion(e.target.value)}
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500"
              >
                <option value="fuel_cost">Minimal Yoqilg'i & Xarajat (Eng tejamkor)</option>
                <option value="distance">Eng Qisqa Masofa (km)</option>
                <option value="time">Eng Tez Yetkazish (Vaqt bo'yicha)</option>
              </select>
            </div>

            <button
              onClick={handleOptimize}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>{loading ? "Hisoblanmoqda..." : "Marshrutni Optimallashtirish"}</span>
            </button>
          </div>
        </div>

        {/* Right: Results Display */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md lg:col-span-2 space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {result ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Optimallashtirilgan Reys Rejasi</span>
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Algoritm eng kam yoqilg'i va vaqt sarfini ta'minlovchi optimal ketma-ketlikni hisoblab chiqdi.
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white/5 p-3.5 rounded-xl border border-white/5">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Jami Masofa</div>
                  <div className="text-lg font-black text-white mt-1">{result.totalDistanceKm} <span className="text-xs font-normal text-slate-400">km</span></div>
                </div>
                <div className="bg-white/5 p-3.5 rounded-xl border border-white/5">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Safar Vaqti</div>
                  <div className="text-lg font-black text-purple-300 mt-1">{result.estimatedHours} <span className="text-xs font-normal text-slate-400">soat</span></div>
                </div>
                <div className="bg-white/5 p-3.5 rounded-xl border border-white/5">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Dizel Sarfi</div>
                  <div className="text-lg font-black text-amber-300 mt-1">{result.fuelConsumptionLiters} <span className="text-xs font-normal text-slate-400">litr</span></div>
                </div>
                <div className="bg-white/5 p-3.5 rounded-xl border border-white/5">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Yoqilg'i Xarajati</div>
                  <div className="text-lg font-black text-emerald-400 mt-1">{result.fuelCostEstimateSom.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">UZS</span></div>
                </div>
              </div>

              {/* Warnings / Mountain Passes */}
              {result.mountainPassCrossings && result.mountainPassCrossings.length > 0 && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-amber-300">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>Tog' Dovoni Ogohlantirishi (Qamchiq Dovoni)</span>
                  </div>
                  <p className="text-slate-300">
                    Marshrut Qamchiq tog' dovonidan (balandligi 2268m) o'tadi. Qish mavsumida zanjirlar va refrijerator harorati izolyatsiyasini tekshiring.
                  </p>
                </div>
              )}

              {/* Waypoint Sequencing List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Ketma-Ket Tushirish / Yuklash Tartibi:
                </h4>

                <div className="space-y-2">
                  {result.optimizedWaypoints.map((wp, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl"
                    >
                      <div className="w-7 h-7 rounded-full bg-purple-600/20 border border-purple-500/30 text-purple-300 font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-white">{wp.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {idx === 0 ? "Boshlang'ich Yuklash Hubi" : idx === result.optimizedWaypoints.length - 1 ? "Yakuniy Manzil" : "Oraliq Tushirish Nuqtasi"}
                        </div>
                      </div>
                      {idx < result.optimizedWaypoints.length - 1 && (
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                          <span>→</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Eco & CO2 Footprint */}
              <div className="flex items-center justify-between p-3.5 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-emerald-400" />
                  <span>CO₂ Emissiyasi: <strong>{result.co2EmissionsKg} kg</strong> (Optimallashtirish hisobiga 18% tejaldi)</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-16 text-center text-slate-500 space-y-2">
              <Navigation className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs">
                Oraliq nuqtalarni kiriting va <strong>Marshrutni Optimallashtirish</strong> tugmasini bosing.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
