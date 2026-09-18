import React, { useState } from "react";
import { usePermissions, PermissionState } from "../context/PermissionContext";
import { useTranslation } from "../context/LanguageContext";
import { 
  MapPin, Camera, Image, Bell, FileText, Phone, Fingerprint, Mic, 
  HelpCircle, Shield, AlertTriangle, CheckCircle2, Info, Moon, Sun, 
  Laptop, Smartphone, Tablet, Wifi, Battery, RefreshCw, Eye, SignalHigh, Check, X, ShieldAlert
} from "lucide-react";

export default function PermissionsManagerTab() {
  const { 
    permissions, 
    network, 
    battery, 
    gps, 
    device, 
    systemTheme, 
    manualThemeOverride, 
    setManualThemeOverride,
    requestPermission, 
    resetPermission, 
    simulateGpsDegradation,
    triggerBiometricAuth
  } = usePermissions();

  const { t, currentLang, changeLang } = useTranslation();
  const [biometricSuccess, setBiometricSuccess] = useState<boolean | null>(null);
  const [testingBiometrics, setTestingBiometrics] = useState(false);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "granted":
        return {
          text: currentLang === "uz" ? "Ruxsat berilgan" : currentLang === "ru" ? "Разрешено" : "Granted",
          class: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        };
      case "denied":
        return {
          text: currentLang === "uz" ? "Rad etilgan" : currentLang === "ru" ? "Отклонено" : "Denied",
          class: "bg-red-500/10 border-red-500/20 text-red-400",
          icon: <X className="w-3.5 h-3.5 text-red-400" />
        };
      case "disabled":
        return {
          text: currentLang === "uz" ? "O'chirilgan (Tez kunda)" : currentLang === "ru" ? "Отключено" : "Disabled (Soon)",
          class: "bg-white/5 border-white/10 text-white/40",
          icon: <ShieldAlert className="w-3.5 h-3.5 text-white/30" />
        };
      default:
        return {
          text: currentLang === "uz" ? "Ruxsat so'ralmagan" : currentLang === "ru" ? "Ожидание" : "Prompt Required",
          class: "bg-amber-500/10 border-amber-500/20 text-amber-400",
          icon: <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
        };
    }
  };

  const handleTestBiometrics = async () => {
    setTestingBiometrics(true);
    setBiometricSuccess(null);
    try {
      const ok = await triggerBiometricAuth("Shaxsiy sozlamalarga kirishni tasdiqlash");
      setBiometricSuccess(ok);
    } catch (err) {
      setBiometricSuccess(false);
    } finally {
      setTestingBiometrics(false);
    }
  };

  const permissionList: Array<{
    key: keyof PermissionState;
    title: string;
    desc: string;
    icon: React.ReactNode;
  }> = [
    {
      key: "location",
      title: "📍 GPS Joylashuv ruxsati • Location",
      desc: "Pickup va delivery manzillarini auto-aniqlash, yaqin haydovchilarni izlash va ETA yo'nalish hisoblash.",
      icon: <MapPin className="w-5 h-5 text-purple-400" />
    },
    {
      key: "camera",
      title: "📷 Qurilma kamerasi • Camera",
      desc: "Profil fotosi, haydovchi verifikatsiyasi, yuk rasm-hujjatlari va topshirilganlik dalillarini suratga olish.",
      icon: <Camera className="w-5 h-5 text-purple-400" />
    },
    {
      key: "photoLibrary",
      title: "🖼 Rasmlar galereyasi • Photo Library",
      desc: "Qurilma xotirasidan yuk suratlari va ro'yxatdan o'tish hujjatlarini platformaga yuklash.",
      icon: <Image className="w-5 h-5 text-purple-400" />
    },
    {
      key: "notifications",
      title: "🔔 Tizim bildirishnomalari • Notifications",
      desc: "Buyurtmalar yangilanishi, haydovchi kelishi, chat xabarlari va balans hisob-kitoblaridan onlayn xabardor bo'lish.",
      icon: <Bell className="w-5 h-5 text-purple-400" />
    },
    {
      key: "fileAccess",
      title: "📁 Fayllar tizimi • File Access",
      desc: "Elektron logistika shartnomalari, PDF hisob-fakturalari va auksion kvitansiyalarini yuklash.",
      icon: <FileText className="w-5 h-5 text-purple-400" />
    },
    {
      key: "microphone",
      title: "🎤 Mikrofon ruxsati • Microphone",
      desc: "Ovozli qidiruv, ovoz orqali buyurtma berish va haydovchilar bilan tezkor ovozli chat (Tez kunda faollashadi).",
      icon: <Mic className="w-5 h-5 text-white/30" />
    },
    {
      key: "phone",
      title: "📞 Telefon qo'ng'iroqlari • Phone Calls",
      desc: "Haydovchi va mijoz o'rtasida telefon raqamini termasdan bir marta bosish orqali to'g'ridan-to'g'ri bog'lanish.",
      icon: <Phone className="w-5 h-5 text-purple-400" />
    },
    {
      key: "biometrics",
      title: "🔒 Biometrik kalit • Touch ID & Face ID",
      desc: "Shaxsiy balans, pul yechish operatsiyalari va xavfsiz sozlamalarni FaceID/TouchID orqali tasdiqlash.",
      icon: <Fingerprint className="w-5 h-5 text-purple-400" />
    }
  ];

  return (
    <div className="space-y-8 pb-12 text-white">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#dda15e] uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4 text-purple-400" />
            <span>YukLa Security & Core Services</span>
          </div>
          <h2 className="text-xl font-black">Xavfsizlik va Ruxsatnomalar Markazi</h2>
          <p className="text-xs text-white/50 leading-relaxed mt-1">
            YukLa platformasi faqat kerakli ruxsatnomalardan kontekstual foydalanadi. O'zingiz boshqaring.
          </p>
        </div>

        {/* Global Reset All Mock Settings */}
        <button
          onClick={() => {
            localStorage.removeItem("yukla_permissions");
            window.location.reload();
          }}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-xs text-white/80 font-bold uppercase transition flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Barcha ruxsatlarni tiklash</span>
        </button>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Permission Card List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-purple-400 flex items-center gap-2 mb-2">
            <span>Ruxsatlar ro'yxati</span>
            <span className="h-1 flex-1 bg-gradient-to-r from-purple-500/20 to-transparent rounded"></span>
          </h3>

          <div className="space-y-3">
            {permissionList.map((item) => {
              const status = permissions[item.key];
              const badge = getStatusLabel(status);
              const isDisabled = item.key === "microphone";

              return (
                <div 
                  key={item.key}
                  className={`p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-purple-500/10 hover:bg-white/[0.03] transition flex flex-col md:flex-row items-start justify-between gap-4 ${
                    isDisabled ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex gap-3.5 items-start">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/15 flex items-center justify-center shrink-0 mt-0.5">
                      {item.icon}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-xs font-black text-white">{item.title}</h4>
                        <span className={`px-2 py-0.5 rounded-md border text-[9px] font-bold font-mono tracking-wider flex items-center gap-1 ${badge.class}`}>
                          {badge.icon}
                          <span>{badge.text}</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-white/50 leading-relaxed max-w-lg">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  {/* Operational Controls */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    {!isDisabled && status !== "granted" && (
                      <button
                        onClick={() => requestPermission(item.key)}
                        className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10.5px] uppercase tracking-wide rounded-xl shadow-lg transition cursor-pointer"
                      >
                        Faollashtirish
                      </button>
                    )}

                    {!isDisabled && status === "granted" && (
                      <button
                        onClick={() => resetPermission(item.key)}
                        className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-semibold text-[10.5px] rounded-xl transition border border-white/5 cursor-pointer"
                      >
                        Bekor qilish
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Dynamic Hardware status, Connectivity, Theme, Biometrics */}
        <div className="space-y-6">
          
          {/* Section 1: Hardware & Signal HUD */}
          <div className="p-5 rounded-2xl bg-[#120b2e]/60 border border-purple-500/15 relative overflow-hidden space-y-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none"></div>
            
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#dda15e] flex items-center gap-2 border-b border-white/5 pb-3">
              <SignalHigh className="w-4 h-4 text-purple-400" />
              <span>Texnik Datchiklar & HUD</span>
            </h3>

            {/* GPS Signal Block */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/40 font-mono">GPS Signal kuchi:</span>
                <span className={`font-black font-mono uppercase text-[10px] px-2 py-0.5 rounded border ${
                  gps.accuracy === "excellent" 
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : gps.accuracy === "good"
                    ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                    : "bg-red-500/10 border-red-500/20 text-red-400 animate-pulse"
                }`}>
                  {gps.accuracy === "excellent" ? "Alo • Excellent" : gps.accuracy === "good" ? "O'rtacha • Good" : "Zaif • Weak"}
                </span>
              </div>
              
              {/* Quality Bar */}
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden flex">
                <div 
                  className={`h-full transition-all duration-300 ${
                    gps.accuracy === "excellent" ? "w-full bg-emerald-500" : gps.accuracy === "good" ? "w-[60%] bg-blue-500" : "w-[20%] bg-red-500"
                  }`}
                />
              </div>

              {gps.accuracy === "weak" && (
                <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] text-red-400 leading-normal flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>GPS aloqasi zaif. To'g'ri ishlashi uchun bino tashqarisiga chiqing yoki ochiq maydonga o'ting.</span>
                </div>
              )}

              {/* Degrade signal simulator */}
              <button
                onClick={simulateGpsDegradation}
                className="w-full mt-1.5 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-[9.5px] uppercase font-bold text-white/70 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>GPS signali o'zgarishini sinash</span>
              </button>
            </div>

            {/* Network Quality Indicator */}
            <div className="border-t border-white/5 pt-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/40 font-mono">Tarmoq tezligi (Speed):</span>
                <span className="font-bold text-white uppercase font-mono text-[10px]">
                  {network.type === "fast" ? "⚡ Tezkor (Fast 4G/Wifi)" : network.type === "medium" ? "3G O'rtacha" : network.type === "slow" ? "🐢 Sekin (2G)" : "Oflayn"}
                </span>
              </div>
              <p className="text-[10px] text-white/40 leading-relaxed">
                {network.type === "fast" 
                  ? "YukLa avtomatik ravishda yuqori sifatli rasmlarni yuklaydi." 
                  : "Sekin internet aniqlandi. YukLa rasmlarni siqadi va yuklanish tezligini oshirish uchun kichraytiradi."
                }
              </p>
            </div>

            {/* Battery Saver Block */}
            <div className="border-t border-white/5 pt-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/40 font-mono">Akkumulyator (Battery):</span>
                <span className="font-bold text-white font-mono flex items-center gap-1.5">
                  <Battery className="w-4 h-4 text-purple-400" />
                  <span>{Math.round(battery.level * 100)}%</span>
                  {battery.charging && <span className="text-[9px] text-green-400">(Quvvatlanmoqda)</span>}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10.5px]">
                <span className="text-white/40">Batareya tejash (Eco):</span>
                <span className={`px-2 py-0.5 rounded font-bold font-mono text-[9px] ${
                  battery.batterySaver 
                    ? "bg-green-500/10 text-green-400 border border-green-500/25" 
                    : "bg-white/5 text-white/40"
                }`}>
                  {battery.batterySaver ? "YONIQ" : "O'CHIQ"}
                </span>
              </div>
              {battery.batterySaver && (
                <p className="text-[10px] text-green-400/80 leading-normal">
                  Batareya quvvati pastligi sababli animatsiyalar kamaytirildi va GPS datchik chastotasi tejamkor rejimga o'tkazildi.
                </p>
              )}
            </div>

            {/* Device Info */}
            <div className="border-t border-white/5 pt-3.5 space-y-1 text-[11px] font-mono text-white/50">
              <div className="flex justify-between">
                <span>Qurilma turi:</span>
                <span className="text-white/80 font-bold flex items-center gap-1">
                  {device.type === "desktop" ? <Laptop className="w-3.5 h-3.5" /> : device.type === "tablet" ? <Tablet className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
                  <span className="capitalize">{device.type}</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span>Operatsion tizim:</span>
                <span className="text-white/80 font-bold">{device.os}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Biometric Test Simulator */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#dda15e] flex items-center gap-2 border-b border-white/5 pb-3">
              <Fingerprint className="w-4 h-4 text-purple-400" />
              <span>Biometrik Himoya Testi</span>
            </h3>

            <p className="text-[11px] text-white/50 leading-relaxed">
              Bu yerda qurilmangizning Face ID, Touch ID yoki Windows Hello sensorini YukLa tizimi bilan integratsiyasini sinab ko'rishingiz mumkin.
            </p>

            <button
              onClick={handleTestBiometrics}
              disabled={testingBiometrics}
              className="w-full py-2.5 bg-purple-600/20 hover:bg-purple-600 text-white font-bold text-xs uppercase tracking-wide rounded-xl border border-purple-500/30 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {testingBiometrics ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Datchik kutilmoqda...</span>
                </>
              ) : (
                <>
                  <Fingerprint className="w-3.5 h-3.5" />
                  <span>Biometriyani sinash</span>
                </>
              )}
            </button>

            {biometricSuccess !== null && (
              <div className={`p-3 rounded-xl border text-xs leading-normal flex items-start gap-2 ${
                biometricSuccess 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}>
                {biometricSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Muvaffaqiyatli! Biometrik shaxsiy kalit tasdiqlandi. Tranzaksiyalar uchun foydalanishga tayyor.</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Xatolik! Biometrik autentifikatsiya bekor qilindi yoki sensor aniqlamadi.</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Section 3: System Theme Mode Control */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#dda15e] flex items-center gap-2 border-b border-white/5 pb-3">
              <Moon className="w-4 h-4 text-purple-400" />
              <span>Tizim Mavzusi • Theme</span>
            </h3>

            <p className="text-[11px] text-white/50 leading-relaxed">
              O'zbekiston bo'ylab kechasi va kunduzi haydashda ko'zga qulay bo'lishi uchun mavzuni boshqaring.
            </p>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setManualThemeOverride(null)}
                className={`py-2 px-1 text-[10px] font-bold uppercase rounded-lg border transition cursor-pointer ${
                  manualThemeOverride === null
                    ? "bg-purple-600/20 border-purple-500 text-purple-400"
                    : "bg-transparent border-white/5 text-white/60 hover:bg-white/5"
                }`}
              >
                Auto (System)
              </button>

              <button
                onClick={() => setManualThemeOverride("dark")}
                className={`py-2 px-1 text-[10px] font-bold uppercase rounded-lg border transition flex items-center justify-center gap-1 cursor-pointer ${
                  manualThemeOverride === "dark"
                    ? "bg-purple-600/20 border-purple-500 text-purple-400"
                    : "bg-transparent border-white/5 text-white/60 hover:bg-white/5"
                }`}
              >
                <Moon className="w-3 h-3" />
                <span>Dark</span>
              </button>

              <button
                onClick={() => setManualThemeOverride("light")}
                className={`py-2 px-1 text-[10px] font-bold uppercase rounded-lg border transition flex items-center justify-center gap-1 cursor-pointer ${
                  manualThemeOverride === "light"
                    ? "bg-purple-600/20 border-purple-500 text-purple-400"
                    : "bg-transparent border-white/5 text-white/60 hover:bg-white/5"
                }`}
              >
                <Sun className="w-3 h-3" />
                <span>Light</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
