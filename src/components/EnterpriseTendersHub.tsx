/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { LanguageCode, EnterpriseTender, TenderBid, User } from "../types";
import {
  Building2,
  Briefcase,
  TrendingUp,
  FileText,
  Clock,
  MapPin,
  Truck,
  DollarSign,
  PlusCircle,
  CheckCircle2,
  ShieldCheck,
  Award,
  Send,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Filter
} from "lucide-react";

interface EnterpriseTendersHubProps {
  currentLang: LanguageCode;
  token: string | null;
  user: User | null;
  onRefresh?: () => void;
}

export default function EnterpriseTendersHub({
  currentLang,
  token,
  user,
  onRefresh
}: EnterpriseTendersHubProps) {
  const [tenders, setTenders] = useState<EnterpriseTender[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTender, setSelectedTender] = useState<EnterpriseTender | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);

  // Create Tender Form state
  const [tenderTitle, setTenderTitle] = useState("");
  const [tenderOrigin, setTenderOrigin] = useState("");
  const [tenderDestination, setTenderDestination] = useState("");
  const [tenderCargo, setTenderCargo] = useState("");
  const [tenderVehicleType, setTenderVehicleType] = useState("Fura Tent");
  const [tenderMonthlyTrips, setTenderMonthlyTrips] = useState("30");
  const [tenderBudget, setTenderBudget] = useState("4500000");
  const [tenderDuration, setTenderDuration] = useState("6");
  const [tenderRequirements, setTenderRequirements] = useState("");
  const [submittingTender, setSubmittingTender] = useState(false);

  // Submit Bid Form state
  const [bidPrice, setBidPrice] = useState("");
  const [bidTrucks, setBidTrucks] = useState("2");
  const [bidSlaDays, setBidSlaDays] = useState("1");
  const [bidInsurance, setBidInsurance] = useState(true);
  const [bidComment, setBidComment] = useState("");
  const [submittingBid, setSubmittingBid] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchTenders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tenders");
      if (res.ok) {
        const data = await res.json();
        setTenders(data);
      }
    } catch (e) {
      console.error("Error loading tenders:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenders();
  }, []);

  const handleCreateTender = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setAlertMsg({ text: "Tender yaratish uchun tizimga kiring.", type: "error" });
      return;
    }

    setSubmittingTender(true);
    try {
      const res = await fetch("/api/tenders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: tenderTitle,
          origin: tenderOrigin,
          destination: tenderDestination,
          cargoType: tenderCargo,
          requiredVehicleType: tenderVehicleType,
          estimatedMonthlyTrips: Number(tenderMonthlyTrips),
          targetBudgetPerTrip: Number(tenderBudget),
          contractDurationMonths: Number(tenderDuration),
          specialRequirements: tenderRequirements
        })
      });

      if (res.ok) {
        setAlertMsg({ text: "Korporativ tender muvaffaqiyatli chop etildi!", type: "success" });
        setShowCreateModal(false);
        setTenderTitle("");
        setTenderOrigin("");
        setTenderDestination("");
        fetchTenders();
      } else {
        const err = await res.json();
        setAlertMsg({ text: err.error || "Xatolik yuz berdi.", type: "error" });
      }
    } catch (err: any) {
      setAlertMsg({ text: err.message || "Ulanish xatosi.", type: "error" });
    } finally {
      setSubmittingTender(false);
    }
  };

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTender || !token) return;

    setSubmittingBid(true);
    try {
      const res = await fetch(`/api/tenders/${selectedTender.id}/bid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          pricePerTrip: Number(bidPrice),
          availableTrucks: Number(bidTrucks),
          slaCommitmentDays: Number(bidSlaDays),
          cargoInsuranceCovered: bidInsurance,
          comment: bidComment
        })
      });

      if (res.ok) {
        setAlertMsg({ text: "Tijorat taklifingiz muvaffaqiyatli topshirildi!", type: "success" });
        setShowBidModal(false);
        setBidPrice("");
        setBidComment("");
        fetchTenders();
      } else {
        const err = await res.json();
        setAlertMsg({ text: err.error || "Taklif yuborishda xatolik.", type: "error" });
      }
    } catch (err: any) {
      setAlertMsg({ text: err.message || "Server bilan aloqa uzildi.", type: "error" });
    } finally {
      setSubmittingBid(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Enterprise Header Banner */}
      <div className="bg-gradient-to-r from-purple-950/60 via-[#100726] to-[#070312] border border-purple-500/20 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-2xl">
        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>B2B Enterprise Procurement & RFQ Auction</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Korporativ Yuk Tashish Tenderlari
          </h2>
          <p className="text-white/70 text-sm leading-relaxed">
            O'zbekistonning yirik korxonalari va distribyutorlari bilan to'g'ridan-to'g'ri uzoq muddatli shartnomalar tuzing. Shaffof auksion, elektron e-CMR va kafolatlangan to'lovlar.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10 w-full md:w-auto">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-900/40 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tender E'lon Qilish</span>
          </button>
        </div>
      </div>

      {alertMsg && (
        <div className={`p-4 rounded-2xl border text-sm flex items-center justify-between ${
          alertMsg.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
            : "bg-rose-500/10 border-rose-500/30 text-rose-300"
        }`}>
          <div className="flex items-center gap-2">
            {alertMsg.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{alertMsg.text}</span>
          </div>
          <button onClick={() => setAlertMsg(null)} className="text-white/50 hover:text-white">&times;</button>
        </div>
      )}

      {/* Tenders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {tenders.map((tender) => {
          const totalValue = (tender.targetBudgetPerTrip || 0) * (tender.estimatedMonthlyTrips || 1) * (tender.contractDurationMonths || 1);
          return (
            <div
              key={tender.id}
              className="bg-[#0b0518]/90 border border-white/10 hover:border-purple-500/40 rounded-3xl p-6 transition flex flex-col justify-between gap-5 relative group shadow-xl"
            >
              <div className="space-y-4">
                {/* Top Badge & Company */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-purple-500/30">
                        {tender.status.toUpperCase()}
                      </span>
                      <span className="text-white/40 text-xs font-mono">
                        ID: {tender.id}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition">
                      {tender.title}
                    </h3>
                    <p className="text-xs text-white/50 flex items-center gap-1.5 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-purple-400" />
                      <span>{tender.companyName}</span>
                    </p>
                  </div>
                </div>

                {/* Route & Requirements */}
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-white/80">
                    <span className="text-white/40">Yo'nalish:</span>
                    <span className="font-semibold text-white">{tender.origin} &rarr; {tender.destination}</span>
                  </div>
                  <div className="flex items-center justify-between text-white/80">
                    <span className="text-white/40">Transport turi:</span>
                    <span className="font-semibold text-purple-300">{tender.requiredVehicleType}</span>
                  </div>
                  <div className="flex items-center justify-between text-white/80">
                    <span className="text-white/40">Hajm:</span>
                    <span className="font-semibold text-white">~{tender.estimatedMonthlyTrips} reys / oy ({tender.contractDurationMonths} oy)</span>
                  </div>
                  <div className="flex items-center justify-between text-white/80">
                    <span className="text-white/40">Mo'ljallangan narx:</span>
                    <span className="font-bold text-emerald-400">{tender.targetBudgetPerTrip.toLocaleString()} UZS / reys</span>
                  </div>
                  {tender.specialRequirements && (
                    <div className="pt-2 border-t border-white/5 text-[11px] text-white/60">
                      <strong className="text-white/80">Talablar:</strong> {tender.specialRequirements}
                    </div>
                  )}
                </div>

                {/* Contract Value Highlight */}
                <div className="bg-gradient-to-r from-emerald-950/40 to-teal-950/20 border border-emerald-500/20 rounded-2xl p-3.5 flex items-center justify-between">
                  <span className="text-xs text-emerald-300/80 font-medium">Umumiy Shartnoma Qiymati:</span>
                  <span className="text-sm font-black text-emerald-400 font-mono">
                    ~{(totalValue / 1000000).toFixed(1)} mln UZS
                  </span>
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                <div className="text-xs text-white/50 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Muddati: {new Date(tender.deadline).toLocaleDateString()}</span>
                  <span className="text-purple-300 font-bold ml-2">({tender.bidsCount || 0} ta taklif)</span>
                </div>

                <button
                  onClick={() => {
                    setSelectedTender(tender);
                    setBidPrice(String(tender.targetBudgetPerTrip));
                    setShowBidModal(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600/90 hover:bg-purple-600 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Taklif Berish</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create Enterprise Tender */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e0720] border border-purple-500/30 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-400" />
                <span>Yangi Korporativ Tender E'lon Qilish</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-white/40 hover:text-white text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={handleCreateTender} className="space-y-4 text-xs">
              <div>
                <label className="text-white/70 block mb-1 font-semibold">Tender Sarlavhasi</label>
                <input
                  type="text"
                  required
                  value={tenderTitle}
                  onChange={(e) => setTenderTitle(e.target.value)}
                  placeholder="Masalan: Toshkent - Farg'ona oylik muntazam yuk tashish"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:border-purple-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/70 block mb-1 font-semibold">Yuklash Manzili</label>
                  <input
                    type="text"
                    required
                    value={tenderOrigin}
                    onChange={(e) => setTenderOrigin(e.target.value)}
                    placeholder="Toshkent zavodi"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-white/30 outline-none"
                  />
                </div>
                <div>
                  <label className="text-white/70 block mb-1 font-semibold">Yetkazish Manzili</label>
                  <input
                    type="text"
                    required
                    value={tenderDestination}
                    onChange={(e) => setTenderDestination(e.target.value)}
                    placeholder="Samarqand / Buxoro"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-white/30 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/70 block mb-1 font-semibold">Talab Etilgan Transport</label>
                  <select
                    value={tenderVehicleType}
                    onChange={(e) => setTenderVehicleType(e.target.value)}
                    className="w-full bg-[#170c33] border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="Labo">Labo (1t)</option>
                    <option value="ISUZU 5">ISUZU (5t)</option>
                    <option value="ISUZU 10">ISUZU (10t)</option>
                    <option value="Fura Tent">Fura Tent (20t)</option>
                    <option value="Refrejirator">Refrejirator (10-20t)</option>
                  </select>
                </div>
                <div>
                  <label className="text-white/70 block mb-1 font-semibold">Oylik Reyslar Soni</label>
                  <input
                    type="number"
                    min="1"
                    value={tenderMonthlyTrips}
                    onChange={(e) => setTenderMonthlyTrips(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/70 block mb-1 font-semibold">Byudjet / Reys (UZS)</label>
                  <input
                    type="number"
                    min="100000"
                    value={tenderBudget}
                    onChange={(e) => setTenderBudget(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-white/70 block mb-1 font-semibold">Shartnoma Muddati (Oy)</label>
                  <input
                    type="number"
                    min="1"
                    max="36"
                    value={tenderDuration}
                    onChange={(e) => setTenderDuration(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-white/70 block mb-1 font-semibold">Maxsus Talablar & Shartlar</label>
                <textarea
                  rows={2}
                  value={tenderRequirements}
                  onChange={(e) => setTenderRequirements(e.target.value)}
                  placeholder="GPS monitoring, CMR rasmiylashtirish, sug'urta va h.k."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-white/30 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/15"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submittingTender}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition disabled:opacity-50"
                >
                  {submittingTender ? "Chop etilmoqda..." : "Tenderni Chop Etish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Submit Bid */}
      {showBidModal && selectedTender && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e0720] border border-purple-500/30 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Send className="w-5 h-5 text-purple-400" />
                  <span>Tijorat Taklifi Topshirish</span>
                </h3>
                <p className="text-xs text-white/50">{selectedTender.title}</p>
              </div>
              <button onClick={() => setShowBidModal(false)} className="text-white/40 hover:text-white text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={handleSubmitBid} className="space-y-4 text-xs">
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-purple-200">
                Buyurtmachi mo'ljali: <strong>{selectedTender.targetBudgetPerTrip.toLocaleString()} UZS / reys</strong>
              </div>

              <div>
                <label className="text-white/70 block mb-1 font-semibold">Sizning Taklif Narxingiz (UZS / Reys)</label>
                <input
                  type="number"
                  required
                  min="100000"
                  value={bidPrice}
                  onChange={(e) => setBidPrice(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold text-sm outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/70 block mb-1 font-semibold">Mavjud Mashinalar Soni</label>
                  <input
                    type="number"
                    min="1"
                    value={bidTrucks}
                    onChange={(e) => setBidTrucks(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-white/70 block mb-1 font-semibold">SLA Yetkazish (Kun)</label>
                  <input
                    type="number"
                    min="1"
                    value={bidSlaDays}
                    onChange={(e) => setBidSlaDays(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="insuranceCheck"
                  checked={bidInsurance}
                  onChange={(e) => setBidInsurance(e.target.checked)}
                  className="rounded bg-white/10 text-purple-600 focus:ring-0"
                />
                <label htmlFor="insuranceCheck" className="text-white/80 font-medium cursor-pointer">
                  Yuk sug'urtasi va to'liq javobgarlik kafolatlanadi
                </label>
              </div>

              <div>
                <label className="text-white/70 block mb-1 font-semibold">Izoh & Avtopark haqida qo'shimcha</label>
                <textarea
                  rows={2}
                  value={bidComment}
                  onChange={(e) => setBidComment(e.target.value)}
                  placeholder="Masalan: MAN TGX 2021 rusumli 3 ta fura, tajribali haydovchilar bilan tayyor."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-white/30 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowBidModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/15"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submittingBid}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition disabled:opacity-50"
                >
                  {submittingBid ? "Yuborilmoqda..." : "Taklifni Yuborish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
