/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { LanguageCode, Order, User, FuelAdvanceRequest } from "../types";
import {
  Fuel,
  CreditCard,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  DollarSign,
  ArrowRight
} from "lucide-react";

interface DriverFuelAdvanceModalProps {
  currentLang: LanguageCode;
  token: string | null;
  user: User | null;
  activeOrders: Order[];
  onClose: () => void;
}

export default function DriverFuelAdvanceModal({
  currentLang,
  token,
  user,
  activeOrders,
  onClose
}: DriverFuelAdvanceModalProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string>(activeOrders[0]?.id || "");
  const [cardNumber, setCardNumber] = useState<string>("8600 1234 5678 9012");
  const [advances, setAdvances] = useState<FuelAdvanceRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const selectedOrder = activeOrders.find((o) => o.id === selectedOrderId) || activeOrders[0];
  const orderPrice = selectedOrder?.price || 3000000;
  const advanceAmount = Math.floor(orderPrice * 0.5); // 50%
  const serviceFee = Math.floor(advanceAmount * 0.025); // 2.5%
  const netAmount = advanceAmount - serviceFee;

  const fetchAdvances = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/driver/fuel-advance", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setAdvances(await res.json());
      }
    } catch (e) {
      console.error("Error loading fuel advances:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvances();
  }, [token]);

  const handleRequestAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedOrderId) {
      setAlertMsg({ text: "Buyurtmani tanlang.", type: "error" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/driver/fuel-advance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: selectedOrderId,
          cardNumber
        })
      });

      const data = await res.json();
      if (res.ok) {
        setAlertMsg({
          text: `50% Yonilg'i avansi (${netAmount.toLocaleString()} UZS) Uzcard/Humo kartangizga o'tkazildi!`,
          type: "success"
        });
        fetchAdvances();
      } else {
        setAlertMsg({ text: data.error || "Avans ajratishda xatolik.", type: "error" });
      }
    } catch (err: any) {
      setAlertMsg({ text: err.message || "Server xatosi.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#0b0518] border border-amber-500/30 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative animate-fade-in text-white text-xs">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider">
              <Zap className="w-3 h-3" />
              <span>Fintech Driver Liquidity & Fast Fuel Advance</span>
            </div>
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <span>50% Tezkor Yonilg'i Avansi</span>
              <Fuel className="w-5 h-5 text-amber-400" />
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center transition text-lg font-bold"
          >
            &times;
          </button>
        </div>

        {alertMsg && (
          <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
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

        {/* Advance Calculator Card */}
        <div className="bg-gradient-to-br from-amber-950/40 via-[#180f2b] to-[#0d0720] border border-amber-500/30 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between text-white/70">
            <span>Buyurtma qiymati:</span>
            <strong className="text-white font-mono">{orderPrice.toLocaleString()} UZS</strong>
          </div>
          <div className="flex items-center justify-between text-amber-400 font-bold">
            <span>50% Yonilg'i Avansi:</span>
            <strong className="text-base font-mono">{advanceAmount.toLocaleString()} UZS</strong>
          </div>
          <div className="flex items-center justify-between text-white/50 text-[11px]">
            <span>Xizmat komissiyasi (2.5%):</span>
            <span className="font-mono">-{serviceFee.toLocaleString()} UZS</span>
          </div>
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <span className="font-bold text-white">Kartaga tushadigan summa:</span>
            <span className="text-lg font-black text-emerald-400 font-mono">
              {netAmount.toLocaleString()} UZS
            </span>
          </div>
        </div>

        {/* Request Form */}
        <form onSubmit={handleRequestAdvance} className="space-y-4">
          <div>
            <label className="text-white/70 block mb-1 font-semibold">Biriktirilgan Buyurtma</label>
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="w-full bg-[#180c33] border border-white/10 rounded-xl px-3 py-2.5 text-white outline-none"
            >
              {activeOrders.map((o) => (
                <option key={o.id} value={o.id}>
                  #{o.id} - {o.pickupAddress} &rarr; {o.deliveryAddress} ({(o.price || 0).toLocaleString()} UZS)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-white/70 block mb-1 font-semibold">Uzcard / Humo Karta Raqami</label>
            <div className="relative">
              <input
                type="text"
                required
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="8600 **** **** **** yoki 9860 **** **** ****"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-amber-500 font-mono"
              />
              <CreditCard className="w-4 h-4 text-amber-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/10 text-white hover:bg-white/15"
            >
              Yopish
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold flex items-center gap-2 shadow-lg shadow-amber-950 transition disabled:opacity-50 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>{submitting ? "O'tkazilmoqda..." : "Avansni Darhol Olish"}</span>
            </button>
          </div>
        </form>

        {/* History List */}
        {advances.length > 0 && (
          <div className="pt-4 border-t border-white/10 space-y-2">
            <h4 className="font-bold text-white/80">Avans Tarixi</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {advances.map((fa) => (
                <div key={fa.id} className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-white">{fa.netDisbursed.toLocaleString()} UZS</span>
                    <span className="text-[10px] text-white/50 block font-mono">{fa.cardNumber} &bull; {new Date(fa.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    O'tkazildi
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
