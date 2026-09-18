import React, { useState } from "react";
import { User } from "../types";
import { useTranslation } from "../context/LanguageContext";
import { COUNTRIES } from "../locationData";
import MapLocationPicker from "./MapLocationPicker";
import CameraCapture from "./CameraCapture";
import { 
  User as UserIcon, 
  MapPin, 
  Camera, 
  Compass, 
  Settings, 
  Check 
} from "lucide-react";

interface ProfileTabProps {
  localProfile: any;
  onProfileChange: (p: any) => void;
  onSave: (e: React.FormEvent) => Promise<void>;
  globalLoading: boolean;
}

export default function DriverProfileTab({
  localProfile,
  onProfileChange,
  onSave,
  globalLoading
}: ProfileTabProps) {
  const { t } = useTranslation();
  const uzbekistan = COUNTRIES.find(c => c.code === "UZ") || COUNTRIES[0];
  const selectedRegionName = localProfile.region || "Toshkent shahri";
  const selectedRegionObj = uzbekistan.regions.find(r => r.nameUz === selectedRegionName || r.nameEn === selectedRegionName) || uzbekistan.regions[0];
  const availableDistricts = selectedRegionObj ? selectedRegionObj.districts : [];

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Profil rasmi hajmi 5MB dan kichik bo'lishi lozim.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onProfileChange({ ...localProfile, profilePhoto: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLocationPickerChange = (pickerData: any) => {
    onProfileChange({
      ...localProfile,
      region: pickerData.region,
      district: pickerData.district,
      city: pickerData.district,
      address: pickerData.address,
      registrationPosition: pickerData.lat && pickerData.lng ? `${pickerData.lat},${pickerData.lng}` : localProfile.registrationPosition
    });
  };

  return (
    <div className="bg-[#120b2e]/40 border border-purple-500/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden animate-fade-in text-xs">
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="pb-4 border-b border-white/5 mb-6 space-y-1">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-400 font-bold" />
          <span>Shaxsiy Profil va Sozlamalar • Settings panel</span>
        </h3>
        <p className="text-white/40 text-[11px]">Dilerlik tizimidagi shaxsiy ma'lumotlaringizni yangilash va faol yuk qidirish nuqtasini sozlash</p>
      </div>

      <form onSubmit={onSave} className="space-y-6 text-white/80">
        
        {/* Profile Avatar Upload & Camera Capture Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-white/5 rounded-2xl border border-white/5">
          <div className="flex items-center gap-5">
            <div className="relative group shrink-0">
              {localProfile.profilePhoto ? (
                <img 
                  src={localProfile.profilePhoto} 
                  alt="Avatar" 
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-purple-500/30" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-[#0f041d] border border-white/10 flex items-center justify-center text-xl font-bold">
                  {localProfile.name?.charAt(0) || "D"}
                </div>
              )}
              <label className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-150 cursor-pointer text-white" title="Rasm yuklash">
                <Camera className="w-5 h-5" />
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden" 
                />
              </label>
            </div>

            <div className="space-y-1 text-left flex-1">
              <h4 className="text-sm font-bold text-white">{localProfile.name || "Dilerlik Haydovchisi"}</h4>
              <p className="text-[10px] text-white/40">Rasm o'zgartirish uchun ustiga bosing yoki fayl yuklang.</p>
              <span className="text-[9.5px] uppercase font-bold text-purple-300 font-mono tracking-widest bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">Active driver ID: #{localProfile.id?.slice(0, 8).toUpperCase()}</span>
            </div>
          </div>

          <div className="border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 flex flex-col justify-center">
            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider mb-2 block">Profil rasmini kameradan olish:</span>
            <CameraCapture
              onCapture={(img) => onProfileChange({ ...localProfile, profilePhoto: img })}
              initialPhoto={localProfile.profilePhoto}
            />
          </div>
        </div>

        {/* Text parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-white/60 block font-semibold">Tug'ilgan kuningizdagi to'liq Ismingiz (Full Name)</label>
            <input 
              type="text"
              value={localProfile.name || ""}
              onChange={(e) => onProfileChange({ ...localProfile, name: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-purple-500 text-white outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-white/60 block font-semibold">Kontakt Telefon raqamingiz (Mobile)</label>
            <input 
              type="text"
              value={localProfile.phone || ""}
              onChange={(e) => onProfileChange({ ...localProfile, phone: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-purple-500 text-white outline-none"
            />
          </div>
        </div>

        {/* Structured dropdowns instead of manual region entry */}
        <div className="space-y-4 bg-white/5 p-4 rounded-2xl border border-white/5">
          <div>
            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest">Hududni tanlash • Regional Selectors (Mandatory)</h4>
            <p className="text-[10.5px] text-white/40 mt-0.5">Avtomatik tumanlarni yuklash uchun hududni dropdown orqali bosing</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 block">
              <label className="text-white/60 block font-semibold text-[10.5px]">Viloyat (State Region)</label>
              <select 
                value={selectedRegionName}
                onChange={(e) => {
                  const regName = e.target.value;
                  const regObj = uzbekistan.regions.find(r => r.nameUz === regName);
                  const firstDistrict = regObj && regObj.districts.length > 0 ? regObj.districts[0].nameUz : "";
                  onProfileChange({
                    ...localProfile,
                    region: regName,
                    district: firstDistrict,
                    city: firstDistrict
                  });
                }}
                className="w-full bg-white/10 border border-white/10 rounded-xl p-3 focus:border-purple-500 text-white outline-none font-semibold cursor-pointer"
              >
                {uzbekistan.regions.map((r, i) => (
                  <option key={i} value={r.nameUz} className="bg-[#100720]">{r.nameUz}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1 block">
              <label className="text-white/60 block font-semibold text-[10.5px]">Tuman / Shahar (Local District)</label>
              <select 
                value={localProfile.district || localProfile.city || ""}
                onChange={(e) => {
                  onProfileChange({
                    ...localProfile,
                    district: e.target.value,
                    city: e.target.value
                  });
                }}
                className="w-full bg-white/10 border border-white/10 rounded-xl p-3 focus:border-purple-500 text-white outline-none font-semibold cursor-pointer"
              >
                {availableDistricts.map((d, i) => (
                  <option key={i} value={d.nameUz} className="bg-[#100720]">{d.nameUz}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Map selection box */}
        <div className="space-y-2">
          <div>
            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest">Xaritadan aniq kordinata olish (Map Location Picker)</h4>
            <p className="text-[10.5px] text-white/40 mt-0.5">Xarita orqali GPS manzilni tanlab, kordinatalarini yangilang</p>
          </div>

          <div className="bg-black/20 p-2.5 rounded-2xl border border-white/5">
            <MapLocationPicker 
              label="Amaldagi GPS To'xtash Manzili"
              value={{
                country: "O'zbekiston",
                region: localProfile.region || "Toshkent shahri",
                district: localProfile.district || "Yunusobod",
                address: localProfile.address || "",
                lat: localProfile.registrationPosition ? parseFloat(localProfile.registrationPosition.split(",")[0]) || 41.2995 : 41.2995,
                lng: localProfile.registrationPosition ? parseFloat(localProfile.registrationPosition.split(",")[1]) || 69.2401 : 69.2401
              }}
              onChange={handleLocationPickerChange}
              accentColor="purple"
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={globalLoading}
          className="w-full bg-purple-650 hover:bg-purple-550 text-white font-extrabold py-3.5 px-6 rounded-2xl text-[11px] uppercase tracking-widest transition cursor-pointer text-center shadow-lg shadow-purple-950/40"
        >
          Tizimdagi barcha ma'lumotlarni yangilash (Save Profile info)
        </button>
      </form>
    </div>
  );
}
