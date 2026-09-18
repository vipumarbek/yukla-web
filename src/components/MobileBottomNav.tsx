import React, { useState } from "react";
import { 
  Home, 
  Package, 
  PlusCircle, 
  Wallet, 
  User, 
  Compass, 
  Truck, 
  Navigation, 
  Briefcase, 
  Activity, 
  ShieldCheck, 
  Zap, 
  Settings, 
  LogIn
} from "lucide-react";
import { User as UserType } from "../types";

interface MobileBottomNavProps {
  user: UserType | null;
  activeView: "home" | "dashboard";
  setActiveView: (view: "home" | "dashboard") => void;
  onOpenAuth: () => void;
  onOpenNewOrder?: () => void;
  onOpenVoiceAssistant?: () => void;
  activeRoleTab?: string;
  onSelectRoleTab?: (tab: string) => void;
  pendingNotificationCount?: number;
}

export default function MobileBottomNav({
  user,
  activeView,
  setActiveView,
  onOpenAuth,
  onOpenNewOrder,
  activeRoleTab,
  onSelectRoleTab,
  pendingNotificationCount = 0
}: MobileBottomNavProps) {
  // Trigger light haptic vibration if supported
  const triggerHaptic = () => {
    try {
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(12);
      }
    } catch {
      // ignore
    }
  };

  // 1. GUEST USER NAV
  if (!user) {
    return (
      <nav 
        id="mobile_bottom_nav_guest"
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[#070314]/92 backdrop-blur-xl border-t border-white/10 px-2 py-1.5 pb-safe shadow-[0_-10px_25px_rgba(0,0,0,0.6)]"
      >
        <div className="grid grid-cols-4 items-center justify-around max-w-md mx-auto">
          <button
            onClick={() => {
              triggerHaptic();
              setActiveView("home");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
              activeView === "home" ? "text-purple-400 font-bold" : "text-white/60 hover:text-white"
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Asosiy</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic();
              setActiveView("home");
              const el = document.getElementById("fleet-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-white/60 hover:text-white transition"
          >
            <Truck className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Park</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic();
              setActiveView("home");
              const el = document.getElementById("quick-calc-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-white/60 hover:text-white transition"
          >
            <Zap className="w-5 h-5 mb-0.5 text-amber-400" />
            <span className="text-[10px] tracking-tight">Kalkulyator</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic();
              onOpenAuth();
            }}
            className="flex flex-col items-center justify-center py-1 px-2 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 transition hover:bg-purple-600/30"
          >
            <LogIn className="w-5 h-5 mb-0.5 text-purple-400" />
            <span className="text-[10px] font-bold tracking-tight">Kirish</span>
          </button>
        </div>
      </nav>
    );
  }

  // 2. CUSTOMER (SHIPPER) NAV
  if (user.role === "customer") {
    return (
      <nav 
        id="mobile_bottom_nav_customer"
        aria-label="Customer Navigation"
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[#070314]/94 backdrop-blur-xl border-t border-white/10 px-2 py-1.5 pb-safe shadow-[0_-10px_25px_rgba(0,0,0,0.6)]"
      >
        <div className="grid grid-cols-5 items-center justify-around max-w-md mx-auto">
          <button
            onClick={() => {
              triggerHaptic();
              setActiveView("dashboard");
              onSelectRoleTab?.("hub");
            }}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition ${
              activeRoleTab === "hub" || !activeRoleTab ? "text-purple-400 font-bold" : "text-white/60 hover:text-white"
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[9.5px] tracking-tight">Asosiy</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic();
              setActiveView("dashboard");
              onSelectRoleTab?.("history");
            }}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition ${
              activeRoleTab === "history" ? "text-purple-400 font-bold" : "text-white/60 hover:text-white"
            }`}
          >
            <Package className="w-5 h-5 mb-0.5" />
            <span className="text-[9.5px] tracking-tight">Yuklarim</span>
          </button>

          {/* Centered Prominent Quick New Order Button */}
          <button
            onClick={() => {
              triggerHaptic();
              setActiveView("dashboard");
              if (onOpenNewOrder) {
                onOpenNewOrder();
              } else {
                onSelectRoleTab?.("book");
              }
            }}
            className="flex flex-col items-center justify-center -mt-5"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-900/60 border-2 border-[#070314] active:scale-95 transition">
              <PlusCircle className="w-6 h-6" />
            </div>
            <span className="text-[9px] font-bold text-purple-300 mt-0.5">+ Buyurtma</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic();
              setActiveView("dashboard");
              onSelectRoleTab?.("payments");
            }}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition ${
              activeRoleTab === "payments" ? "text-purple-400 font-bold" : "text-white/60 hover:text-white"
            }`}
          >
            <Wallet className="w-5 h-5 mb-0.5" />
            <span className="text-[9.5px] tracking-tight">Hamyon</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic();
              setActiveView("dashboard");
              onSelectRoleTab?.("profile");
            }}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition ${
              activeRoleTab === "profile" ? "text-purple-400 font-bold" : "text-white/60 hover:text-white"
            }`}
          >
            <User className="w-5 h-5 mb-0.5" />
            <span className="text-[9.5px] tracking-tight">Profil</span>
          </button>
        </div>
      </nav>
    );
  }

  // 3. DRIVER (CARRIER) NAV
  if (user.role === "driver") {
    return (
      <nav 
        id="mobile_bottom_nav_driver"
        aria-label="Driver Navigation"
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[#070314]/94 backdrop-blur-xl border-t border-white/10 px-2 py-1.5 pb-safe shadow-[0_-10px_25px_rgba(0,0,0,0.6)]"
      >
        <div className="grid grid-cols-5 items-center justify-around max-w-md mx-auto">
          <button
            onClick={() => {
              triggerHaptic();
              setActiveView("dashboard");
              onSelectRoleTab?.("available");
            }}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition ${
              activeRoleTab === "available" || activeRoleTab === "dashboard" ? "text-purple-400 font-bold" : "text-white/60 hover:text-white"
            }`}
          >
            <Compass className="w-5 h-5 mb-0.5" />
            <span className="text-[9.5px] tracking-tight">Birja</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic();
              setActiveView("dashboard");
              onSelectRoleTab?.("active");
            }}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition ${
              activeRoleTab === "active" ? "text-green-400 font-bold" : "text-white/60 hover:text-white"
            }`}
          >
            <Navigation className="w-5 h-5 mb-0.5 text-green-400" />
            <span className="text-[9.5px] tracking-tight">Faol Tashuv</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic();
              setActiveView("dashboard");
              onSelectRoleTab?.("backhaul");
            }}
            className="flex flex-col items-center justify-center -mt-5"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 text-white flex items-center justify-center shadow-lg shadow-emerald-950/60 border-2 border-[#070314] active:scale-95 transition">
              <Zap className="w-6 h-6" />
            </div>
            <span className="text-[9px] font-bold text-emerald-300 mt-0.5">Backhaul</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic();
              setActiveView("dashboard");
              onSelectRoleTab?.("earnings");
            }}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition ${
              activeRoleTab === "earnings" ? "text-purple-400 font-bold" : "text-white/60 hover:text-white"
            }`}
          >
            <Wallet className="w-5 h-5 mb-0.5" />
            <span className="text-[9.5px] tracking-tight">Kassa</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic();
              setActiveView("dashboard");
              onSelectRoleTab?.("profile");
            }}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition relative ${
              activeRoleTab === "profile" ? "text-purple-400 font-bold" : "text-white/60 hover:text-white"
            }`}
          >
            <User className="w-5 h-5 mb-0.5" />
            <span className="text-[9.5px] tracking-tight">Profil</span>
            {pendingNotificationCount > 0 && (
              <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-fuchsia-500 animate-ping" />
            )}
          </button>
        </div>
      </nav>
    );
  }

  // 4. COMPANY (FLEET) NAV
  if (user.role === "company") {
    return (
      <nav 
        id="mobile_bottom_nav_company"
        aria-label="Company Navigation"
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[#070314]/94 backdrop-blur-xl border-t border-white/10 px-2 py-1.5 pb-safe shadow-[0_-10px_25px_rgba(0,0,0,0.6)]"
      >
        <div className="grid grid-cols-5 items-center justify-around max-w-md mx-auto">
          <button
            onClick={() => {
              triggerHaptic();
              setActiveView("dashboard");
              onSelectRoleTab?.("overview");
            }}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition ${
              activeRoleTab === "overview" || !activeRoleTab ? "text-purple-400 font-bold" : "text-white/60 hover:text-white"
            }`}
          >
            <Activity className="w-5 h-5 mb-0.5" />
            <span className="text-[9.5px] tracking-tight">Fleet Hub</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic();
              setActiveView("dashboard");
              onSelectRoleTab?.("telematics");
            }}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition ${
              activeRoleTab === "telematics" ? "text-purple-400 font-bold" : "text-white/60 hover:text-white"
            }`}
          >
            <Navigation className="w-5 h-5 mb-0.5" />
            <span className="text-[9.5px] tracking-tight">GPS Radar</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic();
              setActiveView("dashboard");
              onSelectRoleTab?.("tenders");
            }}
            className="flex flex-col items-center justify-center -mt-5"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-950/60 border-2 border-[#070314] active:scale-95 transition">
              <Briefcase className="w-6 h-6" />
            </div>
            <span className="text-[9px] font-bold text-purple-300 mt-0.5">Tenderlar</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic();
              setActiveView("dashboard");
              onSelectRoleTab?.("finances");
            }}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition ${
              activeRoleTab === "finances" || activeRoleTab === "factoring" ? "text-purple-400 font-bold" : "text-white/60 hover:text-white"
            }`}
          >
            <Wallet className="w-5 h-5 mb-0.5" />
            <span className="text-[9.5px] tracking-tight">Faktoring</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic();
              setActiveView("dashboard");
              onSelectRoleTab?.("settings");
            }}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition ${
              activeRoleTab === "settings" ? "text-purple-400 font-bold" : "text-white/60 hover:text-white"
            }`}
          >
            <Settings className="w-5 h-5 mb-0.5" />
            <span className="text-[9.5px] tracking-tight">Sozlamalar</span>
          </button>
        </div>
      </nav>
    );
  }

  // 5. SUPER ADMIN NAV
  return (
    <nav 
      id="mobile_bottom_nav_admin"
      aria-label="Admin Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[#070314]/94 backdrop-blur-xl border-t border-white/10 px-2 py-1.5 pb-safe shadow-[0_-10px_25px_rgba(0,0,0,0.6)]"
    >
      <div className="grid grid-cols-5 items-center justify-around max-w-md mx-auto">
        <button
          onClick={() => {
            triggerHaptic();
            setActiveView("dashboard");
            onSelectRoleTab?.("analytics");
          }}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition ${
            activeRoleTab === "analytics" || !activeRoleTab ? "text-purple-400 font-bold" : "text-white/60 hover:text-white"
          }`}
        >
          <Activity className="w-5 h-5 mb-0.5" />
          <span className="text-[9.5px] tracking-tight">Mission</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic();
            setActiveView("dashboard");
            onSelectRoleTab?.("orders");
          }}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition ${
            activeRoleTab === "orders" ? "text-purple-400 font-bold" : "text-white/60 hover:text-white"
          }`}
        >
          <Package className="w-5 h-5 mb-0.5" />
          <span className="text-[9.5px] tracking-tight">Buyurtmalar</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic();
            setActiveView("dashboard");
            onSelectRoleTab?.("security");
          }}
          className="flex flex-col items-center justify-center -mt-5"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-red-600 via-purple-650 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-950/60 border-2 border-[#070314] active:scale-95 transition">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="text-[9px] font-bold text-purple-300 mt-0.5">Xavfsizlik</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic();
            setActiveView("dashboard");
            onSelectRoleTab?.("payments");
          }}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition ${
            activeRoleTab === "payments" ? "text-purple-400 font-bold" : "text-white/60 hover:text-white"
          }`}
        >
          <Wallet className="w-5 h-5 mb-0.5" />
          <span className="text-[9.5px] tracking-tight">Escrow</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic();
            setActiveView("dashboard");
            onSelectRoleTab?.("qa");
          }}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition ${
            activeRoleTab === "qa" || activeRoleTab === "observability" ? "text-purple-400 font-bold" : "text-white/60 hover:text-white"
          }`}
        >
          <Zap className="w-5 h-5 mb-0.5 text-amber-400" />
          <span className="text-[9.5px] tracking-tight">QA Suite</span>
        </button>
      </div>
    </nav>
  );
}
