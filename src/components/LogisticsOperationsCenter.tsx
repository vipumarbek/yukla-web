import React, { useState, useEffect } from "react";
import {
  Activity,
  AlertTriangle,
  Radio,
  Truck,
  Package,
  Clock,
  CloudRain,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  Send,
  Navigation,
  Gauge
} from "lucide-react";
import { OperationalAlert, OperationsSummary } from "../types";

interface Props {
  token: string;
}

export const LogisticsOperationsCenter: React.FC<Props> = ({ token }) => {
  const [summary, setSummary] = useState<OperationsSummary>({
    liveOrdersCount: 4,
    activeDriversCount: 6,
    fleetUtilizationPct: 87.5,
    delayedOrdersCount: 1,
    slaBreachRiskCount: 1,
    activeAlertsCount: 3,
    averageTripSpeedKmh: 64.2,
    onTimeDeliveryRatePct: 98.4,
  });
  const [alerts, setAlerts] = useState<OperationalAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [newAlert, setNewAlert] = useState({
    type: "weather",
    title: "",
    description: "",
    severity: "medium",
    corridorOrLocation: "Qamchiq dovoni A373",
    affectedOrdersCount: 2,
  });
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const fetchOperationsData = async () => {
    setLoading(true);
    try {
      const sumRes = await fetch("/api/operations/dashboard-summary", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (sumRes.ok) {
        const data = await sumRes.json();
        setSummary(data);
      }

      const alertRes = await fetch("/api/operations/alerts");
      if (alertRes.ok) {
        const alertData = await alertRes.json();
        setAlerts(alertData);
      }
    } catch (err) {
      console.error("Failed to load operations data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperationsData();
    const interval = setInterval(fetchOperationsData, 15000);
    return () => clearInterval(interval);
  }, [token]);

  const handleDispatchAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlert.title || !newAlert.description) return;
    try {
      const res = await fetch("/api/operations/alerts/dispatch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newAlert)
      });
      if (res.ok) {
        const created = await res.json();
        setAlerts([created, ...alerts]);
        setBroadcastOpen(false);
        setNewAlert({
          type: "weather",
          title: "",
          description: "",
          severity: "medium",
          corridorOrLocation: "Qamchiq dovoni A373",
          affectedOrdersCount: 2,
        });
      }
    } catch (err) {
      console.error("Alert dispatch failed:", err);
    }
  };

  const handleResolveAlert = async (id: string) => {
    setResolvingId(id);
    try {
      const res = await fetch(`/api/operations/alerts/${id}/resolve`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ resolutionNote: "Holat dispetcher tomonidan to'liq bartaraf etildi." })
      });
      if (res.ok) {
        setAlerts(alerts.map(a => a.id === id ? { ...a, status: "resolved" } : a));
      }
    } catch (err) {
      console.error("Resolve alert failed:", err);
    } finally {
      setResolvingId(null);
    }
  };

  const filteredAlerts = alerts.filter(a => filterType === "all" || a.type === filterType || (filterType === "active" && a.status === "active"));

  return (
    <div className="space-y-6" id="operations-mission-control">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">Logistics Operations Center</h2>
              <span className="px-2 py-0.5 text-xs bg-emerald-500/20 text-emerald-300 rounded-full font-medium border border-emerald-500/30">
                LIVE 24/7 RADAR
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Markaziy Osiyo va O'zbekiston magistral yo'llaridagi barcha buyurtmalar, haydovchilar va ob-havo hodisalari telemetriyasi.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setBroadcastOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-xl text-sm transition-all shadow-md active:scale-95"
          >
            <AlertTriangle className="w-4 h-4" />
            Hodisa e'lon qilish
          </button>
          <button
            onClick={fetchOperationsData}
            disabled={loading}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all"
            title="Yangilash"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* KPI Status Radar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Jonli Buyurtmalar</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{summary.liveOrdersCount} ta</div>
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <Activity className="w-3.5 h-3.5" /> Rejimda harakatlanmoqda
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Faol Haydovchilar</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{summary.activeDriversCount} ta</div>
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-1">
              <Gauge className="w-3.5 h-3.5" /> Flot bandligi: {summary.fleetUtilizationPct}%
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">SLA / Kechikishlar</span>
            <div className="text-2xl font-black text-amber-600 mt-1">{summary.delayedOrdersCount} ta</div>
            <span className="text-xs text-amber-600 font-medium flex items-center gap-1 mt-1">
              <Clock className="w-3.5 h-3.5" /> 1 ta buyurtma kuzatuvda
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">O'z Vaqtida Yetkazish</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{summary.onTimeDeliveryRatePct}%</div>
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-1">
              O'rtacha tezlik: {summary.averageTripSpeedKmh} km/s
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Navigation className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Broadcast Modal */}
      {broadcastOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Tezkor Operatsion Ogohlantirish Chiqarish
              </h3>
              <button onClick={() => setBroadcastOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
            </div>
            <form onSubmit={handleDispatchAlert} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Hodisa Turi</label>
                <select
                  value={newAlert.type}
                  onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="weather">Ob-havo / Qor-Muzlama</option>
                  <option value="road_closure">Yo'l ta'mirlash / Yopilish</option>
                  <option value="border_delay">Bojxona Posti Tirbandligi</option>
                  <option value="sla_breach">SLA Yetkazish Xavfi</option>
                  <option value="vehicle_breakdown">Texnik Nosozlik / Avariya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Ogohlantirish Sarlavhasi</label>
                <input
                  type="text"
                  placeholder="Masalan: Qamchiq dovonida kuchli qor yog'moqda"
                  value={newAlert.title}
                  onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Batafsil Tavsif & Yo'riqnoma</label>
                <textarea
                  rows={3}
                  placeholder="Haydovchilar va yuk jo'natuvchilar uchun tavsiyalar..."
                  value={newAlert.description}
                  onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Hudud / Magistral</label>
                  <input
                    type="text"
                    value={newAlert.corridorOrLocation}
                    onChange={(e) => setNewAlert({ ...newAlert, corridorOrLocation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Xavf Darajasi</label>
                  <select
                    value={newAlert.severity}
                    onChange={(e) => setNewAlert({ ...newAlert, severity: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm outline-none"
                  >
                    <option value="critical">Kritik (Qizil)</option>
                    <option value="high">Yuqori (To'q sariq)</option>
                    <option value="medium">O'rta (Sariq)</option>
                    <option value="low">Past (Moviy)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBroadcastOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-medium"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm flex items-center gap-2"
                >
                  <Send className="w-4 h-4" /> E'lon qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Incidents and Road Conditions List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Faol Magistral & Bojxona Hodisalari</h3>
            <p className="text-xs text-slate-500 mt-0.5">Dispetcherlik va ob-havo telemetriyasi monitoringi</p>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {["all", "active", "weather", "border_delay", "sla_breach"].map(f => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  filterType === f
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f === "all" ? "Barchasi" : f === "active" ? "Faqat Faollar" : f === "weather" ? "Ob-havo" : f === "border_delay" ? "Bojxona" : "SLA Xavfi"}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredAlerts.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 mb-2" />
              <p className="font-medium text-slate-600">Hech qanday ogohlantirish yoki to'siq mavjud emas.</p>
              <p className="text-xs text-slate-400 mt-1">Barcha yo'llar va postlar shtat rejimida ishlamoqda.</p>
            </div>
          ) : (
            filteredAlerts.map(alert => (
              <div key={alert.id} className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    alert.severity === "critical"
                      ? "bg-rose-100 text-rose-600"
                      : alert.severity === "high"
                      ? "bg-amber-100 text-amber-600"
                      : "bg-blue-100 text-blue-600"
                  }`}>
                    {alert.type === "weather" ? (
                      <CloudRain className="w-5 h-5" />
                    ) : alert.type === "border_delay" ? (
                      <ShieldAlert className="w-5 h-5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{alert.title}</h4>
                      <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full uppercase tracking-wider ${
                        alert.status === "active"
                          ? "bg-rose-100 text-rose-700"
                          : alert.status === "investigating"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {alert.status === "active" ? "Faol" : alert.status === "investigating" ? "O'rganilmoqda" : "Bartaraf etildi"}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {new Date(alert.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 max-w-2xl">{alert.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span className="font-medium text-slate-700">📍 {alert.corridorOrLocation}</span>
                      <span>Ta'sirlangan: <strong className="text-slate-900">{alert.affectedOrdersCount} ta</strong> buyurtma</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  {alert.status !== "resolved" ? (
                    <button
                      onClick={() => handleResolveAlert(alert.id)}
                      disabled={resolvingId === alert.id}
                      className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Bartaraf etildi deb belgilash
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Yopilgan
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
export default LogisticsOperationsCenter;
