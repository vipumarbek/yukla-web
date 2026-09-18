/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { TRANSLATIONS, FLEET_INFO } from "./translations";
import { useTranslation } from "./context/LanguageContext";
import { LanguageCode, User, Order, FAQ, NewsArticle, AuditLog, OrderStatus } from "./types";
import Header from "./components/Header";
import Fleet from "./components/Fleet";
import AiAssistant from "./components/AiAssistant";
import DashboardCustomer from "./components/DashboardCustomer";
import DashboardDriver from "./components/DashboardDriver";
import DashboardAdmin from "./components/DashboardAdmin";
import DashboardCompany from "./components/DashboardCompany";
import InvestorDeckModal from "./components/InvestorDeckModal";
import CentralAsiaFreightTerminal from "./components/CentralAsiaFreightTerminal";
import AiLogisticsDispatcher from "./components/AiLogisticsDispatcher";
import EnterpriseShipperHub from "./components/EnterpriseShipperHub";
import Footer from "./components/Footer";
import SaaSPolicies from "./components/SaaSPolicies";
import LogisticsMarketplace from "./components/LogisticsMarketplace";
import CameraCapture from "./components/CameraCapture";
import PermissionExplainerModal from "./components/PermissionExplainerModal";
import OfflineBanner from "./components/OfflineBanner";
import MobileBottomNav from "./components/MobileBottomNav";
import MobileQuickActionFAB from "./components/MobileQuickActionFAB";
import VoiceShipmentModal from "./components/VoiceShipmentModal";
import DigitalSignatureModal from "./components/DigitalSignatureModal";
import QrScannerModal from "./components/QrScannerModal";
import BiometricLoginModal from "./components/BiometricLoginModal";
import BiometricSecuritySettingsModal from "./components/BiometricSecuritySettingsModal";
import SettingsModal, { NotificationSettings } from "./components/SettingsModal";
import { MOCK_LOGISTICS_SERVICES, LogisticsProduct } from "./data/mockLogisticsServices";
import {
  Truck,
  Shield,
  Clock,
  ArrowRight,
  HelpCircle,
  FileText,
  User as UserIcon,
  Briefcase,
  Layers,
  MapPin,
  Star,
  CheckCircle2,
  Calendar,
  Sparkles,
  Award,
  Bell,
  Volume2,
  Mail,
  PhoneCall,
  Fingerprint,
  ScanFace
} from "lucide-react";
import { io } from "socket.io-client";

// Sound synthesis helper for driver real-time order alerts (Web Audio API)
function playNotificationSound() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.stop(ctx.currentTime + 0.3);
  } catch (err) {
    console.warn("Audio Context blocked or failed:", err);
  }
}

export default function App() {
  const { currentLang, t, changeLang, setToken: setContextToken } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("yukla_token"));
  const [initialLoading, setInitialLoading] = useState(true);
  const [activeView, setActiveView] = useState<"home" | "dashboard">("home");

  const handleChangeLang = async (lang: LanguageCode) => {
    await changeLang(lang);
    if (token) {
      setUser(prev => prev ? { ...prev, language: lang } : null);
    }
  };

  useEffect(() => {
    setContextToken(token);
  }, [token, setContextToken]);

  // Core Entity Pools
  const [orders, setOrders] = useState<Order[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [newsList, setNewsList] = useState<NewsArticle[]>([]);
  const [faqList, setFaqList] = useState<FAQ[]>([]);
  const [revenueHistory, setRevenueHistory] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Auth Overlay Modals State
  const [authModal, setAuthModal] = useState<"login" | "register" | "forgotPassword" | "resetPassword" | "verifyEmail" | null>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authRole, setAuthRole] = useState<"customer" | "driver" | "company">("customer");
  const [authCompanyName, setAuthCompanyName] = useState("");
  const [authCompanyTaxId, setAuthCompanyTaxId] = useState("");
  const [driverVehicle, setDriverVehicle] = useState("Labo");
  const [driverPlates, setDriverPlates] = useState("");
  const [regProfilePhoto, setRegProfilePhoto] = useState("");
  const [authError, setAuthError] = useState("");
  const [showInvestorDeck, setShowInvestorDeck] = useState(false);
  const [showSecuritySettingsModal, setShowSecuritySettingsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
    try {
      const saved = localStorage.getItem("yukla_notification_settings");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { soundEnabled: false, pushEnabled: true };
  });
  const notificationSettingsRef = useRef(notificationSettings);
  useEffect(() => {
    notificationSettingsRef.current = notificationSettings;
  }, [notificationSettings]);

  // Custom password-reset & verification inputs
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [emailVerifyCode, setEmailVerifyCode] = useState("");

  // SaaS Legal Center overlays state
  const [sassPolicyTab, setSassPolicyTab] = useState<"terms" | "privacy" | "cookie" | null>(null);

  // Prefilled logistics marketplace element
  const [prefilledBooking, setPrefilledBooking] = useState<any>(null);

  // Loading indicator states
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Guest Quick calculator tool params
  const [guestVehicle, setGuestVehicle] = useState("Labo");
  const [guestDistance, setGuestDistance] = useState("50");
  const [calculatedGuestPrice, setCalculatedGuestPrice] = useState<number | null>(null);

  // Mobile App Native Features State
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showQrScannerModal, setShowQrScannerModal] = useState(false);
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [activeRoleTab, setActiveRoleTab] = useState<string>("hub");

  // Listen to address hash events to surface real terms & private declarations
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#terms-of-service") {
        setSassPolicyTab("terms");
      } else if (hash === "#privacy-policy") {
        setSassPolicyTab("privacy");
      } else if (hash === "#cookie-policy") {
        setSassPolicyTab("cookie");
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    handleHashChange(); // Run once initially
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // 1. Initial State load & Cache controls
  useEffect(() => {
    // Fast-track preseed lists for guest navigation
    fetchFAQs();
    fetchNews();

    if (token) {
      fetchCurrentUser();
    } else {
      setInitialLoading(false);
    }
  }, [token]);

  // Fetch static assets
  const fetchFAQs = async () => {
    try {
      const r = await fetch("/api/faqs");
      const d = await r.json();
      if (r.ok) setFaqList(d);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchNews = async () => {
    try {
      const r = await fetch("/api/news");
      const d = await r.json();
      if (r.ok) setNewsList(d);
    } catch (e) {
      console.error(e);
    }
  };

  // Authenticated operational fetches
  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.status === 401) {
        // Access token expired, attempt to refresh using Secure Cookies & LocalStorage Fallback
        const storedRefreshToken = localStorage.getItem("yukla_refresh_token");
        const refreshRes = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: storedRefreshToken })
        });
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          localStorage.setItem("yukla_token", refreshData.token);
          if (refreshData.refreshToken) {
            localStorage.setItem("yukla_refresh_token", refreshData.refreshToken);
          }
          setToken(refreshData.token);
          setUser(refreshData.user);
          if (refreshData.user.language) {
            changeLang(refreshData.user.language);
            localStorage.setItem("yukla_lang", refreshData.user.language);
            sessionStorage.setItem("yukla_lang", refreshData.user.language);
          }
          return;
        } else {
          handleLogout();
          return;
        }
      }

      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        if (data.user.language) {
          changeLang(data.user.language);
          localStorage.setItem("yukla_lang", data.user.language);
          sessionStorage.setItem("yukla_lang", data.user.language);
        }
        // Load data specific to role
        fetchAllOrders();
        if (data.user.role === "admin") {
          fetchUsersAdmin();
          fetchAdminRevenues();
          fetchAuditLogs();
        }
      } else {
        // Stale session
        handleLogout();
      }
    } catch (err) {
      console.error(err);
      handleLogout();
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchAllOrders = async () => {
    if (!token) return;
    try {
      const r = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await r.json();
      if (r.ok) setOrders(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUsersAdmin = async () => {
    try {
      const r = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await r.json();
      if (r.ok) setUsersList(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAdminRevenues = async () => {
    try {
      const r = await fetch("/api/revenue", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await r.json();
      if (r.ok) setRevenueHistory(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const r = await fetch("/api/audit-logs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await r.json();
      if (r.ok) setAuditLogs(data);
    } catch (e) {
      console.error(e);
    }
  };

  // 2. Socket.IO Core Binding Events for real-time synchronization
  useEffect(() => {
    if (!token) return;

    // Connect securely by sending Authorization Handshake payload
    const socket = io({
      auth: { token },
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000
    });

    socket.on("connect", () => {
      console.log("WebSocket connected successfully with secure handshake context", user?.email);
    });

    socket.on("order_created", (newOrd: Order) => {
      setOrders((prev) => {
        if (prev.some((o) => o.id === newOrd.id)) return prev;
        return [newOrd, ...prev];
      });
      // Visual notification retained (toast & badges)
      showTemporaryToast(`Yangi buyurtma: #${newOrd.id.substring(0, 8).toUpperCase()} - ${newOrd.pickupAddress}`);
      // Sound notification is disabled for order creation per enterprise spec
    });

    socket.on("order_updated", (updatedOrd: Order) => {
      setOrders((prev) => prev.map((o) => (o.id === updatedOrd.id ? updatedOrd : o)));
      showTemporaryToast(`Buyurtma holati yangilandi: #${updatedOrd.id.substring(0, 8).toUpperCase()} -> ${updatedOrd.status}`);
      if (notificationSettingsRef.current.soundEnabled) {
        playNotificationSound();
      }
      // If admin, refetch analytics metrics
      if (user?.role === "admin") {
        fetchAdminRevenues();
        fetchAuditLogs();
      }
    });

    socket.on("order_deleted", (deletedId: string) => {
      setOrders((prev) => prev.filter((o) => o.id !== deletedId));
      showTemporaryToast(`Buyurtma o'chirildi: #${deletedId.substring(0, 8).toUpperCase()}`);
    });

    socket.on("status_alert", (data: any) => {
      showTemporaryToast(`Bildirishnoma: ${data.message}`);
      if (notificationSettingsRef.current.soundEnabled) {
        playNotificationSound();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [token, user?.id]);

  const showTemporaryToast = (msg: string) => {
    setAlertMessage(msg);
    setTimeout(() => {
      setAlertMessage((p) => (p === msg ? null : p));
    }, 5000);
  };

  // 3. User Authentication handlers
  const handleQuickDemoLogin = async (demoEmail: string, demoPass: string) => {
    setAuthError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: demoEmail, password: demoPass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ulanishda muammo yuz berdi.");
      localStorage.setItem("yukla_token", data.token);
      if (data.refreshToken) localStorage.setItem("yukla_refresh_token", data.refreshToken);
      setToken(data.token);
      setUser(data.user);
      if (data.user.language) {
        changeLang(data.user.language);
      }
      setAuthModal(null);
      setActiveView("dashboard");
      showTemporaryToast(`Xush kelibsiz, ${data.user.name}! (${data.user.role.toUpperCase()})`);
    } catch (err: any) {
      setAuthError(err.message || "Kirishda xatolik.");
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);

    const isLogin = authModal === "login";
    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const bodyArgs = isLogin
      ? { email: authEmail, password: authPassword }
      : {
          email: authEmail,
          password: authPassword,
          name: authName,
          phone: authPhone,
          role: authRole,
          companyName: authRole === "company" ? (authCompanyName || authName) : undefined,
          companyTaxId: authRole === "company" ? authCompanyTaxId : undefined,
          vehicleType: authRole === "driver" ? driverVehicle : undefined,
          vehiclePlates: authRole === "driver" ? driverPlates : undefined,
          profilePhoto: authRole === "driver" ? regProfilePhoto : undefined,
        };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyArgs),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ulanishda muammo yuz berdi.");
      }

      // Successful auth flow
      localStorage.setItem("yukla_token", data.token);
      if (data.refreshToken) {
        localStorage.setItem("yukla_refresh_token", data.refreshToken);
      }
      setToken(data.token);
      setUser(data.user);
      if (data.user.language) {
        changeLang(data.user.language);
        localStorage.setItem("yukla_lang", data.user.language);
        sessionStorage.setItem("yukla_lang", data.user.language);
      } else {
        // sync currently chosen language to the newly authenticated profile
        fetch("/api/users/language", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.token}`
          },
          body: JSON.stringify({ language: currentLang })
        }).catch(err => console.error("Could not sync preference on login", err));
      }
      setAuthModal(null);
      setActiveView("dashboard");
      setAuthPassword("");

      // dynamic greeting message in the active language
      const greetingMap: Record<string, string> = {
        uz: "Assalomu alaykum",
        en: "Welcome",
        ru: "Добро пожаловать",
        tr: "Hoş geldiniz",
        ar: "مرحباً بك",
        zh: "欢迎回来",
        fr: "Bienvenue",
        de: "Willkommen",
        es: "Bienvenido",
        pt: "Bem-vindo",
        it: "Benificato"
      };
      const salut = greetingMap[currentLang] || "Welcome";
      showTemporaryToast(`${salut}, ${data.user.name}!`);
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || "Tizimga kirishda xato.");
    } finally {
      setLoading(false);
    }
  };

  // Advanced Security Handlers
  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!forgotEmail) {
      setAuthError("Iltimos, pochtangizni kiriting.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Xatolik yuz berdi");

      showTemporaryToast("Parolni tiklash kodi yuborildi!");
      setAuthModal("resetPassword");
    } catch (err: any) {
      setAuthError(err.message || "Xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!resetToken || !resetNewPassword) {
      setAuthError("Barcha maydonlarni to'ldiring.");
      return;
    }
    if (resetNewPassword.length < 6) {
      setAuthError("Yangi parol kamida 6 belgidan iborat bo'lishi kerak.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail,
          token: resetToken,
          newPassword: resetNewPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Xatolik yuz berdi");

      showTemporaryToast("Parolingiz muvaffaqiyatli tiklandi!");
      // Pre-fill login credentials
      setAuthEmail(forgotEmail);
      setAuthPassword(resetNewPassword);
      setAuthModal("login");
    } catch (err: any) {
      setAuthError(err.message || "Xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestEmailVerification = async () => {
    setAuthError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/email/request-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kod yuborib bo'lmadi");
      showTemporaryToast("Tasdiqlash kodi muvaffaqiyatli yuborildi!");
    } catch (err: any) {
      setAuthError(err.message || "Xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!emailVerifyCode) {
      setAuthError("Tasdiqlash kodini kiriting.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/email/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ code: emailVerifyCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ulanishda xatolik yuz berdi");

      showTemporaryToast("Akkauntingiz muvaffaqiyatli tasdiqlandi!");
      setUser(prev => prev ? { ...prev, emailVerified: true } : null);
      setAuthModal(null);
    } catch (err: any) {
      setAuthError(err.message || "Xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
    } catch (err) {
      console.error("Logout error", err);
    }
    localStorage.removeItem("yukla_token");
    localStorage.removeItem("yukla_refresh_token");
    setToken(null);
    setUser(null);
    setActiveView("home");
    setOrders([]);
    showTemporaryToast("Tizimdan muvaffaqiyatli chiqdingiz.");
  };

  // Biometric Instant Login
  const handleBiometricSuccess = (data: { token: string; refreshToken?: string; user: User; role: string }) => {
    localStorage.setItem("yukla_token", data.token);
    if (data.refreshToken) {
      localStorage.setItem("yukla_refresh_token", data.refreshToken);
    }
    if (data.user?.language) {
      localStorage.setItem("yukla_lang", data.user.language);
      changeLang(data.user.language as any);
    }
    setToken(data.token);
    setUser(data.user);
    setAuthModal(null);
    setShowBiometricModal(false);
    setActiveView("dashboard");
    showTemporaryToast(`${data.user.name} (${data.user.role.toUpperCase()}) sifatida biometrik kirish muvaffaqiyatli amalga oshirildi!`);
  };

  // Apply parsed voice shipment to new booking state
  const handleApplyVoiceShipment = (parsed: any) => {
    setPrefilledBooking({
      title: parsed.cargoType,
      vehicle: parsed.vehicle,
      pickup: parsed.pickup,
      destination: parsed.delivery,
      weight: parsed.weight,
      volume: parsed.volume,
      price: "1850000"
    });
    if (!user) {
      setAuthModal("login");
      showTemporaryToast("Ovozli buyurtmani tasdiqlash uchun tizimga kiring.");
    } else {
      setActiveView("dashboard");
      showTemporaryToast("Ovozli buyurtma ma'lumotlari yuklandi!");
    }
  };

  // 4. Shippers Order creation proxy
  const handleCreateOrder = async (orderData: Partial<Order>) => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error Creating cargo order request");

      showTemporaryToast("Buyurtma muvaffaqiyatli platformaga joylandi!");
      fetchAllOrders();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 5. Carriers acceptance & status workflow modifier
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Tashuv holatini o'zgartirishda xatolik.");

      showTemporaryToast(`Buyurtma holati muvaffaqiyatli yangilandi.`);
      fetchAllOrders();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 6. Admin exclusive overrides
  const handleAdminDeleteOrder = async (orderId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showTemporaryToast("Buyurtma o'chirib tashlandi.");
        fetchAllOrders();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminDeleteUser = async (userId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showTemporaryToast("A'zo profili butunlay o'chirildi.");
        fetchUsersAdmin();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminCreateFaq = async (faqData: Partial<FAQ>) => {
    try {
      const r = await fetch("/api/faqs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(faqData),
      });
      if (r.ok) {
        showTemporaryToast("Yangi FAQ muvaffaqiyatli qo'shildi!");
        fetchFAQs();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdminDeleteFaq = async (faqId: string) => {
    try {
      const r = await fetch(`/api/faqs/${faqId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) {
        showTemporaryToast("FAQ o'chirildi.");
        fetchFAQs();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdminCreateNews = async (newsData: any) => {
    try {
      const r = await fetch("/api/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newsData),
      });
      if (r.ok) {
        showTemporaryToast("Yangi yangilik chop etildi!");
        fetchNews();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdminDeleteNews = async (newsId: string) => {
    try {
      const r = await fetch(`/api/news/${newsId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) {
        showTemporaryToast("Maqola o'chirib tashlandi.");
        fetchNews();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 7. Estimating Guest Pricing coefficients
  const handleCalculateGuestPrice = (e: React.FormEvent) => {
    e.preventDefault();
    const dst = Number(guestDistance) || 1;
    let rate = 3500;
    let base = 15000;

    if (guestVehicle.includes("Labo") || guestVehicle.includes("Bongo") || guestVehicle.includes("Furgon")) {
      rate = 3500;
      base = 15000;
    } else if (guestVehicle.startsWith("ISUZU") || guestVehicle.startsWith("Gruzovik")) {
      rate = 6000;
      base = 45000;
    } else {
      rate = 10000;
      base = 150000;
    }

    const price = base + (dst * rate);
    setCalculatedGuestPrice(Math.round(price));
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#040109] flex flex-col items-center justify-center space-y-6 select-none">
        <div className="relative flex items-center justify-center">
          <div className="h-16 w-16 rounded-full border-t-2 border-b-2 border-purple-500 animate-spin"></div>
          <div className="absolute h-10 w-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xs font-black text-purple-400">
            YL
          </div>
        </div>
        <div className="space-y-1 text-center animate-pulse">
          <h2 className="text-sm font-black uppercase tracking-widest text-white">YukLa Logistics</h2>
          <p className="text-[10px] text-white/40 uppercase font-mono tracking-wider">Xavfsiz portal tekshirilmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#040109] text-white selection:bg-purple-600 selection:text-white font-sans overflow-x-hidden">
      
      {/* Background Decorative Neon Orbs - editorial styling */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none -translate-x-1/2"></div>
      <div className="absolute top-[1200px] right-10 w-[400px] h-[400px] bg-indigo-900/10 blur-[130px] rounded-full pointer-events-none"></div>

      {/* Persistent floating notification alerts */}
      {alertMessage && (
        <div className="fixed top-24 right-6 z-[100] max-w-sm bg-[#0c0617] border border-purple-500/30 text-white rounded-2xl p-4 shadow-2xl animate-bounce flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-green-400 animate-ping"></div>
          <p className="text-xs font-semibold leading-normal">{alertMessage}</p>
        </div>
      )}

      {/* Global Header Navigation bar */}
      <Header
        currentLang={currentLang}
        onChangeLang={handleChangeLang}
        user={user}
        onLogout={handleLogout}
        onOpenInvestorDeck={() => setShowInvestorDeck(true)}
        onOpenSecuritySettings={() => setShowSecuritySettingsModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenAuth={(view) => {
          setAuthEmail("");
          setAuthPassword("");
          setAuthName("");
          setAuthPhone("");
          setAuthError("");
          setAuthModal(view);
        }}
        onSetView={(view) => {
          if (view === "home") {
            setActiveView("home");
          } else if (view === "dashboard") {
            if (token) {
              setActiveView("dashboard");
            } else {
              setAuthModal("login");
              showTemporaryToast(t("authRequiredAlert"));
            }
          }
        }}
        activeView={activeView}
      />

      {/* CORE VIEW RENDERING */}
      {activeView === "home" ? (
        <div className="space-y-0">
          
          {/* Dynamic Hero Panel */}
          <section className="py-12 sm:py-16 lg:py-20 relative px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center justify-center min-h-[80vh] overflow-hidden">
            <div className="absolute inset-0 bg-[#060211] [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#3b0764_100%)] opacity-80"></div>
            
            <div className="max-w-4xl mx-auto space-y-8 z-10">
              <span className="px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] uppercase font-bold tracking-[0.25em] inline-block animate-pulse">
                {t("heroBadge")}
              </span>
              
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none text-white max-w-5xl [text-wrap:balance]">
                {t("heroTitle")}
              </h1>
              
              <p className="text-white/50 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
                {t("heroSubtitle")}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() => {
                    if (user) {
                      setActiveView("dashboard");
                    } else {
                      setAuthModal("login");
                    }
                  }}
                  className="w-full sm:w-auto bg-white text-black hover:bg-purple-600 hover:text-white font-extrabold text-xs uppercase tracking-widest px-8 py-4.5 rounded-full transition-all duration-300 shadow-2xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{t("heroCtaOrder")}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Opens Scroll down to price calculation component */}
                <a
                  href="#calculator"
                  className="w-full sm:w-auto bg-white/5 border border-white/10 text-white hover:bg-white/10 font-bold text-xs uppercase tracking-widest px-8 py-4.5 rounded-full transition-all duration-300 text-center cursor-pointer"
                >
                  {t("heroCtaCalc")}
                </a>
              </div>
            </div>

            {/* Quick Live Order board strip simulation ticker */}
            <div className="w-full absolute bottom-4 left-0 select-none overflow-hidden h-14 bg-black/40 border-t border-b border-white/5 flex items-center">
              <div className="flex items-center gap-12 whitespace-nowrap animate-infinite-scroll text-xs text-white/40 uppercase tracking-widest font-mono">
                <span>🟢 Toshkent &rarr; Samarqand [Labo] {t("statusPending")}</span>
                <span>•</span>
                <span>🔵 Buxoro &rarr; Xiva [ISUZU] {t("statusInTransit")}</span>
                <span>•</span>
                <span>🟢 Farg'ona &rarr; Toshkent [Fura] {t("statusPending")}</span>
                <span>•</span>
                <span>✅ Andijon &rarr; Namangan [Bongo] {t("statusDelivered")}</span>
                <span>•</span>
                <span>🟢 Urganch &rarr; Nukus [Shalanda] {t("statusAccepted")}</span>
              </div>
            </div>
          </section>

          {/* Flagship Central Asia Freight Terminal & Qamchiq Radar */}
          <CentralAsiaFreightTerminal
            currentLang={currentLang}
            onRequestQuote={(origin, destination) => {
              const el = document.getElementById("ai-dispatcher");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
          />

          {/* Autonomous AI Freight Dispatcher & OCR Waybill Scanner */}
          <AiLogisticsDispatcher
            currentLang={currentLang}
            user={user}
            onRequestAuth={() => setAuthModal("login")}
            onBookOrder={handleCreateOrder}
          />

          {/* About us Section */}
          <section id="about" className="py-12 sm:py-16 lg:py-20 relative px-4 sm:px-6 lg:px-8 bg-[#060211] border-b border-white/5">
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <span className="text-[10px] text-purple-400 font-extrabold uppercase tracking-widest block">
                  {t("aboutBadge")}
                </span>
                <h2 className="text-4xl font-extrabold tracking-tight text-white leading-none">
                  {t("aboutTitle")}
                </h2>
                <p className="text-white/60 leading-relaxed text-sm font-sans">
                  {t("aboutText")}
                </p>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-white/50">{t("aboutFeat1")}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-white/50">{t("aboutFeat2")}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-white/50">{t("aboutFeat3")}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-white/50">{t("aboutFeat4")}</span>
                  </div>
                </div>
              </div>

              {/* Decorative graphic widget representing logistics precision */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-center min-h-[300px]">
                <div className="absolute inset-0 bg-[#0b0518]/50"></div>
                <div className="absolute top-4 left-4 bg-purple-600/20 px-3 py-1 rounded border border-purple-500/20 text-[10px] text-purple-400 font-bold uppercase">
                  YukLa Security Shield
                </div>

                <div className="relative z-10 space-y-6 text-center">
                  <span className="text-6xl text-purple-400 block animate-pulse">🛡️</span>
                  <h4 className="text-lg font-bold text-white">{t("secShieldTitle")}</h4>
                  <p className="text-xs text-white/40 max-w-xs mx-auto">
                    {t("secShieldDesc")}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Services Section */}
          <section id="services" className="py-12 sm:py-16 lg:py-20 relative px-4 sm:px-6 lg:px-8 bg-black/60 border-b border-white/5">
            <div className="max-w-5xl mx-auto space-y-16">
              <div className="text-center space-y-4">
                <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] uppercase font-bold tracking-widest rounded-full">
                  XIZMATLAR
                </span>
                <h2 className="text-4xl font-extrabold text-white">{t("servicesSubtitle")}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Service 1 */}
                <div className="bg-[#0b0617] border border-white/5 hover:border-purple-500/30 rounded-2xl p-6 shadow-xl transition duration-300">
                  <span className="text-3xl">🚛</span>
                  <h3 className="text-lg font-bold text-white mt-4">{t("service1Title")}</h3>
                  <p className="text-xs text-white/50 mt-2 leading-relaxed">{t("service1Desc")}</p>
                </div>

                {/* Service 2 */}
                <div className="bg-[#0b0617] border border-white/5 hover:border-purple-500/30 rounded-2xl p-6 shadow-xl transition duration-300">
                  <span className="text-3xl">🚐</span>
                  <h3 className="text-lg font-bold text-white mt-4">{t("service2Title")}</h3>
                  <p className="text-xs text-white/50 mt-2 leading-relaxed">{t("service2Desc")}</p>
                </div>

                {/* Service 3 */}
                <div className="bg-[#0b0617] border border-white/5 hover:border-purple-500/30 rounded-2xl p-6 shadow-xl transition duration-300">
                  <span className="text-3xl">📝</span>
                  <h3 className="text-lg font-bold text-white mt-4">{t("service3Title")}</h3>
                  <p className="text-xs text-white/50 mt-2 leading-relaxed">{t("service3Desc")}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Core Autopark Show Case component */}
          <Fleet currentLang={currentLang} hideCTA />

          {/* Dynamic Uzbekistan logistics services marketplace explorer */}
          <LogisticsMarketplace
            currentLang={currentLang}
            isLoggedIn={!!user}
            onSelectServiceForBooking={(service) => {
              setPrefilledBooking(service);
              setActiveView("dashboard");
            }}
            onRequestAuth={() => setAuthModal("login")}
          />

          {/* Live Open-calculator tool (Available to guests) */}
          <section id="calculator" className="py-12 sm:py-16 lg:py-20 relative px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#05010d] to-black">
            <div className="max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-6 lg:p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full"></div>
              
              <div className="text-center space-y-3 mb-10">
                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">{t("calcTitle")}</span>
                <h2 className="text-3xl font-extrabold text-white">{t("calcSubtitle")}</h2>
                <p className="text-xs text-white/40 max-w-md mx-auto">{t("calcDesc")}</p>
              </div>

              <form onSubmit={handleCalculateGuestPrice} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/80 block">{t("selectVehicle")}</label>
                  <select
                    value={guestVehicle}
                    onChange={(e) => setGuestVehicle(e.target.value)}
                    className="w-full bg-[#16131F] border border-white/[0.08] h-11 px-3.5 text-xs rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white outline-none cursor-pointer transition-all"
                  >
                    {FLEET_INFO.map(v => (
                      <option key={v.name} value={v.name}>{v.name} ({v.capacity})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/80 block">{t("distance")}</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={guestDistance}
                    onChange={(e) => setGuestDistance(e.target.value)}
                    className="w-full bg-[#16131F] border border-white/[0.08] h-11 px-3.5 text-xs font-mono rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full min-h-[44px] bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-widest h-11 rounded-xl transition cursor-pointer shadow-lg shadow-purple-900/30"
                >
                  {t("calcButton")}
                </button>
              </form>

              {calculatedGuestPrice !== null && (
                <div className="mt-8 p-5 bg-black/60 border border-purple-500/20 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 animate-fade-in">
                  <div>
                    <span className="text-[10px] text-purple-400 font-bold uppercase block">{t("estimation")}</span>
                    <p className="text-3xl font-black text-white font-mono mt-0.5">{calculatedGuestPrice.toLocaleString()} UZS</p>
                    <span className="text-[10px] text-white/40 block mt-1">{t("formulaInfo")}</span>
                  </div>

                  <button
                    onClick={() => {
                      setAuthModal("register");
                      showTemporaryToast(t("toastRegisterToPost"));
                    }}
                    className="bg-white hover:bg-purple-600 text-black hover:text-white font-extrabold text-[10px] uppercase tracking-widest px-6 py-3 rounded-xl transition cursor-pointer"
                  >
                    {t("ctaStartPostCargo")}
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Dynamic real-time statistics panels */}
          <section className="py-20 relative px-4 lg:px-10 border-t border-white/5 bg-black/40">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                
                {/* Stat 1 */}
                <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                  <span className="text-2xl block mb-2">⭐</span>
                  <p className="text-4xl font-extrabold text-white font-mono">15,400+</p>
                  <span className="text-xs text-white/40 block mt-1">{t("statsDelivered")}</span>
                </div>

                {/* Stat 2 */}
                <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                  <span className="text-2xl block mb-2">🧑‍✈️</span>
                  <p className="text-4xl font-extrabold text-purple-400 font-mono">3,890+</p>
                  <span className="text-xs text-white/40 block mt-1">{t("statsDrivers")}</span>
                </div>

                {/* Stat 3 */}
                <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                  <span className="text-2xl block mb-2">🏢</span>
                  <p className="text-4xl font-extrabold text-white font-mono">1,240+</p>
                  <span className="text-xs text-white/40 block mt-1">{t("statsPartners")}</span>
                </div>

                {/* Stat 4 */}
                <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                  <span className="text-2xl block mb-2">📈</span>
                  <p className="text-4xl font-extrabold text-purple-400 font-mono">99.4%</p>
                  <span className="text-xs text-white/40 block mt-1">{t("statsSatisfaction")}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Enterprise TMS, B2B Shippers Suite & Corporate Partners */}
          <EnterpriseShipperHub
            currentLang={currentLang}
            user={user}
            onOpenTenders={() => {
              if (!user) {
                setAuthModal("login");
              } else {
                setActiveView("dashboard");
              }
            }}
            onOpenCompanyAuth={() => {
              setAuthRole("company");
              setAuthModal("login");
            }}
          />

          {/* User Reviews & feedbacks slide */}
          <section className="py-12 sm:py-16 lg:py-20 relative px-4 sm:px-6 lg:px-8 bg-[#060211] border-b border-white/5">
            <div className="max-w-4xl mx-auto space-y-12">
              <div className="text-center space-y-3">
                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">{t("navReviews")}</span>
                <h3 className="text-3xl font-extrabold text-white">{t("reviewsTitle")}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative">
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-purple-400 text-purple-400" />)}
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed italic">
                    {t("review1Text")}
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center text-xs text-purple-300 font-mono font-bold">SM</span>
                    <div>
                      <p className="text-xs font-bold text-white">Sarvar Meliboev</p>
                      <span className="text-[9.5px] text-white/30 block">{t("review1Company")}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative">
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-indigo-400 text-indigo-400" />)}
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed italic">
                    {t("review2Text")}
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs text-indigo-300 font-mono font-bold">DR</span>
                    <div>
                      <p className="text-xs font-bold text-white">Ilhom G'ofurov</p>
                      <span className="text-[9.5px] text-white/30 block">{t("review2Company")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Live System News Articles Feed */}
          <section className="py-12 sm:py-16 lg:py-20 relative px-4 sm:px-6 lg:px-8 bg-black/60 border-b border-white/5">
            <div className="max-w-5xl mx-auto space-y-12 animate-fade-in">
              <div className="text-center space-y-3">
                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">{t("navNews")}</span>
                <h3 className="text-3xl font-extrabold text-white">{t("newsTitle")}</h3>
              </div>

              {newsList.length === 0 ? (
                <p className="text-center text-white/40 text-xs">{t("newsLoading")}</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {newsList.slice(0, 3).map((n) => {
                    const langKey = currentLang.charAt(0).toUpperCase() + currentLang.slice(1);
                    const newsTitle = n[`title${langKey}` as keyof typeof n] || n.titleUz;
                    const newsContent = n[`content${langKey}` as keyof typeof n] || n.contentUz;
                    return (
                      <div key={n.id} className="bg-white/5 border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex justify-between text-[10px] text-white/30 font-semibold font-mono">
                            <span>YUKLA INSIDER</span>
                            <span>{n.date}</span>
                          </div>
                          <h4 className="text-sm font-extrabold text-purple-400 leading-snug line-clamp-2">{String(newsTitle)}</h4>
                          <p className="text-xs text-white/60 line-clamp-4 leading-relaxed font-sans">{String(newsContent)}</p>
                        </div>

                        <div className="mt-5 pt-3 border-t border-white/5 text-right">
                          <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest inline-flex items-center gap-1 cursor-pointer">
                            <span>{t("newsDetail")}</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Collapse Frequently Asked Questions panel */}
          <section className="py-12 sm:py-16 lg:py-20 relative px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-[#05010d]">
            <div className="max-w-3xl mx-auto space-y-12">
              <div className="text-center space-y-3">
                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">{t("navFaq")}</span>
                <h3 className="text-3xl font-extrabold text-white">{t("faqTitle")}</h3>
              </div>

              {faqList.length === 0 ? (
                <p className="text-center text-white/40 text-xs">{t("faqLoading")}</p>
              ) : (
                <div className="space-y-4">
                  {faqList.map((item) => {
                    const langKey = currentLang.charAt(0).toUpperCase() + currentLang.slice(1);
                    const faqQuestion = item[`question${langKey}` as keyof typeof item] || item.questionUz;
                    const faqAnswer = item[`answer${langKey}` as keyof typeof item] || item.answerUz;
                    return (
                      <details key={item.id} className="group bg-[#0b0617] border border-white/10 rounded-2xl p-4 cursor-pointer outline-none transition duration-300">
                        <summary className="list-none flex justify-between items-center text-xs font-bold select-none text-white hover:text-purple-400">
                          <span>❓ {String(faqQuestion)}</span>
                          <span className="text-white/40 group-open:rotate-180 transition">&darr;</span>
                        </summary>
                        <p className="mt-3 text-xs text-white/60 leading-relaxed pl-6 font-sans border-t border-white/5 pt-2">
                          {String(faqAnswer)}
                        </p>
                      </details>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

        </div>
      ) : (
        /* DASHBOARD SECTION INTERFACES */
        <div className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[80vh]">
          {!user ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
              <Shield className="w-16 h-16 text-purple-400 animate-pulse" />
              <h2 className="text-2xl font-bold text-white tracking-tight">{t("secureZoneTitle")}</h2>
              <p className="text-white/60 max-w-md text-xs">
                {t("secureZoneDesc")}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setAuthModal("login")}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-2.5 rounded-full text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-purple-950/50"
                >
                  {t("loginButton")}
                </button>
                <button
                  onClick={() => setActiveView("home")}
                  className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold px-6 py-2.5 rounded-full text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  {t("backToHome")}
                </button>
              </div>
            </div>
          ) : (
            <>
              {user.role === "customer" && (
                <DashboardCustomer
                  currentLang={currentLang}
                  onChangeLang={handleChangeLang}
                  orders={orders.filter(o => o.customerId === user.id)}
                  onCreateOrder={handleCreateOrder}
                  loading={loading}
                  token={token}
                  onRefreshOrders={fetchAllOrders}
                  user={user}
                  onRefreshUser={fetchCurrentUser}
                  prefilledBooking={prefilledBooking}
                  onClearPrefilledBooking={() => setPrefilledBooking(null)}
                />
              )}

              {user.role === "driver" && (
                <DashboardDriver
                  currentLang={currentLang}
                  onChangeLang={handleChangeLang}
                  driverUser={user}
                  orders={orders}
                  onUpdateStatus={handleUpdateOrderStatus}
                  loading={loading}
                  token={token}
                  onRefreshUser={fetchCurrentUser}
                />
              )}

              {user.role === "company" && (
                <DashboardCompany
                  currentLang={currentLang}
                  onChangeLang={handleChangeLang}
                  user={user}
                  orders={orders}
                  loading={loading}
                  token={token}
                  onRefreshOrders={fetchAllOrders}
                  onRefreshUser={fetchCurrentUser}
                />
              )}

              {(user.role === "admin" || user.role === "superadmin") && (
                <DashboardAdmin
                  currentLang={currentLang}
                  onChangeLang={handleChangeLang}
                  orders={orders}
                  users={usersList}
                  faqs={faqList}
                  news={newsList}
                  auditLogs={auditLogs}
                  revenue={revenueHistory}
                  onDeleteOrder={handleAdminDeleteOrder}
                  onDeleteUser={handleAdminDeleteUser}
                  onCreateFaq={handleAdminCreateFaq}
                  onDeleteFaq={handleAdminDeleteFaq}
                  onCreateNews={handleAdminCreateNews}
                  onDeleteNews={handleAdminDeleteNews}
                  loading={loading}
                  token={token}
                  onRefreshOrders={fetchAllOrders}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* Global Startup Footer */}
      <Footer currentLang={currentLang} />

      {/* Floating Sparkly AI Assistant (Instantly accessible across all screens) */}
      <AiAssistant currentLang={currentLang} token={token} />

      {/* AUTH SYSTEM OVERLAYS MODALS DISPLAY */}
      {authModal && (
        <div className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0e081f] border border-white/[0.08] rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl overflow-hidden animate-fade-in">
            <div className="absolute -top-16 -left-16 w-32 h-32 bg-purple-600/10 blur-[80px] rounded-full pointer-events-none"></div>

            <button
              onClick={() => {
                setAuthModal(null);
                setAuthError("");
              }}
              className="absolute top-4 right-4 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 h-8 w-8 rounded-full flex items-center justify-center cursor-pointer font-bold text-base transition"
            >
              &times;
            </button>

            {/* Custom Modal Headers */}
            <div className="text-center space-y-1.5 mb-6">
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {authModal === "forgotPassword" && "Parolni tiklash"}
                {authModal === "resetPassword" && "Yangi parol o'rnatish"}
                {authModal === "verifyEmail" && "E-pochta tasdiqlash"}
                {authModal === "login" && t("loginTitle")}
                {authModal === "register" && t("registerTitle")}
              </h3>
              <p className="text-xs text-white/50 leading-relaxed">
                {authModal === "forgotPassword" && "Elektron pochtangizni kiriting. Biz sizga bir martalik 6-xonali kod yuboramiz."}
                {authModal === "resetPassword" && "Elektron pochtangizga yuborilgan tiklash kodi va yangi parolni kiriting."}
                {authModal === "verifyEmail" && "Akkauntni faollashtirish uchun pochtangizga yuborilgan 6-xonali kodni kiriting."}
                {authModal === "login" && t("loginSubtitle")}
                {authModal === "register" && t("registerSubtitle")}
              </p>
            </div>

            {authError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs text-center mb-4 leading-relaxed font-semibold">
                ⚠️ {authError}
              </div>
            )}

            {/* 1. FORGOT PASSWORD FLOW */}
            {authModal === "forgotPassword" && (
              <form onSubmit={handleForgotPasswordRequest} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/80 block">Kirish elektron pochtasi</label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full bg-[#16131F] border border-white/[0.08] h-11 px-3.5 text-xs rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white placeholder-zinc-500 outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full min-h-[44px] bg-[#dda15e] border border-transparent text-black font-extrabold text-xs uppercase tracking-widest h-11 rounded-xl hover:bg-purple-600 hover:text-white transition-all cursor-pointer mt-4 flex items-center justify-center font-sans shadow-lg shadow-amber-900/20"
                >
                  {loading ? "Yuborilmoqda..." : "Tasdiqlash kodini yuborish"}
                </button>

                <div className="text-center pt-4 border-t border-white/5 text-xs text-white/40">
                  <button
                    type="button"
                    onClick={() => setAuthModal("login")}
                    className="hover:text-purple-400 hover:underline cursor-pointer"
                  >
                    Orqaga, Tizimga kirish
                  </button>
                </div>
              </form>
            )}

            {/* 2. PASSWORD RESET CODE ENTRY */}
            {authModal === "resetPassword" && (
              <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/80 block">Tiklash kodi (6-xonali PIN)</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    className="w-full bg-[#16131F] border border-white/[0.08] h-11 px-3.5 text-xs font-mono text-center tracking-[0.4em] rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white placeholder-zinc-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/80 block">Yangi parol (kamida 6 ta belgi)</label>
                  <input
                    type="password"
                    required
                    placeholder="Kamida 6 ta belgi kiriting"
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    className="w-full bg-[#16131F] border border-white/[0.08] h-11 px-3.5 text-xs rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white placeholder-zinc-500 outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full min-h-[44px] bg-[#dda15e] border border-transparent text-black font-extrabold text-xs uppercase tracking-widest h-11 rounded-xl hover:bg-purple-600 hover:text-white transition-all cursor-pointer mt-4 flex items-center justify-center font-sans shadow-lg shadow-amber-900/20"
                >
                  {loading ? "Tekshirilmoqda..." : "Parolni tiklashni yakunlash"}
                </button>
              </form>
            )}

            {/* 3. EMAIL VERIFICATION REQUIRED DETAILS */}
            {authModal === "verifyEmail" && (
              <div className="space-y-4">
                <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-2xl text-xs text-white/70 space-y-2">
                  <p>
                    Ro'yxatdan o'tgan pochtangiz: <strong className="text-white">{user?.email}</strong>
                  </p>
                  <p className="text-white/40 text-[10.5px]">
                    Agar siz tasdiqlash kodini hali olmagan bo'lsangiz, quyidagi tugmani bosib yangi kod so'rashingiz mumkin.
                  </p>
                  <button
                    onClick={handleRequestEmailVerification}
                    disabled={loading}
                    className="text-xs font-bold text-[#dda15e] hover:underline cursor-pointer py-1.5"
                  >
                    {loading ? "Kutilmoqda..." : "🔄 Yangi kod yuborish so'rash"}
                  </button>
                </div>

                <form onSubmit={handleEmailVerificationSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white/80 block">Tasdiqlash kodi</label>
                    <input
                      type="text"
                      required
                      placeholder="Masalan: 123456"
                      value={emailVerifyCode}
                      onChange={(e) => setEmailVerifyCode(e.target.value)}
                      className="w-full bg-[#16131F] border border-white/[0.08] h-11 px-3.5 text-xs font-mono text-center tracking-[0.4em] rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white placeholder-zinc-500 outline-none transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full min-h-[44px] bg-green-600 border border-transparent text-white font-extrabold text-xs uppercase tracking-widest h-11 rounded-xl hover:bg-green-500 transition-all cursor-pointer mt-4 flex items-center justify-center shadow-lg shadow-green-950/40"
                  >
                    {loading ? "Tasdiqlanmoqda..." : "Pochtani tasdiqlash"}
                  </button>
                </form>
              </div>
            )}

            {/* 4. STANDARD LOGIN & REGISTER FORMS */}
            {(authModal === "login" || authModal === "register") && (
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                
                {/* If Register status: ask for FullName and phone number */}
                {authModal === "register" && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-white/80 block">{t("fullName")}</label>
                      <input
                        type="text"
                        required
                        placeholder="Sarvar Meliboev"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        className="w-full bg-[#16131F] border border-white/[0.08] h-11 px-3.5 text-xs rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white placeholder-zinc-500 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-white/80 block">{t("phone")}</label>
                      <input
                        type="text"
                        required
                        placeholder="Masalan: +998 90 123 45 67"
                        value={authPhone}
                        onChange={(e) => setAuthPhone(e.target.value)}
                        className="w-full bg-[#16131F] border border-white/[0.08] h-11 px-3.5 text-xs rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white placeholder-zinc-500 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-white/80 block">{t("roleSelect")}</label>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setAuthRole("customer")}
                          className={`py-2.5 px-2 rounded-xl border text-center transition font-bold cursor-pointer text-[11px] ${
                            authRole === "customer"
                              ? "bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-900/40"
                              : "bg-[#16131F] border-white/[0.08] text-white/60 hover:bg-white/10"
                          }`}
                        >
                          {t("roleCustomer")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setAuthRole("driver")}
                          className={`py-2.5 px-2 rounded-xl border text-center transition font-bold cursor-pointer text-[11px] ${
                            authRole === "driver"
                              ? "bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-900/40"
                              : "bg-[#16131F] border-white/[0.08] text-white/60 hover:bg-white/10"
                          }`}
                        >
                          {t("roleDriver")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setAuthRole("company")}
                          className={`py-2.5 px-2 rounded-xl border text-center transition font-bold cursor-pointer text-[11px] ${
                            authRole === "company"
                              ? "bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-900/40"
                              : "bg-[#16131F] border-white/[0.08] text-white/60 hover:bg-white/10"
                          }`}
                        >
                          Kompaniya
                        </button>
                      </div>
                    </div>

                    {/* Ask for company info if role === company */}
                    {authRole === "company" && (
                      <div className="p-4 rounded-2xl bg-black/40 border border-purple-500/20 space-y-3">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-wider text-purple-400 font-bold block">
                            Kompaniya Nomi (Yuridik shaxs)
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Silk Road Logistics MCHJ"
                            value={authCompanyName}
                            onChange={(e) => setAuthCompanyName(e.target.value)}
                            className="w-full bg-[#16131F] border border-white/[0.08] h-11 px-3.5 text-xs rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white placeholder-zinc-500 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-wider text-purple-400 font-bold block">
                            STIR (INN / Soliq raqami)
                          </label>
                          <input
                            type="text"
                            placeholder="301234567"
                            value={authCompanyTaxId}
                            onChange={(e) => setAuthCompanyTaxId(e.target.value)}
                            className="w-full bg-[#16131F] border border-white/[0.08] h-11 px-3.5 text-xs font-mono rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white placeholder-zinc-500 outline-none transition-all"
                          />
                        </div>
                      </div>
                    )}

                    {/* Ask for driver plates and vehicle specs config */}
                    {authRole === "driver" && (
                      <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-wider text-purple-400 font-bold block">{t("driverVehicle")}</label>
                          <select
                            value={driverVehicle}
                            onChange={(e) => setDriverVehicle(e.target.value)}
                            className="w-full bg-[#16131F] border border-white/[0.08] h-11 px-3.5 text-xs rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white outline-none cursor-pointer transition-all"
                          >
                            {FLEET_INFO.map(f => (
                              <option key={f.name} value={f.name}>{f.name} ({f.capacity})</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-wider text-purple-400 font-bold block">{t("driverPlates")}</label>
                          <input
                            type="text"
                            required
                            placeholder="Masalan: 01 A 777 AA"
                            value={driverPlates}
                            onChange={(e) => setDriverPlates(e.target.value)}
                            className="w-full bg-[#16131F] border border-white/[0.08] h-11 px-3.5 text-xs font-mono rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white placeholder-zinc-500 outline-none transition-all"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-wider text-purple-400 font-bold block">
                            Profil surati (Kamerada rasmga tushish)
                          </label>
                          <CameraCapture
                            onCapture={(img) => setRegProfilePhoto(img)}
                            initialPhoto={regProfilePhoto}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/80 block">{t("email")}</label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full bg-[#16131F] border border-white/[0.08] h-11 px-3.5 text-xs rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white placeholder-zinc-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/80 block">{t("password")}</label>
                  <input
                    type="password"
                    required
                    placeholder="Parolingizni kiriting"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full bg-[#16131F] border border-white/[0.08] h-11 px-3.5 text-xs rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white placeholder-zinc-500 outline-none transition-all"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-white/50 pt-2 select-none">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-white/10 mr-1 accent-purple-600 h-3.5 w-3.5" />
                    <span>{t("rememberMe")}</span>
                  </label>

                  {authModal === "login" && (
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(authEmail);
                        setAuthModal("forgotPassword");
                        setAuthError("");
                      }}
                      className="hover:text-purple-400 hover:underline cursor-pointer"
                    >
                      {t("forgotPass")}
                    </button>
                  )}
                </div>

                {authModal === "login" && (
                  <button
                    type="button"
                    onClick={() => setShowBiometricModal(true)}
                    className="w-full min-h-[44px] bg-[#16131F] hover:bg-purple-600/20 border border-white/[0.08] hover:border-purple-500/40 text-purple-300 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <ScanFace className="w-4 h-4 text-purple-400" />
                    <Fingerprint className="w-4 h-4 text-purple-400" />
                    <span>Face ID / Barmoq izi orqali kirish</span>
                  </button>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full min-h-[44px] bg-[#dda15e] border border-transparent text-black font-extrabold text-xs uppercase tracking-widest h-11 rounded-xl hover:bg-purple-600 hover:text-white transition-all cursor-pointer shadow-lg shadow-amber-900/20 mt-2 flex items-center justify-center"
                >
                  {loading ? "Ruxsat etilmoqda..." : t(authModal + "Now")}
                </button>

                <div className="text-center pt-3 border-t border-white/5 text-xs text-white/40">
                  {authModal === "login" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthModal("register");
                        setAuthError("");
                      }}
                      className="hover:text-purple-400 hover:underline cursor-pointer"
                    >
                      {t("noAccount")}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthModal("login");
                        setAuthError("");
                      }}
                      className="hover:text-purple-400 hover:underline cursor-pointer"
                    >
                      {t("haveAccount")}
                    </button>
                  )}
                </div>

              </form>
            )}

          </div>
        </div>
      )}

      {/* Investor Strategy & Pitch Deck Modal */}
      {showInvestorDeck && (
        <InvestorDeckModal
          currentLang={currentLang}
          onClose={() => setShowInvestorDeck(false)}
        />
      )}

      {/* SaaS Legal Center Overlays */}
      {sassPolicyTab && (
        <SaaSPolicies
          currentLang={currentLang}
          initialTab={sassPolicyTab}
          onClose={() => {
            setSassPolicyTab(null);
            window.location.hash = "";
          }}
        />
      )}

      {/* Global Permission Explainer & Offline Banners */}
      <PermissionExplainerModal />
      <OfflineBanner />

      {/* NATIVE MOBILE SPEED DIAL FAB */}
      <MobileQuickActionFAB
        onOpenVoice={() => setShowVoiceModal(true)}
        onOpenScanner={() => setShowQrScannerModal(true)}
        onOpenSignature={() => setShowSignatureModal(true)}
        onOpenSupport={() => {
          showTemporaryToast("Dispetcherlik aloqa markazi: +998 (71) 200-00-00");
        }}
      />

      {/* NATIVE MOBILE BOTTOM NAVIGATION BAR */}
      <MobileBottomNav
        user={user}
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenAuth={() => setAuthModal("login")}
        onOpenNewOrder={() => {
          setActiveView("dashboard");
          setActiveRoleTab("book");
        }}
        activeRoleTab={activeRoleTab}
        onSelectRoleTab={(tab) => {
          setActiveRoleTab(tab);
          // Auto scroll to top of dashboard smoothly
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      {/* MOBILE VOICE SHIPMENT ASSISTANT MODAL */}
      <VoiceShipmentModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onApplyParsedShipment={handleApplyVoiceShipment}
      />

      {/* MOBILE DIGITAL SIGNATURE / e-CMR MODAL */}
      <DigitalSignatureModal
        isOpen={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        onConfirmSignature={(signatureDataUrl) => {
          showTemporaryToast("Elektron imzo e-CMR reestriga kiritildi!");
        }}
      />

      {/* MOBILE QR & e-CMR SCANNER MODAL */}
      <QrScannerModal
        isOpen={showQrScannerModal}
        onClose={() => setShowQrScannerModal(false)}
        onScanResult={(code) => {
          showTemporaryToast(`Hujjat aniqlandi: ${code}`);
          if (user) {
            setActiveView("dashboard");
          }
        }}
      />

      {/* MOBILE BIOMETRIC QUICK LOGIN MODAL */}
      <BiometricLoginModal
        isOpen={showBiometricModal}
        onClose={() => setShowBiometricModal(false)}
        onSuccess={handleBiometricSuccess}
        userEmail={authEmail || undefined}
        onSwitchToPasswordLogin={() => {
          setShowBiometricModal(false);
          setAuthModal("login");
        }}
      />

      {/* ENTERPRISE BIOMETRIC SECURITY SETTINGS MODAL */}
      {showSecuritySettingsModal && user && token && (
        <BiometricSecuritySettingsModal
          isOpen={showSecuritySettingsModal}
          onClose={() => setShowSecuritySettingsModal(false)}
          user={user}
          token={token}
          onRefreshUser={fetchCurrentUser}
        />
      )}

      {/* USER SETTINGS & NOTIFICATIONS PREFERENCES MODAL */}
      {showSettingsModal && user && (
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          user={user}
          token={token || undefined}
          initialSettings={notificationSettings}
          onSaveNotificationSettings={async (newSettings) => {
            setNotificationSettings(newSettings);
            try {
              localStorage.setItem("yukla_notification_settings", JSON.stringify(newSettings));
            } catch (e) {}
            if (token) {
              try {
                await fetch("/api/users/notification-settings", {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    sound: newSettings.soundEnabled,
                    push: newSettings.pushEnabled,
                  }),
                });
              } catch (err) {
                console.error("Failed to persist notification settings to server:", err);
              }
            }
          }}
          onOpenBiometrics={() => {
            setShowSettingsModal(false);
            setShowSecuritySettingsModal(true);
          }}
          playTestSound={playNotificationSound}
        />
      )}

    </div>
  );
}
