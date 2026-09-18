/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User, FactoringInvoice, FactoringRequest, YuklaWallet, WalletLedgerEntry } from "../types";
import { useTranslation } from "../context/LanguageContext";
import {
  Wallet,
  Building2,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  Zap,
  RefreshCw,
  Plus,
  Send,
  CreditCard,
  Layers,
  ChevronRight,
  TrendingUp,
  Percent,
  Banknote
} from "lucide-react";

interface EnterpriseYuklaPayFactoringProps {
  user: User;
  token: string | null;
}

export default function EnterpriseYuklaPayFactoring({ user, token }: EnterpriseYuklaPayFactoringProps) {
  const { t } = useTranslation();
  const [wallet, setWallet] = useState<YuklaWallet | null>(null);
  const [ledger, setLedger] = useState<WalletLedgerEntry[]>([]);
  const [invoices, setInvoices] = useState<FactoringInvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modals & forms
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [selectedInvoiceForFactoring, setSelectedInvoiceForFactoring] = useState<FactoringInvoice | null>(null);

  // Form states
  const [depositAmount, setDepositAmount] = useState("5000000");
  const [depositSource, setDepositSource] = useState("Uzcard / Humo Business");
  const [withdrawAmount, setWithdrawAmount] = useState("10000000");
  const [withdrawAccount, setWithdrawAccount] = useState("20208000900123456001");
  const [withdrawMfo, setWithdrawMfo] = useState("00444");

  // New invoice form
  const [invClientName, setInvClientName] = useState("");
  const [invClientTaxId, setInvClientTaxId] = useState("");
  const [invGrossAmount, setInvGrossAmount] = useState("35000000");
  const [invRoute, setInvRoute] = useState("Toshkent -> Samarqand");
  const [invPaymentTerms, setInvPaymentTerms] = useState("30");

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [walletRes, invoicesRes] = await Promise.all([
        fetch("/api/pay/wallet", { credentials: "omit", headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/factoring/invoices", { credentials: "omit", headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (walletRes.ok) {
        const wData = await walletRes.json();
        setWallet(wData.wallet);
        setLedger(wData.recentLedger || []);
      }
      if (invoicesRes.ok) {
        const invData = await invoicesRes.json();
        setInvoices(invData || []);
      }
    } catch (err: any) {
      setError(err.message || "Ma'lumotlarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pay/deposit", {
        method: "POST",
        credentials: "omit",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: Number(depositAmount), paymentSource: depositSource })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Mablag' kiritish amalga oshmadi");
      setSuccessMsg(`${Number(depositAmount).toLocaleString()} UZS hamyonga muvaffaqiyatli kiritildi.`);
      setShowDepositModal(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pay/withdraw", {
        method: "POST",
        credentials: "omit",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: Number(withdrawAmount), bankAccount: withdrawAccount, mfo: withdrawMfo })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chiqim amalga oshmadi");
      setSuccessMsg(`${Number(withdrawAmount).toLocaleString()} UZS bank hisobiga to'lov uchun yuborildi.`);
      setShowWithdrawModal(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/factoring/invoices", {
        method: "POST",
        credentials: "omit",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          clientName: invClientName,
          clientTaxId: invClientTaxId,
          grossAmount: Number(invGrossAmount),
          orderRoute: invRoute,
          paymentTermDays: Number(invPaymentTerms)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Hisob-faktura yaratilmadi");
      setSuccessMsg(`Hisob-faktura ${data.invoiceNumber} yaratildi (12% QQS bilan).`);
      setShowCreateInvoiceModal(false);
      setInvClientName("");
      setInvClientTaxId("");
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestFactoring = async (invoiceId: string) => {
    if (!token) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/factoring/request", {
        method: "POST",
        credentials: "omit",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ invoiceId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Faktoring arizasi yuborilmadi");
      setSuccessMsg("Faktoring arizasi qabul qilindi. 2 soat ichida 85% avans o'tkazib beriladi.");
      setSelectedInvoiceForFactoring(null);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdminProcessFactoring = async (invoiceId: string, action: "fund" | "reject") => {
    if (!token) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/factoring/${invoiceId}/process`, {
        method: "POST",
        credentials: "omit",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Faktoringni tasdiqlashda xatolik");
      setSuccessMsg(action === "fund" ? "Faktoring mablag'i tashuvchi hamyoniga to'liq o'tkazildi." : "Faktoring arizasi rad etildi.");
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Status */}
      <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900/60 border border-purple-500/20 rounded-2xl p-6 lg:p-8 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Production OpenBanking & Escrow Core</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                Didox E-Faktura 12% QQS
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
              YukLa Pay & Carrier Factoring Engine
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl mt-1">
              Yuk tashuvchilar uchun 2 soatlik tezkor faktoring (85% naqd avans), kafolatlangan xavfsiz escrow depozitlari va to'liq audit qilinuvchi buxgalteriya jurnali.
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
              onClick={() => setShowCreateInvoiceModal(true)}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-purple-600/25 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi E-Faktura</span>
            </button>
          </div>
        </div>

        {/* Feedback messages */}
        {error && (
          <div className="mt-4 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mt-4 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Real KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>Mavjud Hamyon Qoldig'i</span>
              <Wallet className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-xl font-bold text-white tracking-tight">
              {(wallet?.availableBalance || 0).toLocaleString()} <span className="text-xs font-normal text-purple-300">UZS</span>
            </div>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
              <button
                onClick={() => setShowDepositModal(true)}
                className="flex-1 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
              >
                <ArrowDownLeft className="w-3 h-3" />
                <span>Kiritish</span>
              </button>
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
              >
                <ArrowUpRight className="w-3 h-3" />
                <span>Chiqarish</span>
              </button>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>Escrow Kafolat Depoziti</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-emerald-300 tracking-tight">
              {(wallet?.escrowBalance || 0).toLocaleString()} <span className="text-xs font-normal text-emerald-400">UZS</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-3 pt-3 border-t border-white/5">
              Reyslar yakunlanguncha muzlatilgan mablag'
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>Faktoring Orqali Moliyalangan</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-bold text-amber-300 tracking-tight">
              {(wallet?.totalFactoredFunded || 0).toLocaleString()} <span className="text-xs font-normal text-amber-400">UZS</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-3 pt-3 border-t border-white/5">
              85% avans stavkasi (2.75% komissiya)
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>E-Fakturalar Soni</span>
              <FileText className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl font-bold text-white tracking-tight">
              {invoices.length} <span className="text-xs font-normal text-slate-400">ta hisob-faktura</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-3 pt-3 border-t border-white/5">
              Didox / E-Faktura bilan avtomatik sinxron
            </p>
          </div>
        </div>
      </div>

      {/* Carrier Invoice Factoring Table */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-400" />
              <span>B2B Hisob-Fakturalar & Faktoring Boshqaruvi</span>
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">
              Buyurtmachi to'lovini 30-45 kun kutmasdan, 2 soat ichida 85% naqd avansni qabul qiling.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
            <Percent className="w-3.5 h-3.5 text-purple-400" />
            <span>Faktoring shartlari: <strong>85% Avans</strong> | <strong>2.75% Xizmat haqi</strong></span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Faktura #</th>
                <th className="py-3 px-4">Buyurtmachi (Debitor)</th>
                <th className="py-3 px-4">Yo'nalish</th>
                <th className="py-3 px-4">Summa (12% QQS bilan)</th>
                <th className="py-3 px-4">Muddat</th>
                <th className="py-3 px-4">85% Naqd Avans</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-slate-300">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-white/[0.02] transition">
                  <td className="py-3.5 px-4 font-mono font-medium text-purple-300">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{inv.clientName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">INN: {inv.clientTaxId}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {inv.orderRoute || "Toshkent -> Hududlar"}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white">{inv.totalAmount.toLocaleString()} UZS</div>
                    <div className="text-[10px] text-slate-500">QQS: {inv.vatAmount.toLocaleString()} UZS</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{inv.paymentTermDays} kun ({inv.dueDate})</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-amber-300">
                    {inv.advanceAmount.toLocaleString()} UZS
                    <div className="text-[10px] text-slate-500">Komissiya: {inv.feeAmount.toLocaleString()} UZS</div>
                  </td>
                  <td className="py-3.5 px-4">
                    {inv.factoringStatus === "funded" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Moliyalandi (85%)</span>
                      </span>
                    )}
                    {inv.factoringStatus === "requested" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Clock className="w-3 h-3" />
                        <span>Kutilmoqda (2 soat)</span>
                      </span>
                    )}
                    {inv.factoringStatus === "unfactored" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                        <span>Standart To'lov</span>
                      </span>
                    )}
                    {inv.factoringStatus === "rejected" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <span>Rad etildi</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {inv.factoringStatus === "unfactored" && (
                      <button
                        onClick={() => setSelectedInvoiceForFactoring(inv)}
                        disabled={actionLoading}
                        className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 ml-auto transition shadow-sm cursor-pointer"
                      >
                        <Zap className="w-3 h-3" />
                        <span>85% Avans Olish</span>
                      </button>
                    )}
                    {inv.factoringStatus === "funded" && (
                      <span className="text-[11px] text-emerald-400 font-medium">To'langan</span>
                    )}
                    {(user.role === "admin" || user.role === "superadmin") && inv.factoringStatus === "requested" && (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleAdminProcessFactoring(inv.id, "fund")}
                          disabled={actionLoading}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold cursor-pointer"
                        >
                          Tasdiqlash
                        </button>
                        <button
                          onClick={() => handleAdminProcessFactoring(inv.id, "reject")}
                          disabled={actionLoading}
                          className="px-2.5 py-1 bg-rose-600/80 hover:bg-rose-600 text-white rounded text-[10px] font-bold cursor-pointer"
                        >
                          Rad etish
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Hozircha hisob-fakturalar mavjud emas. Yangi faktura yaratish uchun yuqoridagi tugmani bosing.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Double-Entry Ledger History */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <Layers className="w-5 h-5 text-purple-400" />
          <span>YukLa Pay Buxgalteriya Jurnali (Audit Ledger)</span>
        </h3>

        <div className="space-y-2">
          {ledger.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-xl transition gap-2"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  item.amount > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                }`}>
                  {item.amount > 0 ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">{item.description}</div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Ref: {item.referenceCode} • {new Date(item.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="text-right sm:pl-4">
                <div className={`text-sm font-bold ${item.amount > 0 ? "text-emerald-400" : "text-slate-300"}`}>
                  {item.amount > 0 ? `+${item.amount.toLocaleString()}` : item.amount.toLocaleString()} UZS
                </div>
                {item.balanceAfter !== undefined && (
                  <div className="text-[10px] text-slate-500">
                    Qoldiq: {item.balanceAfter.toLocaleString()} UZS
                  </div>
                )}
              </div>
            </div>
          ))}
          {ledger.length === 0 && (
            <div className="py-6 text-center text-slate-500 text-xs">
              Tranzaksiyalar tarixi bo'sh.
            </div>
          )}
        </div>
      </div>

      {/* Factoring Request Confirmation Modal */}
      {selectedInvoiceForFactoring && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">2 Soatlik Tezkor Faktoring</h3>
              </div>
              <button
                onClick={() => setSelectedInvoiceForFactoring(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="bg-purple-950/30 border border-purple-500/20 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Faktura raqami:</span>
                <span className="font-mono text-white">{selectedInvoiceForFactoring.invoiceNumber}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Debitor (Mijoz):</span>
                <span className="text-white font-medium">{selectedInvoiceForFactoring.clientName}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Jami hisob summasi:</span>
                <span className="text-white font-bold">{selectedInvoiceForFactoring.totalAmount.toLocaleString()} UZS</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between text-amber-300 font-semibold">
                <span>85% Avans o'tkaziladi:</span>
                <span>{selectedInvoiceForFactoring.advanceAmount.toLocaleString()} UZS</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Xizmat haqi (2.75%):</span>
                <span>-{selectedInvoiceForFactoring.feeAmount.toLocaleString()} UZS</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between text-emerald-400 font-bold text-sm">
                <span>Hamyonga sof tushum:</span>
                <span>{selectedInvoiceForFactoring.netPayoutAmount.toLocaleString()} UZS</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 bg-white/5 p-3 rounded-lg flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Didox E-Faktura tekshiruvidan so'ng mablag' 2 soat ichida YukLa Pay hamyoningizga o'tkaziladi.
              </span>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedInvoiceForFactoring(null)}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={() => handleRequestFactoring(selectedInvoiceForFactoring.id)}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer shadow-lg"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{actionLoading ? "Yuborilmoqda..." : "Avansni Tasdiqlash"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleDeposit} className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">YukLa Pay Hamyoniga Mablag' Kiritish</h3>
            <div>
              <label className="text-xs text-slate-400 block mb-1">To'lov Summasi (UZS)</label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">To'lov Manbai</label>
              <select
                value={depositSource}
                onChange={(e) => setDepositSource(e.target.value)}
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="Uzcard / Humo Business">Uzcard / Humo Korporativ Karta</option>
                <option value="Ipak Yoli Bank ATB">Ipak Yo'li Bank ATB Hisob-kitob</option>
                <option value="Anorbank OpenBanking">Anorbank OpenBanking API</option>
                <option value="Kapitalbank B2B">Kapitalbank B2B To'lov</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDepositModal(false)}
                className="flex-1 py-2.5 bg-white/5 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold"
              >
                {actionLoading ? "Yuklanmoqda..." : "To'lovni Tasdiqlash"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleWithdraw} className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Bank Hisobiga Chiqim Qilish</h3>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Chiqarish Summasi (UZS)</label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Bank Hisob Raqami (20 xonali)</label>
              <input
                type="text"
                value={withdrawAccount}
                onChange={(e) => setWithdrawAccount(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Bank MFO Kodi (5 xonali)</label>
              <input
                type="text"
                value={withdrawMfo}
                onChange={(e) => setWithdrawMfo(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-purple-500"
                required
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 py-2.5 bg-white/5 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold"
              >
                {actionLoading ? "Chiqarilmoqda..." : "Chiqimni Bajarish"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showCreateInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateInvoice} className="bg-slate-900 border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" />
              <span>Yangi Didox E-Faktura Yaratish</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Mijoz Kompaniya Nomi</label>
                <input
                  type="text"
                  placeholder="Masalan: Anglesey Food (Korzinka)"
                  value={invClientName}
                  onChange={(e) => setInvClientName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Mijoz STIR (INN) Raqami</label>
                <input
                  type="text"
                  placeholder="308123456"
                  value={invClientTaxId}
                  onChange={(e) => setInvClientTaxId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Asosiy Summa (UZS, QQSsiz)</label>
                <input
                  type="number"
                  value={invGrossAmount}
                  onChange={(e) => setInvGrossAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500"
                  required
                />
                <div className="text-[10px] text-purple-400 mt-1">
                  +12% QQS: {Math.round(Number(invGrossAmount || 0) * 0.12).toLocaleString()} UZS
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">To'lov Muddati (Kun)</label>
                <select
                  value={invPaymentTerms}
                  onChange={(e) => setInvPaymentTerms(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500"
                >
                  <option value="15">15 kun</option>
                  <option value="30">30 kun (Standart)</option>
                  <option value="45">45 kun</option>
                  <option value="60">60 kun</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Tashish Yo'nalishi / Shartnoma Izohi</label>
              <input
                type="text"
                value={invRoute}
                onChange={(e) => setInvRoute(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500"
                placeholder="Toshkent -> Samarqand 8 ta Fura reysi"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateInvoiceModal(false)}
                className="flex-1 py-2.5 bg-white/5 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold"
              >
                {actionLoading ? "Yaratilmoqda..." : "E-Faktura Yaratish"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
