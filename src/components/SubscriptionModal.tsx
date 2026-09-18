import React, { useState, useEffect } from "react";
import { 
  X, 
  Crown, 
  Zap, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  CreditCard,
  Building2,
  AlertCircle
} from "lucide-react";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  maxActiveOrders: number;
  features: string[];
  recommended?: boolean;
}

interface SubscriptionModalProps {
  token: string | null;
  currentTier?: string;
  onClose: () => void;
  onSubscribed?: (newTier: string) => void;
}

export default function SubscriptionModal({
  token,
  currentTier = "ODDIY",
  onClose,
  onSubscribed
}: SubscriptionModalProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingTier, setSubmittingTier] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"CLICK" | "PAYME" | "UZUM">("CLICK");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/subscriptions/plans");
      const data = await res.json();
      if (res.ok && data.plans) {
        setPlans(data.plans);
      }
    } catch (e) {
      console.error("Failed to load subscription plans:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (tier: string) => {
    if (!token) {
      setErrorMsg("Obunani yangilash uchun tizimga kiring.");
      return;
    }
    setErrorMsg("");
    setSuccessMsg("");
    setSubmittingTier(tier);

    try {
      const res = await fetch("/api/subscriptions/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          tier,
          paymentMethod: selectedPaymentMethod
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Obuna jarayonida xatolik yuz berdi");
      }

      setSuccessMsg(data.message || `Muvaffaqiyatli ${tier} tarifiga ulandingiz!`);
      if (onSubscribed) {
        onSubscribed(tier);
      }
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Xatolik yuz berdi");
    } finally {
      setSubmittingTier(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-4xl bg-[#0d0b18] border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[92vh] text-white">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 mb-8 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] font-extrabold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>YukLa SaaS Enterprise Ekosistemasi</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Logistika Quvvatingizni Oshiring
          </h2>
          <p className="text-xs sm:text-sm text-white/50">
            Oddiy, Pro yoki VIP obunalarni tanlab, buyurtmalar chegarasini kengaytiring va birjada yuklaringizni eng yuqori o'ringa chiqaring.
          </p>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => {
            const isCurrent = currentTier.toUpperCase() === plan.id.toUpperCase();
            const isVip = plan.id === "VIP";
            const isPro = plan.id === "PRO";

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 backdrop-blur-md ${
                  isVip
                    ? "bg-gradient-to-b from-[#240b3b]/70 via-[#13082a]/70 to-[#0d0b18] border-2 border-purple-400/50 shadow-[0_0_30px_rgba(168,85,247,0.25)]"
                    : isPro
                    ? "bg-gradient-to-b from-[#2b1f09]/50 via-[#13082a]/50 to-[#0d0b18] border-2 border-amber-500/40"
                    : "bg-[#120b2e]/40 border border-white/10 hover:border-white/20"
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-black text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                    Eng Ommabop
                  </div>
                )}

                {isVip && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-300" />
                    <span>Maksimal Imkoniyat</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-black uppercase tracking-wider text-purple-400">
                      {plan.name}
                    </span>
                    {isCurrent && (
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full font-bold uppercase">
                        Hozirgi tarif
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                      {plan.price === 0 ? "0" : plan.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-white/40 ml-1 font-mono">UZS / oy</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 mb-5 text-[11px] text-white/70">
                    Bir vaqtning o'zida:{" "}
                    <strong className="text-white font-mono font-bold">
                      {plan.maxActiveOrders === -1 ? "Cheksiz" : `${plan.maxActiveOrders} ta`}
                    </strong>{" "}
                    faol yuk
                  </div>

                  <ul className="space-y-2.5 text-xs mb-6">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-white/80 leading-relaxed">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isCurrent || submittingTier === plan.id}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 ${
                    isCurrent
                      ? "bg-white/10 text-white/40 cursor-not-allowed"
                      : isVip
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-900/40"
                      : isPro
                      ? "bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/40"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                >
                  {submittingTier === plan.id ? (
                    <span>Faollashtirilmoqda...</span>
                  ) : isCurrent ? (
                    <span>Faol reja</span>
                  ) : (
                    <>
                      <span>{plan.price === 0 ? "O'tish" : "Obuna bo'lish"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Payment Methods and Escrow Guarantee Footer */}
        <div className="bg-[#120b2e]/60 border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-white/60">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>1% Avtomatlashtirilgan Escrow kafolati va xavfsiz to'lov gateway</span>
          </div>

          <div className="flex items-center gap-2">
            {(["CLICK", "PAYME", "UZUM"] as const).map((method) => (
              <button
                key={method}
                onClick={() => setSelectedPaymentMethod(method)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition cursor-pointer ${
                  selectedPaymentMethod === method
                    ? "bg-purple-600 text-white border border-purple-400"
                    : "bg-black/40 text-white/40 border border-white/10 hover:text-white"
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
