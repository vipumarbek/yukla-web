import React, { useState, useMemo } from "react";
import { Order, OrderStatus } from "../types";
import { useTranslation } from "../context/LanguageContext";
import { 
  MapPin, 
  Truck, 
  Scale, 
  Layers, 
  DollarSign, 
  Compass, 
  Eye, 
  X, 
  Check, 
  AlertTriangle,
  Crown,
  Zap,
  Filter,
  ArrowUpDown,
  Search,
  ShieldCheck,
  RefreshCw
} from "lucide-react";

interface DriverMarketplaceProps {
  orders: Order[];
  onAccept: (orderId: string) => void;
  globalLoading: boolean;
  hasActiveOrder: boolean;
}

const REGIONS = [
  "Barchasi",
  "Toshkent shahri",
  "Toshkent viloyati",
  "Samarqand",
  "Farg'ona",
  "Andijon",
  "Namangan",
  "Buxoro",
  "Navoiy",
  "Qashqadaryo",
  "Surxondaryo",
  "Xorazm",
  "Jizzax",
  "Sirdaryo",
  "Qoraqalpog'iston"
];

const VEHICLE_CATEGORIES = [
  "Barchasi",
  "Labo / Damas",
  "Porter / Chazor",
  "Isuzu",
  "Fura (Tent)",
  "Refrejirator",
  "Bortli / Shalanda"
];

export default function DriverMarketplace({
  orders,
  onAccept,
  globalLoading,
  hasActiveOrder
}: DriverMarketplaceProps) {
  const { t } = useTranslation();
  const [hiddenOrders, setHiddenOrders] = useState<string[]>([]);
  const [selectedDetailOrder, setSelectedDetailOrder] = useState<Order | null>(null);

  // Live filter states
  const [originFilter, setOriginFilter] = useState("Barchasi");
  const [destFilter, setDestFilter] = useState("Barchasi");
  const [vehicleFilter, setVehicleFilter] = useState("Barchasi");
  const [weightFilter, setWeightFilter] = useState("Barchasi");
  const [searchQuery, setSearchQuery] = useState("");

  const handleHideOrder = (id: string) => {
    setHiddenOrders(prev => [...prev, id]);
  };

  // Filter and sort orders: VIP -> PRO -> ODDIY, then newest
  const filteredAndSortedOrders = useMemo(() => {
    return orders
      .filter((o) => o.status === OrderStatus.PENDING && !hiddenOrders.includes(o.id))
      .filter((o) => {
        if (originFilter !== "Barchasi" && !o.pickupRegion?.toLowerCase().includes(originFilter.toLowerCase())) {
          return false;
        }
        if (destFilter !== "Barchasi" && !o.deliveryRegion?.toLowerCase().includes(destFilter.toLowerCase())) {
          return false;
        }
        if (vehicleFilter !== "Barchasi") {
          const vType = (o.vehicleType || "").toLowerCase();
          const target = vehicleFilter.toLowerCase();
          if (target.includes("labo") && !vType.includes("labo") && !vType.includes("damas")) return false;
          if (target.includes("porter") && !vType.includes("porter") && !vType.includes("bongo") && !vType.includes("chazor")) return false;
          if (target.includes("isuzu") && !vType.includes("isuzu")) return false;
          if (target.includes("fura") && !vType.includes("fura") && !vType.includes("man") && !vType.includes("kamaz") && !vType.includes("scania")) return false;
          if (target.includes("refrejirator") && !vType.includes("refrejirator") && !vType.includes("sovutgich")) return false;
        }
        if (weightFilter !== "Barchasi") {
          const w = Number(o.weight) || 0;
          if (weightFilter === "< 2t" && w >= 2000) return false;
          if (weightFilter === "2-5t" && (w < 2000 || w > 5000)) return false;
          if (weightFilter === "5-10t" && (w < 5000 || w > 10000)) return false;
          if (weightFilter === "> 10t" && w <= 10000) return false;
        }
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchTitle = (o.cargoType || "").toLowerCase().includes(query);
          const matchOrigin = (o.pickupAddress || "").toLowerCase().includes(query);
          const matchDest = (o.deliveryAddress || "").toLowerCase().includes(query);
          if (!matchTitle && !matchOrigin && !matchDest) return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Priority Sorting: VIP (weight 3) -> PRO (weight 2) -> ODDIY (weight 1)
        const getTierWeight = (tier?: string) => {
          const t = (tier || "").toUpperCase();
          if (t === "VIP") return 3;
          if (t === "PRO") return 2;
          return 1;
        };
        const weightDiff = getTierWeight((b as any).tier) - getTierWeight((a as any).tier);
        if (weightDiff !== 0) return weightDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [orders, hiddenOrders, originFilter, destFilter, vehicleFilter, weightFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-white/5 gap-3">
        <div className="space-y-0.5">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-purple-400" />
            <span>Yuk Birjasi & Haydovchi Bozori</span>
          </h3>
          <p className="text-xs text-white/40">Real-vaqt rejimida yangi yuklarni tanlang va 99% kafolatlangan Escrow to'lovini oling</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-purple-600/20 border border-purple-500/20 text-purple-300 text-xs font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            {filteredAndSortedOrders.length} ta faol yuk
          </span>
        </div>
      </div>

      {/* Live Marketplace Filters Bar */}
      <div className="bg-[#120b2e]/60 border border-purple-500/20 p-4 rounded-2xl backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-white/70 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-purple-400" />
            <span>Tezkor Filtrlar</span>
          </span>
          {(originFilter !== "Barchasi" || destFilter !== "Barchasi" || vehicleFilter !== "Barchasi" || weightFilter !== "Barchasi" || searchQuery) && (
            <button 
              onClick={() => {
                setOriginFilter("Barchasi");
                setDestFilter("Barchasi");
                setVehicleFilter("Barchasi");
                setWeightFilter("Barchasi");
                setSearchQuery("");
              }}
              className="text-[10px] text-purple-400 hover:text-purple-300 underline font-semibold cursor-pointer"
            >
              Filtrlarni tozalash
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          {/* Origin filter */}
          <div>
            <label className="text-[10px] text-white/40 block mb-1 font-semibold">Qayerdan (Yuklash):</label>
            <select 
              value={originFilter} 
              onChange={(e) => setOriginFilter(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-purple-500 text-xs"
            >
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Destination filter */}
          <div>
            <label className="text-[10px] text-white/40 block mb-1 font-semibold">Qayerga (Yetkazish):</label>
            <select 
              value={destFilter} 
              onChange={(e) => setDestFilter(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-purple-500 text-xs"
            >
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Vehicle Category filter */}
          <div>
            <label className="text-[10px] text-white/40 block mb-1 font-semibold">Mashina turi:</label>
            <select 
              value={vehicleFilter} 
              onChange={(e) => setVehicleFilter(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-purple-500 text-xs"
            >
              {VEHICLE_CATEGORIES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          {/* Weight filter */}
          <div>
            <label className="text-[10px] text-white/40 block mb-1 font-semibold">Yuk vazni:</label>
            <select 
              value={weightFilter} 
              onChange={(e) => setWeightFilter(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-purple-500 text-xs"
            >
              <option value="Barchasi">Barchasi</option>
              <option value="< 2t">&lt; 2 tonna (Labo/Porter)</option>
              <option value="2-5t">2 - 5 tonna (Isuzu)</option>
              <option value="5-10t">5 - 10 tonna (Gruzovik)</option>
              <option value="> 10t">&gt; 10 tonna (Fura 20t)</option>
            </select>
          </div>

          {/* Search text */}
          <div>
            <label className="text-[10px] text-white/40 block mb-1 font-semibold">Qidiruv:</label>
            <div className="relative">
              <input 
                type="text"
                placeholder="Yuk nomi yoki manzil..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 pl-8 text-white outline-none focus:border-purple-500 text-xs"
              />
              <Search className="w-3.5 h-3.5 text-white/40 absolute left-2.5 top-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Orders Grid or High-Converting Zero-State */}
      {filteredAndSortedOrders.length === 0 ? (
        <div className="text-center py-20 bg-[#120b2e]/20 border border-dashed border-purple-500/20 rounded-3xl p-8 space-y-4 backdrop-blur-md">
          <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
            <Compass className="w-8 h-8 animate-pulse" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h4 className="text-base font-extrabold text-white">
              Ayni damda yo‘nalishingizda bo‘sh yuklar mavjud emas. Yangi buyurtmalar kutilmoqda.
            </h4>
            <p className="text-xs text-white/40 leading-relaxed">
              Yangi yuklar paydo bo'lishi bilan tizim sizga avtomatik bildirishnoma yuboradi. Filtr parametrlarini o'zgartirib ko'rishingiz mumkin.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => {
                setOriginFilter("Barchasi");
                setDestFilter("Barchasi");
                setVehicleFilter("Barchasi");
                setWeightFilter("Barchasi");
                setSearchQuery("");
              }}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Barcha yo'nalishlarni ko'rish</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedOrders.map((ord) => {
            const grossPay = Number(ord.price) || 0;
            const commission1Percent = Math.round(grossPay * 0.01);
            const netEarn = grossPay - commission1Percent;
            const distance = (ord as any).distance || 150;
            const orderTier = String((ord as any).tier || "ODDIY").toUpperCase();
            const isVip = orderTier === "VIP";
            const isPro = orderTier === "PRO";

            return (
              <div 
                key={ord.id} 
                className={`backdrop-blur-md rounded-3xl p-5 shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden group hover:scale-[1.01] ${
                  isVip 
                    ? "bg-gradient-to-b from-[#240b3b]/60 to-[#120b2e]/60 border-2 border-purple-400/50 shadow-[0_0_25px_rgba(168,85,247,0.2)]" 
                    : isPro 
                    ? "bg-gradient-to-b from-[#2b1f09]/40 to-[#120b2e]/50 border-2 border-amber-500/40" 
                    : "bg-[#120b2e]/40 border border-purple-500/10 hover:border-purple-500/40"
                }`}
              >
                {/* Priority Top Badge for VIP & PRO */}
                {isVip && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-600 to-indigo-600 text-white text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl shadow-md flex items-center gap-1 font-mono tracking-wider">
                    <Crown className="w-3 h-3 text-amber-300 fill-amber-300" />
                    <span>TOP VIP LISTING</span>
                  </div>
                )}
                {isPro && !isVip && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-600 to-amber-700 text-white text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl shadow-md flex items-center gap-1 font-mono tracking-wider">
                    <Zap className="w-3 h-3 text-yellow-200 fill-yellow-200" />
                    <span>PRIORITET PRO</span>
                  </div>
                )}

                <div className="space-y-4 mt-2">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-purple-400 font-mono tracking-widest uppercase">
                      ID: #{ord.id.substring(0, 8).toUpperCase()}
                    </span>
                    <span className="bg-purple-500/10 border border-purple-500/25 text-purple-300 text-[9px] font-bold px-2 py-0.5 rounded-xl uppercase tracking-widest font-mono">
                      {ord.vehicleType}
                    </span>
                  </div>

                  {/* Cargo type box */}
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/5 space-y-1">
                    <p className="font-bold text-white text-[13px]">{ord.cargoType}</p>
                    <span className="text-[10px] text-white/40 block">Og'irligi: {ord.weight} kg • Hajmi: {ord.volume} m³</span>
                  </div>

                  {/* A -> B route details */}
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold text-[9px] mt-0.5 border border-emerald-500/20">A</div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[8px] uppercase font-black bg-emerald-500/10 text-emerald-300 px-1 py-0.2 rounded">
                            {ord.pickupRegion || "Toshkent shahri"}
                          </span>
                          <span className="text-white/40 font-semibold text-[9px]">{ord.pickupDistrict || "Sergeli"}</span>
                        </div>
                        <p className="text-white/80 line-clamp-1 mt-0.5">{ord.pickupAddress}</p>
                      </div>
                    </div>

                    <div className="border-l border-dashed border-white/10 h-3 ml-2"></div>

                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold text-[9px] mt-0.5 border border-purple-500/20">B</div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[8px] uppercase font-black bg-purple-500/10 text-purple-300 px-1 py-0.2 rounded">
                            {ord.deliveryRegion || "Samarqand"}
                          </span>
                          <span className="text-white/40 font-semibold text-[9px]">{ord.deliveryDistrict || "Samarqand shahri"}</span>
                        </div>
                        <p className="text-white/80 line-clamp-1 mt-0.5">{ord.deliveryAddress}</p>
                      </div>
                    </div>
                  </div>

                  {/* Distance display */}
                  <div className="flex items-center justify-between text-[11px] font-semibold text-white/50 bg-white/5 px-3 py-2 rounded-xl">
                    <span className="flex items-center gap-1">📍 Masofa: <span className="text-white font-mono">{distance} km</span></span>
                    <span className="flex items-center gap-1 text-emerald-400 font-mono">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>1% Escrow Kafolati</span>
                    </span>
                  </div>
                </div>

                {/* Pricing & Buttons */}
                <div className="mt-5 pt-3 border-t border-white/5">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <span className="text-[9px] text-white/40 uppercase block leading-none font-mono">Sof Daromad (99% Sizga)</span>
                      <span className="text-base font-black text-emerald-400 font-mono mt-0.5 block">{netEarn.toLocaleString()} UZS</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-white/30 uppercase block leading-none font-mono">Umumiy Gross</span>
                      <span className="text-xs text-white/50 font-mono">{grossPay.toLocaleString()} UZS</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedDetailOrder(ord)}
                      className="bg-purple-950/20 hover:bg-purple-900/30 text-purple-300 border border-purple-500/20 p-2.5 rounded-xl transition text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                      title="Batafsil ko'rish"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">Batafsil</span>
                    </button>

                    <button
                      onClick={() => handleHideOrder(ord.id)}
                      className="bg-rose-950/10 hover:bg-rose-900/20 text-rose-400 border border-rose-500/10 p-2.5 rounded-xl transition text-xs font-semibold cursor-pointer"
                      title="Yashirish"
                    >
                      Yashirish
                    </button>

                    <button
                      disabled={globalLoading || hasActiveOrder}
                      onClick={() => onAccept(ord.id)}
                      className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-45 disabled:cursor-not-allowed text-white font-bold py-2 px-3 rounded-xl uppercase tracking-wider text-[10.5px] font-mono transition cursor-pointer text-center shadow-lg"
                      title={hasActiveOrder ? "Avval aktiv buyurtmani yakunlang" : "Yuk tashuvini biriktirish"}
                    >
                      Tashuvni olish
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Modal dialogue */}
      {selectedDetailOrder && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="backdrop-blur-md bg-[#100720]/95 border border-purple-500/20 rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl relative text-xs">
            <button 
              onClick={() => setSelectedDetailOrder(null)}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 pb-3 border-b border-white/5">
              <span className="px-3 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[9px] uppercase tracking-wider font-extrabold font-mono">
                Order details #{selectedDetailOrder.id.substring(0, 8).toUpperCase()}
              </span>
              <h3 className="text-lg font-black text-white mt-1.5">{selectedDetailOrder.cargoType}</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 bg-white/5 p-3 rounded-xl">
                <span className="text-white/40 block">Yuk Sig'imi turi:</span>
                <p className="font-bold text-white uppercase text-[12px]">{selectedDetailOrder.vehicleType}</p>
              </div>
              <div className="space-y-1 bg-white/5 p-3 rounded-xl">
                <span className="text-white/40 block">Og'irligi va Hajmi:</span>
                <p className="font-bold text-white text-[12px]">{selectedDetailOrder.weight} kg • {selectedDetailOrder.volume} m³</p>
              </div>
            </div>

            <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/5">
              <div>
                <span className="text-emerald-400 font-bold block">A: Yuklash nuqtasi:</span>
                <p className="text-white font-medium mt-0.5">{selectedDetailOrder.pickupAddress}</p>
                <p className="text-white/45 text-[10px] mt-0.5">Viloyat: {selectedDetailOrder.pickupRegion} | Tuman: {selectedDetailOrder.pickupDistrict}</p>
              </div>
              <hr className="border-white/5" />
              <div>
                <span className="text-purple-400 font-bold block">B: Yetkazish manzili:</span>
                <p className="text-white font-medium mt-0.5">{selectedDetailOrder.deliveryAddress}</p>
                <p className="text-white/45 text-[10px] mt-0.5">Viloyat: {selectedDetailOrder.deliveryRegion} | Tuman: {selectedDetailOrder.deliveryDistrict}</p>
              </div>
            </div>

            <div className="bg-black/40 p-3.5 rounded-xl space-y-1 border border-white/5">
              <span className="text-white/40 block">Mijoz ma'lumoti:</span>
              <p className="font-extrabold text-white text-[12px]">{selectedDetailOrder.customerName}</p>
              <p className="font-mono text-purple-400 font-bold">{selectedDetailOrder.phoneNumber || "+998 -- --- -- --"}</p>
            </div>

            {selectedDetailOrder.comment && (
              <div className="p-3 bg-purple-500/5 rounded-xl border border-purple-500/10">
                <span className="text-[10px] text-purple-300 font-bold block">Qo'shimcha izohlar / Buyurtma talabi:</span>
                <p className="text-white/80 italic mt-1 font-sans">"{selectedDetailOrder.comment}"</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSelectedDetailOrder(null)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3.5 rounded-xl uppercase transition cursor-pointer"
              >
                Yopish
              </button>

              <button
                disabled={globalLoading || hasActiveOrder}
                onClick={() => {
                  onAccept(selectedDetailOrder.id);
                  setSelectedDetailOrder(null);
                }}
                className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-45 text-white font-black py-3.5 rounded-xl uppercase tracking-widest transition cursor-pointer text-center"
              >
                Tashuvni qabul qilish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
