/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { LanguageCode } from "../types";
import { FLEET_INFO, TRANSLATIONS } from "../translations";
import { Truck, Scale, Move, CheckCircle2, ChevronRight, Fuel } from "lucide-react";

interface FleetProps {
  currentLang: LanguageCode;
  onSelectVehicle?: (vehicleName: string) => void;
  hideCTA?: boolean;
}

// Custom simple inline vector renders representing truck chassis & loaders
const TRUCK_SVGS: Record<string, React.ReactNode> = {
  Labo: (
    <svg viewBox="0 0 100 50" className="w-full h-full text-purple-400 stroke-current fill-none stroke-2">
      {/* Driver Cabin */}
      <path d="M 10 38 L 10 22 L 20 22 L 30 30 L 30 38 Z" fill="rgba(168, 85, 247, 0.1)" />
      {/* Small Cabin window */}
      <path d="M 16 26 L 24 26 L 27 30 L 16 30 Z" />
      {/* Load tray */}
      <rect x="30" y="26" width="45" height="12" rx="1" fill="rgba(168, 85, 247, 0.2)" />
      {/* Wheels */}
      <circle cx="20" cy="38" r="5" fill="#000" />
      <circle cx="20" cy="38" r="2" fill="#fff" />
      <circle cx="62" cy="38" r="5" fill="#000" />
      <circle cx="62" cy="38" r="2" fill="#fff" />
      {/* Cargo Box outline */}
      <path d="M 32 20 L 73 20 L 73 26" strokeDasharray="3,3" />
    </svg>
  ),
  Bongo: (
    <svg viewBox="0 0 100 50" className="w-full h-full text-purple-400 stroke-current fill-none stroke-2">
      <path d="M 8 38 L 8 20 L 22 20 L 32 28 L 32 38 Z" fill="rgba(168, 85, 247, 0.1)" />
      <path d="M 15 24 L 24 24 L 28 28 L 15 28 Z" />
      <rect x="32" y="20" width="50" height="18" rx="1" fill="rgba(16ec, 85, 247, 0.2)" />
      <line x1="32" y1="28" x2="82" y2="28" strokeWidth="1" strokeDasharray="2,2" />
      <circle cx="20" cy="38" r="6" fill="#000" />
      <circle cx="20" cy="38" r="2.5" fill="#fff" />
      <circle cx="68" cy="38" r="6" fill="#000" />
      <circle cx="68" cy="38" r="2.5" fill="#fff" />
    </svg>
  ),
  Furgon: (
    <svg viewBox="0 0 100 50" className="w-full h-full text-purple-400 stroke-current fill-none stroke-2">
      <path d="M 10 38 L 10 22 L 30 22 L 30 38 Z" fill="rgba(168, 85, 247, 0.1)" />
      <path d="M 15 26 L 25 26 L 25 32 L 15 32 Z" />
      <rect x="30" y="16" width="55" height="22" rx="2" fill="rgba(168, 85, 247, 0.3)" />
      {/* Secure lock handle */}
      <line x1="80" y1="20" x2="80" y2="34" strokeWidth="2" />
      <circle cx="24" cy="38" r="6" fill="#000" />
      <circle cx="24" cy="38" r="2.5" fill="#fff" />
      <circle cx="68" cy="38" r="6" fill="#000" />
      <circle cx="68" cy="38" r="2.5" fill="#fff" />
    </svg>
  ),
  "ISUZU 5": (
    <svg viewBox="0 0 100 50" className="w-full h-full text-indigo-400 stroke-current fill-none stroke-[2.5]">
      <path d="M 5 36 L 5 16 L 22 16 L 26 24 L 26 36 Z" fill="rgba(99, 102, 241, 0.1)" />
      <path d="M 10 20 L 20 20 L 22 24 L 10 24 Z" />
      <rect x="26" y="12" width="62" height="24" rx="2" fill="rgba(99, 102, 241, 0.25)" />
      <circle cx="18" cy="36" r="7" fill="#000" />
      <circle cx="18" cy="36" r="3" fill="#fff" />
      <circle cx="70" cy="36" r="7" fill="#000" />
      <circle cx="70" cy="36" r="3" fill="#fff" />
    </svg>
  ),
  "ISUZU 10": (
    <svg viewBox="0 0 100 50" className="w-full h-full text-indigo-400 stroke-current fill-none stroke-[2.5]">
      <path d="M 5 36 L 5 15 L 22 15 L 26 23 L 26 36 Z" fill="rgba(99, 102, 241, 0.15)" />
      <path d="M 10 19 L 20 19 L 22 23 L 10 23 Z" />
      <rect x="26" y="10" width="66" height="26" rx="2" fill="rgba(99, 102, 241, 0.3)" />
      <circle cx="18" cy="36" r="7" fill="#000" />
      <circle cx="18" cy="36" r="3" fill="#fff" />
      <circle cx="64" cy="36" r="7" fill="#000" />
      <circle cx="64" cy="36" r="3" fill="#fff" />
      <circle cx="78" cy="36" r="7" fill="#000" />
      <circle cx="78" cy="36" r="3" fill="#fff" />
    </svg>
  ),
  Gruzovik: (
    <svg viewBox="0 0 100 50" className="w-full h-full text-purple-400 stroke-current fill-none stroke-[2.5]">
      <path d="M 5 38 L 5 18 L 20 18 L 24 26 L 24 38 Z" fill="rgba(168, 85, 247, 0.1)" />
      <rect x="24" y="14" width="68" height="24" rx="2" fill="rgba(168, 85, 247, 0.3)" />
      {/* Exhaust pipe */}
      <path d="M 22 18 L 22 10 L 20 10" />
      <circle cx="16" cy="38" r="7" fill="#000" />
      <circle cx="16" cy="38" r="3" fill="#fff" />
      <circle cx="60" cy="38" r="7" fill="#000" />
      <circle cx="60" cy="38" r="3" fill="#fff" />
      <circle cx="74" cy="38" r="7" fill="#000" />
      <circle cx="74" cy="38" r="3" fill="#fff" />
    </svg>
  ),
  "Fura Tent": (
    <svg viewBox="0 0 130 50" className="w-full h-full text-purple-400 stroke-current fill-none stroke-[2.5]">
      {/* Tractor cabin */}
      <path d="M 5 38 L 5 18 L 20 18 L 25 24 L 25 38 Z" fill="rgba(168, 85, 247, 0.15)" />
      {/* Wind deflector */}
      <path d="M 12 18 L 20 12 L 25 18" />
      {/* Heavy semi-trailer */}
      <rect x="28" y="10" width="94" height="28" rx="2" fill="rgba(168, 85, 247, 0.35)" />
      {/* Diagonal strap lines of trailer tent */}
      <line x1="45" y1="10" x2="45" y2="38" strokeWidth="1" strokeDasharray="1,2" />
      <line x1="65" y1="10" x2="65" y2="38" strokeWidth="1" strokeDasharray="1,2" />
      <line x1="85" y1="10" x2="85" y2="38" strokeWidth="1" strokeDasharray="1,2" />
      <line x1="105" y1="10" x2="105" y2="38" strokeWidth="1" strokeDasharray="1,2" />
      {/* Wheels */}
      <circle cx="16" cy="38" r="8" fill="#000" />
      <circle cx="16" cy="38" r="3" fill="#fff" />
      <circle cx="86" cy="38" r="8" fill="#000" />
      <circle cx="86" cy="38" r="3" fill="#fff" />
      <circle cx="102" cy="38" r="8" fill="#000" />
      <circle cx="102" cy="38" r="3" fill="#fff" />
      <circle cx="118" cy="38" r="8" fill="#000" />
      <circle cx="118" cy="38" r="3" fill="#fff" />
    </svg>
  ),
  "Fura Budka": (
    <svg viewBox="0 0 130 50" className="w-full h-full text-indigo-400 stroke-current fill-none stroke-[2.5]">
      <path d="M 5 38 L 5 18 L 20 18 L 25 24 L 25 38 Z" fill="rgba(99, 102, 241, 0.1)" />
      <path d="M 12 18 L 20 12 L 25 18" />
      <rect x="28" y="10" width="94" height="28" rx="2" fill="rgba(99, 102, 241, 0.4)" />
      <circle cx="16" cy="38" r="8" fill="#000" />
      <circle cx="16" cy="38" r="3" fill="#fff" />
      <circle cx="86" cy="38" r="8" fill="#000" />
      <circle cx="86" cy="38" r="3" fill="#fff" />
      <circle cx="102" cy="38" r="8" fill="#000" />
      <circle cx="102" cy="38" r="3" fill="#fff" />
      <circle cx="118" cy="38" r="8" fill="#000" />
      <circle cx="118" cy="38" r="3" fill="#fff" />
    </svg>
  ),
  Refrejirator: (
    <svg viewBox="0 0 130 50" className="w-full h-full text-indigo-400 stroke-current fill-none stroke-[2.5]">
      <path d="M 5 38 L 5 18 L 20 18 L 25 24 L 25 38 Z" fill="rgba(99, 102, 241, 0.15)" />
      {/* Cooling fan condenser box */}
      <rect x="26" y="10" width="8" height="10" rx="1" fill="#fff" />
      <rect x="34" y="12" width="88" height="26" rx="2" fill="rgba(99, 102, 241, 0.35)" />
      <circle cx="16" cy="38" r="8" fill="#000" />
      <circle cx="16" cy="38" r="3" fill="#fff" />
      <circle cx="90" cy="38" r="8" fill="#000" />
      <circle cx="90" cy="38" r="3" fill="#fff" />
      <circle cx="106" cy="38" r="8" fill="#000" />
      <circle cx="106" cy="38" r="3" fill="#fff" />
    </svg>
  ),
  Paravoz: (
    <svg viewBox="0 0 150 50" className="w-full h-full text-purple-400 stroke-current fill-none stroke-[2]">
      {/* Truck 1 */}
      <path d="M 3 38 L 3 18 L 18 18 L 22 24 L 22 38 Z" fill="rgba(168, 85, 247, 0.1)" />
      <rect x="22" y="14" width="48" height="24" rx="2" fill="rgba(168, 85, 247, 0.25)" />
      {/* Tow hook block */}
      <line x1="70" y1="32" x2="78" y2="32" strokeWidth="3" />
      {/* Trailer 2 */}
      <rect x="78" y="14" width="67" height="24" rx="2" fill="rgba(168, 85, 247, 0.35)" />
      {/* Wheels */}
      <circle cx="12" cy="38" r="7" fill="#000" />
      <circle cx="42" cy="38" r="7" fill="#000" />
      <circle cx="56" cy="38" r="7" fill="#000" />
      <circle cx="92" cy="38" r="7" fill="#000" />
      <circle cx="112" cy="38" r="7" fill="#000" />
      <circle cx="128" cy="38" r="7" fill="#000" />
    </svg>
  ),
  Shalanda: (
    <svg viewBox="0 0 130 50" className="w-full h-full text-purple-400 stroke-current fill-none stroke-[2.5]">
      {/* Tractor cabin */}
      <path d="M 5 38 L 5 18 L 20 18 L 25 24 L 25 38 Z" fill="rgba(168, 85, 247, 0.15)" />
      {/* Flatbed chassis deck with open rails */}
      <line x1="28" y1="32" x2="124" y2="32" strokeWidth="4" />
      <line x1="28" y1="38" x2="124" y2="38" strokeWidth="2" strokeDasharray="3,3" />
      {/* Load container profile outline */}
      <rect x="34" y="16" width="35" height="16" rx="1" strokeWidth="1.5" strokeDasharray="2,2" fill="rgba(168, 85, 247, 0.05)" />
      <rect x="74" y="16" width="35" height="16" rx="1" strokeWidth="1.5" strokeDasharray="2,2" fill="rgba(168, 85, 247, 0.05)" />
      {/* Wheels */}
      <circle cx="16" cy="38" r="8" fill="#000" />
      <circle cx="16" cy="38" r="3" fill="#fff" />
      <circle cx="86" cy="38" r="8" fill="#000" />
      <circle cx="86" cy="38" r="3" fill="#fff" />
      <circle cx="102" cy="38" r="8" fill="#000" />
      <circle cx="102" cy="38" r="3" fill="#fff" />
      <circle cx="118" cy="38" r="8" fill="#000" />
      <circle cx="118" cy="38" r="3" fill="#fff" />
    </svg>
  ),
};

const LOCAL_FLEET_LANGS: Record<string, Record<string, string>> = {
  uz: {
    fleetDescParagraph: "YukLa zamonaviy yuk mashinalari parki oraliq viloyat, shahar hamda shahar ichi yuklarni tashishga moslashtirilgan. Har bir yukingiz kafolatlangan va doimiy monitoringdadir.",
    capacity: "Sig'imi",
    dimensions: "O'lchamlari",
    tariff: "Tarif (1 km)",
    guarantee1: "3% Komissiya kiritilgan & Sug'urta kafolati",
    guarantee2: "GPS Tracing va Davlat Ro'yxatidan o'tgan haydovchilar",
    needCar: "Menga ushbu mashina kerak",
  },
  en: {
    fleetDescParagraph: "The YukLa fleet is fully equipped to transport inter-provincial, intercity and intra-city cargo. Every shipment is insured and monitored continuously.",
    capacity: "Capacity",
    dimensions: "Dimensions",
    tariff: "Rate (1 km)",
    guarantee1: "3% Platform commission included & Load insurance guaranteed",
    guarantee2: "Live GPS Tracking & Fully background checked drivers",
    needCar: "I need this vehicle",
  },
  ru: {
    fleetDescParagraph: "Современный автопарк YukLa адаптирован для перевозки междугородных, областных и внутригородских грузов. Каждая поездка застрахована и находится под постоянным мониторингом.",
    capacity: "Грузоподъемность",
    dimensions: "Размеры",
    tariff: "Тариф (1 км)",
    guarantee1: "3% комиссия включена и гарантия страхования",
    guarantee2: "GPS-трекинг в реальном времени и проверенные водители",
    needCar: "Мне нужна эта машина",
  },
  tr: {
    fleetDescParagraph: "YukLa modern araç filosu iller arası, şehirler arası ve şehir içi yük taşımacılığına uygundur. Her yükünüz sigortalıdır ve sürekli takip edilir.",
    capacity: "Kapasite",
    dimensions: "Boyutlar",
    tariff: "Tarife (1 km)",
    guarantee1: "%3 komisyon dahil ve sigorta garantili",
    guarantee2: "Canlı GPS takibi ve doğrulanmış sürücüler",
    needCar: "Bu araca ihtiyacım var",
  },
  ar: {
    fleetDescParagraph: "تم تجهيز أسطول YukLa بالكامل لنقل البضائع بين المقاطعات والمدن وداخلها. كل شحنة مؤمنة ومراقبة باستمرار.",
    capacity: "الحمولة",
    dimensions: "الأبعاد",
    tariff: "التعريفة (1 كم)",
    guarantee1: "عمولة تشغيل 3% متضمنة وضمان تأميني شامل",
    guarantee2: "تتبع GPS مباشر وسائقون معتمدون ومرخصون",
    needCar: "أحتاج لهذه الشاحنة",
  },
  zh: {
    fleetDescParagraph: "YukLa现代化车队专为跨省、市际及同城货运量身打造。每一单货品均有足额保险和持续的实时监控。",
    capacity: "承载容量",
    dimensions: "货厢尺寸",
    tariff: "运价 (1 公里)",
    guarantee1: "已含 3% 平台技术服务分成 & 货品安全运输保险",
    guarantee2: "实时 GPS 轨迹定位 & 实名背景核实过司载",
    needCar: "我需要这一辆车",
  },
  fr: {
    fleetDescParagraph: "La flotte moderne YukLa est adaptée aux liaisons interprovinciales, interurbaines et intrapersonnelles. Chaque expédition est assurée et monitorée.",
    capacity: "Capacité",
    dimensions: "Dimensions",
    tariff: "Tarif (1 km)",
    guarantee1: "Commission de 3% incluse & Garantie de transport assurée",
    guarantee2: "Suivi GPS en temps réel & Chauffeurs audités",
    needCar: "Choisir ce véhicule",
  },
  de: {
    fleetDescParagraph: "Der moderne Fuhrpark von YukLa ist für den überregionalen, städtischen und innerstädtischen Güterverkehr bestens gerüstet. Jede Fracht ist versichert und wird lückenlos überwacht.",
    capacity: "Soll-Tragekraft",
    dimensions: "Abmessungen",
    tariff: "Tarif (1 km)",
    guarantee1: "3% Gebühr einberechnet & Transportversicherung garantiert",
    guarantee2: "Echtzeit-GPS-Verfolgung & behördlich geprüfte Fahrer",
    needCar: "Dieses Gefährt buchen",
  },
  es: {
    fleetDescParagraph: "La flota moderna de YukLa está adaptada para transporte interprovincial, interurbano y de reparto urbano. Cada envío cuenta con cobertura de seguro y rastreo satelital continuo.",
    capacity: "Capacidad útil",
    dimensions: "Dimensiones",
    tariff: "Tarifa (1 km)",
    guarantee1: "3% de gestión integrada & Cobertura de trayecto asegurada",
    guarantee2: "Seguimiento en directo GPS & Conductores verificados",
    needCar: "Quiero este vehículo",
  },
  pt: {
    fleetDescParagraph: "A frota moderna YukLa está adaptada para transportar cargas intermunicipais, interurbanas e metropolitanas. Todo envio possui seguro garantido e rastreamento contínuo.",
    capacity: "Capacidade útil",
    dimensions: "Dimensões",
    tariff: "Tarifa (1 km)",
    guarantee1: "3% de taxa inclusa & Seguro de trajeto garantido",
    guarantee2: "Sebe GPS em tempo real & Motoristas plenamente certificados",
    needCar: "Quero este veículo",
  },
  it: {
    fleetDescParagraph: "La flotta moderna YukLa è strutturata per la logistica interregionale, urbana e di ultimo miglio. Ogni carico è coperto da assicurazione e monitorato via satellite.",
    capacity: "Capacità utile",
    dimensions: "Dimensioni box",
    tariff: "Tariffa (1 km)",
    guarantee1: "Commissione del 3% inclusa & Assicurazione di trasporto garantita",
    guarantee2: "Monitoraggio GPS in tempo real & Autisti controllati",
    needCar: "Ho bisogno di questo mezzo",
  }
};

export default function Fleet({ currentLang, onSelectVehicle, hideCTA = false }: FleetProps) {
  const [activeTab, setActiveTab] = useState<string>("Labo");
  const t = (key: string) => TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS["en"]?.[key] || key;
  const lf = (key: string) => LOCAL_FLEET_LANGS[currentLang]?.[key] || LOCAL_FLEET_LANGS["en"]?.[key] || key;

  const currentVehicleData = FLEET_INFO.find((v) => v.name === activeTab) || FLEET_INFO[0];

  // Language translated specific descriptions
  const getDesc = (v: typeof FLEET_INFO[0]) => {
    const descProp = `${currentLang}Desc`;
    if (descProp in v) {
      return (v as any)[descProp];
    }
    return v.desc; // fallback UZ
  };

  return (
    <section id="fleet" className="py-20 relative px-4 lg:px-10 border-t border-white/5 bg-gradient-to-b from-black to-[#05010d]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-900/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="max-w-6xl mx-auto z-10 relative">
        <div className="text-center space-y-4 mb-16">
          <span className="px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] uppercase font-bold tracking-[0.2em] inline-block">
            {t("fleetTitle")}
          </span>
          <h2 className="text-4xl font-extrabold tracking-tight text-white">
            {t("fleetSubtitle")}
          </h2>
          <p className="text-white/40 max-w-xl mx-auto text-sm">
            {lf("fleetDescParagraph")}
          </p>
        </div>

        {/* Tab Buttons Container Container */}
        <div className="flex flex-wrap gap-2 justify-center mb-10 pb-4 border-b border-white/5">
          {FLEET_INFO.map((vehicle) => (
            <button
              key={vehicle.name}
              onClick={() => setActiveTab(vehicle.name)}
              className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all duration-300 cursor-pointer ${
                activeTab === vehicle.name
                  ? "bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/20"
                  : "bg-white/5 text-white/60 border-white/5 hover:bg-white/10 hover:text-white"
              }`}
            >
              {vehicle.name}
            </button>
          ))}
        </div>

        {/* Selected Vehicle detailed Panel */}
        {currentVehicleData && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 lg:p-10 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            {/* Geometric SVG Side */}
            <div className="bg-[#0b0617] border border-white/5 rounded-2xl p-6 h-64 lg:h-80 flex flex-col items-center justify-center relative group overflow-hidden">
              <div className="absolute top-2 left-2 bg-purple-600/20 border border-purple-500/30 text-purple-400 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md">
                Live Blueprint R-2026
              </div>

              {/* Vector Graphic Render */}
              <div className="w-full h-40 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-500">
                {TRUCK_SVGS[currentVehicleData.name] || TRUCK_SVGS["Labo"]}
              </div>

              <div className="text-center text-white/30 text-[10px] uppercase font-mono tracking-wider mt-4">
                YukLa Autopark Registered Chassis Specification
              </div>
            </div>

            {/* Description details Side */}
            <div className="space-y-6">
              <div>
                <span className="text-purple-400 text-[11px] font-bold uppercase tracking-widest">
                  Professional Delivery Asset
                </span>
                <h3 className="text-3xl font-bold text-white mt-1">{currentVehicleData.name}</h3>
              </div>

              <p className="text-white/70 leading-relaxed text-sm lg:text-base">
                {getDesc(currentVehicleData)}
              </p>

              {/* Grid Specifications cards */}
              <div className="grid grid-cols-3 gap-4 border-t border-b border-white/10 py-6">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider flex items-center gap-1">
                    <Scale className="w-3 h-3 text-purple-400" />
                    {lf("capacity")}
                  </span>
                  <p className="text-sm font-bold text-white font-mono">{currentVehicleData.capacity}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider flex items-center gap-1">
                    <Move className="w-3 h-3 text-purple-400" />
                    {lf("dimensions")}
                  </span>
                  <p className="text-sm font-bold text-white font-mono">{currentVehicleData.dimensions}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider flex items-center gap-1">
                    <Fuel className="w-3 h-3 text-indigo-400" />
                    {lf("tariff")}
                  </span>
                  <p className="text-sm font-bold text-purple-300 font-mono">
                    {currentVehicleData.name.includes("Labo") || currentVehicleData.name.includes("Bongo") || currentVehicleData.name.includes("Furgon")
                      ? "3,500 UZS"
                      : currentVehicleData.name.startsWith("ISUZU") || currentVehicleData.name.startsWith("Gruzovik")
                      ? "6,000 UZS"
                      : "10,000 UZS"}
                  </p>
                </div>
              </div>

              {/* Guarantees */}
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 text-xs text-white/70">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span>{lf("guarantee1")}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-white/70">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span>{lf("guarantee2")}</span>
                </div>
              </div>

              {!hideCTA && onSelectVehicle && (
                <button
                  onClick={() => onSelectVehicle(currentVehicleData.name)}
                  className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 text-white font-bold px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-purple-500/10 cursor-pointer text-sm"
                >
                  <span>{lf("needCar")}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
