/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User, CustomsDocument, BorderCheckpoint } from "../types";
import { useTranslation } from "../context/LanguageContext";
import {
  FileCheck2,
  Globe2,
  Shield,
  QrCode,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Plus,
  RefreshCw,
  Search,
  ExternalLink,
  MapPin,
  Truck,
  Hash,
  FileText,
  Radio,
  Navigation2,
  Layers,
  ArrowRight
} from "lucide-react";

interface EnterpriseCustomsBorderHubProps {
  user: User;
  token: string | null;
}

export default function EnterpriseCustomsBorderHub({ user, token }: EnterpriseCustomsBorderHubProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"documents" | "border_radar" | "verify">("documents");

  // State
  const [documents, setDocuments] = useState<CustomsDocument[]>([]);
  const [checkpoints, setCheckpoints] = useState<BorderCheckpoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modals & form
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<CustomsDocument | null>(null);
  const [verifyHashInput, setVerifyHashInput] = useState("");
  const [verifyResult, setVerifyResult] = useState<any | null>(null);

  // Form states for e-CMR / TIR
  const [docType, setDocType] = useState<"e_cmr" | "digital_tir">("e_cmr");
  const [senderName, setSenderName] = useState("TEXNOPARK MCHJ Toshkent");
  const [senderCountry, setSenderCountry] = useState("O'zbekiston");
  const [receiverName, setReceiverName] = useState("KAZ LOGISTICS GROUP LLP");
  const [receiverCountry, setReceiverCountry] = useState("Qozog'iston");
  const [truckPlate, setTruckPlate] = useState("01 777 SAA");
  const [trailerPlate, setTrailerPlate] = useState("01 AA 777");
  const [originCity, setOriginCity] = useState("Toshkent");
  const [destinationCity, setDestinationCity] = useState("Olmaota");
  const [cargoDesc, setCargoDesc] = useState("Gaz hisoblagichlari va radiatorlar (Paletlarda)");
  const [hsCode, setHsCode] = useState("9028.10.000");
  const [grossWeightKg, setGrossWeightKg] = useState("14800");
  const [declaredValueUsd, setDeclaredValueUsd] = useState("68500");

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [docsRes, radarRes] = await Promise.all([
        fetch("/api/customs/documents", { credentials: "omit", headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/border/checkpoints")
      ]);

      if (docsRes.ok) {
        const docsData = await docsRes.json();
        setDocuments(docsData || []);
      }
      if (radarRes.ok) {
        const radarData = await radarRes.json();
        setCheckpoints(radarData.checkpoints || []);
      }
    } catch (err: any) {
      setError(err.message || "Bojxona ma'lumotlarini yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/customs/documents", {
        method: "POST",
        credentials: "omit",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          docType,
          senderName,
          senderCountry,
          receiverName,
          receiverCountry,
          truckPlate,
          trailerPlate,
          originCity,
          destinationCity,
          cargoDescription: cargoDesc,
          hsCode,
          grossWeightKg: Number(grossWeightKg),
          declaredValueUsd: Number(declaredValueUsd)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Hujjat yaratilmadi");
      setSuccessMsg(`Elektron ${docType === "digital_tir" ? "TIR Carnet" : "e-CMR"} (${data.docNumber}) yaratildi va kriptografik imzolandi.`);
      setShowCreateModal(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyByHash = async (hashToVerify: string) => {
    if (!hashToVerify) return;
    setActionLoading(true);
    setVerifyResult(null);
    try {
      const res = await fetch(`/api/customs/verify/${encodeURIComponent(hashToVerify.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Bojxona hujjati topilmadi");
      setVerifyResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900/60 border border-blue-500/20 rounded-2xl p-6 lg:p-8 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Globe2 className="w-3.5 h-3.5" />
                <span>UNECE e-CMR & UN/CEFACT Compliant</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                IRU Digital TIR Ready
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
              Digital Customs, e-CMR & Border Radar
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl mt-1">
              Xalqaro tranzit hujjatlarini (e-CMR va TIR) avtomatik kriptografik QR muhr bilan yaratish va Markaziy Osiyo chegaralaridagi tirbandlikni real vaqtda kuzatish tizimi.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Yangilash</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-blue-600/25 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi e-CMR / TIR</span>
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-2 mt-6 border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab("documents")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === "documents"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Tranzit Hujjatlar ({documents.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("border_radar")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === "border_radar"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Radio className="w-4 h-4 text-emerald-400" />
            <span>Chegara Radar & Tirbandlik ({checkpoints.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("verify")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === "verify"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>QR & Kripto Tekshirish</span>
          </button>
        </div>
      </div>

      {/* Feedback Alerts */}
      {error && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* TAB 1: Customs Documents List */}
      {activeTab === "documents" && (
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <span>Elektron Tranzit & Bojxona Hujjatlari</span>
            </h3>
            <div className="text-xs text-slate-400 font-mono">
              Barcha hujjatlar SHA-256 raqamli kalit bilan himoyalangan
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 rounded-xl p-5 transition space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider mb-1.5 ${
                      doc.docType === "digital_tir"
                        ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                        : "bg-blue-500/10 text-blue-300 border border-blue-500/20"
                    }`}>
                      {doc.docType === "digital_tir" ? "Digital TIR Carnet" : "Elektron e-CMR"}
                    </span>
                    <h4 className="text-base font-bold text-white font-mono">{doc.docNumber}</h4>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    doc.status === "border_stamped" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                    doc.status === "submitted" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                    "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                  }`}>
                    {doc.status === "border_stamped" ? "Bojxonadan O'tgan" : "Yuborilgan"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/5 p-2.5 rounded-lg">
                    <span className="text-[10px] text-slate-500 block">Jo'natuvchi:</span>
                    <span className="text-white font-semibold line-clamp-1">{doc.senderName}</span>
                    <span className="text-[10px] text-slate-400">{doc.senderCountry}</span>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded-lg">
                    <span className="text-[10px] text-slate-500 block">Qabul qiluvchi:</span>
                    <span className="text-white font-semibold line-clamp-1">{doc.receiverName}</span>
                    <span className="text-[10px] text-slate-400">{doc.receiverCountry}</span>
                  </div>
                </div>

                <div className="text-xs space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Marshrut:</span>
                    <span className="font-semibold text-white">{doc.originCity} → {doc.destinationCity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Avtotransport:</span>
                    <span className="font-mono text-purple-300">{doc.truckPlate} {doc.trailerPlate && `(${doc.trailerPlate})`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Yuk tavsifi:</span>
                    <span className="text-white line-clamp-1">{doc.cargoDescription}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Og'irligi / Qiymati:</span>
                    <span>{(doc.grossWeightKg / 1000).toFixed(1)}t • ${doc.declaredValueUsd.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bojxona plombalari:</span>
                    <span className="font-mono text-emerald-400">{doc.sealNumbers.join(", ")}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <div className="text-[10px] text-slate-500 font-mono line-clamp-1 max-w-[200px]">
                    {doc.digitalSignatureHash}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedDoc(doc);
                      handleVerifyByHash(doc.docNumber);
                      setActiveTab("verify");
                    }}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-blue-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>QR Tekshirish</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Central Asia Border Checkpoint Live Radar */}
      {activeTab === "border_radar" && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
                  <span>Markaziy Osiyo Bojxona & Chegara O'tkazish Radar</span>
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Yuk avtomobillari navbatlari, o'rtacha kutish vaqti va Green Channel tranzit ko'rsatkichlari.
                </p>
              </div>

              <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                Jonli Telemetriya Faol
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {checkpoints.map((cp) => (
                <div
                  key={cp.id}
                  className="bg-white/[0.02] border border-white/10 rounded-xl p-5 hover:border-blue-500/30 transition space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-bold text-white">{cp.name}</h4>
                      <span className="text-xs text-blue-400 font-medium">{cp.countryPair}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      cp.congestionLevel === "low" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                      cp.congestionLevel === "moderate" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                      "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    }`}>
                      {cp.congestionLevel === "low" ? "Erkin Harakat" : cp.congestionLevel === "moderate" ? "O'rtacha Tirbandlik" : "Yuqori Tirbandlik"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 p-3 rounded-lg text-center">
                      <span className="text-[10px] text-slate-500 block uppercase">Kutish Vaqti</span>
                      <span className="text-lg font-black text-white">{cp.avgWaitHours} <span className="text-xs font-normal text-slate-400">soat</span></span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg text-center">
                      <span className="text-[10px] text-slate-500 block uppercase">Navbatdagi Furalar</span>
                      <span className="text-lg font-black text-amber-300">{cp.queueTrucksCount} <span className="text-xs font-normal text-slate-400">ta</span></span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${cp.greenChannelActive ? "text-emerald-400" : "text-slate-600"}`} />
                      <span>Green Corridor (Tezkor o'tish): <strong>{cp.greenChannelActive ? "Mavjud" : "Mavjud emas"}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${cp.electronicQueueSupported ? "text-emerald-400" : "text-slate-600"}`} />
                      <span>E-Navbat Integratsiyasi: <strong>{cp.electronicQueueSupported ? "Faol" : "O'chirilgan"}</strong></span>
                    </div>
                  </div>

                  {cp.recentNotice && (
                    <div className="p-2.5 bg-blue-950/20 border border-blue-500/10 rounded-lg text-[11px] text-slate-300">
                      {cp.recentNotice}
                    </div>
                  )}

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Joylashuv: {cp.locationName}</span>
                    <span className="font-mono">{cp.integrationMode === "implemented" ? "Official Gov API" : "Live Driver Mesh"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Public QR Verification Simulator */}
      {activeTab === "verify" && (
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md max-w-2xl mx-auto space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <QrCode className="w-5 h-5 text-blue-400" />
              <span>Bojxona Xodimi & Chegara Nazorati QR Tekshiruvi</span>
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              Chegara postida skanerlangan QR kod yoki SHA-256 xesh raqamini kiriting va hujjat haqiqiyligini tekshiring.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Masalan: UZ-CMR-2026-004921 yoki SHA-256 xesh..."
              value={verifyHashInput}
              onChange={(e) => setVerifyHashInput(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => handleVerifyByHash(verifyHashInput)}
              disabled={actionLoading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              {actionLoading ? "Tekshirilmoqda..." : "Tekshirish"}
            </button>
          </div>

          {verifyResult && (
            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-400">Hujjat Haqiqiy & Bojxona Tasdiqlangan</h4>
                  <p className="text-[11px] text-slate-400">{verifyResult.documentType}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs border-t border-white/10 pt-3">
                <div>
                  <span className="text-slate-500 block">Hujjat raqami:</span>
                  <span className="font-mono font-bold text-white">{verifyResult.documentNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Tashuvchi:</span>
                  <span className="text-white font-semibold">{verifyResult.carrier}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Avtomobil / Marshrut:</span>
                  <span className="text-white">{verifyResult.truckPlate} ({verifyResult.route})</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Yuk tavsifi:</span>
                  <span className="text-white">{verifyResult.cargo} ({verifyResult.grossWeightKg} kg)</span>
                </div>
                <div>
                  <span className="text-slate-500 block">TIR / Bojxona Plombalari:</span>
                  <span className="font-mono text-emerald-400">{verifyResult.seals?.join(", ")}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Raqamli Imzo:</span>
                  <span className="font-mono text-slate-400 text-[10px] line-clamp-1">{verifyResult.digitalSignatureHash}</span>
                </div>
              </div>

              <div className="text-[11px] text-emerald-300/80 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/10">
                {verifyResult.regulatoryCompliance}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create e-CMR / TIR Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateDocument} className="bg-slate-900 border border-white/10 rounded-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-blue-400" />
                <span>Yangi Raqamli Xalqaro Hujjat Yaratish</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Hujjat Turi</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDocType("e_cmr")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    docType === "e_cmr"
                      ? "bg-blue-600 text-white border-blue-500"
                      : "bg-white/5 text-slate-400 border-white/10"
                  }`}
                >
                  Elektron e-CMR (Xalqaro Nakladnoy)
                </button>
                <button
                  type="button"
                  onClick={() => setDocType("digital_tir")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    docType === "digital_tir"
                      ? "bg-amber-600 text-white border-amber-500"
                      : "bg-white/5 text-slate-400 border-white/10"
                  }`}
                >
                  Digital TIR Carnet (IRU Tranzit)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Jo'natuvchi Korxona</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Jo'natuvchi Davlat</label>
                <input
                  type="text"
                  value={senderCountry}
                  onChange={(e) => setSenderCountry(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Qabul Qiluvchi Korxona</label>
                <input
                  type="text"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Qabul Qiluvchi Davlat</label>
                <input
                  type="text"
                  value={receiverCountry}
                  onChange={(e) => setReceiverCountry(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Yuk Mashinasi Davlat Raqami</label>
                <input
                  type="text"
                  value={truckPlate}
                  onChange={(e) => setTruckPlate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Pritsep (Tirkama) Raqami</label>
                <input
                  type="text"
                  value={trailerPlate}
                  onChange={(e) => setTrailerPlate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Chiqish Shahri</label>
                <input
                  type="text"
                  value={originCity}
                  onChange={(e) => setOriginCity(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Yetkazish Shahri</label>
                <input
                  type="text"
                  value={destinationCity}
                  onChange={(e) => setDestinationCity(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Yuk Tavsifi & Qadoqlanishi</label>
              <input
                type="text"
                value={cargoDesc}
                onChange={(e) => setCargoDesc(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">TIF TN K签订 (HS Code)</label>
                <input
                  type="text"
                  value={hsCode}
                  onChange={(e) => setHsCode(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Brutto Og'irligi (kg)</label>
                <input
                  type="number"
                  value={grossWeightKg}
                  onChange={(e) => setGrossWeightKg(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">E'lon Qilingan Qiymat (USD)</label>
                <input
                  type="number"
                  value={declaredValueUsd}
                  onChange={(e) => setDeclaredValueUsd(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2.5 bg-white/5 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg"
              >
                {actionLoading ? "Imzolanmoqda..." : "Generatsiya & Imzolash"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
