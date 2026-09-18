import React, { useState } from "react";
import { useTranslation } from "../context/LanguageContext";
import { 
  UserCheck, 
  ShieldCheck, 
  FileText, 
  Camera, 
  AlertTriangle 
} from "lucide-react";

interface VerificationProps {
  verForm: any;
  onFormChange: (val: any) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  localProfile: any;
}

export default function DriverVerificationTab({
  verForm,
  onFormChange,
  onSubmit,
  localProfile
}: VerificationProps) {
  const { t } = useTranslation();
  const [loadingLocal, setLoadingLocal] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Fayl hajmi 10MB dan kichik bo'lishi lozim.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onFormChange({ ...verForm, [fieldName]: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const getVerificationStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved": return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
      case "pending": return "bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse";
      case "rejected": return "bg-rose-500/10 border-rose-500/30 text-rose-400";
      default: return "bg-zinc-500/10 border-zinc-500/30 text-zinc-400";
    }
  };

  const getVerificationStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved": return "Tasdiqlangan • Active Professional Driver";
      case "pending": return "Tekshirilmoqda • Audit Under Review";
      case "rejected": return "Rad etilgan • Document Rejected";
      default: return "Hujjatlar to'ldirilmagan • Missing Info";
    }
  };

  return (
    <div className="bg-[#120b2e]/40 border border-purple-500/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-xs">
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="pb-5 border-b border-white/5 space-y-1 mb-6">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-purple-400" />
          <span>Haydovchi Identifikatsiyasi va Professional Audit</span>
        </h3>
        <p className="text-white/40 text-xs">Yuk buyurtmalari birjasiga kirish va litsenziya olish uchun shaxsingizni tasdiqlovchi hujjatlarni yuboring</p>
      </div>

      <div className={`p-4 rounded-2xl border mb-6 flex items-center gap-3 font-semibold ${getVerificationStatusColor(localProfile.verificationStatus || "pending")}`}>
        <ShieldCheck className="w-5 h-5 text-current" />
        <div>
          <span className="block text-[10px] text-white/50 uppercase leading-none font-bold">Tekshiruv Statusingiz:</span>
          <p className="text-sm font-bold text-white mt-1">{getVerificationStatusLabel(localProfile.verificationStatus || "pending")}</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6 text-white/80">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-white/60 block font-semibold">Haydovchilik guvohnomasi seriyasi va raqami (License No)</label>
            <input 
              type="text" 
              value={verForm.driverLicenseNo || ""}
              onChange={(e) => onFormChange({ ...verForm, driverLicenseNo: e.target.value.toUpperCase() })}
              placeholder="Masalan: AF1234567"
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-purple-500 text-white outline-none uppercase font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-white/60 block font-semibold">Guvohnomaning amal qilish muddati (Expiry)</label>
            <input 
              type="date" 
              value={verForm.driverLicenseExpiry || ""}
              onChange={(e) => onFormChange({ ...verForm, driverLicenseExpiry: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-purple-500 text-white outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col justify-between items-start space-y-3">
            <div>
              <span className="font-bold text-white block text-[11px]">Haydovchilik guvohnomasi nusxasi (old tomoni)</span>
              <span className="text-[10px] text-white/40 block mt-0.5">Yozuvlari aniq o'qiladigan rangli rasm.</span>
            </div>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => handleFileUpload(e, "driverLicenseDoc")}
              className="text-[10px] text-white/40"
            />
            {verForm.driverLicenseDoc && (
              <span className="text-[10px] text-green-400 font-semibold font-mono uppercase bg-green-500/10 px-2 py-0.5 rounded-md">Yuklandi ✅</span>
            )}
          </div>

          <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col justify-between items-start space-y-3">
            <div>
              <span className="font-bold text-white block text-[11px]">Texnik Pasport nusxasi (barcha tomonlari)</span>
              <span className="text-[10px] text-white/40 block mt-0.5">Avtotransport davlat raqami ko'rsatilgan varog'i.</span>
            </div>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => handleFileUpload(e, "vehicleRegistrationDoc")}
              className="text-[10px] text-white/40"
            />
            {verForm.vehicleRegistrationDoc && (
              <span className="text-[10px] text-green-400 font-semibold font-mono uppercase bg-green-500/10 px-2 py-0.5 rounded-md">Yuklandi ✅</span>
            )}
          </div>

          <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col justify-between items-start space-y-3">
            <div>
              <span className="font-bold text-white block text-[11px]">Pasport yoki ID-karta bilan selfie rasm</span>
              <span className="text-[10px] text-white/40 block mt-0.5">Hujjat yuzingiz bilan birga aniq ko'rinsin.</span>
            </div>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => handleFileUpload(e, "identityVerificationDoc")}
              className="text-[10px] text-white/40"
            />
            {verForm.identityVerificationDoc && (
              <span className="text-[10px] text-green-400 font-semibold font-mono uppercase bg-green-500/10 px-2 py-0.5 rounded-md">Yuklandi ✅</span>
            )}
          </div>

          <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col justify-between items-start space-y-3">
            <div>
              <span className="font-bold text-white block text-[11px]">Avtomobil tashqi tasviri rasmlari</span>
              <span className="text-[10px] text-white/40 block mt-0.5">Mashina oldi va orqasidan aniq olingan burchak.</span>
            </div>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => handleFileUpload(e, "vehiclePhotosDoc")}
              className="text-[10px] text-white/40"
            />
            {verForm.vehiclePhotosDoc && (
              <span className="text-[10px] text-green-400 font-semibold font-mono uppercase bg-green-500/10 px-2 py-0.5 rounded-md">Yuklandi ✅</span>
            )}
          </div>
        </div>

        <button 
          type="submit"
          disabled={loadingLocal}
          className="w-full bg-purple-650 hover:bg-purple-550 text-white font-extrabold py-3.5 px-6 rounded-2xl text-[11px] uppercase tracking-widest transition cursor-pointer text-center"
        >
          Ma'lumotlarni tekshiruvga yuborish (Submit Audit Material)
        </button>
      </form>
    </div>
  );
}
