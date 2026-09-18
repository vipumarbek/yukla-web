import React, { useState, useEffect } from "react";
import { LanguageCode, Order, OrderStatus, User, Vehicle } from "../types";
import { useTranslation } from "../context/LanguageContext";
import { TRANSLATIONS } from "../translations";
import MapLocationPicker from "./MapLocationPicker";
import { COUNTRIES } from "../locationData";
import DriverKPICards from "./DriverKPICards";
import DriverMarketplace from "./DriverMarketplace";
import DriverActiveMission from "./DriverActiveMission";
import DriverEarningsTab from "./DriverEarningsTab";
import DriverVehiclesTab from "./DriverVehiclesTab";
import DriverVerificationTab from "./DriverVerificationTab";
import DriverProfileTab from "./DriverProfileTab";
import DriverNotificationsTab from "./DriverNotificationsTab";
import DriverSupportTab from "./DriverSupportTab";
import PermissionsManagerTab from "./PermissionsManagerTab";
import EnterpriseTendersHub from "./EnterpriseTendersHub";
import BackhaulOptimizerHub from "./BackhaulOptimizerHub";
import SilkRoadCorridorHub from "./SilkRoadCorridorHub";
import DriverFuelAdvanceModal from "./DriverFuelAdvanceModal";
import { 
  Truck, 
  DollarSign, 
  CheckCircle2, 
  Navigation, 
  MapPin, 
  Wallet, 
  Award, 
  ShieldAlert, 
  Receipt, 
  Plus, 
  Trash2, 
  Edit, 
  Clock, 
  Star, 
  Check, 
  AlertTriangle, 
  X, 
  RefreshCw, 
  Sliders, 
  UserCheck, 
  Map, 
  User as UserIcon, 
  FileText, 
  Camera, 
  Eye, 
  Compass,
  ArrowRight,
  ShieldCheck,
  Bell,
  HelpCircle,
  Activity,
  TrendingUp,
  Sparkles,
  Shield,
  Locate,
  MessageSquare,
  Paperclip,
  Send,
  Globe,
  Fuel,
  Zap,
  Briefcase,
  Globe2
} from "lucide-react";

interface DashboardDriverProps {
  currentLang: LanguageCode;
  onChangeLang?: (lang: LanguageCode) => void;
  driverUser: User;
  orders: Order[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  loading: boolean;
  token: string | null;
  onRefreshUser?: () => Promise<void>;
}

interface EarningsData {
  totalEarnings: number;
  todayEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  completedOrdersCount: number;
  commissionPaid: number;
  netIncome: number;
  history: Array<{
    orderId: string;
    cargoType: string;
    customerName: string;
    price: number;
    earnings: number;
    commission: number;
    date: string;
    status: string;
  }>;
}

interface ReviewsData {
  averageRating: number;
  totalReviews: number;
  reputationScore: number;
  reviews: Array<{
    id: string;
    customerId: string;
    customerName: string;
    rating: number;
    review: string;
    createdAt: string;
  }>;
}

export default function DashboardDriver({
  currentLang,
  onChangeLang,
  driverUser,
  orders,
  onUpdateStatus,
  loading,
  token,
  onRefreshUser
}: DashboardDriverProps) {
  const { t } = useTranslation();

  // Active sub-section tabs inside our carrier station
  const [activeTab, setActiveTab] = useState<"dashboard" | "available" | "active" | "tenders" | "backhaul" | "silkroad" | "history" | "earnings" | "vehicles" | "verification" | "notifications" | "profile" | "support" | "permissions">("dashboard");
  const [showFuelAdvanceModal, setShowFuelAdvanceModal] = useState(false);

  // Notifications center simulator
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; text: string; time: string; read: boolean }>>([
    { id: "1", title: "Ruxsatnoma va litsenziya", text: "Sizning haydovchilik guvohnomangiz va texnik pasportingiz tizimda tekshiruvdan o'tdi.", time: "Bugun", read: false },
    { id: "2", title: "Yuk birjasi yangilandi", text: "Sizning hududingizda yangi yuk tashish buyurtmasi joylashtirildi.", time: "Bugun", read: false },
    { id: "3", title: "Reyting o'zgarishi", text: "Mijoz sizga 5⭐ reyting berdi va aloqa a'lo darajadaligini ma'lum qildi.", time: "Kecha", read: true }
  ]);

  // Local state synced from props to allow instant UI feedback upon updates
  const [localProfile, setLocalProfile] = useState<any>(driverUser);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [reviews, setReviews] = useState<ReviewsData>({ averageRating: 5.0, totalReviews: 0, reputationScore: 100, reviews: [] });
  
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Target Active Order for Location/Simulations
  const myActiveOrder = orders.find(
    (o) => !o.isDeleted && !o.isArchived && o.driverId === driverUser.id && o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.CANCELLED
  );

  // Simulation parameters for Location/GPS
  const [simStepsCompleted, setSimStepsCompleted] = useState<number>(0);
  const [currentCoord, setCurrentCoord] = useState<{lat: number; lng: number}>({ lat: 41.311081, lng: 69.240562 }); // Tashkent center
  const [gpsLog, setGpsLog] = useState<string[]>([]);
  const [showingCancelModal, setShowingCancelModal] = useState(false);
  const [cancelReasonText, setCancelReasonText] = useState("");
  const [cancelOrderId, setCancelOrderId] = useState("");

  // Real-Time Chat States
  const [activeChatOrderId, setActiveChatOrderId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState<string>("");
  const [sendingChat, setSendingChat] = useState<boolean>(false);
  const [chatImgBase64, setChatImgBase64] = useState<string>("");

  const [showingVehicleModal, setShowingVehicleModal] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);

  // Verification materials submission states (Base64 simulated files)
  const [verificationForm, setVerificationForm] = useState({
    driverLicenseDoc: "",
    vehicleRegistrationDoc: "",
    identityVerificationDoc: "",
    vehiclePhotosDoc: "",
    driverLicenseNo: "",
    driverLicenseExpiry: "2030-12-31"
  });

  // Fetch complete profile, vehicles & earnings on startup
  const fetchDriverCorePayload = async () => {
    if (!token) return;
    setLoadingLocal(true);
    try {
      // 1. Double check current full profile details
      const profRes = await fetch("/api/driver/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (profRes.ok) {
        const pData = await profRes.json();
        setLocalProfile(pData);
        // Pre-fill verification form fields if existing
        setVerificationForm(prev => ({
          ...prev,
          driverLicenseNo: pData.driverLicenseNo || "",
          driverLicenseExpiry: pData.driverLicenseExpiry || "2030-12-31",
          driverLicenseDoc: pData.driverLicenseDoc || "",
          vehicleRegistrationDoc: pData.vehicleRegistrationDoc || "",
          identityVerificationDoc: pData.identityVerificationDoc || "",
          vehiclePhotosDoc: pData.vehiclePhotosDoc || ""
        }));
      }

      // 2. Load Vehicles
      const vehRes = await fetch("/api/driver/vehicle", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (vehRes.ok) {
        const vData = await vehRes.json();
        setVehicles(vData);
      }

      // 3. Load Earnings
      const earnRes = await fetch("/api/driver/earnings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (earnRes.ok) {
        const eData = await earnRes.json();
        setEarnings(eData);
      }

      // 4. Load Ratings & Reviews
      const reviewsRes = await fetch(`/api/driver/${driverUser.id}/reviews`);
      if (reviewsRes.ok) {
        const rData = await reviewsRes.json();
        setReviews(rData);
      }
    } catch (err) {
      console.error("Payload retrieval fault:", err);
    } finally {
      setLoadingLocal(false);
    }
  };

  useEffect(() => {
    fetchDriverCorePayload();
  }, [orders, token, activeTab]);

  // Flash Notifications Timer
  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(""), 4500);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  useEffect(() => {
    if (errorMsg) {
      const t = setTimeout(() => setErrorMsg(""), 4500);
      return () => clearTimeout(t);
    }
  }, [errorMsg]);

  // Load chat messages history for driving orders & polling interval registration
  const fetchChatMessages = async (orderId: string) => {
    if (!token || !orderId) return;
    try {
      const res = await fetch(`/api/chat/messages/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data);
      }
    } catch (err) {
      console.error("Error reading chat history:", err);
    }
  };

  useEffect(() => {
    if (activeChatOrderId) {
      fetchChatMessages(activeChatOrderId);
      const interval = setInterval(() => {
        fetchChatMessages(activeChatOrderId);
      }, 3000); // Poll every 3 seconds for active chats
      return () => clearInterval(interval);
    }
  }, [activeChatOrderId]);

  // Send message
  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeChatOrderId || (!chatInput.trim() && !chatImgBase64) || !token) return;

    setSendingChat(true);
    try {
      const res = await fetch(`/api/chat/messages/${activeChatOrderId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          text: chatInput,
          image: chatImgBase64
        })
      });
      if (res.ok) {
        setChatInput("");
        setChatImgBase64("");
        fetchChatMessages(activeChatOrderId);
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSendingChat(false);
    }
  };

  // Chat Image select converter
  const handleChatImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setChatImgBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // GPS Live Tracking simulation logic
  useEffect(() => {
    let timer: any;
    if (myActiveOrder) {
      timer = setInterval(() => {
        const status = myActiveOrder.status;
        setSimStepsCompleted(prev => {
          const next = prev + 1;
          let delta = next * 0.0015;
          if (status === OrderStatus.ACCEPTED) {
            setCurrentCoord({ lat: 41.311081 + delta, lng: 69.240562 - delta });
            if (next % 5 === 0) {
              setGpsLog(logs => [...logs, `[${new Date().toLocaleTimeString()}] Haydovchi yuk yuklash nuqtasiga o'tmoqda... (Masofa: ${Math.max(1, 15 - next)} km)`]);
            }
          } else if (status === OrderStatus.IN_TRANSIT) {
            setCurrentCoord({ lat: 41.315081 - delta, lng: 69.230562 + delta * 1.5 });
            if (next % 5 === 0) {
              setGpsLog(logs => [...logs, `[${new Date().toLocaleTimeString()}] Yo'nalishda harakatlanmoqda. Toshkent - Samarqand (ETA: ${Math.max(5, 45 - next * 3)} daqiqa)`]);
            }
          }
          return next;
        });
      }, 4000);
    } else {
      setSimStepsCompleted(0);
      setGpsLog([]);
    }
    return () => clearInterval(timer);
  }, [myActiveOrder]);

  // Actions
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoadingLocal(true);
    try {
      const res = await fetch("/api/driver/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: localProfile.name,
          phone: localProfile.phone,
          email: localProfile.email,
          profilePhoto: localProfile.profilePhoto,
          driverLicenseNo: localProfile.driverLicenseNo,
          driverLicenseExpiry: localProfile.driverLicenseExpiry,
          region: localProfile.region,
          city: localProfile.city,
          country: localProfile.country || "Uzbekistan",
          district: localProfile.district || localProfile.city || "Sergeli",
          streetAddress: localProfile.streetAddress || localProfile.city || "Sergeli",
          latitude: localProfile.latitude || 41.2995,
          longitude: localProfile.longitude || 69.2401,
          formattedAddress: localProfile.formattedAddress || localProfile.city || "",
          driverStatus: localProfile.driverStatus || "Online"
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Profilingiz muvaffaqiyatli saqlandi!");
        setLocalProfile(data.user);
        if (onRefreshUser) onRefreshUser();
      } else {
        setErrorMsg(data.error || "Profilni saqlashda xatolik yuz berdi.");
      }
    } catch (err) {
      setErrorMsg("Aloqa xatosi. Iltimos qayta urinib ko'ring.");
    } finally {
      setLoadingLocal(false);
    }
  };

  const handleRegisterOrEditVehicle = async (vehDraft: any, editingId: string | null) => {
    if (!token) return;
    setLoadingLocal(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const res = await fetch("/api/driver/vehicle", {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id: editingId || undefined,
          vehicleType: vehDraft.vehicleType,
          licensePlateNumber: vehDraft.licensePlateNumber,
          vehicleBrand: vehDraft.vehicleBrand,
          vehicleModel: vehDraft.vehicleModel,
          manufacturingYear: vehDraft.manufacturingYear,
          vehicleColor: vehDraft.vehicleColor,
          vehicleCapacity: vehDraft.vehicleCapacity,
          vehicleDimensions: vehDraft.vehicleDimensions,
          vehiclePhoto: vehDraft.vehiclePhoto,
          vehicleDocuments: vehDraft.vehicleDocuments,
          active: vehDraft.active
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(editingId ? "Transport muvaffaqiyatli tahrirlandi!" : "Yangi transport tasdiqlandi!");
        fetchDriverCorePayload();
      } else {
        setErrorMsg(data.error || "Kutilmagan xatolik.");
      }
    } catch (err) {
      setErrorMsg("Server bilan bog'lanish muvaffaqiyatsiz.");
    } finally {
      setLoadingLocal(false);
    }
  };

  const handleSetVehicleActive = async (id: string, active: boolean) => {
    if (!token) return;
    setLoadingLocal(true);
    try {
      const res = await fetch(`/api/driver/vehicle/${id}/activate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSuccessMsg("Transport vositasi muvaffaqiyatli faollashtirildi!");
        fetchDriverCorePayload();
      } else {
        const d = await res.json();
        setErrorMsg(d.error || "Faollashtirib bo'lmadi.");
      }
    } catch (err) {
      setErrorMsg("Logistika gateway aloqa xatosi.");
    } finally {
      setLoadingLocal(false);
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (!token) return;
    if (!confirm("Haqiqatdan ham ushbu avtotransportni o'chirib yubormoqchimisiz?")) return;
    setLoadingLocal(true);
    try {
      const res = await fetch(`/api/driver/vehicle/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSuccessMsg("Transport o'chirildi.");
        fetchDriverCorePayload();
      } else {
        setErrorMsg("Transport o'chirishda xato yuz berdi.");
      }
    } catch (err) {
      setErrorMsg("Transportlarni qayta yuklash fault.");
    } finally {
      setLoadingLocal(false);
    }
  };

  const handleVerifySubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!verificationForm.driverLicenseDoc || !verificationForm.vehicleRegistrationDoc || !verificationForm.identityVerificationDoc) {
      setErrorMsg("Iltimos, tekshiruv uchun barcha hujjatlarni to'liq yuklang.");
      return;
    }

    setLoadingLocal(true);
    try {
      const res = await fetch("/api/driver/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(verificationForm)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Tasdiqlash so'rovingiz administratorga yuborildi. Holat: Kutilmoqda (Pending) ⏳");
        fetchDriverCorePayload();
        if (onRefreshUser) onRefreshUser();
      } else {
        setErrorMsg(data.error || "Yuborishda xatolik.");
      }
    } catch (err) {
      setErrorMsg("Audit tizimi bilan bog'lanish fault.");
    } finally {
      setLoadingLocal(false);
    }
  };

  const handleCancelWithReasonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!cancelReasonText.trim()) {
      alert("Iltimos, bekor qilish sababini yozing.");
      return;
    }
    setLoadingLocal(true);
    try {
      const res = await fetch(`/api/orders/${cancelOrderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: OrderStatus.CANCELLED, reason: cancelReasonText })
      });
      if (res.ok) {
        setSuccessMsg("Buyurtma muvaffaqiyatli bekor qilindi va sababi yozildi.");
        setShowingCancelModal(false);
        setCancelReasonText("");
      } else {
        const d = await res.json();
        setErrorMsg(d.error || "Bekor qilishda muammo bo'ldi.");
      }
    } catch (err) {
      setErrorMsg("Aloqa portlovi.");
    } finally {
      setLoadingLocal(false);
    }
  };

  const myCompletedOrders = orders.filter(
    (o) => !o.isDeleted && o.driverId === driverUser.id && (o.status === OrderStatus.DELIVERED || o.status === OrderStatus.COMPLETED || o.isArchived)
  );

  return (
    <div id="driver_market_dashboard" className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-white max-w-7xl mx-auto font-sans p-2 sm:p-6 relative">
      
      {/* Toast Alert Flash alerts */}
      {successMsg && (
        <div id="success_alert_toast" className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white font-semibold px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500/30 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div id="error_alert_toast" className="fixed bottom-6 right-6 z-50 bg-rose-600 text-white font-semibold px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-rose-500/30 animate-shake">
          <AlertTriangle className="w-5 h-5 text-rose-200" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* MOBILE TOP TAB BAR & QUICK PROFILE BAR */}
      <div className="lg:hidden col-span-1 space-y-3 select-none">
        <div className="bg-[#120b2e]/90 border border-purple-500/10 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              {localProfile.profilePhoto ? (
                <img 
                  src={localProfile.profilePhoto} 
                  alt="Profile" 
                  className="w-11 h-11 rounded-xl object-cover border border-purple-500/30" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-650 text-white flex items-center justify-center font-bold text-base">
                  {localProfile.name?.charAt(0) || "D"}
                </div>
              )}
              <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#070312] ${
                localProfile.driverStatus === "Online" ? "bg-green-500" :
                localProfile.driverStatus === "Busy" ? "bg-amber-400" : "bg-zinc-500"
              }`} />
            </div>
            <div className="truncate">
              <h3 className="font-bold text-white text-xs truncate">{localProfile.name}</h3>
              <span className="text-[10px] text-purple-400 font-bold block">⭐ {reviews.averageRating.toFixed(1)} • {localProfile.driverStatus || "Online"}</span>
            </div>
          </div>

          {/* Quick status switcher */}
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 shrink-0">
            <button
              onClick={async () => {
                setLocalProfile((p: any) => ({ ...p, driverStatus: "Online" }));
                await fetch("/api/driver/profile", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ driverStatus: "Online" })
                });
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition ${localProfile.driverStatus === "Online" ? "bg-green-600 text-white" : "text-white/40"}`}
            >
              Online
            </button>
            <button
              onClick={async () => {
                setLocalProfile((p: any) => ({ ...p, driverStatus: "Offline" }));
                await fetch("/api/driver/profile", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ driverStatus: "Offline" })
                });
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition ${localProfile.driverStatus === "Offline" ? "bg-zinc-600 text-white" : "text-white/40"}`}
            >
              Offline
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Tabs Scroll */}
        <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar text-xs">
          {[
            { id: "dashboard", label: "Asosiy", icon: Activity },
            { id: "available", label: "Yuk Birjasi", icon: Compass, count: orders.filter(o => !o.isDeleted && !o.isArchived && o.status === OrderStatus.PENDING).length },
            { id: "active", label: "Faol Tashuv", icon: Navigation },
            { id: "tenders", label: "Tenderlar", icon: Briefcase },
            { id: "backhaul", label: "Backhaul", icon: Zap },
            { id: "earnings", label: "Mening Kassa", icon: Wallet },
            { id: "notifications", label: "Xabarlar", icon: Bell, count: notifications.filter(n => !n.read).length },
            { id: "verification", label: "Hujjatlar", icon: UserCheck },
            { id: "profile", label: "Profil", icon: UserIcon },
          ].map(tab => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 border transition shrink-0 cursor-pointer ${
                  isCurrent
                    ? "bg-purple-600 border-purple-400 text-white shadow-md shadow-purple-950/50"
                    : "bg-[#120b2e]/60 border-white/5 text-white/60 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count ? (
                  <span className="bg-fuchsia-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-black font-mono">
                    {tab.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* LEFT SIDEBAR PANEL (span 3) - Desktop Only */}
      <div className="hidden lg:flex lg:col-span-3 flex-col gap-6 select-none animate-fade-in">
        {/* User Card */}
        <div className="bg-[#120b2e]/60 border border-purple-500/10 rounded-3xl p-5 shadow-2xl backdrop-blur-md flex flex-col items-center text-center space-y-4">
          <div className="relative">
            {localProfile.profilePhoto ? (
              <img 
                src={localProfile.profilePhoto} 
                alt="Profile" 
                className="w-20 h-20 rounded-2xl object-cover border-2 border-purple-500/30" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-650 text-white flex items-center justify-center font-black text-2xl border-2 border-purple-500/20">
                {localProfile.name?.charAt(0) || "D"}
              </div>
            )}
            <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-[#070312] flex items-center justify-center text-[10px] text-white ${
              localProfile.driverStatus === "Online" ? "bg-green-500" :
              localProfile.driverStatus === "Busy" ? "bg-amber-400" : "bg-zinc-500"
            }`}>
              ●
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="font-extrabold text-white text-base leading-snug">{localProfile.name}</h3>
            <span className="text-[10px] tracking-widest text-[#9333ea] uppercase font-bold block">
              HAYDOVCHI • CARRIER ACTIVE
            </span>
            <div className="text-[11px] text-white/50 flex justify-center items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-purple-400 text-purple-400" />
              <span>{reviews.averageRating.toFixed(1)} Rating</span>
            </div>
          </div>

          {/* Quick Active truck widget */}
          {vehicles.length > 0 && (
            <div className="w-full p-2.5 bg-white/5 border border-white/5 rounded-2xl text-[10.5px] text-white/60">
              <span className="text-white/30 uppercase text-[8.5px] block">Faol Mashina (Active Truck)</span>
              <p className="font-bold text-white mt-1">🚚 {vehicles.find(v => v.active !== false)?.brand || vehicles[0].brand} - {vehicles.find(v => v.active !== false)?.licensePlate || vehicles[0].licensePlate || vehicles[0].licensePlateNumber}</p>
            </div>
          )}
        </div>

        {/* Control Panel Language Selector */}
        <div className="bg-[#120b2e]/60 border border-purple-500/10 rounded-3xl p-4 shadow-xl backdrop-blur-md flex flex-col gap-2">
          <div className="flex items-center gap-2 text-white/60 text-[10px] font-extrabold uppercase tracking-widest">
            <Globe className="w-3.5 h-3.5 text-purple-400" />
            <span>{t("language") || "Tilni Tanlash / Language"}</span>
          </div>
          <div className="relative">
            <select
              value={currentLang}
              onChange={(e) => onChangeLang && onChangeLang(e.target.value as LanguageCode)}
              className="w-full bg-[#1b143d] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white/90 font-bold outline-none focus:border-purple-500 transition cursor-pointer appearance-none pr-8"
            >
              <option value="uz">🇺🇿 O'zbekcha</option>
              <option value="en">🇺🇸 English</option>
              <option value="ru">🇷🇺 Русский</option>
              <option value="tr">🇹🇷 Türkçe</option>
              <option value="ar">🇸🇦 العربية</option>
              <option value="zh">🇨🇳 中文</option>
              <option value="fr">🇫🇷 Français</option>
              <option value="de">🇩🇪 Deutsch</option>
              <option value="es">🇪🇸 Español</option>
              <option value="pt">🇵🇹 Português</option>
              <option value="it">🇮🇹 Italiano</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 text-[10px]">
              ▼
            </div>
          </div>
        </div>

        {/* Navigation buttons List */}
        <div className="bg-[#120b2e]/60 border border-purple-500/10 rounded-3xl p-4 shadow-2xl backdrop-blur-md flex flex-col gap-1.5 text-xs text-white/75 font-sans">
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={`w-full px-4 py-3 rounded-xl uppercase tracking-wider font-extrabold flex items-center gap-3 border transition text-left cursor-pointer ${
              activeTab === "dashboard" 
                ? "bg-purple-600/20 border-purple-500 text-purple-400 font-bold" 
                : "bg-transparent border-transparent hover:bg-white/5 hover:text-white"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Asosiy Panel</span>
          </button>

          <button 
            onClick={() => setActiveTab("available")}
            className={`w-full px-4 py-3 rounded-xl uppercase tracking-wider font-extrabold flex items-center gap-3 border transition text-left relative cursor-pointer ${
              activeTab === "available" 
                ? "bg-purple-600/20 border-purple-500 text-purple-400 font-bold" 
                : "bg-transparent border-transparent hover:bg-white/5 hover:text-white"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Yuk Birjasi</span>
            {orders.filter(o => !o.isDeleted && !o.isArchived && o.status === OrderStatus.PENDING).length > 0 && (
              <span className="absolute right-3 bg-purple-500 text-white font-mono text-[9px] px-1.5 py-0.5 rounded-md animate-pulse font-black">
                {orders.filter(o => !o.isDeleted && !o.isArchived && o.status === OrderStatus.PENDING).length}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab("tenders")}
            className={`w-full px-4 py-3 rounded-xl uppercase tracking-wider font-extrabold flex items-center gap-3 border transition text-left relative cursor-pointer ${
              activeTab === "tenders" 
                ? "bg-purple-600/20 border-purple-500 text-purple-400 font-bold" 
                : "bg-transparent border-transparent hover:bg-white/5 hover:text-white"
            }`}
          >
            <Briefcase className="w-4 h-4 text-purple-400" />
            <span>Tenderlar & RFQ</span>
            <span className="absolute right-3 bg-purple-500/30 text-purple-300 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border border-purple-500/40">B2B</span>
          </button>

          <button 
            onClick={() => setActiveTab("backhaul")}
            className={`w-full px-4 py-3 rounded-xl uppercase tracking-wider font-extrabold flex items-center gap-3 border transition text-left relative cursor-pointer ${
              activeTab === "backhaul" 
                ? "bg-emerald-600/20 border-emerald-500 text-emerald-400 font-bold" 
                : "bg-transparent border-transparent hover:bg-white/5 hover:text-white"
            }`}
          >
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Backhaul AI (Qaytish)</span>
            <span className="absolute right-3 bg-emerald-500/20 text-emerald-300 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">+35%</span>
          </button>

          <button 
            onClick={() => setActiveTab("silkroad")}
            className={`w-full px-4 py-3 rounded-xl uppercase tracking-wider font-extrabold flex items-center gap-3 border transition text-left relative cursor-pointer ${
              activeTab === "silkroad" 
                ? "bg-blue-600/20 border-blue-500 text-blue-400 font-bold" 
                : "bg-transparent border-transparent hover:bg-white/5 hover:text-white"
            }`}
          >
            <Globe2 className="w-4 h-4 text-blue-400" />
            <span>Ipak Yo'li Koridorlari</span>
          </button>

          <button 
            onClick={() => setActiveTab("active")}
            className={`w-full px-4 py-3 rounded-xl uppercase tracking-wider font-extrabold flex items-center gap-3 border transition text-left relative cursor-pointer ${
              activeTab === "active" 
                ? "bg-purple-600/20 border-purple-500 text-purple-400 font-bold" 
                : "bg-transparent border-transparent hover:bg-white/5 hover:text-white"
            }`}
          >
            <Navigation className="w-4 h-4" />
            <span>Faol Tashuv</span>
            {myActiveOrder && (
              <span className="absolute right-3 w-2.5 h-2.5 rounded-full bg-green-400 animate-ping"></span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab("vehicles")}
            className={`w-full px-4 py-3 rounded-xl uppercase tracking-wider font-extrabold flex items-center gap-3 border transition text-left cursor-pointer ${
              activeTab === "vehicles" 
                ? "bg-purple-600/20 border-purple-500 text-purple-400 font-bold" 
                : "bg-transparent border-transparent hover:bg-white/5 hover:text-white"
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Avtotransportlar ({vehicles.length})</span>
          </button>

          <button 
            onClick={() => setActiveTab("earnings")}
            className={`w-full px-4 py-3 rounded-xl uppercase tracking-wider font-extrabold flex items-center gap-3 border transition text-left cursor-pointer ${
              activeTab === "earnings" 
                ? "bg-purple-600/20 border-purple-500 text-purple-400 font-bold" 
                : "bg-transparent border-transparent hover:bg-white/5 hover:text-white"
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Mening Kassa</span>
          </button>

          <button 
            onClick={() => setActiveTab("verification")}
            className={`w-full px-4 py-3 rounded-xl uppercase tracking-wider font-extrabold flex items-center gap-3 border transition text-left cursor-pointer ${
              activeTab === "verification" 
                ? "bg-purple-600/20 border-purple-500 text-purple-400 font-bold" 
                : "bg-transparent border-transparent hover:bg-white/5 hover:text-white"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Hujjatlar Audit</span>
          </button>

          <button 
            onClick={() => setActiveTab("notifications")}
            className={`w-full px-4 py-3 rounded-xl uppercase tracking-wider font-extrabold flex items-center gap-3 border transition text-left relative cursor-pointer ${
              activeTab === "notifications" 
                ? "bg-purple-600/20 border-purple-500 text-purple-400 font-bold" 
                : "bg-transparent border-transparent hover:bg-white/5 hover:text-white"
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Xabarlar</span>
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="absolute right-3 bg-red-500 text-white font-mono text-[9px] px-1.5 py-0.5 rounded-full">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab("profile")}
            className={`w-full px-4 py-3 rounded-xl uppercase tracking-wider font-extrabold flex items-center gap-3 border transition text-left cursor-pointer ${
              activeTab === "profile" 
                ? "bg-purple-600/20 border-purple-500 text-purple-400 font-bold" 
                : "bg-transparent border-transparent hover:bg-white/5 hover:text-white"
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Profil Sozlamalari</span>
          </button>

          <button 
            onClick={() => setActiveTab("permissions")}
            className={`w-full px-4 py-3 rounded-xl uppercase tracking-wider font-extrabold flex items-center gap-3 border transition text-left cursor-pointer ${
              activeTab === "permissions" 
                ? "bg-purple-600/20 border-purple-500 text-purple-400 font-bold" 
                : "bg-transparent border-transparent hover:bg-white/5 hover:text-white"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Ruxsatnomalar & HUD</span>
          </button>

          <button 
            onClick={() => setActiveTab("support")}
            className={`w-full px-4 py-3 rounded-xl uppercase tracking-wider font-extrabold flex items-center gap-3 border transition text-left cursor-pointer ${
              activeTab === "support" 
                ? "bg-purple-600/20 border-purple-500 text-purple-400 font-bold" 
                : "bg-transparent border-transparent hover:bg-white/5 hover:text-white"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Dileri Support</span>
          </button>
        </div>

        {/* Live Online Toggles */}
        <div className="bg-[#120b2e]/60 border border-purple-500/10 rounded-3xl p-4 shadow-2xl backdrop-blur-md space-y-2 text-center text-xs">
          <span className="text-white/40 font-bold uppercase text-[9px] tracking-wide block">Tizimdagi Rejim:</span>
          
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 shadow-inner">
            <button 
              onClick={async () => {
                setLocalProfile((p: any) => ({ ...p, driverStatus: "Online" }));
                await fetch("/api/driver/profile", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ driverStatus: "Online" })
                });
              }}
              className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${localProfile.driverStatus === "Online" ? "bg-green-500 text-white font-black" : "text-white/40 hover:text-white/80"}`}
            >
              Online
            </button>
            <button 
              onClick={async () => {
                setLocalProfile((p: any) => ({ ...p, driverStatus: "Offline" }));
                await fetch("/api/driver/profile", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ driverStatus: "Offline" })
                });
              }}
              className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${localProfile.driverStatus === "Offline" ? "bg-zinc-600 text-white font-black" : "text-white/40 hover:text-white/80"}`}
            >
              Offline
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT CONTENT WORKSPACE (span 9) */}
      <div className="lg:col-span-9 space-y-6">
        
        {loadingLocal && (
          <div className="flex items-center justify-center gap-2.5 py-4 bg-purple-500/5 rounded-2xl border border-purple-500/10 animate-pulse text-xs text-purple-300">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Logistika operatsiyalarini yuklash...</span>
          </div>
        )}

        {/* Quick Driver Fintech Liquidity Banner */}
        <div className="bg-gradient-to-r from-amber-950/40 via-[#180e28] to-[#0d0720] border border-amber-500/30 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Fuel className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                <span>50% Tezkor Yonilg'i Avansi (Instant Fuel Payout)</span>
                <span className="bg-amber-500/20 text-amber-300 text-[9px] font-mono px-2 py-0.5 rounded-full border border-amber-500/30">FINTECH</span>
              </h4>
              <p className="text-white/50 text-[11px]">
                Buyurtmani qabul qilgan zahotingiz yoqilg'i va yo'l xarajatlari uchun 50% avansni Humo/Uzcard kartangizga oling.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowFuelAdvanceModal(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-950/50 transition cursor-pointer shrink-0"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Avans Olish</span>
          </button>
        </div>

        {/* Tab 1: Dashboard Home */}
        {activeTab === "dashboard" && (
          <div className="space-y-6 animate-fade-in text-xs font-sans">
            <div className="p-6 bg-gradient-to-r from-[#1b093c] to-[#0d041c] border border-purple-500/25 rounded-3xl relative overflow-hidden shadow-2xl flex justify-between items-center">
              <div className="space-y-1 z-10">
                <h2 className="text-2xl font-black text-white">Xush kelibsiz, {localProfile.name}!</h2>
                <p className="text-white/50 text-xs text-purple-200">Milliy yuk tashish dilerlik darchasidasiz. Yuklarni muddatida, xavfsiz yetkazib kassa foydangizni oshiring.</p>
              </div>
              <Sparkles className="w-12 h-12 text-purple-400 opacity-40 animate-pulse hidden md:block" />
            </div>

            <DriverKPICards 
              earnings={earnings}
              availableCount={orders.filter(o => !o.isDeleted && !o.isArchived && o.status === OrderStatus.PENDING).length}
              activeCount={orders.filter(o => !o.isDeleted && !o.isArchived && o.driverId === driverUser.id && (o.status === OrderStatus.ACCEPTED || o.status === OrderStatus.IN_TRANSIT)).length}
              completedCount={myCompletedOrders.length}
              averageRating={reviews.averageRating}
              driverStatus={localProfile.driverStatus}
            />

            {myActiveOrder ? (
              <div className="border border-purple-500/20 rounded-3xl p-5 bg-[#120b2e]/60 backdrop-blur-md space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold uppercase text-purple-300 tracking-wider">Aktiv buyurtma joriy etilgan</span>
                  <button onClick={() => setActiveTab("active")} className="text-purple-400 font-extrabold hover:underline cursor-pointer">Safar marshrutiga o'tish →</button>
                </div>
                <p className="text-sm text-white font-extrabold">🚚 #{myActiveOrder.id.substring(0, 8).toUpperCase()} - {myActiveOrder.cargoType}</p>
                <p className="text-xs text-white/40">{myActiveOrder.pickupDistrict} ➔ {myActiveOrder.deliveryDistrict}</p>
              </div>
            ) : (
              <div className="border border-purple-500/10 rounded-3xl p-6 bg-white/5 backdrop-blur text-center space-y-2">
                <p className="text-xs text-white/50">Hozirda sizda yuklash jarayonidagi faol buyurtma yo'q.</p>
                <button onClick={() => setActiveTab("available")} className="bg-purple-650/40 text-purple-300 hover:bg-purple-650 text-xs font-bold py-2 px-4 rounded-xl transition cursor-pointer">Yuk tashuv birjasini ochish</button>
              </div>
            )}
          </div>
        )}

        {/* Tab: Enterprise Tenders & RFQ */}
        {activeTab === "tenders" && (
          <div className="animate-fade-in">
            <EnterpriseTendersHub
              currentLang={currentLang}
              token={token}
              user={driverUser}
              onRefresh={fetchDriverCorePayload}
            />
          </div>
        )}

        {/* Tab: Backhaul AI Return Load Optimizer */}
        {activeTab === "backhaul" && (
          <div className="animate-fade-in">
            <BackhaulOptimizerHub
              currentLang={currentLang}
              token={token}
              user={driverUser}
            />
          </div>
        )}

        {/* Tab: Silk Road Corridors & Customs */}
        {activeTab === "silkroad" && (
          <div className="animate-fade-in">
            <SilkRoadCorridorHub
              currentLang={currentLang}
              token={token}
              user={driverUser}
            />
          </div>
        )}

        {/* Tab 2: Available Orders Marketplace */}
        {activeTab === "available" && (
          <DriverMarketplace 
            orders={orders}
            onAccept={async (id) => {
              setLoadingLocal(true);
              try {
                await onUpdateStatus(id, OrderStatus.ACCEPTED);
                setSuccessMsg("Tashuv sizga muvaffaqiyatli dilerlikka biriktirildi! Faol Tashuv bo'limiga kiring.");
                setActiveTab("active");
                setTimeout(() => setSuccessMsg(""), 4000);
              } catch {
                setErrorMsg("Buyurtmani qabul qilishda xatolik yuz berdi.");
                setTimeout(() => setErrorMsg(""), 4000);
              } finally {
                setLoadingLocal(false);
              }
            }}
            globalLoading={loadingLocal}
            hasActiveOrder={!!myActiveOrder}
          />
        )}

        {/* Tab 3: Active Delivery Route Track */}
        {activeTab === "active" && (
          <DriverActiveMission 
            activeOrder={myActiveOrder}
            simStepsCompleted={simStepsCompleted}
            currentCoord={currentCoord}
            gpsLog={gpsLog}
            globalLoading={loadingLocal}
            onUpdateStatus={async (id, status) => {
              setLoadingLocal(true);
              try {
                await onUpdateStatus(id, status);
                setSuccessMsg(`Yuk tashish statusi o'zgartirildi: ${status}`);
                setTimeout(() => setSuccessMsg(""), 4000);
              } catch {
                setErrorMsg("Status yangilanishida xato ketdi.");
                setTimeout(() => setErrorMsg(""), 4000);
              } finally {
                setLoadingLocal(false);
              }
            }}
            onOpenCancelModal={(id) => {
              setCancelOrderId(id);
              setShowingCancelModal(true);
            }}
            onOpenChat={(orderId) => {
              setActiveChatOrderId(orderId);
            }}
          />
        )}

        {/* Tab 4: Available Vehicles catalog */}
        {activeTab === "vehicles" && (
          <DriverVehiclesTab 
            vehicles={vehicles}
            onRegisterOrEdit={handleRegisterOrEditVehicle}
            onSetActive={handleSetVehicleActive}
            onDelete={handleDeleteVehicle}
            globalLoading={loadingLocal}
          />
        )}

        {/* Tab 5: Real-time Earnings stats */}
        {activeTab === "earnings" && (
          <DriverEarningsTab earnings={earnings} token={token || ""} onRefreshProfile={onRefreshUser} />
        )}

        {/* Tab 6: Real-time Document Audit upload */}
        {activeTab === "verification" && (
          <DriverVerificationTab 
            verForm={verificationForm}
            onFormChange={setVerificationForm}
            onSubmit={handleVerifySubmission}
            localProfile={localProfile}
          />
        )}

        {/* Tab 7: Notifications Center */}
        {activeTab === "notifications" && (
          <DriverNotificationsTab 
            notifications={notifications}
            onMarkRead={(id) => {
              setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            }}
            onClearAll={() => {
              setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            }}
          />
        )}

        {/* Tab 8: Profile configurations */}
        {activeTab === "profile" && (
          <DriverProfileTab 
            localProfile={localProfile}
            onProfileChange={setLocalProfile}
            onSave={handleSaveProfile}
            globalLoading={loadingLocal}
          />
        )}

        {/* Tab 11: Permissions HUD */}
        {activeTab === "permissions" && (
          <PermissionsManagerTab />
        )}

        {/* Tab 9: Help support FAQs */}
        {activeTab === "support" && (
          <DriverSupportTab />
        )}

      </div>

      {/* Global Cancel Order Modal backdrop */}
      {showingCancelModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in text-xs text-white font-sans">
          <div className="backdrop-blur-md bg-[#100720]/95 border border-purple-500/20 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl relative">
            <button 
              onClick={() => {
                setShowingCancelModal(false);
                setCancelReasonText("");
              }}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pb-3 border-b border-white/5 space-y-1">
              <h3 className="text-lg font-black text-white">Tashuv buyurtmasini bekor qilish</h3>
              <p className="text-white/40 text-[11px]">Agar buyurtma dilerlik yuk avtomobilingizga mos kelmasa bekor qilish sababini kiritib buyurtmaning dilerlik birikmasini bekor qiling</p>
            </div>

            <form onSubmit={handleCancelWithReasonSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-white/60 block font-semibold text-[11px]">Bekor qilish sababi (Cancel Reason)</label>
                <textarea 
                  required
                  value={cancelReasonText}
                  onChange={(e) => setCancelReasonText(e.target.value)}
                  placeholder="Masalan: Fura g'ildiragi teshildi / Mijoz aloqaga chiqmayapti..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-purple-500 text-white outline-none min-h-[100px] text-xs resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => {
                    setShowingCancelModal(false);
                    setCancelReasonText("");
                  }}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl uppercase transition cursor-pointer text-[10.5px] text-center"
                >
                  Orqaga qaytish
                </button>

                <button 
                  disabled={loadingLocal}
                  type="submit"
                  className="flex-1 bg-rose-650 hover:bg-rose-550 text-white font-extrabold py-3 rounded-xl uppercase transition cursor-pointer text-[10.5px] text-center"
                >
                  Sababni tasdiqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 💬 REAL-TIME CHAT DRAWER */}
      {activeChatOrderId && (
        <div id="driver_customer_chat_overlay" className="fixed inset-0 bg-black/75 backdrop-blur-sm flex justify-end z-[999] animate-fade-in font-sans">
          <div className="w-full max-w-md bg-[#0a0517]/95 border-l border-white/10 h-full flex flex-col relative shadow-2xl">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
            
            {/* Header */}
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-[#120b2e]/90 pt-7">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/15 border border-purple-500/20 flex items-center justify-center font-bold text-purple-400">
                  💬
                </div>
                <div>
                  <h4 className="text-white font-extrabold text-sm">Buyurtmachi bilan chat</h4>
                  <span className="text-[10px] text-green-400 font-mono flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-ping"></span>
                    <span>Tashuv kanali • Active Chat</span>
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setActiveChatOrderId(null)}
                className="h-8 w-8 rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-450 flex items-center justify-center border border-white/5 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat message threads */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-black/40 text-xs">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-center space-y-2 opacity-50 px-4">
                  <span className="text-3xl animate-bounce">💬</span>
                  <h5 className="font-bold text-xs text-white">Xabarlashuvni boshlang</h5>
                  <p className="text-[10px] text-white/50">Mijozga yukni yuklanganligini, yetkazilish prognozi va yo'l holati haqida xabar bering.</p>
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isMe = msg.senderId === driverUser?.id;
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"} space-y-1`}>
                      <span className="text-[8px] text-white/40 font-mono">{msg.senderName} ({msg.senderRole === "driver" ? "Siz / Haydovchi" : "Mijoz"})</span>
                      <div className={`max-w-[80%] rounded-2xl p-3.5 text-xs text-left shadow-lg ${
                        isMe 
                          ? "bg-purple-600 border border-purple-500/30 text-white rounded-br-none" 
                          : "bg-white/5 border border-white/10 text-white/95 rounded-bl-none"
                      }`}>
                        {msg.text && <p className="leading-relaxed break-words">{msg.text}</p>}
                        {msg.image && (
                          <img 
                            src={msg.image} 
                            alt="Yuborilgan rasm" 
                            className="mt-2 rounded-lg max-h-40 object-cover w-full scale-100 hover:scale-[1.02] duration-200" 
                            referrerPolicy="no-referrer"
                          />
                        )}
                      </div>
                      <span className="text-[8px] text-white/30 font-mono">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Current Image Preview */}
            {chatImgBase64 && (
              <div className="p-3 border-t border-white/5 bg-purple-950/20 flex gap-3 items-center">
                <img src={chatImgBase64} alt="Preview" className="h-10 w-10 object-cover rounded-lg" referrerPolicy="no-referrer" />
                <div className="flex-1 flex justify-between items-center pr-2">
                  <div>
                    <p className="text-[10px] text-white font-bold font-sans">Surat ilova qilindi</p>
                    <span className="text-[8.5px] text-white/40">Yuborishga tayyor</span>
                  </div>
                  <button 
                    onClick={() => setChatImgBase64("")}
                    className="p-1 rounded bg-white/5 hover:bg-rose-500 text-white/50 hover:text-white transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Message input footer */}
            <form onSubmit={handleSendChatMessage} className="p-4 border-t border-white/5 bg-[#0a0517] flex gap-2">
              <label className="h-11 w-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center cursor-pointer text-white/60 transition shrink-0">
                <Paperclip className="w-4.5 h-4.5" />
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleChatImageChange} 
                />
              </label>

              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Mijozga xabar yozing..."
                className="flex-1 bg-black/45 border border-white/10 h-11 px-4 text-xs rounded-xl focus:border-purple-500 text-white outline-none"
              />

              <button 
                type="submit"
                disabled={sendingChat || (!chatInput.trim() && !chatImgBase64)}
                className="h-11 w-11 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-purple-950/30 transition shadow"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 💳 FINTECH DRIVER FUEL ADVANCE MODAL */}
      {showFuelAdvanceModal && (
        <DriverFuelAdvanceModal
          currentLang={currentLang}
          token={token}
          user={driverUser}
          activeOrders={orders.filter(
            (o) => o.driverId === driverUser.id || o.status === OrderStatus.ACCEPTED || o.status === OrderStatus.IN_TRANSIT
          )}
          onClose={() => setShowFuelAdvanceModal(false)}
        />
      )}

    </div>
  );
}
