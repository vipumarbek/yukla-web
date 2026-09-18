import React, { useState, useEffect } from "react";
import { useTranslation } from "../context/LanguageContext";
import { 
  Receipt, 
  DollarSign, 
  Wallet, 
  Award, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck, 
  HelpCircle, 
  Landmark, 
  X,
  Eye,
  CircleDollarSign,
  CreditCard
} from "lucide-react";

interface DriverEarningsTabProps {
  earnings: any;
  token: string;
  onRefreshProfile?: () => void;
}

export default function DriverEarningsTab({ earnings, token, onRefreshProfile }: DriverEarningsTabProps) {
  const { t } = useTranslation();
  const [wallet, setWallet] = useState<any>({
    availableBalance: 0,
    pendingBalance: 0,
    totalEarnings: 0
  });
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [driverPayments, setDriverPayments] = useState<any[]>([]);
  const [pendingPayouts, setPendingPayouts] = useState<number>(0);
  const [completedPayouts, setCompletedPayouts] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Form states
  const [showWithdrawForm, setShowWithdrawForm] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>("");
  const [method, setMethod] = useState<string>("card"); // click, payme, card, bank
  const [accountDetails, setAccountDetails] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  const fetchWalletDetails = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/driver/wallet", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setWallet(data.wallet || { availableBalance: 0, pendingBalance: 0, totalEarnings: 0 });
        setWithdrawals(data.withdrawals || []);
        setTransactions(data.transactions || []);
        setDriverPayments(data.driverPayments || []);
        setPendingPayouts(data.pendingPayouts || 0);
        setCompletedPayouts(data.completedPayouts || 0);
      }
    } catch (e) {
      console.error("Error fetching driver wallet:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletDetails();
  }, [token]);

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const withdrawAmt = parseInt(amount, 10);
    if (!withdrawAmt || isNaN(withdrawAmt) || withdrawAmt < 50000) {
      setErrorMsg("Minimal pul yechish miqdori 50,000 UZS bo'lishi lozim.");
      return;
    }

    if (wallet.availableBalance < withdrawAmt) {
      setErrorMsg("Hisobingizda yetarli mablag' mavjud emas.");
      return;
    }

    if (!accountDetails.trim()) {
      setErrorMsg("Pul yuborish hisob raqami / karta raqamini kiritish majburiy.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/driver/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: withdrawAmt,
          method,
          accountDetails
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Xatolik yuz berdi.");
      }

      setSuccessMsg("Yechib olish so'rovi yuborildi! Administrator tasdiqlashini kuting. 🎉");
      setAmount("");
      setAccountDetails("");
      setShowWithdrawForm(false);
      
      // Refresh statistics & profile callback
      await fetchWalletDetails();
      if (onRefreshProfile) {
        onRefreshProfile();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Server aloqasida xatolik.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-xs font-sans">
      
      {/* Platform Info Header */}
      <div className="bg-gradient-to-r from-purple-950/40 via-[#0e0722]/50 to-indigo-950/40 border border-purple-500/20 p-5 rounded-3xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2 bg-purple-600/20 text-purple-400 font-mono tracking-widest text-[9px] uppercase font-black rounded border border-purple-500/10">1% Automated Escrow Architecture</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-white text-base font-black">YukLa Drayver Hamyoni (Unified Escrow Wallet)</h3>
          <p className="text-white/50 text-[10.5px] leading-relaxed">
            Platformada atigi 1% avtomatlashtirilgan Escrow komissiyasi ushlab qolinadi. Buyurtma yetkazib berilishi bilan mijoz bloklagan summaning to'liq 99% qismi drayver hisobiga darhol o'tkaziladi.
          </p>
        </div>
        <button 
          onClick={() => setShowWithdrawForm(!showWithdrawForm)}
          className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold px-6 py-3 rounded-xl transition uppercase tracking-wider text-[10px] shadow-lg cursor-pointer self-start md:self-center"
        >
          {showWithdrawForm ? "So'rovni yopish" : "Pul yechish (Withdraw)"}
        </button>
      </div>

      {/* WITHDRAWAL PROCESS FORM CONTAINER */}
      {showWithdrawForm && (
        <div className="bg-[#120b2e]/60 border border-purple-500/20 p-6 rounded-3xl space-y-4 animate-scale-up backdrop-blur-md">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Hisobdan mablag' chiqarish so'rovi</h4>
            <button onClick={() => setShowWithdrawForm(false)} className="text-white/40 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleWithdrawSubmit} className="space-y-5">
            {errorMsg && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-[10.5px]">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Method choice */}
              <div className="space-y-1">
                <label className="text-white/50 block font-semibold">Tizimni tanlang:</label>
                <select 
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 p-3 text-xs rounded-xl focus:border-purple-500 text-white outline-none"
                >
                  <option value="card">Humo / UzCard Plastik Karta</option>
                  <option value="click">Click Elektron Hamyon</option>
                  <option value="payme">Payme To'lov Xizmati</option>
                  <option value="bank">Bank Shaxsiy Hisob Raqami</option>
                </select>
              </div>

              {/* Amount input */}
              <div className="space-y-1">
                <label className="text-white/50 block font-semibold">Pul miqdori (UZS, min 50k):</label>
                <input 
                  type="number"
                  placeholder="Masalan: 500000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 p-3 text-xs rounded-xl focus:border-purple-500 text-white font-mono outline-none"
                />
              </div>

              {/* Account/Details */}
              <div className="space-y-1">
                <label className="text-white/50 block font-semibold">Hisob / Karta / Telefon tafsilotlari:</label>
                <input 
                  type="text"
                  placeholder="Masalan: 860012023405 or Telefon"
                  value={accountDetails}
                  onChange={(e) => setAccountDetails(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 p-3 text-xs rounded-xl focus:border-purple-500 text-white font-mono outline-none"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl uppercase tracking-wider text-[10px] transition cursor-pointer"
            >
              {submitting ? "Kutilmoqda..." : "Yechib olish uchun administratorga so'rovingizni yo'llang"}
            </button>
          </form>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-3xl text-[10.5px] font-semibold animate-scale-up">
          {successMsg}
        </div>
      )}

      {/* Wallet Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Erkin Balans */}
        <div className="bg-[#120b2e]/40 border border-emerald-500/25 p-5 rounded-2xl space-y-1 relative overflow-hidden backdrop-blur-md animate-scale-up">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl rounded-full"></div>
          <span className="text-emerald-400 uppercase font-bold tracking-wider text-[8.5px] flex items-center gap-1">
            <Wallet className="w-3.5 h-3.5" />
            <span>Erkin balans (Available to Withdraw)</span>
          </span>
          <p className="text-2xl font-black text-emerald-400 font-mono">
            {loading ? "..." : (wallet.availableBalance || 0).toLocaleString()} UZS
          </p>
          <span className="text-[10px] text-emerald-500/60 block pt-1.5 border-t border-white/5 font-sans leading-none">
            Sizning to'g'ridan-to'g'ri yechib olishingiz yoki karta orqali to'lanishini so'rashingiz mumkin bo'lgan erkin balansingiz
          </span>
        </div>

        {/* Metric 2: Muzlatilgan balans (Escrow Hold) */}
        <div className="bg-[#120b2e]/40 border border-amber-500/20 p-5 rounded-2xl space-y-1 relative overflow-hidden backdrop-blur-md animate-scale-up">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-2xl rounded-full"></div>
          <span className="text-amber-400 uppercase font-bold tracking-wider text-[8.5px] flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>Muzlatilgan balans (Escrow Hold)</span>
          </span>
          <p className="text-2xl font-black text-amber-400 font-mono">
            {loading ? "..." : (wallet.pendingBalance || pendingPayouts || 0).toLocaleString()} UZS
          </p>
          <span className="text-[10px] text-white/40 block pt-1.5 border-t border-white/5 font-sans leading-none">
            Kargo topshirilgach avtomatik ravishda 99% drayver erkin hisobiga o'tuvchi depozit mablag'
          </span>
        </div>

        {/* Metric 3: Yechib olingan summa */}
        <div className="bg-[#120b2e]/40 border border-purple-500/20 p-5 rounded-2xl space-y-1 relative overflow-hidden backdrop-blur-md animate-scale-up">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-2xl rounded-full"></div>
          <span className="text-purple-300 uppercase font-bold tracking-wider text-[8.5px] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Yechib olingan summa (Total Withdrawn)</span>
          </span>
          <p className="text-2xl font-black text-purple-400 font-mono">
            {loading ? "..." : (completedPayouts || 0).toLocaleString()} UZS
          </p>
          <span className="text-[10px] text-white/40 block pt-1.5 border-t border-white/5 font-sans leading-none">
            Drayver bank kartasiga muvaffaqiyatli o'tkazib berilgan to'lovlar yig'indisi
          </span>
        </div>
      </div>

      {/* Ledger and History sections split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Ledger Transaction section (Left 7 cols) */}
        <div className="lg:col-span-7 bg-[#120b2e]/30 border border-white/5 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-4">
          <h4 className="text-sm font-extrabold uppercase tracking-widest text-white/60 pb-3 border-b border-white/5 flex items-center gap-1.5">
            <Receipt className="w-5 h-5 text-purple-400" />
            <span>Kassa tranzaksiya jurnali (Financial Ledger)</span>
          </h4>

          {loading ? (
            <div className="text-center py-6 text-white/20">Yuklanmoqda...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-10 bg-black/10 rounded-2xl text-white/30 font-medium">
              Tranzaksiyalar tarixi bo‘sh.
            </div>
          ) : (
            <div className="overflow-y-auto max-h-80 pr-1 space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="bg-black/25 border border-white/5 p-4 rounded-xl flex items-center justify-between font-sans hover:border-white/10 transition">
                  <div className="space-y-1 max-w-[70%]">
                    <div className="flex items-center gap-2">
                      <span className={`text-[8.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded leading-none ${
                        tx.type === "payout" ? "bg-emerald-500/10 text-emerald-400" : "bg-teal-500/10 text-teal-300"
                      }`}>
                        {tx.type}
                      </span>
                      <span className="text-[10px] text-white/35 font-mono">#{tx.id.substring(3, 11).toUpperCase()}</span>
                    </div>
                    <p className="text-[11px] text-white/70 font-semibold leading-relaxed truncate">{tx.details}</p>
                    <span className="text-[9.5px] text-white/40 block leading-none">{new Date(tx.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold font-mono text-xs ${tx.type === "withdrawal" ? "text-rose-450" : "text-emerald-400"}`}>
                      {tx.type === "withdrawal" ? "-" : "+"}{tx.amount.toLocaleString()} UZS
                    </p>
                    <span className="text-[9px] text-white/30 font-semibold">{tx.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Withdrawal Requests section (Right 5 cols) */}
        <div className="lg:col-span-5 bg-[#120b2e]/30 border border-white/5 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-4">
          <h4 className="text-sm font-extrabold uppercase tracking-widest text-white/60 pb-3 border-b border-white/5 flex items-center gap-1.5">
            <Landmark className="w-5 h-5 text-[#dda15e]" />
            <span>Yechib olish hulosalari (Payout Requests)</span>
          </h4>

          {loading ? (
            <div className="text-center py-6 text-white/20">Yuklanmoqda...</div>
          ) : withdrawals.length === 0 ? (
            <div className="text-center py-10 bg-black/10 rounded-2xl text-white/30">
              Karta yoki bankka pul yechish so'rovlari yo'q.
            </div>
          ) : (
            <div className="overflow-y-auto max-h-80 pr-1 space-y-3">
              {withdrawals.map((wd) => (
                <div key={wd.id} className="bg-black/20 border border-white/5 p-4 rounded-xl space-y-2 font-sans hover:border-white/10 transition">
                  <div className="flex justify-between items-center text-[10.5px]">
                    <strong className="text-white font-mono">{wd.amount.toLocaleString()} UZS</strong>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      wd.status === "Approved" 
                        ? "bg-emerald-500/10 text-emerald-400" 
                        : wd.status === "Rejected"
                        ? "bg-rose-500/10 text-rose-500" 
                        : "bg-amber-500/10 text-amber-400"
                    }`}>
                      {wd.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[9.5px] text-white/40 leading-tight">
                    <div>
                      <span>Tizim: </span>
                      <strong className="text-white/60 uppercase">{wd.method}</strong>
                    </div>
                    <div>
                      <span>Sana: </span>
                      <strong className="text-white/60">{new Date(wd.createdAt).toLocaleDateString()}</strong>
                    </div>
                    <div className="col-span-2 truncate">
                      <span>Hisob: </span>
                      <strong className="text-white/60 font-mono">{wd.accountDetails}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Driver Payouts (manual commissions from Completed orders) */}
      <div className="bg-[#120b2e]/30 border border-white/5 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-4 animate-scale-up">
        <div className="border-b border-white/5 pb-3">
          <h4 className="text-sm font-extrabold uppercase tracking-widest text-white/70 flex items-center gap-2">
            <CircleDollarSign className="w-5 h-5 text-purple-400" />
            <span>Buyurtmalar bo'yicha ulush to'lovlari (99% Drayver ulushi)</span>
          </h4>
          <p className="text-[10.5px] text-white/40 mt-1">Har bir yakunlangan kargo buyurtmangiz uchun sizga to'lanadigan 99% sof sheriklik narxi (1% YukLa avtomatlashtirilgan escrow yig'imi ushlanadi)</p>
        </div>

        {loading ? (
          <div className="text-center py-6 text-white/20">Yuklanmoqda...</div>
        ) : driverPayments.length === 0 ? (
          <div className="text-center py-10 bg-black/10 rounded-2xl text-white/20 text-xs">
            Hozircha birorta yakunlangan buyurtma to'lov hujjati mavjud emas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans font-medium text-white">
              <thead>
                <tr className="border-b border-white/10 text-white/40 uppercase font-mono tracking-wider text-[9px]">
                  <th className="py-2.5 px-3">To'lov ID</th>
                  <th className="py-2.5 px-3">Yo'nalish / Marshrut</th>
                  <th className="py-2.5 px-3">Buyurtma narxi</th>
                  <th className="py-2.5 px-3 text-[#dda15e]">YukLa komissiyasi (1%)</th>
                  <th className="py-2.5 px-3 text-emerald-450">Sizga berilishi (99%)</th>
                  <th className="py-2.5 px-3">Holati (Status)</th>
                  <th className="py-2.5 px-3 text-right">To'lov hisoboti</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {driverPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.01] transition">
                    <td className="py-3 px-3 font-mono text-purple-400 text-[10px] whitespace-nowrap">
                      #{p.id.substring(4, 12).toUpperCase()}
                      <span className="block text-[8px] text-white/30 font-normal">Sana: {new Date(p.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td className="py-3 px-3">
                      <p className="text-[10.5px] text-white/80 max-w-[260px] truncate leading-none" title={p.orderRoute}>{p.orderRoute}</p>
                      <span className="text-[8.5px] text-white/30 mt-0.5 block">Kargo buyurtma: #{p.orderId.substring(0, 8).toUpperCase()}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-white/50 text-[10.5px] whitespace-nowrap font-medium">
                      {p.orderAmount?.toLocaleString()} UZS
                    </td>
                    <td className="py-3 px-3 font-mono text-rose-300 text-[10.5px] whitespace-nowrap font-medium">
                      {p.platformFee?.toLocaleString()} UZS
                    </td>
                    <td className="py-3 px-3 font-mono font-extrabold text-emerald-400 text-[11px] whitespace-nowrap">
                      {p.driverAmount?.toLocaleString()} UZS
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                        p.status === "Paid" 
                          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-405" 
                          : p.status === "Approved"
                          ? "bg-purple-500/10 border border-purple-500/20 text-purple-300"
                          : p.status === "Cancelled"
                          ? "bg-rose-500/10 border border-rose-500/20 text-rose-455"
                          : "bg-amber-500/10 border border-amber-500/20 text-amber-450"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {p.status === "Paid" ? (
                        <div className="inline-block text-right space-y-0.5">
                          <span className="text-[8.5px] text-white/35 font-mono block">To'landi: {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : 'Yaqinda'}</span>
                          {p.paymentNote && <p className="text-[9.5px] text-white/60 italic max-w-[200px] whitespace-normal inline-block text-left leading-tight">{p.paymentNote}</p>}
                          {p.paymentProof && (
                            <a 
                              href={p.paymentProof} 
                              target="_blank" 
                              referrerPolicy="no-referrer"
                              rel="noopener noreferrer" 
                              className="text-[9.5px] text-[#dda15e] font-black hover:underline flex items-center justify-end gap-1 mt-0.5 leading-none"
                            >
                              <Eye className="w-2.5 h-2.5" />
                              <span>To'lov chekini ochish</span>
                            </a>
                          )}
                        </div>
                      ) : p.status === "Approved" ? (
                        <span className="text-[10px] text-purple-300 font-medium">To'lovga tasdiqlangan (Admin navbatida)</span>
                      ) : p.status === "Cancelled" ? (
                        <span className="text-rose-500/50 text-[10px] font-mono">Bekor qilingan</span>
                      ) : (
                        <span className="text-amber-500/60 text-[10px]">Ma'muriyat hisob-kitobini kutilmoqda</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
