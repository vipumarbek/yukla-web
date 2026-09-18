/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User, ColdChainNode, ColdChainTelemetryPoint } from "../types";
import { useTranslation } from "../context/LanguageContext";
import {
  ThermometerSnowflake,
  ShieldCheck,
  AlertTriangle,
  Radio,
  CheckCircle2,
  RefreshCw,
  Clock,
  Battery,
  MapPin,
  Truck,
  Activity,
  DoorClosed,
  DoorOpen,
  Sliders,
  Send,
  Download,
  Flame,
  Zap,
  Info
} from "lucide-react";

interface EnterpriseColdChainHubProps {
  user: User;
  token: string | null;
}

export default function EnterpriseColdChainHub({ user, token }: EnterpriseColdChainHubProps) {
  const { t } = useTranslation();
  const [nodes, setNodes] = useState<ColdChainNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<ColdChainNode | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // IoT Simulation form
  const [simTemp, setSimTemp] = useState("4.2");
  const [simHumidity, setSimHumidity] = useState("85");
  const [simDoor, setSimDoor] = useState<"closed" | "open">("closed");

  const fetchNodes = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cold-chain/nodes", {
        credentials: "omit",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNodes(data || []);
        if (data.length > 0 && !selectedNode) {
          setSelectedNode(data[0]);
        }
      }
    } catch (err: any) {
      setError(err.message || "Sovuq zanjir ma'lumotlarini olishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const fetchTelemetryHistory = async (truckId: string) => {
    if (!token || !truckId) return;
    try {
      const res = await fetch(`/api/cold-chain/telemetry/${truckId}`, {
        credentials: "omit",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (err: any) {
      console.error("Telemetry fetch error:", err);
    }
  };

  useEffect(() => {
    fetchNodes();
  }, [token]);

  useEffect(() => {
    if (selectedNode) {
      fetchTelemetryHistory(selectedNode.truckId || selectedNode.id);
      setSimTemp(selectedNode.currentTempC.toString());
      setSimHumidity(selectedNode.currentHumidityPct.toString());
      setSimDoor(selectedNode.doorStatus);
    }
  }, [selectedNode]);

  const handleSimulateIoTUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedNode) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cold-chain/telemetry", {
        method: "POST",
        credentials: "omit",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          truckId: selectedNode.truckId || selectedNode.id,
          tempC: Number(simTemp),
          humidityPct: Number(simHumidity),
          doorStatus: simDoor,
          batteryPct: 95
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Telemetriyani yuborishda xatolik");
      setSuccessMsg(`IoT Telemetriya qabul qilindi: ${simTemp}°C | Holat: ${data.node?.status === "excursion_breach" ? "DIQQAT: Harorat buzilishi!" : "Normal"}`);
      fetchNodes();
      fetchTelemetryHistory(selectedNode.truckId || selectedNode.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-slate-900/60 border border-cyan-500/20 rounded-2xl p-6 lg:p-8 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <ThermometerSnowflake className="w-3.5 h-3.5" />
                <span>IoT BLE 5.0 Sensor Telematics Stream</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Pharma & Fresh Export Certified
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
              Cold Chain Monitoring & Telematics Architecture
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl mt-1">
              Refrijeratorlar harorati (-25°C dan +15°C gacha), nisbiy namlik, eshik datchiklari va Qamchiq dovonidan tranzitdagi harorat o'zgarishlarini real vaqtda nazorat qilish.
            </p>
          </div>

          <button
            onClick={fetchNodes}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold flex items-center gap-2 transition cursor-pointer self-start lg:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Telemetriyani Yangilash</span>
          </button>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="mt-4 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mt-4 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* Main Grid: Active Units & Selected Unit Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Nodes List */}
        <div className="space-y-3 lg:col-span-1">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider px-1">
            Faol Sovutgichli Reyslar ({nodes.length})
          </h3>

          {nodes.map((node) => {
            const isSelected = selectedNode?.id === node.id;
            const isBreach = node.status === "excursion_breach" || node.currentTempC > node.setpointMaxC || node.currentTempC < node.setpointMinC;

            return (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className={`p-4 rounded-xl border transition cursor-pointer ${
                  isSelected
                    ? "bg-cyan-950/30 border-cyan-500/50 shadow-lg shadow-cyan-950/50"
                    : "bg-slate-900/60 border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white font-mono">{node.truckPlate}</h4>
                    <span className="text-xs text-slate-400">{node.driverName}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isBreach
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse"
                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  }`}>
                    {isBreach ? "Harorat Chetidagi!" : "Normada"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/5 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Joriy Harorat:</span>
                    <span className={`text-base font-black ${isBreach ? "text-rose-400" : "text-cyan-300"}`}>
                      {node.currentTempC > 0 ? `+${node.currentTempC}` : node.currentTempC}°C
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Ruxsat Oralig'i:</span>
                    <span className="text-xs font-semibold text-slate-300">
                      {node.setpointMinC}°C dan {node.setpointMaxC}°C gacha
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 mt-2 line-clamp-1">
                  📦 {node.cargoName}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  📍 {node.route}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right column: Interactive Detail View & Time-Series Graph */}
        <div className="lg:col-span-2 space-y-6">
          {selectedNode ? (
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white font-mono">{selectedNode.truckPlate}</h3>
                    <span className="text-xs text-slate-400">({selectedNode.sensorModel})</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Haydovchi: <strong>{selectedNode.driverName}</strong> • Yuk: {selectedNode.cargoName}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg">
                    <Battery className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{selectedNode.batteryPct}%</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg">
                    {selectedNode.doorStatus === "open" ? (
                      <DoorOpen className="w-3.5 h-3.5 text-rose-400" />
                    ) : (
                      <DoorClosed className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span>Eshik: {selectedNode.doorStatus === "open" ? "Ochiq" : "Yopiq"}</span>
                  </div>
                </div>
              </div>

              {/* 12-Hour Temperature Timeseries Chart */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span>12 Soatlik Harorat Grafigi & Setpoint Chegarasi</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Setpoint: {selectedNode.setpointMinC}°C ... {selectedNode.setpointMaxC}°C
                  </span>
                </div>

                <div className="bg-slate-950/80 border border-white/10 rounded-xl p-4">
                  {/* Bars visualization */}
                  <div className="h-44 flex items-end justify-between gap-1.5 pt-6 pb-2 px-2 border-b border-white/10">
                    {history.map((point, idx) => {
                      const temp = point.tempC;
                      const isHigh = temp > selectedNode.setpointMaxC;
                      const isLow = temp < selectedNode.setpointMinC;
                      const isBreach = isHigh || isLow;

                      // Normalize height between -25 and +25 range
                      const heightPct = Math.max(15, Math.min(95, ((temp + 25) / 50) * 100));

                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative">
                          {/* Tooltip */}
                          <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 bg-slate-800 text-white text-[10px] rounded p-1.5 whitespace-nowrap pointer-events-none transition z-20 border border-white/10">
                            <div>{new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            <div className="font-bold">{temp}°C ({point.humidityPct}% namlik)</div>
                            <div>Eshik: {point.doorOpen ? "Ochiq" : "Yopiq"}</div>
                          </div>

                          <span className={`text-[9px] font-mono font-semibold ${isBreach ? "text-rose-400 font-bold" : "text-cyan-300"}`}>
                            {temp}°
                          </span>
                          <div
                            style={{ height: `${heightPct}%` }}
                            className={`w-full rounded-t transition-all ${
                              isBreach
                                ? "bg-rose-500 shadow-lg shadow-rose-500/50 animate-pulse"
                                : "bg-gradient-to-t from-cyan-600 to-cyan-400"
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-2 px-1">
                    <span>12 soat oldin</span>
                    <span>6 soat oldin</span>
                    <span>Hozirgi vaqt</span>
                  </div>
                </div>
              </div>

              {/* IoT Ingestion Simulator Form */}
              <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Datchik Telemetriyasini Test Qilish (IoT Ingestion Simulator)</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Teltonika / Sensitech BLE datchigidan kelayotgan jonli signallarni simulyatsiya qilib harorat chegaralarini tekshirib ko'ring:
                </p>

                <form onSubmit={handleSimulateIoTUpdate} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Harorat (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={simTemp}
                      onChange={(e) => setSimTemp(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Namlik (%)</label>
                    <input
                      type="number"
                      value={simHumidity}
                      onChange={(e) => setSimHumidity(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Eshik Holati</label>
                    <select
                      value={simDoor}
                      onChange={(e: any) => setSimDoor(e.target.value)}
                      className="w-full bg-slate-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-500"
                    >
                      <option value="closed">Yopiq (Closed)</option>
                      <option value="open">Ochiq (Open)</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="py-1.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{actionLoading ? "Yuborilmoqda..." : "Ping Yuborish"}</span>
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 border border-white/10 rounded-2xl">
              Ko'rish uchun chapdagi reyslardan birini tanlang.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
