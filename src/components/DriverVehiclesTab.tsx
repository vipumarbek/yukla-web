import React, { useState } from "react";
import { Vehicle } from "../types";
import { useTranslation } from "../context/LanguageContext";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Truck, 
  CheckCircle2, 
  AlertTriangle,
  X,
  Camera,
  FileText
} from "lucide-react";

const VEHICLE_TYPES = [
  "Labo", 
  "Bongo", 
  "Furgon", 
  "ISUZU 5", 
  "ISUZU 10", 
  "Gruzovik", 
  "Fura Tent", 
  "Fura Budka", 
  "Refrejirator", 
  "Paravoz", 
  "Shalanda"
];

interface DriverVehiclesProps {
  vehicles: Vehicle[];
  onRegisterOrEdit: (veh: any, editingId: string | null) => Promise<void>;
  onSetActive: (id: string, active: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  globalLoading: boolean;
}

export default function DriverVehiclesTab({
  vehicles,
  onRegisterOrEdit,
  onSetActive,
  onDelete,
  globalLoading
}: DriverVehiclesProps) {
  const { t } = useTranslation();
  const [showingModal, setShowingModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [vehDraft, setVehDraft] = useState({
    vehicleType: "Labo",
    licensePlateNumber: "",
    vehicleBrand: "",
    vehicleModel: "",
    manufacturingYear: "2024",
    vehicleColor: "Oq (White)",
    vehicleCapacity: "1000",
    vehicleDimensions: "2.5 x 1.4 x 1.6 m",
    vehiclePhoto: "",
    vehicleDocuments: "",
    active: true
  });

  const handleOpenEdit = (v: Vehicle) => {
    setEditingId(v.id);
    setVehDraft({
      vehicleType: v.vehicleType,
      licensePlateNumber: v.licensePlate || v.licensePlateNumber || "",
      vehicleBrand: v.brand || "",
      vehicleModel: v.model || "",
      manufacturingYear: String(v.year || "2024"),
      vehicleColor: v.color || "Oq (White)",
      vehicleCapacity: String(v.capacity || "1000"),
      vehicleDimensions: v.dimensions || "2.5 x 1.4 x 1.6 m",
      vehiclePhoto: v.vehiclePhoto || "",
      vehicleDocuments: v.vehicleDocuments || "",
      active: v.active !== false
    });
    setShowingModal(true);
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setVehDraft({
      vehicleType: "Labo",
      licensePlateNumber: "",
      vehicleBrand: "",
      vehicleModel: "",
      manufacturingYear: "2024",
      vehicleColor: "Oq (White)",
      vehicleCapacity: "1000",
      vehicleDimensions: "2.5 x 1.4 x 1.6 m",
      vehiclePhoto: "",
      vehicleDocuments: "",
      active: true
    });
    setShowingModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: "vehiclePhoto" | "vehicleDocuments") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Fayl hajmi 10MB dan kichik bo'lishi lozim.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setVehDraft(prev => ({ ...prev, [fieldName]: reader.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehDraft.licensePlateNumber || !vehDraft.vehicleBrand || !vehDraft.vehicleModel) {
      alert("Iltimos, avtomobil raqami, brend va modelini to'ldiring.");
      return;
    }
    await onRegisterOrEdit(vehDraft, editingId);
    setShowingModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-white/5 gap-3">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-purple-400" />
            <span>Mening Avtotransportlarim • My Fleet list</span>
          </h3>
          <p className="text-xs text-white/40">Yuklarni tashish uchun ruxsat berilgan fura va yuk mashinalaringiz ro'yxati</p>
        </div>

        <button 
          onClick={handleOpenCreate}
          className="bg-purple-650 hover:bg-purple-550 text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-widest flex items-center gap-2 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Mashina qo'shish</span>
        </button>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-16 bg-[#120b2e]/20 border border-dashed border-white/10 rounded-3xl space-y-3">
          <p className="text-4xl">🚚</p>
          <p className="text-sm font-semibold text-white/50">Hali yuk mashinangiz ro'yxatdan o'tkazilmagan.</p>
          <button 
            onClick={handleOpenCreate}
            className="mt-2 text-xs text-purple-400 font-extrabold hover:underline"
          >
            Sohangizga mos birinchi mashinani qo'shing →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vehicles.map((v) => (
            <div 
              key={v.id} 
              className={`backdrop-blur-md bg-[#120b2e]/40 border rounded-3xl p-5 shadow-xl transition relative flex flex-col justify-between ${
                v.active ? 'border-purple-500/30 shadow-purple-950/15' : 'border-white/5 opacity-65'
              }`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[9px] font-bold px-2 py-0.5 rounded-lg uppercase font-mono tracking-widest">
                      {v.vehicleType}
                    </span>
                    <h3 className="text-base font-extrabold text-white mt-1">{v.brand} {v.model}</h3>
                  </div>

                  <span className="bg-[#0f041d] border border-white/10 text-white font-mono font-bold text-xs px-3 py-1.5 rounded-xl uppercase">
                    {v.licensePlate || v.licensePlateNumber}
                  </span>
                </div>

                {v.vehiclePhoto ? (
                  <img 
                    src={v.vehiclePhoto} 
                    alt="Truck" 
                    className="w-full h-32 object-cover rounded-2xl border border-white/5" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-32 bg-black/40 rounded-2xl flex items-center justify-center border border-dashed border-white/10">
                    <Truck className="w-8 h-8 text-white/20" />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-[11px] text-white/50 font-mono">
                  <div className="bg-white/5 p-2 rounded-xl">Yili: <span className="text-white font-bold">{v.year || "2024"}</span></div>
                  <div className="bg-white/5 p-2 rounded-xl">Yuk sig'imi: <span className="text-white font-bold">{v.capacity} kg</span></div>
                  <div className="bg-white/5 p-2 rounded-xl col-span-2">O'lchamlari: <span className="text-white font-bold">{v.dimensions || "Amaldagi o'lcham"}</span></div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/5 flex justify-between items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-white/60">
                  <input 
                    type="checkbox" 
                    checked={v.active !== false}
                    onChange={(e) => onSetActive(v.id, e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500 bg-white/5 border-white/10 w-4 h-4 cursor-pointer"
                  />
                  <span>Faol foydalanish</span>
                </label>

                <div className="flex gap-1.5">
                  <button 
                    onClick={() => handleOpenEdit(v)}
                    className="bg-white/5 hover:bg-white/10 p-2 rounded-xl border border-white/10 transition text-white/80 cursor-pointer"
                    title="Tahrirlash"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button 
                    onClick={() => onDelete(v.id)}
                    className="bg-rose-950/20 hover:bg-rose-900/30 p-2 rounded-xl border border-rose-500/20 transition text-rose-400 cursor-pointer"
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Roster Add/Edit Modal */}
      {showingModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in text-xs">
          <div className="backdrop-blur-md bg-[#100720]/95 border border-purple-500/20 rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl relative text-white">
            <button 
              onClick={() => setShowingModal(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pb-3 border-b border-white/5">
              <h3 className="text-lg font-black text-white">{editingId ? "Mashinani tahrirlash" : "Yangi yuk mashinani qo'shish"}</h3>
              <p className="text-white/40 text-[11px] mt-0.5">Yuk tashuv zayavkalarini mosligini qidirish uchun to'ldiring</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-white/60 block font-semibold">Tashuv Turi (Vehicle Type)</label>
                  <select 
                    value={vehDraft.vehicleType}
                    onChange={(e) => setVehDraft(prev => ({ ...prev, vehicleType: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-purple-500 text-white outline-none font-semibold"
                  >
                    {VEHICLE_TYPES.map(vt => (
                      <option key={vt} value={vt} className="bg-[#100720]">{vt}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-white/60 block font-semibold">Gos. Raqami (License Plate)</label>
                  <input 
                    type="text"
                    value={vehDraft.licensePlateNumber}
                    onChange={(e) => setVehDraft(prev => ({ ...prev, licensePlateNumber: e.target.value.toUpperCase() }))}
                    placeholder="Masalan: 01A777AA"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-purple-500 text-white outline-none uppercase font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-white/60 block font-semibold">Brend (Brand)</label>
                  <input 
                    type="text"
                    value={vehDraft.vehicleBrand}
                    onChange={(e) => setVehDraft(prev => ({ ...prev, vehicleBrand: e.target.value }))}
                    placeholder="Masalan: Daewoo / Isuzu / Volvo"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-purple-500 text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-white/60 block font-semibold">Mashina Modeli (Model)</label>
                  <input 
                    type="text"
                    value={vehDraft.vehicleModel}
                    onChange={(e) => setVehDraft(prev => ({ ...prev, vehicleModel: e.target.value }))}
                    placeholder="Masalan: Labo / Furgon / 30"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-purple-500 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-white/60 block font-semibold text-[10px]">Ishlab chiqarilgan yili</label>
                  <input 
                    type="number"
                    value={vehDraft.manufacturingYear}
                    onChange={(e) => setVehDraft(prev => ({ ...prev, manufacturingYear: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-purple-500 text-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-white/60 block font-semibold text-[10px]">Og'irlik hajmi (kg)</label>
                  <input 
                    type="text"
                    value={vehDraft.vehicleCapacity}
                    onChange={(e) => setVehDraft(prev => ({ ...prev, vehicleCapacity: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-purple-500 text-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-white/60 block font-semibold text-[10px]">O'lchamlari (LxWxH)</label>
                  <input 
                    type="text"
                    value={vehDraft.vehicleDimensions}
                    onChange={(e) => setVehDraft(prev => ({ ...prev, vehicleDimensions: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-purple-500 text-white outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-white/60 block font-semibold">Tashqi rangi (Color)</label>
                <input 
                  type="text"
                  value={vehDraft.vehicleColor}
                  onChange={(e) => setVehDraft(prev => ({ ...prev, vehicleColor: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-purple-500 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex flex-col items-center justify-center space-y-2 relative">
                  <Camera className="w-5 h-5 text-purple-300" />
                  <span className="text-[10px] text-white/50 block">Transport rasmi</span>
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "vehiclePhoto")}
                    className="text-[9px] w-full mt-1 file:hidden text-white/30 text-center"
                  />
                  {vehDraft.vehiclePhoto && (
                    <span className="absolute top-1 right-2 text-[8px] text-green-400 font-bold uppercase">Yuklandi ✓</span>
                  )}
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex flex-col items-center justify-center space-y-2 relative">
                  <FileText className="w-5 h-5 text-purple-300" />
                  <span className="text-[10px] text-white/50 block">TexTex Pasport rasmi</span>
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "vehicleDocuments")}
                    className="text-[9px] w-full mt-1 file:hidden text-white/30 text-center"
                  />
                  {vehDraft.vehicleDocuments && (
                    <span className="absolute top-1 right-2 text-[8px] text-green-400 font-bold uppercase">Yuklandi ✓</span>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowingModal(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 py-3 rounded-xl transition font-bold"
                >
                  Bekor qilish
                </button>
                <button 
                  disabled={globalLoading}
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-500 py-3 rounded-xl transition font-black tracking-widest uppercase text-[10.5px]"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
