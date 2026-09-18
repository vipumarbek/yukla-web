import React, { useState, useEffect, useRef } from "react";
import { LanguageCode, User } from "../types";
import { 
  Globe, 
  LogOut, 
  Layout, 
  User as UserIcon, 
  Menu, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Settings,
  Truck,
  ChevronDown,
  ArrowRight,
  Layers
} from "lucide-react";
import { useTranslation } from "../context/LanguageContext";

export interface NavbarProps {
  currentLang: LanguageCode;
  onChangeLang: (lang: LanguageCode) => void;
  user: User | null;
  onLogout: () => void;
  onOpenAuth: (view: "login" | "register") => void;
  onSetView: (view: "home" | "dashboard" | "about" | "services" | "fleet" | "faq" | "contacts") => void;
  onOpenInvestorDeck?: () => void;
  onOpenSecuritySettings?: () => void;
  onOpenSettings?: () => void;
  activeView: string;
}

const LANGUAGES: { code: LanguageCode; name: string; flag: string }[] = [
  { code: "uz", name: "O'zbekcha", flag: "🇺🇿" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
];

export default function Navbar({
  currentLang,
  onChangeLang,
  user,
  onLogout,
  onOpenAuth,
  onSetView,
  onOpenInvestorDeck,
  onOpenSecuritySettings,
  onOpenSettings,
  activeView,
}: NavbarProps) {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [sectionsMenuOpen, setSectionsMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const sectionsMenuRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (langMenuRef.current && !langMenuRef.current.contains(target)) {
        setLangMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserMenuOpen(false);
      }
      if (sectionsMenuRef.current && !sectionsMenuRef.current.contains(target)) {
        setSectionsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileDrawerOpen]);

  const handleNavClick = (view: "home" | "about" | "services" | "fleet" | "faq" | "contacts") => {
    onSetView(view);
    setMobileDrawerOpen(false);

    if (view !== "home") {
      const element = document.getElementById(view);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const navLinks = [
    { id: "home" as const, label: t("navSendCargo") || "Yuk Jo‘natish" },
    { id: "about" as const, label: t("navAbout") || "Biz Haqimizda" },
    { id: "services" as const, label: t("navServices") || "Xizmatlar" },
    { id: "fleet" as const, label: t("navFleet") || "Avtopark" },
    { id: "faq" as const, label: t("navFaq") || "FAQ" },
    { id: "contacts" as const, label: t("navContacts") || "Kontaktlar" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#05010d]/95 backdrop-blur-md">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3 md:gap-6">
        
        {/* 1. LOGO & BRAND INTEGRITY */}
        <div className="flex items-center shrink-0 select-none">
          <button
            onClick={() => handleNavClick("home")}
            className="flex items-center gap-2.5 group cursor-pointer focus:outline-none"
            aria-label="YukLa Home"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-900/40 shrink-0 group-hover:scale-105 transition-transform duration-200">
              <Truck className="w-5 h-5" />
            </div>
            <span className="whitespace-nowrap font-black tracking-wider text-xl sm:text-2xl bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-purple-400 group-hover:opacity-90 transition-opacity">
              YukLa
            </span>
          </button>
        </div>

        {/* 2. NAVIGATION LINKS (RESPONSIVE & OVERFLOW-SAFE) */}
        {!user ? (
          /* Guest Mode: full navigation links on desktop */
          <nav 
            aria-label="Main Navigation"
            className="hidden xl:flex items-center gap-4 lg:gap-6 justify-center flex-1 min-w-0 px-2"
          >
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`whitespace-nowrap text-sm font-medium shrink-0 transition-colors duration-200 cursor-pointer ${
                  activeView === link.id
                    ? "text-purple-400 font-semibold"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {link.label}
              </button>
            ))}

            {onOpenInvestorDeck && (
              <button
                onClick={onOpenInvestorDeck}
                className="whitespace-nowrap shrink-0 flex items-center gap-1.5 text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider cursor-pointer transition shadow-sm"
                title="YukLa Investor Pitch Deck ($5M)"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>INVESTOR DECK</span>
              </button>
            )}
          </nav>
        ) : (
          /* Logged In Mode: Adaptive & Spacious with No Center Overflow */
          <nav
            aria-label="App Navigation"
            className="hidden xl:flex items-center gap-3 lg:gap-5 justify-center flex-1 min-w-0 px-2"
          >
            {/* On Ultra-wide 2xl screens: show full link suite */}
            <div className="hidden 2xl:flex items-center gap-5">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`whitespace-nowrap text-xs font-medium shrink-0 transition-colors duration-200 cursor-pointer ${
                    activeView === link.id
                      ? "text-purple-400 font-semibold"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* On standard desktop (xl to 2xl): show compact "Bo'limlar" dropdown */}
            <div className="flex 2xl:hidden relative shrink-0" ref={sectionsMenuRef}>
              <button
                onClick={() => setSectionsMenuOpen(!sectionsMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 transition cursor-pointer"
                title="Sayt bo'limlari"
              >
                <Layers className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="whitespace-nowrap">Bo‘limlar</span>
                <ChevronDown className={`w-3 h-3 text-white/40 transition-transform ${sectionsMenuOpen ? "rotate-180 text-purple-400" : ""}`} />
              </button>

              {sectionsMenuOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-[#0c0617] border border-purple-500/20 rounded-2xl shadow-2xl py-2 z-50 animate-fade-in backdrop-blur-xl">
                  {navLinks.map((link) => (
                    <button
                      key={link.id}
                      onClick={() => {
                        handleNavClick(link.id);
                        setSectionsMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs transition-colors cursor-pointer flex items-center justify-between ${
                        activeView === link.id
                          ? "bg-purple-600/20 text-purple-300 font-bold"
                          : "text-white/80 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span>{link.label}</span>
                      <ArrowRight className="w-3 h-3 opacity-40" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Investor Deck Pill (shown on 2xl) */}
            {onOpenInvestorDeck && (
              <button
                onClick={onOpenInvestorDeck}
                className="hidden 2xl:flex whitespace-nowrap shrink-0 items-center gap-1.5 text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider cursor-pointer transition shadow-sm"
                title="YukLa Investor Pitch Deck ($5M)"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>INVESTOR DECK</span>
              </button>
            )}
          </nav>
        )}

        {/* 3. ACTION BUTTONS & USER PROFILE MENU */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Language Selector Dropdown */}
          <div className="relative shrink-0" ref={langMenuRef}>
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              aria-label="Tilni tanlash"
              title="Tilni o'zgartirish / Select Language"
              className="w-9 h-9 flex items-center justify-center bg-white/5 hover:bg-purple-600/20 border border-white/10 hover:border-purple-500/30 text-white/90 hover:text-white rounded-full transition-all duration-200 cursor-pointer shrink-0"
            >
              <Globe className="w-4 h-4 text-purple-400 shrink-0" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#0c0617] border border-purple-500/20 rounded-2xl shadow-2xl py-2 z-50 animate-fade-in max-h-80 overflow-y-auto backdrop-blur-xl">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onChangeLang(lang.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2 text-xs text-left whitespace-nowrap transition-colors cursor-pointer ${
                      currentLang === lang.code 
                        ? "bg-purple-600/20 text-purple-400 font-bold" 
                        : "text-white/80 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-sm shrink-0">{lang.flag}</span>
                      <span className="truncate">{lang.name}</span>
                    </span>
                    {currentLang === lang.code && (
                      <span className="h-1.5 w-1.5 bg-purple-400 rounded-full shrink-0"></span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Logged In Actions */}
          {user ? (
            <div className="flex items-center gap-2 shrink-0">
              
              {/* Boshqaruv Paneli (Primary CTA) */}
              <button
                onClick={() => onSetView("dashboard")}
                className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold uppercase tracking-wider px-3 sm:px-3.5 py-2 rounded-full transition-all duration-300 shadow-md shadow-purple-900/40 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Layout className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap hidden sm:inline">{t("navDashboard") || "Boshqaruv Paneli"}</span>
              </button>

              {/* Interactive User Profile Dropdown */}
              <div className="relative shrink-0" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 rounded-full px-2.5 sm:px-3 py-1.5 text-xs text-white/90 transition-all cursor-pointer shrink-0"
                  title={`${user.name} (${user.role})`}
                >
                  <div className="w-5 h-5 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                    <UserIcon className="w-3 h-3" />
                  </div>
                  <span className="max-w-[100px] sm:max-w-[140px] truncate font-medium text-white whitespace-nowrap">
                    {user.name}
                  </span>
                  
                  {/* Role Badge */}
                  <span className="px-1.5 py-0.5 text-[10px] font-bold leading-none rounded-full shrink-0 bg-purple-600/30 text-purple-300 border border-purple-500/20 uppercase whitespace-nowrap hidden md:inline-block">
                    {user.role}
                  </span>

                  <ChevronDown className={`w-3.5 h-3.5 text-white/40 transition-transform duration-200 ${userMenuOpen ? "rotate-180 text-purple-400" : ""}`} />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#0c0617] border border-purple-500/20 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in backdrop-blur-xl divide-y divide-white/5">
                    {/* User Header */}
                    <div className="px-3 py-2.5">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-white truncate">{user.name}</span>
                        <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase rounded bg-purple-600/40 text-purple-300 border border-purple-500/30">
                          {user.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/50 truncate">{user.phone || user.email || "YukLa Verified"}</p>
                    </div>

                    {/* Quick Access Menu Items */}
                    <div className="py-1.5 space-y-0.5">
                      <button
                        onClick={() => {
                          onSetView("dashboard");
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-white/80 hover:text-white hover:bg-white/5 transition text-left cursor-pointer"
                      >
                        <Layout className="w-4 h-4 text-purple-400 shrink-0" />
                        <span>Boshqaruv Paneli</span>
                      </button>

                      {onOpenSecuritySettings && (
                        <button
                          onClick={() => {
                            onOpenSecuritySettings();
                            setUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-purple-300 hover:text-white hover:bg-purple-600/20 transition text-left cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
                          <span>Biometrik Xavfsizlik</span>
                        </button>
                      )}

                      {onOpenSettings && (
                        <button
                          onClick={() => {
                            onOpenSettings();
                            setUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-white/80 hover:text-white hover:bg-white/5 transition text-left cursor-pointer"
                        >
                          <Settings className="w-4 h-4 text-purple-400 shrink-0" />
                          <span>Sozlamalar (Ovoz & Bildirishnoma)</span>
                        </button>
                      )}

                      {onOpenInvestorDeck && (
                        <button
                          onClick={() => {
                            onOpenInvestorDeck();
                            setUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 transition text-left cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>Investor Pitch Deck ($5M)</span>
                        </button>
                      )}
                    </div>

                    {/* Logout */}
                    <div className="pt-1.5">
                      <button
                        onClick={() => {
                          onLogout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 transition font-medium text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{t("navLogout") || "Tizimdan chiqish"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Logout Button (Navbar) */}
              <button
                onClick={onLogout}
                aria-label="Chiqish"
                title={t("navLogout") || "Tizimdan chiqish"}
                className="p-2 text-white/50 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10 rounded-full border border-white/10 hover:border-rose-500/30 transition-all duration-200 cursor-pointer shrink-0"
              >
                <LogOut className="w-4 h-4 shrink-0" />
              </button>
            </div>
          ) : (
            /* Guest Auth Buttons */
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <button
                onClick={() => onOpenAuth("login")}
                className="text-white/80 hover:text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap transition-colors"
              >
                {t("navLogin") || "Kirish"}
              </button>
              <button
                onClick={() => onOpenAuth("register")}
                className="bg-white text-black hover:bg-purple-500 hover:text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-lg cursor-pointer whitespace-nowrap shrink-0"
              >
                {t("navRegister") || "Ro'yxatdan o'tish"}
              </button>
            </div>
          )}

          {/* Mobile / Tablet Hamburger Toggle (Shown below xl: 1280px) */}
          <button
            onClick={() => setMobileDrawerOpen(true)}
            aria-label="Navigatsiya menyusini ochish"
            className="p-2 xl:hidden text-white/80 hover:text-white bg-white/5 hover:bg-purple-600/20 rounded-full border border-white/10 hover:border-purple-500/30 transition cursor-pointer shrink-0"
          >
            <Menu className="w-5 h-5 shrink-0" />
          </button>
        </div>

      </div>

      {/* MOBILE / TABLET RESPONSIVE SLIDE-OVER DRAWER (below 1280px) */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-fade-in"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Drawer Sheet */}
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-[#090317] border-l border-purple-500/20 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-slide-left z-10">
            <div className="space-y-6">
              
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2 select-none">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
                    <Truck className="w-4 h-4" />
                  </div>
                  <span className="font-black text-lg text-white whitespace-nowrap tracking-wider">
                    YukLa
                  </span>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile in Drawer if Logged In */}
              {user && (
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[10px] text-white/40 truncate">{user.phone || user.email}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-purple-600/30 text-purple-300 border border-purple-500/20 whitespace-nowrap shrink-0">
                    {user.role}
                  </span>
                </div>
              )}

              {/* Navigation Links */}
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 px-2">
                  Navigatsiya
                </p>
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer whitespace-nowrap flex items-center justify-between ${
                      activeView === link.id
                        ? "bg-purple-600/20 text-purple-300 font-bold border border-purple-500/30"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-40" />
                  </button>
                ))}

                {/* Investor Deck Link in Drawer */}
                {onOpenInvestorDeck && (
                  <button
                    onClick={() => {
                      onOpenInvestorDeck();
                      setMobileDrawerOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition cursor-pointer whitespace-nowrap flex items-center justify-between mt-2"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>INVESTOR DECK ($5M)</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400/60" />
                  </button>
                )}
              </div>

              {/* Drawer Quick Actions */}
              {user ? (
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1 px-2">
                    Boshqaruv & Sozlamalar
                  </p>
                  
                  <button
                    onClick={() => {
                      onSetView("dashboard");
                      setMobileDrawerOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-lg cursor-pointer whitespace-nowrap"
                  >
                    <Layout className="w-4 h-4 shrink-0" />
                    <span>{t("navDashboard") || "Boshqaruv Paneli"}</span>
                  </button>

                  {onOpenSecuritySettings && (
                    <button
                      onClick={() => {
                        onOpenSecuritySettings();
                        setMobileDrawerOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/5 border border-purple-500/20 text-purple-300 hover:bg-purple-600/20 text-xs font-semibold transition cursor-pointer whitespace-nowrap"
                    >
                      <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Biometrik Xavfsizlik</span>
                    </button>
                  )}

                  {onOpenSettings && (
                    <button
                      onClick={() => {
                        onOpenSettings();
                        setMobileDrawerOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 text-xs font-semibold transition cursor-pointer whitespace-nowrap"
                    >
                      <Settings className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Bildirishnoma va Ovoz Sozlamalari</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2 pt-4 border-t border-white/10">
                  <button
                    onClick={() => {
                      onOpenAuth("login");
                      setMobileDrawerOpen(false);
                    }}
                    className="w-full py-3 rounded-xl border border-white/20 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/5 transition cursor-pointer whitespace-nowrap text-center"
                  >
                    {t("navLogin") || "Kirish"}
                  </button>
                  <button
                    onClick={() => {
                      onOpenAuth("register");
                      setMobileDrawerOpen(false);
                    }}
                    className="w-full py-3 rounded-xl bg-white text-black font-black text-xs uppercase tracking-wider hover:bg-purple-500 hover:text-white transition shadow-lg cursor-pointer whitespace-nowrap text-center"
                  >
                    {t("navRegister") || "Ro'yxatdan o'tish"}
                  </button>
                </div>
              )}

            </div>

            {/* Drawer Footer / Logout */}
            {user && (
              <div className="pt-6 border-t border-white/10">
                <button
                  onClick={() => {
                    onLogout();
                    setMobileDrawerOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold text-xs transition cursor-pointer whitespace-nowrap"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>{t("navLogout") || "Tizimdan chiqish"}</span>
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </header>
  );
}
