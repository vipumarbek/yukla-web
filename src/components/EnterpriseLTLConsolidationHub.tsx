/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User, LogisticsHub, LtlShipment, ConsolidationManifest } from "../types";
import { useTranslation } from "../context/LanguageContext";
import {
  Boxes,
  Building,
  Truck,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Package,
  Layers,
  ArrowRight,
  TrendingUp,
  Clock,
  MapPin,
  Scale,
  Maximize2,
  Calendar,
  Send
} from "lucide-react";

interface EnterpriseLTLConsolidationHubProps {
  user: User;
  token: string | null;
}

export default function EnterpriseLTLConsolidationHub({ user, token }: EnterpriseLTLConsolidationHubProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"manifests" | "shipments" | "hubs">("manifests");

  // State
  const [hubs, setHubs] = useState<LogisticsHub[]>([]);
  const [shipments, setShipments] = useState<LtlShipment[]>([]);
  const [manifests, setManifests] = useState<ConsolidationManifest[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modals & form
  const [showCreateShipmentModal, setShowCreateShipmentModal] = useState(false);
  const [showConsolidateModal, setShowConsolidateModal] = useState(false);
  const [selectedShipmentIds, setSelectedShipmentIds] = useState<string[]>([]);

  // New LTL Shipment Form
  const [shipperName, setShipperName] = useState("");
  const [shipperPhone, setShipperPhone] = useState("+998 90 123 45 67");
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("+998 93 987 65 43");
  const [originHubId, setOriginHubId] = useState("hub-tashkent-central");
  const [destinationHubId, setDestinationHubId] = useState("hub-samarkand");
  const [cargoDesc, setCargoDesc] = useState("Kiyimlar va to'qimachilik mahsulotlari (Paletlarda)");
  const [palletsCount, setPalletsCount] = useState("4");
  const [weightKg, setWeightKg] = useState("1600");
  const [volumeM3, setVolumeM3] = useState("7.2");

  // Manifest Build Form
  const [manifestOriginHub, setManifestOriginHub] = useState("hub-tashkent-central");
  const [manifestDestHub, setManifestDestHub] = useState("hub-samarkand");
  const [manifestTruckPlate, setManifestTruckPlate] = useState("01 888 SAA");
  const [manifestDriverName, setManifestDriverName] = useState("Alisher Usmonov");
  const [manifestDriverPhone, setManifestDriverPhone] = useState("+998 93 456 78 90");

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [hubsRes, shipRes, manRes] = await Promise.all([
        fetch("/api/ltl/hubs"),
        fetch("/api/ltl/shipments", { credentials: "omit", headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/ltl/manifests", { credentials: "omit", headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (hubsRes.ok) {
        const hData = await hubsRes.json();
        setHubs(hData || []);
      }
      if (shipRes.ok) {
        const sData = await shipRes.json();
        setShipments(sData || []);
      }
      if (manRes.ok) {
        const mData = await manRes.json();
        setManifests(mData || []);
      }
    } catch (err: any) {
      setError(err.message || "LTL ma'lumotlarini yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ltl/shipments", {
        method: "POST",
        credentials: "omit",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          shipperName,
          shipperPhone,
          receiverName,
          receiverPhone,
          originHubId,
          destinationHubId,
          cargoDescription: cargoDesc,
          palletsCount: Number(palletsCount),
          weightKg: Number(weightKg),
          volumeM3: Number(volumeM3)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "LTL yuk ro'yxatga olinmadi");
      setSuccessMsg(`LTL yuk (${data.trackingCode}) omborga qabul qilindi.`);
      setShowCreateShipmentModal(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBuildConsolidation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (selectedShipmentIds.length === 0) {
      setError("Konsolidatsiya uchun kamida bitta yukni belgilang.");
      return;
    }
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ltl/consolidate", {
        method: "POST",
        credentials: "omit",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          originHubId: manifestOriginHub,
          destinationHubId: manifestDestHub,
          shipmentIds: selectedShipmentIds,
          truckPlate: manifestTruckPlate,
          driverName: manifestDriverName,
          driverPhone: manifestDriverPhone
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Konsolidatsiya manifesti yaratilmadi");
      setSuccessMsg(`Konsolidatsiya manifesti ${data.manifestNumber} yaratildi (${data.shipmentsCount} ta yuk, ${data.loadedTons}t).`);
      setShowConsolidateModal(false);
      setSelectedShipmentIds([]);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const toggleShipmentSelection = (id: string) => {
    setSelectedShipmentIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900/60 border border-emerald-500/20 rounded-2xl p-6 lg:p-8 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Boxes className="w-3.5 h-3.5" />
                <span>LTL Cargo Hub & Cross-Dock Consolidation</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-300 border border-teal-500/20">
                Linehaul Efficiency Engine
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
              LTL Cargo Consolidation & Hub Management
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl mt-1">
              Kichik hajmdagi (1-6 paletli) LTL yuklarni mintaqaviy kross-dok omborlarida to'plash, 20 tonnalik magistral furaga 85%+ sig'imda birlashtirish va reys xarajatlarini 40% tejash.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Yangilash</span>
            </button>
            <button
              onClick={() => setShowCreateShipmentModal(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-emerald-600/25 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi LTL Yuk</span>
            </button>
            <button
              onClick={() => setShowConsolidateModal(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-purple-600/25 cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Linehaul Birlashtirish</span>
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 mt-6 border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab("manifests")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === "manifests"
                ? "bg-emerald-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Magistral Manifestlar ({manifests.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("shipments")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === "shipments"
                ? "bg-emerald-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Kutilayotgan LTL Yuklar ({shipments.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("hubs")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === "hubs"
                ? "bg-emerald-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Mintaqaviy Hublar ({hubs.length})</span>
          </button>
        </div>
      </div>

      {/* Feedback Alerts */}
      {error && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* TAB 1: Linehaul Manifests */}
      {activeTab === "manifests" && (
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-400" />
                <span>Linehaul Konsolidatsiya Manifestlari</span>
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Barcha LTL buyurtmalari jamlangan 20t yuk avtomobillari marshrutlari.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {manifests.map((mnf) => (
              <div
                key={mnf.id}
                className="bg-white/[0.02] border border-white/10 rounded-xl p-5 hover:border-emerald-500/30 transition space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      {mnf.manifestNumber}
                    </span>
                    <h4 className="text-base font-bold text-white mt-1">{mnf.routeName}</h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Yuklanmoqda (Building)
                  </span>
                </div>

                {/* Capacity Gauges */}
                <div className="space-y-2 bg-white/5 p-3 rounded-xl text-xs">
                  <div>
                    <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                      <span>Og'irlik Sig'imi: {mnf.loadedTons}t / {mnf.maxTons}t</span>
                      <span className="font-bold text-emerald-400">{mnf.utilizationTonsPct}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        style={{ width: `${mnf.utilizationTonsPct}%` }}
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                      <span>Hajm Sig'imi: {mnf.loadedVolumeM3}m³ / {mnf.maxVolumeM3}m³</span>
                      <span className="font-bold text-teal-300">{mnf.utilizationVolumePct}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        style={{ width: `${mnf.utilizationVolumePct}%` }}
                        className="bg-gradient-to-r from-teal-500 to-cyan-400 h-2 rounded-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Avtomobil / Haydovchi:</span>
                    <span className="font-semibold text-white">{mnf.truckPlate}</span>
                    <div className="text-[11px] text-slate-400">{mnf.driverName}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Yuklar Soni:</span>
                    <span className="text-white font-bold">{mnf.shipmentsCount} ta LTL partiya</span>
                    <div className="text-[11px] text-emerald-400 font-medium">Marshrut rejalashtirildi</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Pending LTL Shipments Table */}
      {activeTab === "shipments" && (
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                <span>Kross-Dok Omborlaridagi LTL Yuklar</span>
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Konsolidatsiya uchun kerakli yuklarni belgilang va yagona Linehaul manifestini tuzing.
              </p>
            </div>

            {selectedShipmentIds.length > 0 && (
              <button
                onClick={() => setShowConsolidateModal(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition cursor-pointer"
              >
                <Layers className="w-4 h-4" />
                <span>{selectedShipmentIds.length} ta Yukni Birlashtirish</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4 w-8">Tanlash</th>
                  <th className="py-3 px-4">Treking Kod</th>
                  <th className="py-3 px-4">Jo'natuvchi & Qabul qiluvchi</th>
                  <th className="py-3 px-4">Yo'nalish Hublari</th>
                  <th className="py-3 px-4">Palet / Og'irlik</th>
                  <th className="py-3 px-4">Narxi</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                {shipments.map((s) => {
                  const isChecked = selectedShipmentIds.includes(s.id);
                  return (
                    <tr
                      key={s.id}
                      onClick={() => toggleShipmentSelection(s.id)}
                      className={`hover:bg-white/[0.02] transition cursor-pointer ${
                        isChecked ? "bg-purple-950/20" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded text-purple-600 focus:ring-0"
                        />
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                        {s.trackingCode}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{s.shipperName}</div>
                        <div className="text-[10px] text-slate-500">→ {s.receiverName}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-white">{s.originHubName}</div>
                        <div className="text-[10px] text-slate-500">→ {s.destinationHubName}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{s.palletsCount} palet ({s.weightKg} kg)</div>
                        <div className="text-[10px] text-slate-500">{s.volumeM3} m³ • {s.cargoDescription}</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">
                        {s.priceSom.toLocaleString()} UZS
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          s.status === "staged_for_linehaul"
                            ? "bg-purple-500/10 text-purple-300 border border-purple-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}>
                          {s.status === "staged_for_linehaul" ? "Linehaulga biriktirilgan" : "Omborda tayyor"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Logistics Hubs Network */}
      {activeTab === "hubs" && (
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-emerald-400" />
              <span>YukLa Mintaqaviy Kross-Dok Ombor Tarmoqlari</span>
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">
              O'zbekistonning asosiy logistika yo'laklarida joylashgan 4 ta zamonaviy hub.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hubs.map((hub) => (
              <div
                key={hub.id}
                className="bg-white/[0.02] border border-white/10 rounded-xl p-5 hover:border-emerald-500/30 transition space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      {hub.code}
                    </span>
                    <h4 className="text-base font-bold text-white mt-1">{hub.name}</h4>
                  </div>
                  <span className="text-xs text-slate-400 bg-white/5 px-2 py-1 rounded">
                    {hub.operatingHours}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/5 p-3 rounded-lg">
                    <span className="text-[10px] text-slate-500 block uppercase">Palet Joylari</span>
                    <span className="text-base font-bold text-white">
                      {hub.occupiedPallets.toLocaleString()} / {hub.palletPositions.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg">
                    <span className="text-[10px] text-slate-500 block uppercase">Kross-Dok Doklar</span>
                    <span className="text-base font-bold text-emerald-400">
                      {hub.availableDocks} ta bo'sh ({hub.crossDockDocks} ta jami)
                    </span>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-300">
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{hub.address}</span>
                  </div>
                  <div className="flex items-center gap-3 pt-2 text-[11px]">
                    <span className={hub.coldStorageAvailable ? "text-cyan-400" : "text-slate-600"}>
                      ❄️ Sovutgichli Ombor: {hub.coldStorageAvailable ? "Mavjud" : "Yo'q"}
                    </span>
                    <span className={hub.bondedCustomsZone ? "text-purple-400" : "text-slate-600"}>
                      🛡️ Bojxona Zonasi: {hub.bondedCustomsZone ? "Mavjud" : "Yo'q"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create LTL Shipment Modal */}
      {showCreateShipmentModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateShipment} className="bg-slate-900 border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-400" />
              <span>Yangi LTL Yukni Qabul Qilish</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Jo'natuvchi Nomi</label>
                <input
                  type="text"
                  value={shipperName}
                  onChange={(e) => setShipperName(e.target.value)}
                  placeholder="Artel Ehtiyot Qismlari"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Qabul Qiluvchi Nomi</label>
                <input
                  type="text"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  placeholder="Samarqand Servis Markazi"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Boshlang'ich Hub</label>
                <select
                  value={originHubId}
                  onChange={(e) => setOriginHubId(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  {hubs.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Maqsadli Hub</label>
                <select
                  value={destinationHubId}
                  onChange={(e) => setDestinationHubId(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  {hubs.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Yuk Tavsifi</label>
              <input
                type="text"
                value={cargoDesc}
                onChange={(e) => setCargoDesc(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Paletlar Soni</label>
                <input
                  type="number"
                  value={palletsCount}
                  onChange={(e) => setPalletsCount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Og'irligi (kg)</label>
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Hajmi (m³)</label>
                <input
                  type="number"
                  step="0.1"
                  value={volumeM3}
                  onChange={(e) => setVolumeM3(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateShipmentModal(false)}
                className="flex-1 py-2.5 bg-white/5 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
              >
                {actionLoading ? "Qabul qilinmoqda..." : "Yukni Ro'yxatga Olish"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Consolidate Linehaul Modal */}
      {showConsolidateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleBuildConsolidation} className="bg-slate-900 border border-purple-500/30 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" />
              <span>Linehaul Furaga Birlashtirish Manifesti</span>
            </h3>

            <div className="bg-purple-950/30 border border-purple-500/20 rounded-xl p-3 text-xs text-slate-300">
              Tanlangan LTL yuklar soni: <strong>{selectedShipmentIds.length} ta</strong>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Chiqish Hubi</label>
                <select
                  value={manifestOriginHub}
                  onChange={(e) => setManifestOriginHub(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500"
                >
                  {hubs.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Qabul Qiluvchi Hub</label>
                <select
                  value={manifestDestHub}
                  onChange={(e) => setManifestDestHub(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500"
                >
                  {hubs.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Fura Davlat Raqami</label>
                <input
                  type="text"
                  value={manifestTruckPlate}
                  onChange={(e) => setManifestTruckPlate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Haydovchi Ismi</label>
                <input
                  type="text"
                  value={manifestDriverName}
                  onChange={(e) => setManifestDriverName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConsolidateModal(false)}
                className="flex-1 py-2.5 bg-white/5 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-lg"
              >
                {actionLoading ? "Yuklanmoqda..." : "Manifestni Shakllantirish"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
