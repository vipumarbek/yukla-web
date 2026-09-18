import React, { useState } from "react";
import { Search, MapPin, Star, Sparkles, Building, Layers, DollarSign, Clock, ArrowRight } from "lucide-react";
import { MOCK_LOGISTICS_SERVICES, LogisticsProduct } from "../data/mockLogisticsServices";
import { LanguageCode } from "../types";
import { useTranslation } from "../context/LanguageContext";

interface LogisticsMarketplaceProps {
  currentLang: LanguageCode;
  isLoggedIn: boolean;
  onSelectServiceForBooking?: (service: LogisticsProduct) => void;
  onRequestAuth?: () => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  "Freight transportation": "🚚",
  "Truck rental": "🔑",
  "Cargo delivery": "📦",
  "International shipping": "🌐",
  "Warehouse services": "🏭",
  "Customs clearance": "📑",
  "Courier services": "✉️",
  "Cold chain transportation": "❄️",
  "Container transport": "🚢",
  "Express delivery": "⚡",
  "Verified Drivers": "🌟",
};

const getCategoryLabel = (category: string, lang: LanguageCode = "uz"): string => {
  if (lang === "uz") {
    switch (category) {
      case "All": return "Barcha xizmatlar";
      case "Freight transportation": return "Yuk tashish";
      case "Truck rental": return "Yuk mashinasi ijarasi";
      case "Cargo delivery": return "Yuk yetkazish";
      case "International shipping": return "Xalqaro yuk";
      case "Warehouse services": return "Ombor xizmati";
      case "Customs clearance": return "Bojxona xizmati";
      case "Courier services": return "Kuryer xizmati";
      case "Cold chain transportation": return "Sovitkichli yuk";
      case "Container transport": return "Konteyner tashish";
      case "Express delivery": return "Tezkor yetkazish";
      case "Verified Drivers": return "Tasdiqlangan haydovchilar";
      default: return category;
    }
  }
  if (lang === "ru") {
    switch (category) {
      case "All": return "Все услуги";
      case "Freight transportation": return "Грузоперевозки";
      case "Truck rental": return "Аренда грузовика";
      case "Cargo delivery": return "Доставка груза";
      case "International shipping": return "Международные перевозки";
      case "Warehouse services": return "Складские услуги";
      case "Customs clearance": return "Таможенные услуги";
      case "Courier services": return "Курьерская служба";
      case "Cold chain transportation": return "Рефрижератор";
      case "Container transport": return "Контейнерные перевозки";
      case "Express delivery": return "Экспресс-доставка";
      case "Verified Drivers": return "Проверенные водители";
      default: return category;
    }
  }
  switch (category) {
    case "All": return "All Services";
    case "Freight transportation": return "Freight Shipping";
    case "Truck rental": return "Truck Rental";
    case "Cargo delivery": return "Cargo Delivery";
    case "International shipping": return "International Shipping";
    case "Warehouse services": return "Warehouse Services";
    case "Customs clearance": return "Customs Services";
    case "Courier services": return "Courier Services";
    case "Cold chain transportation": return "Cold Chain";
    case "Container transport": return "Container Transport";
    case "Express delivery": return "Express Delivery";
    case "Verified Drivers": return "Verified Drivers";
    default: return category;
  }
};

const DEFAULT_VERIFIED_DRIVERS = [
  {
    id: "drv-01",
    name: "Rustam Karimov",
    phone: "+998 90 123 45 67",
    profilePhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    verificationStatus: "approved",
    rating: 4.95,
    completedTrips: 184,
    region: "Toshkent",
    city: "Toshkent shahri",
    vehicle: {
      vehicleType: "Fura Tent",
      licensePlate: "01 A 777 AA",
      brand: "MAN",
      model: "TGX 18.440",
      year: "2021",
      color: "Oq",
      capacity: 22000,
      dimensions: "13.6 x 2.45 x 2.7m",
      photo: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&auto=format&fit=crop&q=80"
    }
  },
  {
    id: "drv-02",
    name: "Alisher Normatov",
    phone: "+998 93 987 65 43",
    profilePhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    verificationStatus: "approved",
    rating: 4.9,
    completedTrips: 92,
    region: "Samarqand",
    city: "Samarqand shahri",
    vehicle: {
      vehicleType: "ISUZU 5",
      licensePlate: "30 B 888 BB",
      brand: "Isuzu",
      model: "NPR 75",
      year: "2022",
      color: "Ko'k",
      capacity: 5000,
      dimensions: "6.2 x 2.2 x 2.2m",
      photo: "https://images.unsplash.com/photo-1586191582056-a6027a07b7b1?w=400&auto=format&fit=crop&q=80"
    }
  },
  {
    id: "drv-03",
    name: "Dilshod Saidov",
    phone: "+998 97 555 12 34",
    profilePhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    verificationStatus: "approved",
    rating: 4.88,
    completedTrips: 130,
    region: "Farg'ona",
    city: "Qo'qon shahri",
    vehicle: {
      vehicleType: "Refrejirator",
      licensePlate: "40 K 123 KA",
      brand: "Scania",
      model: "R450 ThermoKing",
      year: "2020",
      color: "Oq",
      capacity: 20000,
      dimensions: "13.4 x 2.45 x 2.6m",
      photo: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=400&auto=format&fit=crop&q=80"
    }
  }
];

export default function LogisticsMarketplace({
  currentLang,
  isLoggedIn,
  onSelectServiceForBooking,
  onRequestAuth,
}: LogisticsMarketplaceProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [filterRegion, setFilterRegion] = useState<string>("All");
  const [drivers, setDrivers] = useState<any[]>(DEFAULT_VERIFIED_DRIVERS);
  const [loadingDrivers, setLoadingDrivers] = useState(false);

  React.useEffect(() => {
    let isMounted = true;
    setLoadingDrivers(true);
    fetch("/api/marketplace/drivers")
      .then((res) => {
        if (!res.ok) throw new Error("Status: " + res.status);
        return res.json();
      })
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setDrivers(data);
        }
      })
      .catch((_err) => {
        // Fallback to initial verified drivers gracefully
        if (isMounted) {
          setDrivers((prev) => (prev.length > 0 ? prev : DEFAULT_VERIFIED_DRIVERS));
        }
      })
      .finally(() => {
        if (isMounted) setLoadingDrivers(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = [
    "All", 
    ...Array.from(new Set(MOCK_LOGISTICS_SERVICES.map((s) => s.category))),
    "Verified Drivers"
  ];
  const regions = ["All", "Toshkent", "Samarqand", "Buxoro", "Andijon", "Namangan", "Farg'ona", "Xalqaro"];

  // Filter items
  const filteredServices = MOCK_LOGISTICS_SERVICES.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    
    const matchesRegion =
      filterRegion === "All" ||
      item.location.toLowerCase().includes(filterRegion.toLowerCase()) ||
      (filterRegion === "Xalqaro" && item.location.toLowerCase().includes("xalqaro"));

    return matchesSearch && matchesCategory && matchesRegion;
  });

  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (driver.vehicle?.brand || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (driver.vehicle?.model || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (driver.vehicle?.licensePlate || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRegion =
      filterRegion === "All" ||
      driver.region.toLowerCase().includes(filterRegion.toLowerCase()) ||
      driver.city.toLowerCase().includes(filterRegion.toLowerCase());

    return matchesSearch && matchesRegion;
  });

  const getTranslation = (key: string) => {
    switch (key) {
      case "title": return currentLang === "uz" ? "Logistika xizmatlari" : currentLang === "ru" ? "Маркетплейс услуг" : "Logistics Products Marketplace";
      case "desc": return currentLang === "uz" ? "Tasdiqlangan yuk tashuvchilar va operatsiyalar ro'yxati." : currentLang === "ru" ? "Проверенные операторы и логистические услуги." : "Consolidated services provided by verified operators.";
      case "searchPlaceholder": return currentLang === "uz" ? "Yuk yoki manzilni qidiring" : currentLang === "ru" ? "Поиск груза или адреса" : "Search...";
      case "filterRegionLabel": return currentLang === "uz" ? "Hudud" : currentLang === "ru" ? "Регион" : "Location";
      case "categoryLabel": return currentLang === "uz" ? "Xizmat turi" : currentLang === "ru" ? "Категории" : "Browse Categories";
      case "completedLabel": return currentLang === "uz" ? "Bajarilgan reyslar" : currentLang === "ru" ? "Выполнено" : "Trips Done";
      case "priceLabel": return currentLang === "uz" ? "Narx" : currentLang === "ru" ? "Цена" : "Est. Cost";
      case "actionBook": return currentLang === "uz" ? "Buyurtma berish" : currentLang === "ru" ? "Заказать" : "Book Service";
      case "actionLoginToBook": return currentLang === "uz" ? "Kirish va buyurtma berish" : currentLang === "ru" ? "Войти для заказа" : "Sign In to Book";
      case "noResults": return currentLang === "uz" ? "Hech narsa topilmadi" : currentLang === "ru" ? "Ничего не найдено" : "No results found.";
      case "levelEconomy": return currentLang === "uz" ? "Tejamkor" : currentLang === "ru" ? "Эконом" : "Economy";
      case "levelStandard": return currentLang === "uz" ? "Standart" : currentLang === "ru" ? "Стандарт" : "Standard";
      case "levelPremium": return currentLang === "uz" ? "Premium" : currentLang === "ru" ? "Премиум" : "Premium";
      default: return key;
    }
  };

  const getServiceLevel = (desc: string): { name: string; color: string } => {
    if (desc.toLowerCase().includes("premium") || desc.toLowerCase().includes("vip")) {
      return { name: getTranslation("levelPremium"), color: "bg-red-500/10 text-red-400 border-red-500/20" };
    }
    if (desc.toLowerCase().includes("ekonom") || desc.toLowerCase().includes("arzon")) {
      return { name: getTranslation("levelEconomy"), color: "bg-green-500/10 text-green-400 border-green-500/20" };
    }
    return { name: getTranslation("levelStandard"), color: "bg-purple-500/10 text-purple-400 border-purple-500/20" };
  };

  const getLocalizedValue = (val: string) => {
    if (currentLang === "uz") return val;
    let trans = val;
    if (currentLang === "ru") {
      trans = trans
        .replace(/Toshkent/g, "Ташкент")
        .replace(/Samarqand/g, "Самарканд")
        .replace(/Buxoro/g, "Бухара")
        .replace(/Andijon/g, "Андижан")
        .replace(/Namangan/g, "Наманган")
        .replace(/Farg'ona/g, "Фергана")
        .replace(/Xalqaro/g, "Международный")
        .replace(/shahri/g, "город")
        .replace(/Og'ir yuk tashish/g, "Перевозка тяжелых грузов")
        .replace(/To'qimachilik logistikasi/g, "Текстильная логистика")
        .replace(/Qurilish mollari reysi/g, "Рейс строительных материалов")
        .replace(/Sutkalik Labo micro-yuk mashinasi ijarasi/g, "Аренда микрогрузовика Labo посуточно")
        .replace(/Chevrolet Bongo Izotermik furgon ijarasi/g, "Аренда изотермического фургона Chevrolet Bongo")
        .replace(/Og'ir tonnajli ISUZU 10 yuk mashina ijarasi/g, "Аренда крупнотоннажного грузовика ISUZU 10")
        .replace(/Fura Tent rusumli/g, "Тентованная фура")
        .replace(/sug'urta qilingan/g, "застраховано")
        .replace(/kun/g, "дн")
        .replace(/soat/g, "ч")
        .replace(/ijara/g, "аренда")
        .replace(/va/g, "и")
        .replace(/tashish/g, "перевозка")
        .replace(/kichik/g, "малый")
        .replace(/mebellar/g, "мебель")
        .replace(/shaxsiy buyumlar/g, "личные вещи");
    } else {
      trans = trans
        .replace(/Toshkent/g, "Tashkent")
        .replace(/Samarqand/g, "Samarkand")
        .replace(/Buxoro/g, "Bukhara")
        .replace(/Andijon/g, "Andijan")
        .replace(/Namangan/g, "Namangan")
        .replace(/Farg'ona/g, "Fergana")
        .replace(/Xalqaro/g, "International")
        .replace(/shahri/g, "City")
        .replace(/Og'ir yuk tashish/g, "Heavy Freight Shipping")
        .replace(/To'qimachilik logistikasi/g, "Textile Logistics")
        .replace(/Qurilish mollari reysi/g, "Construction Materials Route")
        .replace(/Sutkalik Labo micro-yuk mashinasi ijarasi/g, "Daily Labo Micro-Truck Rental")
        .replace(/Chevrolet Bongo Izotermik furgon ijarasi/g, "Chevrolet Bongo Isothermal Van Rental")
        .replace(/Og'ir tonnajli ISUZU 10 yuk mashina ijarasi/g, "Heavy-duty ISUZU 10 Truck Rental")
        .replace(/kun/g, "day")
        .replace(/soat/g, "hours")
        .replace(/ijara/g, "rental");
    }
    return trans;
  };

  return (
    <section id="marketplace-testing-hub" className="py-24 border-t border-b border-white/5 bg-[#070314] relative px-4 lg:px-10">
      <div className="absolute top-10 left-10 w-[400px] h-[400px] bg-purple-900/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-[#dda15e]/5 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto z-10 relative">
        {/* Header Title block */}
        <div className="text-center space-y-4 mb-16">
          <span className="px-3.5 py-1.5 rounded-full bg-[#dda15e]/10 border border-[#dda15e]/20 text-[#dda15e] text-[10px] uppercase font-mono font-bold tracking-[0.25em] inline-flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>30x Uzbekistan Testing Suite</span>
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white font-sans">
            {getTranslation("title")}
          </h2>
          <p className="text-white/40 max-w-2xl mx-auto text-xs lg:text-sm">
            {getTranslation("desc")}
          </p>
        </div>

        {/* Filter Bar Controls */}
        <div className="bg-[#0b0619]/80 border border-white/10 rounded-2xl p-6 mb-12 shadow-xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Search input Box */}
            <div className="md:col-span-6 relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={getTranslation("searchPlaceholder")}
                className="w-full bg-[#040109] border border-white/5 focus:border-purple-500 h-11 pl-10 pr-4 text-xs rounded-xl text-white outline-none placeholder:text-white/30"
              />
            </div>

            {/* Region dropdown filter */}
            <div className="md:col-span-3">
              <select
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                className="w-full bg-[#040109] border border-white/5 focus:border-purple-500 h-11 px-3 text-xs rounded-xl text-white outline-none cursor-pointer"
              >
                <option value="All">🌍 {getTranslation("filterRegionLabel")}: {getCategoryLabel("All", currentLang)}</option>
                {regions.filter(r => r !== "All").map((r) => (
                  <option key={r} value={r}>📍 {getLocalizedValue(r)}</option>
                ))}
              </select>
            </div>

            {/* Dynamic Counter badges */}
            <div className="md:col-span-3 flex items-center justify-center md:justify-end font-mono text-xs text-white/40 gap-2">
              <Building className="w-4 h-4 text-purple-400" />
              <span>SaaS Pool:</span>
              <span className="text-white font-bold bg-purple-500/20 px-2.5 py-1 rounded-md border border-purple-500/20">{filteredServices.length} {currentLang === "uz" ? "ta xizmat" : currentLang === "ru" ? "услуг" : "services"}</span>
            </div>

          </div>

          {/* Quick Category Tab lists */}
          <div className="border-t border-white/5 pt-5">
            <span className="text-[10px] text-white/30 uppercase font-bold tracking-wider mb-2.5 block">{getTranslation("categoryLabel")}:</span>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all duration-200 cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20"
                      : "bg-[#04010a] border-white/5 text-white/60 hover:border-white/10 hover:text-white"
                  }`}
                >
                  <span className="mr-1.5">{CATEGORY_ICONS[cat] || "🚚"}</span>
                  <span>{getCategoryLabel(cat, currentLang)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Marketplace Products Grid */}
        {selectedCategory === "Verified Drivers" ? (
          filteredDrivers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDrivers.map((driver) => {
                const vehicle = driver.vehicle;
                const vehiclePhoto = vehicle.photo || 
                  (vehicle.vehicleType?.toLowerCase().includes("labo")
                    ? "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=400&q=80"
                    : "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80");

                return (
                  <div
                    key={driver.id}
                    className="bg-white/[0.02] border border-white/5 hover:border-purple-500/20 hover:bg-white/[0.04] rounded-2xl overflow-hidden transition-all duration-300 shadow-xl flex flex-col group relative"
                  >
                    {/* Card Banner Image */}
                    <div className="h-44 relative bg-gray-900 overflow-hidden shrink-0">
                      <img
                        src={vehiclePhoto}
                        alt={vehicle.brand}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0e071e]/90 via-[#0e071e]/30 to-transparent"></div>
                      
                      {/* Location Badge */}
                      <div className="absolute top-3 left-3 bg-[#0d0617]/85 border border-white/10 px-2.5 py-1 rounded-md flex items-center gap-1.5 text-[10px] font-bold text-white font-sans">
                        <MapPin className="w-3 h-3 text-[#dda15e]" />
                        <span>{driver.region}, {driver.city}</span>
                      </div>

                      {/* Verification Status sticker */}
                      <div className="absolute top-3 right-3 border bg-green-500/10 text-green-400 border-green-500/20 px-2.5 py-1 rounded-md text-[9px] font-mono tracking-wider uppercase font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                        <span>TASDIQLANGAN</span>
                      </div>

                      {/* Overlap camera profile photo taken by driver alongside vehicle details */}
                      <div className="absolute -bottom-5 right-4 z-10">
                        {driver.profilePhoto ? (
                          <img
                            src={driver.profilePhoto}
                            alt={driver.name}
                            referrerPolicy="no-referrer"
                            className="w-14 h-14 rounded-full object-cover border-2 border-purple-500 shadow-lg bg-[#0d0617]"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-purple-600 border-2 border-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {driver.name?.charAt(0) || "D"}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Cargo Service details */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-white/40">
                          <span className="font-mono flex items-center gap-1 text-purple-300/80 font-bold">
                            <Sparkles className="w-3 h-3 text-[#dda15e]" />
                            {vehicle.vehicleType} ({vehicle.brand} {vehicle.model !== "N/A" ? vehicle.model : ""})
                          </span>
                        </div>

                        <h3 className="text-sm font-extrabold text-white leading-snug group-hover:text-purple-300 transition-colors">
                          {driver.name}
                        </h3>

                        <p className="text-xs text-white/50 leading-relaxed line-clamp-3">
                          YukLa platformasining faol mustaqil haydovchisi. Qurilma kamerasi orqali tasdiqlangan va xavfsiz yuk tashish reyslarini taklif etadi.
                        </p>
                      </div>

                      {/* Operational metrics */}
                      <div className="border-t border-b border-white/5 py-3 grid grid-cols-2 gap-2 text-[10.5px] font-mono">
                        <div className="space-y-0.5">
                          <span className="text-white/35 block uppercase text-[8px] tracking-wider">Avto raqam (Plates)</span>
                          <span className="text-white font-bold font-mono">{vehicle.licensePlate}</span>
                        </div>
                        <div className="space-y-0.5 text-right">
                          <span className="text-white/35 block uppercase text-[8px] tracking-wider">Sig'imi (Capacity)</span>
                          <span className="text-green-400 font-bold font-mono">{vehicle.capacity ? `${vehicle.capacity.toLocaleString()} kg` : "N/A"}</span>
                        </div>
                      </div>

                      {/* Price & Action row */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-white/30 uppercase font-bold block">Tarif</span>
                          <span className="text-base font-black text-[#dda15e] font-mono leading-none">
                            Muzokaraviy
                          </span>
                        </div>

                        <a
                          href={`tel:${driver.phone}`}
                          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wide flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <span>Bog'lanish</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center bg-[#0b0619]/40 border border-white/5 rounded-2xl py-12 px-6">
              <span className="text-4xl block mb-3">🔍</span>
              <p className="text-sm text-white/60">Tizimda faol haydovchilar topilmadi.</p>
            </div>
          )
        ) : (
          filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => {
                const level = getServiceLevel(service.description);
                return (
                  <div
                    key={service.id}
                    className="bg-white/[0.02] border border-white/5 hover:border-purple-500/20 hover:bg-white/[0.04] rounded-2xl overflow-hidden transition-all duration-300 shadow-xl flex flex-col group"
                  >
                    
                    {/* Card Banner Image */}
                    <div className="h-44 relative bg-gray-900 overflow-hidden shrink-0">
                      <img
                        src={service.image}
                        alt={service.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0e071e]/90 via-[#0e071e]/30 to-transparent"></div>
                      
                      {/* Location Badge */}
                      <div className="absolute top-3 left-3 bg-[#0d0617]/85 border border-white/10 px-2.5 py-1 rounded-md flex items-center gap-1.5 text-[10px] font-bold text-white font-sans">
                        <MapPin className="w-3 h-3 text-[#dda15e]" />
                        <span>{service.location}</span>
                      </div>

                      {/* Service Level Sticker */}
                      <div className={`absolute top-3 right-3 border px-2.5 py-1 rounded-md text-[9px] font-mono tracking-wider uppercase font-bold ${level.color}`}>
                        {level.name}
                      </div>

                      {/* Category Label at bottom of image overlay */}
                      <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[10.5px] text-purple-300 font-bold font-mono">
                        <span>{CATEGORY_ICONS[service.category] || "🚚"}</span>
                        <span>{getCategoryLabel(service.category, currentLang)}</span>
                      </div>
                    </div>

                    {/* Cargo Service details */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-white/40">
                          <span className="font-mono flex items-center gap-1 text-purple-300/80 font-bold">
                            <Building className="w-3 h-3 text-[#dda15e]" />
                            {service.companyName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <strong className="text-white font-mono">{service.rating}</strong>
                          </span>
                        </div>

                        <h3 className="text-sm font-extrabold text-white leading-snug group-hover:text-purple-300 transition-colors">
                          {getLocalizedValue(service.title)}
                        </h3>

                        <p className="text-xs text-white/50 leading-relaxed line-clamp-3">
                          {getLocalizedValue(service.description)}
                        </p>
                      </div>

                      {/* Operational metrics */}
                      <div className="border-t border-b border-white/5 py-3 grid grid-cols-2 gap-2 text-[10.5px] font-mono">
                        <div className="space-y-0.5">
                          <span className="text-white/35 block uppercase text-[8px] tracking-wider">{currentLang === "uz" ? "Yetkazish vaqti" : currentLang === "ru" ? "Срок доставки" : "Delivery Time"}</span>
                          <div className="flex items-center gap-1 text-white/80 font-bold">
                            <Clock className="w-3 h-3 text-purple-400" />
                            <span>{getLocalizedValue(service.deliveryTime)}</span>
                          </div>
                        </div>
                        <div className="space-y-0.5 text-right">
                          <span className="text-white/35 block uppercase text-[8px] tracking-wider">{getTranslation("completedLabel")}</span>
                          <span className="text-green-400 font-bold font-mono">{service.completedOrders.toLocaleString()} {currentLang === "uz" ? "ta reys" : currentLang === "ru" ? "рейсов" : "trips"}</span>
                        </div>
                      </div>

                      {/* Price & Action row */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-white/30 uppercase font-bold block">{getTranslation("priceLabel")}</span>
                          <span className="text-base font-black text-[#dda15e] font-mono leading-none">
                            {service.price.toLocaleString()} <span className="text-xs font-bold text-white/60">UZS</span>
                          </span>
                        </div>

                        {isLoggedIn && onSelectServiceForBooking ? (
                          <button
                            onClick={() => onSelectServiceForBooking(service)}
                            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wide flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <span>{getTranslation("actionBook")}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={onRequestAuth}
                            className="px-4 py-2 rounded-xl bg-[#dda15e] hover:bg-purple-600 hover:text-white text-black font-extrabold text-xs uppercase tracking-wider transition cursor-pointer"
                          >
                            {getTranslation("actionLoginToBook")}
                          </button>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center bg-[#0b0619]/40 border border-white/5 rounded-2xl py-12 px-6">
              <span className="text-4xl block mb-3">🔍</span>
              <p className="text-sm text-white/60">{getTranslation("noResults")}</p>
            </div>
          )
        )}

      </div>
    </section>
  );
}
