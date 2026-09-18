import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Key,
  Smartphone,
  History,
  Lock,
  Trash2,
  CheckCircle2,
  AlertOctagon,
  Copy,
  QrCode
} from "lucide-react";
import { UserDevice, LoginHistoryRecord, ApiKeyMetadata } from "../types";

interface Props {
  token: string;
}

export const EnterpriseSecuritySuite: React.FC<Props> = ({ token }) => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [devices, setDevices] = useState<UserDevice[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistoryRecord[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeyMetadata[]>([]);
  const [activeTab, setActiveTab] = useState<"2fa" | "devices" | "sessions" | "apikeys">("2fa");
  const [totpSetup, setTotpSetup] = useState<{ secret: string; qrCodeUri: string } | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const fetchSecurityOverview = async () => {
    try {
      const res = await fetch("/api/security/overview", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTwoFactorEnabled(data.twoFactorEnabled);
        setDevices(data.devices || []);
        setLoginHistory(data.loginHistory || []);
        setApiKeys(data.apiKeys || []);
      }
    } catch (err) {
      console.error("Security overview fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchSecurityOverview();
  }, [token]);

  const handleStart2FA = async () => {
    try {
      const res = await fetch("/api/security/2fa/generate", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTotpSetup(data);
      }
    } catch (err) {
      console.error("2FA start error:", err);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpCode || totpCode.length < 6) return;
    try {
      const res = await fetch("/api/security/2fa/verify-and-enable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ code: totpCode })
      });
      if (res.ok) {
        setTwoFactorEnabled(true);
        setTotpSetup(null);
        setTotpCode("");
        setStatusMessage("2FA ikki bosqichli autentifikatsiya muvaffaqiyatli yoqildi!");
        setTimeout(() => setStatusMessage(""), 4000);
      }
    } catch (err) {
      console.error("2FA verify failed:", err);
    }
  };

  const handleDisable2FA = async () => {
    if (!confirm("2FA himoyasini o'chirmoqchimisiz?")) return;
    try {
      const res = await fetch("/api/security/2fa/disable", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setTwoFactorEnabled(false);
        setStatusMessage("2FA himoyasi o'chirildi.");
        setTimeout(() => setStatusMessage(""), 4000);
      }
    } catch (err) {
      console.error("2FA disable failed:", err);
    }
  };

  const handleRevokeDevice = async (id: string) => {
    try {
      const res = await fetch(`/api/security/devices/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setDevices(devices.filter(d => d.id !== id));
      }
    } catch (err) {
      console.error("Revoke device failed:", err);
    }
  };

  return (
    <div className="space-y-6" id="security-suite-center">
      {/* Header Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Enterprise Security Suite & Access Vault</h2>
            <p className="text-xs text-slate-500">2FA TOTP, sessiyalar, kirish jurnali va API xavfsizlik kalitlari</p>
          </div>
        </div>
        <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab("2fa")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "2fa" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            2FA / OTP Himoyasi
          </button>
          <button
            onClick={() => setActiveTab("devices")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "devices" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Qurilmalar ({devices.length})
          </button>
          <button
            onClick={() => setActiveTab("sessions")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "sessions" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Kirish Jurnali ({loginHistory.length})
          </button>
          <button
            onClick={() => setActiveTab("apikeys")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "apikeys" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            API Kalitlar ({apiKeys.length})
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {statusMessage}
        </div>
      )}

      {/* Tab: 2FA TOTP */}
      {activeTab === "2fa" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Ikki Bosqichli Himoya (2FA / TOTP)</h3>
              <p className="text-xs text-slate-500 mt-0.5">Google Authenticator, Microsoft Authenticator yoki Authy orqali xavfsizlik</p>
            </div>
            <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${
              twoFactorEnabled ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
            }`}>
              {twoFactorEnabled ? "Faollashtirilgan" : "O'chirilgan"}
            </span>
          </div>

          {!twoFactorEnabled ? (
            !totpSetup ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  2FA hisobingizni parollarni o'g'irlash yoki ruxsatsiz kirishlardan ishonchli himoya qiladi. Har safar tizimga kirishda mobil ilovangizdagi 6 xonali dinamik kod so'raladi.
                </p>
                <button
                  onClick={handleStart2FA}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-95"
                >
                  2FA ni sozlashni boshlash
                </button>
              </div>
            ) : (
              <form onSubmit={handleVerify2FA} className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-emerald-600" />
                  1. Authenticator ilovasida QR-kodni skanerlang yoki kalitni kiriting
                </h4>
                <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between font-mono text-xs">
                  <span className="text-slate-800 font-bold">{totpSetup.secret}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(totpSetup.secret);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="p-1.5 text-slate-500 hover:text-slate-700"
                    title="Nusxa olish"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                {copied && <span className="text-[11px] text-emerald-600 font-semibold">Nusxa olindi!</span>}

                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    2. Ilovada ko'ringan 6 xonali tasdiqlash kodini kiriting
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Masalan: 482910"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-lg font-mono tracking-widest text-center focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setTotpSetup(null)}
                    className="px-4 py-2 text-slate-600 text-xs font-semibold hover:bg-slate-200 rounded-xl"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
                  >
                    Tasdiqlash va Yoqish
                  </button>
                </div>
              </form>
            )
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 text-emerald-900 rounded-2xl border border-emerald-200 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold">Hisobingiz 2FA bilan to'liq himoyalangan.</p>
                  <p className="text-emerald-700 mt-0.5">Har bir yangi sessiya ochilganda TOTP kodi talab etiladi.</p>
                </div>
              </div>
              <button
                onClick={handleDisable2FA}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-xl text-xs transition-colors"
              >
                2FA Himoyasini o'chirish
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab: Devices */}
      {activeTab === "devices" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Faol Qurilmalar va Sessiyalar</h3>
            <span className="text-xs text-slate-400">Jami: {devices.length} ta qurilma</span>
          </div>
          <div className="divide-y divide-slate-100">
            {devices.map(dev => (
              <div key={dev.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{dev.deviceName}</h4>
                      {dev.isCurrentDevice && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full">
                          Joriy Qurilma
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {dev.browser} • {dev.os} • {dev.ipAddress} ({dev.location})
                    </p>
                  </div>
                </div>

                {!dev.isCurrentDevice && (
                  <button
                    onClick={() => handleRevokeDevice(dev.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Sessiyani bekor qilish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Login History */}
      {activeTab === "sessions" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Tizimga Kirish Jurnali & Xavf Tahlili</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {loginHistory.map(item => (
              <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{item.userEmail}</span>
                    <span className="font-mono text-slate-500">({item.ipAddress})</span>
                    <span className="text-slate-400">📍 {item.location}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono truncate max-w-md">
                    {item.userAgent}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-full">
                    {item.status.toUpperCase()}
                  </span>
                  <div className="text-[11px] text-slate-400 mt-1 font-mono">
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: API Keys */}
      {activeTab === "apikeys" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Enterprise ERP & TMS API Kalitlari</h3>
              <p className="text-xs text-slate-500">1C, SAP va shaxsiy telemetriya tizimlarini ulash uchun xavfsiz tokenlar</p>
            </div>
          </div>

          <div className="space-y-3">
            {apiKeys.map(key => (
              <div key={key.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-slate-700" />
                    <h4 className="font-bold text-slate-900 text-sm">{key.name}</h4>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-200 text-slate-800 rounded">
                      {key.keyPrefix}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Ruxsatlar:</span>
                    {key.scopes.map(s => (
                      <span key={s} className="px-2 py-0.5 text-[10px] font-mono bg-blue-50 text-blue-700 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <span>Muddati: <strong className="text-slate-800">{new Date(key.expiresAt).toLocaleDateString()}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default EnterpriseSecuritySuite;
