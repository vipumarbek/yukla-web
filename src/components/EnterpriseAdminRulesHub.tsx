import React, { useState, useEffect } from "react";
import {
  Sliders,
  Percent,
  Truck,
  CheckCircle2,
  Save,
  DollarSign
} from "lucide-react";
import { SystemSettings, PricingRule, CommissionRule } from "../types";

interface Props {
  token: string;
}

export const EnterpriseAdminRulesHub: React.FC<Props> = ({ token }) => {
  const [settings, setSettings] = useState<SystemSettings>({
    maintenanceMode: false,
    maintenanceReason: "",
    minMobileAppVersion: "2.4.0",
    forceAppUpdate: false,
    allowGuestCalculations: true,
    defaultCurrency: "UZS",
    globalPlatformFeePct: 3.0,
    factoringAdvanceRatePct: 85.0,
    factoringDiscountRatePct: 2.75,
    instantPayoutFeePct: 0.8,
    taxVatRatePct: 12.0,
    autoEscrowReleaseHours: 24,
  });
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [commissionRules, setCommissionRules] = useState<CommissionRule[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchRules = async () => {
    try {
      const res = await fetch("/api/admin/rules/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.systemSettings) setSettings(data.systemSettings);
        if (data.pricingRules) setPricingRules(data.pricingRules);
        if (data.commissionRules) setCommissionRules(data.commissionRules);
      }
    } catch (err) {
      console.error("Fetch rules error:", err);
    }
  };

  useEffect(() => {
    fetchRules();
  }, [token]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/rules/system-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setMsg("Tizimning global moliyaviy va komissiya qoidalari muvaffaqiyatli yangilandi!");
        setTimeout(() => setMsg(""), 4000);
      }
    } catch (err) {
      console.error("Save settings error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePricingRule = (idx: number, field: string, value: number) => {
    const updated = [...pricingRules];
    updated[idx] = { ...updated[idx], [field]: value };
    setPricingRules(updated);
  };

  const handleSavePricing = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/rules/pricing", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ pricingRules })
      });
      if (res.ok) {
        setMsg("Transport tariflari va tog' yo'li koeffitsiyentlari yangilandi!");
        setTimeout(() => setMsg(""), 4000);
      }
    } catch (err) {
      console.error("Save pricing error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6" id="admin-rules-hub">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Dynamic Rules & Pricing Engine</h2>
            <p className="text-xs text-slate-500">Global komissiya, faktoring foizlari, tariflar va tog' koeffitsiyentlari</p>
          </div>
        </div>
      </div>

      {msg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {msg}
        </div>
      )}

      {/* Global Financial Settings Form */}
      <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            Global Platforma & Faktoring Parametrlari
          </h3>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95"
          >
            <Save className="w-4 h-4" /> {saving ? "Saqlanmoqda..." : "Parametrlarni Saqlash"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 uppercase mb-1">Global Komissiya (%)</label>
            <input
              type="number"
              step="0.1"
              value={settings.globalPlatformFeePct}
              onChange={(e) => setSettings({ ...settings, globalPlatformFeePct: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold font-mono outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase mb-1">Faktoring Avans Stavksi (%)</label>
            <input
              type="number"
              step="0.5"
              value={settings.factoringAdvanceRatePct}
              onChange={(e) => setSettings({ ...settings, factoringAdvanceRatePct: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold font-mono outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase mb-1">Faktoring Diskont (%)</label>
            <input
              type="number"
              step="0.05"
              value={settings.factoringDiscountRatePct}
              onChange={(e) => setSettings({ ...settings, factoringDiscountRatePct: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold font-mono outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase mb-1">QQS / NDS Stavksi (%)</label>
            <input
              type="number"
              step="1"
              value={settings.taxVatRatePct}
              onChange={(e) => setSettings({ ...settings, taxVatRatePct: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold font-mono outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase mb-1">Tezkor Yechib Olish Komissiyasi (%)</label>
            <input
              type="number"
              step="0.1"
              value={settings.instantPayoutFeePct}
              onChange={(e) => setSettings({ ...settings, instantPayoutFeePct: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold font-mono outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase mb-1">Avtomatik Eskrou Chiqarish (soat)</label>
            <input
              type="number"
              step="1"
              value={settings.autoEscrowReleaseHours}
              onChange={(e) => setSettings({ ...settings, autoEscrowReleaseHours: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold font-mono outline-none"
            />
          </div>
        </div>
      </form>

      {/* Vehicle Type Pricing Rules */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-600" />
            Avtomashina Turlari Bo'yicha Baza Narxlar & Tog' Koeffitsiyentlari
          </h3>
          <button
            onClick={handleSavePricing}
            disabled={saving}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors"
          >
            Tariflarni Saqlash
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                <th className="pb-2">Avtomashina Turi</th>
                <th className="pb-2">Baza Chiqish (UZS)</th>
                <th className="pb-2">1 km Narxi (UZS)</th>
                <th className="pb-2">Tog' Dovoni Koeff. (A373)</th>
                <th className="pb-2">Tungi Qo'shimcha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pricingRules.map((r, idx) => (
                <tr key={r.id}>
                  <td className="py-3 font-bold text-slate-900">{r.vehicleType}</td>
                  <td className="py-3">
                    <input
                      type="number"
                      value={r.baseFareSom}
                      onChange={(e) => handleUpdatePricingRule(idx, "baseFareSom", Number(e.target.value))}
                      className="w-28 px-2.5 py-1 border border-slate-200 rounded-lg font-mono font-bold"
                    />
                  </td>
                  <td className="py-3">
                    <input
                      type="number"
                      value={r.pricePerKmSom}
                      onChange={(e) => handleUpdatePricingRule(idx, "pricePerKmSom", Number(e.target.value))}
                      className="w-28 px-2.5 py-1 border border-slate-200 rounded-lg font-mono font-bold"
                    />
                  </td>
                  <td className="py-3">
                    <input
                      type="number"
                      step="0.05"
                      value={r.mountainPassMultiplier}
                      onChange={(e) => handleUpdatePricingRule(idx, "mountainPassMultiplier", Number(e.target.value))}
                      className="w-20 px-2.5 py-1 border border-slate-200 rounded-lg font-mono font-bold text-amber-600"
                    />
                  </td>
                  <td className="py-3">
                    <input
                      type="number"
                      step="0.05"
                      value={r.nightSurgeMultiplier}
                      onChange={(e) => handleUpdatePricingRule(idx, "nightSurgeMultiplier", Number(e.target.value))}
                      className="w-20 px-2.5 py-1 border border-slate-200 rounded-lg font-mono font-bold"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Commission Tiers */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
          <Percent className="w-4 h-4 text-purple-600" />
          Mijoz & Korporativ Hamkorlik Darajalari (Tier System)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {commissionRules.map(tier => (
            <div key={tier.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 text-sm block">{tier.tierName}</span>
              <div className="text-xs text-slate-600 space-y-1">
                <div>Komissiya: <strong className="text-purple-700 font-bold">{tier.commissionRatePct}%</strong></div>
                <div>Faktoring diskonti: <strong className="text-slate-800">{tier.factoringDiscountPct}%</strong></div>
                <div>Shaxsiy menejer: <strong className="text-slate-800">{tier.dedicatedManager ? "Mavjud ✅" : "Yo'q"}</strong></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default EnterpriseAdminRulesHub;
