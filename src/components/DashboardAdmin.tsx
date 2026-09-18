/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { LanguageCode, Order, AuditLog, User, FAQ, NewsArticle, OrderStatus, Payment } from "../types";
import { useTranslation } from "../context/LanguageContext";
import { TRANSLATIONS } from "../translations";
import { 
  DollarSign, 
  ShieldAlert, 
  BarChart3, 
  Users, 
  HelpCircle, 
  FileText, 
  Trash, 
  PlusCircle, 
  Activity, 
  CreditCard, 
  RefreshCw, 
  CircleDollarSign, 
  Percent, 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter, 
  UserCheck, 
  AlertTriangle, 
  MapPin, 
  Truck, 
  Clock, 
  Calendar, 
  TrendingUp, 
  BookOpen, 
  ShieldCheck,
  Eye,
  Settings,
  Globe,
  Radio,
  LifeBuoy,
  Bell,
  HardDrive,
  Zap,
  Sliders,
  Play,
  Server,
  Archive,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Building2,
  Download,
  ArrowUpRight,
  Wallet
} from "lucide-react";

import LogisticsOperationsCenter from "./LogisticsOperationsCenter";
import EnterpriseSupportCenterCRM from "./EnterpriseSupportCenterCRM";
import EnterpriseNotificationCenter from "./EnterpriseNotificationCenter";
import EnterpriseSecuritySuite from "./EnterpriseSecuritySuite";
import EnterpriseObservabilityHub from "./EnterpriseObservabilityHub";
import EnterpriseDisasterRecoveryHub from "./EnterpriseDisasterRecoveryHub";
import EnterpriseScalabilityHub from "./EnterpriseScalabilityHub";
import EnterpriseAdminRulesHub from "./EnterpriseAdminRulesHub";
import EnterpriseQADiagnosticHub from "./EnterpriseQADiagnosticHub";

interface DashboardAdminProps {
  currentLang: LanguageCode;
  onChangeLang?: (lang: LanguageCode) => void;
  orders: Order[];
  users: User[];
  faqs: FAQ[];
  news: NewsArticle[];
  auditLogs: AuditLog[];
  revenue: any[];
  onDeleteOrder: (orderId: string) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  onCreateFaq: (faqData: Partial<FAQ>) => Promise<void>;
  onDeleteFaq: (faqId: string) => Promise<void>;
  onCreateNews: (newsData: Partial<NewsArticle>) => Promise<void>;
  onDeleteNews: (newsId: string) => Promise<void>;
  loading: boolean;
  token: string | null;
  onRefreshOrders: () => Promise<void>;
}

export default function DashboardAdmin({
  currentLang,
  onChangeLang,
  orders,
  users,
  faqs,
  news,
  auditLogs,
  revenue,
  onDeleteOrder,
  onDeleteUser,
  onCreateFaq,
  onDeleteFaq,
  onCreateNews,
  onDeleteNews,
  loading: globalLoading,
  token,
  onRefreshOrders,
}: DashboardAdminProps) {
  // Navigation tabs for advanced ops
  const [activeTab, setActiveTab] = useState<"analytics" | "orders" | "drivers" | "shippers" | "payments" | "driverPayments" | "faq" | "news" | "audit" | "operations" | "support" | "notifications" | "security" | "observability" | "backup" | "scalability" | "rules" | "qa">("analytics");

  // Driver Payments States
  const [driverPayments, setDriverPayments] = useState<any[]>([]);
  const [driverPaymentsLoading, setDriverPaymentsLoading] = useState(false);
  const [dpSearch, setDpSearch] = useState("");
  const [dpDriverFilter, setDpDriverFilter] = useState("all");
  const [dpStatusFilter, setDpStatusFilter] = useState("all");
  const [dpDateFilter, setDpDateFilter] = useState("");
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payingNote, setPayingNote] = useState("");
  const [payingProof, setPayingProof] = useState("https://images.unsplash.com/photo-1554515707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=400");
  const [payingSubmitting, setPayingSubmitting] = useState(false);

  const fetchDriverPayments = async () => {
    if (!token) return;
    setDriverPaymentsLoading(true);
    try {
      const res = await fetch("/api/admin/driver-payments", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDriverPayments(data);
      }
    } catch (err) {
      console.error("Error fetching driver payments:", err);
    } finally {
      setDriverPaymentsLoading(false);
    }
  };

  // Filter conditions
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [orderArchiveTab, setOrderArchiveTab] = useState<"all" | "active" | "archived">("all");
  const [orderPage, setOrderPage] = useState(1);
  const [orderPageSize, setOrderPageSize] = useState(25);
  const [userSearchQuery, setUserSearchQuery] = useState("");

  // Direct Driver Verification form states
  const [modifyingDriverId, setModifyingDriverId] = useState<string | null>(null);
  const [verificationFeedback, setVerificationFeedback] = useState("");
  const [verificationSubmitting, setVerificationSubmitting] = useState(false);

  // FAQ Creator form states
  const [newFaqQuestion, setNewFaqQuestion] = useState("");
  const [newFaqAnswer, setNewFaqAnswer] = useState("");
  const [isFaqFormActive, setIsFaqFormActive] = useState(false);

  // News Creator form states
  const [newNewsTitle, setNewNewsTitle] = useState("");
  const [newNewsContent, setNewNewsContent] = useState("");
  const [isNewsFormActive, setIsNewsFormActive] = useState(false);

  // System-wide payments logs
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  // Escrow & Payout states for admin oversight
  const [adminFinancials, setAdminFinancials] = useState<{
    wallets: any[];
    withdrawals: any[];
    escrows: any[];
    transactions: any[];
  }>({ wallets: [], withdrawals: [], escrows: [], transactions: [] });
  const [financialsLoading, setFinancialsLoading] = useState(false);

  // Local notification banner alert helper
  const [toastAlert, setToastAlert] = useState({ show: false, text: "", type: "success" });

  // Real-time Observability & Telemetry state
  const [observabilityStats, setObservabilityStats] = useState<any>(null);
  const [observabilityLoading, setObservabilityLoading] = useState(false);

  const fetchObservabilityStats = async () => {
    setObservabilityLoading(true);
    try {
      const res = await fetch("/api/observability/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setObservabilityStats(data);
      }
    } catch (err) {
      console.error("Error fetching observability stats:", err);
    } finally {
      setObservabilityLoading(false);
    }
  };

  // Real-time Treasury & Monetization Engine state
  const [treasuryStats, setTreasuryStats] = useState<any>(null);
  const [treasuryLoading, setTreasuryLoading] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawBank, setWithdrawBank] = useState("Kapitalbank ATB");
  const [withdrawAccount, setWithdrawAccount] = useState("20208000900000123456");
  const [withdrawMfo, setWithdrawMfo] = useState("00440");
  const [withdrawCompany, setWithdrawCompany] = useState("YUKLA LOGISTICS MCHJ");
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);

  const fetchTreasuryStats = async () => {
    if (!token) return;
    setTreasuryLoading(true);
    try {
      const res = await fetch("/api/admin/treasury/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTreasuryStats(data);
      }
    } catch (err) {
      console.error("Error fetching treasury stats:", err);
    } finally {
      setTreasuryLoading(false);
    }
  };

  const handleCorporateWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const num = Number(withdrawAmount);
    if (isNaN(num) || num <= 0) {
      triggerToast("Iltimos, yaroqli pul summasini kiriting.", "error");
      return;
    }
    setWithdrawSubmitting(true);
    try {
      const res = await fetch("/api/admin/treasury/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: num,
          bankName: withdrawBank,
          accountNumber: withdrawAccount,
          mfo: withdrawMfo,
          companyName: withdrawCompany
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Pul chiqarishda xatolik yuz berdi.");
      }
      triggerToast(data.message || "Pul muvaffaqiyatli korporativ hisobga o'tkazildi!");
      setIsWithdrawModalOpen(false);
      setWithdrawAmount("");
      fetchTreasuryStats();
      fetchAllSystemPayments();
    } catch (err: any) {
      triggerToast(err.message || "Xatolik yuz berdi.", "error");
    } finally {
      setWithdrawSubmitting(false);
    }
  };

  useEffect(() => {
    fetchObservabilityStats();
    fetchTreasuryStats();
    const interval = setInterval(() => {
      fetchObservabilityStats();
      fetchTreasuryStats();
    }, 15000);
    return () => clearInterval(interval);
  }, [token]);

  const { t } = useTranslation();

  // Dynamic Real-Time Metrics from Treasury API or fallback to DB aggregates (Day-1 zero-state safe)
  const totalGMV = treasuryStats?.metrics?.totalGMV ?? orders
    .filter(o => !o.isDeleted && ((o.status as any) === "delivered" || (o.status as any) === OrderStatus.DELIVERED || (o.status as any) === OrderStatus.COMPLETED || (o.status as any) === "DELIVERED_PENDING_CONFIRMATION" || (o.status as any) === "SETTLED"))
    .reduce((sum, o) => sum + (o.price || 0), 0);
  
  const takeRateProfit = treasuryStats?.metrics?.takeRateProfit ?? Math.round(totalGMV * 0.01);
  const subscriptionMRR = treasuryStats?.metrics?.subscriptionMRR ?? 0;
  const subscriptionARR = treasuryStats?.metrics?.subscriptionARR ?? (subscriptionMRR * 12);
  const totalSubscriptionRevenue = treasuryStats?.metrics?.totalSubscriptionRevenue ?? 0;
  const availableTreasuryBalance = treasuryStats?.metrics?.availableForWithdrawal ?? (takeRateProfit + totalSubscriptionRevenue);
  const totalCarrierEarnings = treasuryStats?.metrics?.totalCarrierEarnings ?? Math.round(totalGMV * 0.99);

  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const monthlyRevenue = (treasuryStats?.metrics?.recentLedger || [])
    .filter((l: any) => new Date(l.timestamp).getTime() >= startOfThisMonth)
    .reduce((sum: number, l: any) => sum + (l.netPlatformFee || l.amount || 0), 0) || (takeRateProfit + subscriptionMRR);

  const triggerToast = (text: string, type = "success") => {
    setToastAlert({ show: true, text, type });
    setTimeout(() => setToastAlert({ show: false, text: "", type: "success" }), 4500);
  };

  // Fetch all live payment logs
  const fetchAllSystemPayments = async () => {
    if (!token) return;
    setPaymentsLoading(true);
    try {
      const res = await fetch("/api/payments", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAllPayments(data);
      }
    } catch (err) {
      console.error("System payments logging fetch error:", err);
    } finally {
      setPaymentsLoading(false);
    }
  };

  const fetchAdminFinancials = async () => {
    if (!token) return;
    setFinancialsLoading(true);
    try {
      const res = await fetch("/api/admin/financials", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAdminFinancials(data);
      }
    } catch (err) {
      console.error("Admin financials oversight fetch error:", err);
    } finally {
      setFinancialsLoading(false);
    }
  };

  const handleUpdateWithdrawalStatus = async (withdrawalId: string, targetStatus: "Approved" | "Rejected") => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/withdrawals/${withdrawalId}/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: targetStatus,
          feedback: `Payout request processed by Administrator: ${targetStatus}`
        })
      });
      const data = await res.json();
      if (res.ok) {
        triggerToast(`Pul yechish so'rovi muvaffaqiyatli [${targetStatus.toUpperCase()}] qilindi! 🎉`);
        await fetchAdminFinancials();
        if (onRefreshOrders) {
          await onRefreshOrders();
        }
      } else {
        triggerToast(data.error || "So'rov holatini yangilashda xatolik.", "error");
      }
    } catch (err: any) {
      triggerToast(err.message || "Server aloqa xatosi.", "error");
    }
  };

  const handleToggleFreezeEscrow = async (orderId: string, currentFrozenState: boolean) => {
    if (!token) return;
    const targetFreezeState = !currentFrozenState;
    try {
      const res = await fetch(`/api/admin/escrow/${orderId}/freeze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          freeze: targetFreezeState
        })
      });
      const data = await res.json();
      if (res.ok) {
        triggerToast(
          targetFreezeState 
            ? "Mablag' muvaffaqiyatli MUZLATILDI! ❄️ (Drayver uni yetkazsa ham chiqara olmaydi)" 
            : "Mablag' muvaffaqiyatli FAOLLASHTIRILDI! 🔥 (Drayver uchun ochildi)"
        );
        await fetchAdminFinancials();
        if (onRefreshOrders) {
          await onRefreshOrders();
        }
      } else {
        triggerToast(data.error || "Muzlatish amali bajarilmadi.", "error");
      }
    } catch (err: any) {
      triggerToast(err.message || "Server aloqa xatosi.", "error");
    }
  };

  useEffect(() => {
    fetchAllSystemPayments();
    fetchDriverPayments();
    if (activeTab === "payments") {
      fetchAdminFinancials();
    }
    if (activeTab === "driverPayments") {
      fetchDriverPayments();
    }
  }, [orders, token, activeTab]);

  // Submit live Driver Document status auditor
  const handleDriverVerifyAction = async (driverId: string, actionStatus: "approved" | "rejected" | "pending") => {
    if (!token) return;
    setVerificationSubmitting(true);
    try {
      const res = await fetch(`/api/admin/driver/${driverId}/verify`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: actionStatus,
          feedback: verificationFeedback || "Hujjatlar ma'muriyat tomonidan tekshirildi va tasdiqlandi"
        })
      });

      const data = await res.json();
      if (res.ok) {
        triggerToast(`Yuk tashuvchi driver drayver xolati muvaffaqiyatli [${actionStatus.toUpperCase()}] qilindi!`);
        setModifyingDriverId(null);
        setVerificationFeedback("");
        // Reload data safely
        await onRefreshOrders();
        await fetchAllSystemPayments();
      } else {
        triggerToast(data.error || "Auditorlik xisobda xatolik yuz berdi", "error");
      }
    } catch (err) {
      triggerToast("Bog'lanish xatoligi", "error");
    } finally {
      setVerificationSubmitting(false);
    }
  };

  // Driver payment action handlers
  const handleApprovePayment = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/driver-payments/${id}/pay`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: "Approved" })
      });
      if (res.ok) {
        triggerToast("To'lov so’rovi muvaffaqiyatli tasdiqlandi (Approved)! 🎉");
        await fetchDriverPayments();
      } else {
        const errorData = await res.json();
        triggerToast(errorData.error || "Xatolik yuz berdi.", "error");
      }
    } catch (err: any) {
      triggerToast(err.message || "Xatolik yuz berdi", "error");
    }
  };

  const handleCancelPayment = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/driver-payments/${id}/cancel`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        triggerToast("To'lov so'rovi chetlatildi va bekor qilindi. ✕");
        await fetchDriverPayments();
      } else {
        const errorData = await res.json();
        triggerToast(errorData.error || "Xatolik yuz berdi.", "error");
      }
    } catch (err: any) {
      triggerToast(err.message || "Xatolik yuz berdi", "error");
    }
  };

  const handlePayConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingId || !token) return;
    setPayingSubmitting(true);
    try {
      const res = await fetch(`/api/admin/driver-payments/${payingId}/pay`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: "Paid",
          paymentNote: payingNote || "Humo/UzCard bank o'tkazmasi orqali muvaffaqiyatli to'landi.",
          paymentProof: payingProof
        })
      });
      if (res.ok) {
        triggerToast("To'lov yuborildi! Jurnalga va kassa kvitansiyasiga kiritildi. 💳");
        setPayingId(null);
        setPayingNote("");
        await fetchDriverPayments();
      } else {
        const errorData = await res.json();
        triggerToast(errorData.error || "To'lovni tasdiqlashda xatolik.", "error");
      }
    } catch (err: any) {
      triggerToast(err.message || "Server aloqa xatosi.", "error");
    } finally {
      setPayingSubmitting(false);
    }
  };

  // Create FAQ entry
  const handleCreateFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQuestion.trim() || !newFaqAnswer.trim()) return;
    
    try {
      await onCreateFaq({
        questionUz: newFaqQuestion,
        questionEn: newFaqQuestion,
        questionRu: newFaqQuestion,
        answerUz: newFaqAnswer,
        answerEn: newFaqAnswer,
        answerRu: newFaqAnswer,
      } as any);
      setNewFaqQuestion("");
      setNewFaqAnswer("");
      setIsFaqFormActive(false);
      triggerToast("Yangi FAQ e'loni saqlandi!");
    } catch (err) {
      triggerToast("FAQ saqlashda ssenariy buzildi", "error");
    }
  };

  // Create News Article Entry
  const handleCreateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNewsTitle.trim() || !newNewsContent.trim()) return;

    try {
      await onCreateNews({
        titleUz: newNewsTitle,
        titleEn: newNewsTitle,
        titleRu: newNewsTitle,
        contentUz: newNewsContent,
        contentEn: newNewsContent,
        contentRu: newNewsContent,
      } as any);
      setNewNewsTitle("");
      setNewNewsContent("");
      setIsNewsFormActive(false);
      triggerToast("Yangi yangilik maqolasi chop qilindi!");
    } catch (err) {
      triggerToast("Yangilik yozishda ssenariy buzildi", "error");
    }
  };

  // Refund driver payments sandbox
  const handleRefundPaymentAction = async (payoutId: string) => {
    if (!token) return;
    if (!confirm("Ushbu drayver onlayn to'lovini butunlay rad etib, jo'natuvchi hamyoniga qaytarmoqchimisiz? To'vov holati REFUNDED bo'ladi.")) return;
    
    try {
      const res = await fetch(`/api/payments/${payoutId}/refund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Qaytarishda server xizmati rad etildi.");
      }
      triggerToast("Mablag'lar mijoz hamyoniga qaytarildi! 💳");
      await onRefreshOrders();
      await fetchAllSystemPayments();
    } catch (err: any) {
      triggerToast(err.message || "Xatolik ro'y berdi", "error");
    }
  };

  // Orders Real Database Metrics & Unlimited Support
  const realTotalOrdersCount = orders.filter(o => !o.isDeleted).length;
  const activeOrdersList = orders.filter(o => !o.isDeleted && !o.isArchived && !["Delivered", "Completed", "Cancelled"].includes(o.status));
  const archivedOrdersList = orders.filter(o => !o.isDeleted && (o.isArchived || ["Delivered", "Completed"].includes(o.status)));
  const deliveredOrdersList = orders.filter(o => !o.isDeleted && (o.status === "Delivered" || o.status === "Completed"));

  // Filters listings with archive tabs and fast multi-field search
  const filteredOrders = useMemo(() => {
    return orders.filter(ord => {
      if (ord.isDeleted) return false;

      // Filter by archive tab
      if (orderArchiveTab === "active") {
        if (ord.isArchived || ["Delivered", "Completed"].includes(ord.status)) return false;
      } else if (orderArchiveTab === "archived") {
        if (!ord.isArchived && !["Delivered", "Completed"].includes(ord.status)) return false;
      }

      const q = orderSearchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        ord.id.toLowerCase().includes(q) ||
        (ord.customerName && ord.customerName.toLowerCase().includes(q)) ||
        (ord.cargoType && ord.cargoType.toLowerCase().includes(q)) ||
        (ord.driverName && ord.driverName.toLowerCase().includes(q)) ||
        (ord.pickupAddress && ord.pickupAddress.toLowerCase().includes(q)) ||
        (ord.deliveryAddress && ord.deliveryAddress.toLowerCase().includes(q));
      
      const matchesStatus = orderStatusFilter === "all" || ord.status.toLowerCase() === orderStatusFilter.toLowerCase();
      
      return matchesSearch && matchesStatus;
    });
  }, [orders, orderArchiveTab, orderSearchQuery, orderStatusFilter]);

  const totalOrderPages = Math.max(1, Math.ceil(filteredOrders.length / orderPageSize));
  const paginatedOrders = useMemo(() => {
    const start = (orderPage - 1) * orderPageSize;
    return filteredOrders.slice(start, start + orderPageSize);
  }, [filteredOrders, orderPage, orderPageSize]);

  const driversList = users.filter(u => u.role === "driver");
  const verifiedDriversCount = driversList.filter((u: any) => u.verificationStatus === "approved").length;
  const pendingDriversCount = driversList.filter((u: any) => u.verificationStatus === "pending").length;

  const shippersList = users.filter(u => u.role === "customer");

  return (
    <div id="admin_control_terminal" className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-white max-w-7xl mx-auto font-sans relative pb-16 animate-fade-in">
      
      {/* Toast Alert Notifier */}
      {toastAlert.show && (
        <div 
          id="admin_toast_box" 
          className={`fixed bottom-6 right-6 z-[160] px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border transition-all duration-300 animate-bounce ${
            toastAlert.type === "success" 
              ? "bg-purple-900/90 border-purple-500 text-purple-200" 
              : "bg-rose-950/95 border-rose-600 text-rose-300"
          }`}
        >
          {toastAlert.type === "success" ? <CheckCircle className="w-5 h-5 text-purple-400" /> : <AlertTriangle className="w-5 h-5 text-rose-400" />}
          <span className="text-xs font-bold font-sans">{toastAlert.text}</span>
        </div>
      )}

      {/* MOBILE TOP TAB BAR FOR ADMIN */}
      <div className="lg:hidden col-span-1 space-y-3 select-none">
        <div className="bg-[#120b2e]/90 border border-purple-500/10 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#8338ec] to-[#3a0ca3] flex items-center justify-center text-white font-black text-xs border border-purple-500/30 font-mono">
              UR
            </div>
            <div>
              <h3 className="font-extrabold text-xs text-white leading-none">Umarbek Ravshanbekovich</h3>
              <span className="text-[9px] text-purple-400 font-mono tracking-widest uppercase font-semibold">YukLa Bosh Administrator</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] bg-purple-500/20 text-purple-300 px-2 py-1 rounded-lg border border-purple-500/20 font-bold">
              {realTotalOrdersCount.toLocaleString()} Buyurtma
            </span>
          </div>
        </div>

        {/* Admin Mobile Tabs Scroll */}
        <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar text-xs">
          {[
            { id: "analytics", label: "Analitika", icon: BarChart3 },
            { id: "orders", label: "Buyurtmalar", icon: FileText, count: realTotalOrdersCount },
            { id: "drivers", label: "Drayverlar", icon: Truck, count: pendingDriversCount },
            { id: "shippers", label: "Mijozlar", icon: Users, count: shippersList.length },
            { id: "payments", label: "Moliya & Escrow", icon: CreditCard },
            { id: "driverPayments", label: "To'lovlar", icon: CircleDollarSign },
            { id: "operations", label: "Mission Control", icon: Radio },
            { id: "security", label: "Security Vault", icon: ShieldCheck },
            { id: "observability", label: "Prometheus APM", icon: Activity },
            { id: "backup", label: "Disaster Recovery", icon: HardDrive },
            { id: "scalability", label: "K8s Scalability", icon: Server },
            { id: "qa", label: "QA Suite", icon: Play },
            { id: "audit", label: "Audit Logs", icon: Activity },
            { id: "support", label: "Support CRM", icon: LifeBuoy },
            { id: "news", label: "Yangiliklar", icon: BookOpen },
            { id: "faq", label: "FAQ", icon: HelpCircle },
          ].map(tab => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (tab.id === "payments") fetchAllSystemPayments();
                  if (tab.id === "driverPayments") fetchDriverPayments();
                }}
                className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 border transition shrink-0 cursor-pointer ${
                  isCurrent
                    ? "bg-purple-600 border-purple-400 text-white shadow-md shadow-purple-950/50"
                    : "bg-[#120b2e]/60 border-white/5 text-white/60 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 ? (
                  <span className="bg-fuchsia-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-black font-mono">
                    {tab.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* LEFT NAVIGATION COLUMN (Ops Switch Control) - Desktop Only */}
      <div className="hidden lg:flex lg:col-span-3 flex-col gap-6 font-sans">
        
        {/* Simple ops hub card identifier */}
        <div className="bg-[#120b2e]/60 border border-purple-500/10 rounded-3xl p-5 shadow-xl text-center backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-600/10 blur-[40px] rounded-full pointer-events-none"></div>
          
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#8338ec] to-[#3a0ca3] flex items-center justify-center mx-auto text-white font-black text-lg border border-purple-500/30 font-mono">
            UR
          </div>
          <h3 className="font-extrabold text-sm tracking-tight mt-3 text-white">Umarbek Ravshanbekovich</h3>
          <span className="text-[10px] text-purple-400 font-mono tracking-widest uppercase font-semibold">Bosh Administrator & Platforma Egasi</span>
          
          <div className="mt-4 pt-3 border-t border-white/5 flex justify-around text-center">
            <div>
              <span className="font-bold text-xs text-purple-300 font-mono block">{realTotalOrdersCount.toLocaleString()}</span>
              <span className="text-[9px] text-white/30 uppercase">{t("orders.title")}</span>
            </div>
            <div className="border-r border-white/5 h-6 self-center"></div>
            <div>
              <span className="font-bold text-xs text-purple-300 font-mono block">{users.length}</span>
              <span className="text-[9px] text-white/30 uppercase">{t("admin.customers")}</span>
            </div>
          </div>
        </div>

        {/* Control Panel Language Selector */}
        <div className="bg-[#120b2e]/60 border border-purple-500/10 rounded-3xl p-4 shadow-xl backdrop-blur-md flex flex-col gap-2">
          <div className="flex items-center gap-2 text-white/60 text-[10px] font-extrabold uppercase tracking-widest">
            <Globe className="w-3.5 h-3.5 text-purple-400" />
            <span>{t("language")}</span>
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

        {/* Tab commands switch options */}
        <div id="admin_navigation_panel" className="bg-[#120b2e]/40 border border-white/5 p-2 rounded-3xl space-y-1 shadow-inner">
          
          <button
            onClick={() => setActiveTab("analytics")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs uppercase font-extrabold tracking-wider transition ${
              activeTab === "analytics" ? "bg-purple-600/20 border border-purple-500/20 text-purple-300 font-black" : "text-white/40 hover:text-white/85 hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-3">
              <BarChart3 className="w-4 h-4" />
              <span>{t("admin.analytics")}</span>
            </div>
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400"></span>
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs uppercase font-extrabold tracking-wider transition ${
              activeTab === "orders" ? "bg-purple-600/20 border border-purple-500/20 text-purple-300 font-black" : "text-white/40 hover:text-white/85 hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4" />
              <span>{t("admin.orders")}</span>
            </div>
            <span className="font-mono text-xs font-semibold text-white/40 bg-white/5 px-2 py-0.5 rounded">{realTotalOrdersCount.toLocaleString()}</span>
          </button>

          <button
            onClick={() => setActiveTab("drivers")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs uppercase font-extrabold tracking-wider transition ${
              activeTab === "drivers" ? "bg-purple-600/20 border border-purple-500/20 text-purple-300 font-black" : "text-white/40 hover:text-white/85 hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-3">
              <Truck className="w-4 h-4" />
              <span>{t("admin.verifyDrivers")}</span>
            </div>
            {pendingDriversCount > 0 && (
              <span className="font-mono text-[10px] bg-yellow-500/25 border border-yellow-500/20 text-yellow-405 font-extrabold px-1.5 py-0.5 rounded leading-none block">
                {pendingDriversCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("shippers")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs uppercase font-extrabold tracking-wider transition ${
              activeTab === "shippers" ? "bg-purple-600/20 border border-purple-500/20 text-purple-300 font-black" : "text-white/40 hover:text-white/85 hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4" />
              <span>{t("admin.customers")}</span>
            </div>
            <span className="font-mono text-xs text-white/40">{shippersList.length}</span>
          </button>

          <button
            onClick={() => { setActiveTab("payments"); fetchAllSystemPayments(); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs uppercase font-extrabold tracking-wider transition ${
              activeTab === "payments" ? "bg-purple-600/20 border border-purple-500/20 text-purple-300 font-black" : "text-white/40 hover:text-white/85 hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-3">
              <CreditCard className="w-4 h-4" />
              <span>{t("admin.financials")}</span>
            </div>
            <span className="font-mono text-xs text-purple-400 font-bold">{allPayments.length}</span>
          </button>

          <button
            onClick={() => { setActiveTab("driverPayments"); fetchDriverPayments(); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs uppercase font-extrabold tracking-wider transition ${
              activeTab === "driverPayments" ? "bg-purple-600/20 border border-purple-500/20 text-purple-300 font-black" : "text-white/40 hover:text-white/85 hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-3">
              <CircleDollarSign className="w-4 h-4" />
              <span>{t("admin.driverPayments")}</span>
            </div>
            {driverPayments.filter((p: any) => p.status === "Pending Payment").length > 0 ? (
              <span className="font-mono text-[10px] bg-amber-500/25 border border-amber-500/20 text-amber-300 font-extrabold px-1.5 py-0.5 rounded leading-none block">
                {driverPayments.filter((p: any) => p.status === "Pending Payment").length}
              </span>
            ) : (
              <span className="font-mono text-xs text-white/40">{driverPayments.length}</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("faq")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs uppercase font-extrabold tracking-wider transition ${
              activeTab === "faq" ? "bg-purple-600/20 border border-purple-500/20 text-purple-300 font-black" : "text-white/40 hover:text-white/85 hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-4 h-4" />
              <span>{t("admin.faq")}</span>
            </div>
            <span className="font-mono text-xs text-white/40">{faqs.length}</span>
          </button>

          <button
            onClick={() => setActiveTab("news")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs uppercase font-extrabold tracking-wider transition ${
              activeTab === "news" ? "bg-purple-600/20 border border-purple-500/20 text-purple-300 font-black" : "text-white/40 hover:text-white/85 hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-4 h-4" />
              <span>{t("admin.news")}</span>
            </div>
            <span className="font-mono text-xs text-white/40">{news.length}</span>
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs uppercase font-extrabold tracking-wider transition ${
              activeTab === "audit" ? "bg-purple-600/20 border border-purple-500/20 text-purple-300 font-black" : "text-white/40 hover:text-white/85 hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-3">
              <Activity className="w-4 h-4" />
              <span>{t("admin.auditLogs")}</span>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>

          {/* ENTERPRISE OPERATIONS & LOGISTICS */}
          <div className="pt-3 pb-1 px-3">
            <span className="text-[10px] font-black uppercase text-purple-400/80 tracking-widest">Operatsion Markazlar</span>
          </div>

          <button
            onClick={() => setActiveTab("operations")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs uppercase font-extrabold tracking-wider transition ${
              activeTab === "operations" ? "bg-purple-600/20 border border-purple-500/20 text-purple-300 font-black" : "text-white/40 hover:text-white/85 hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-3">
              <Radio className="w-4 h-4 text-amber-400" />
              <span>Ops Mission Control</span>
            </div>
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping"></span>
          </button>

          <button
            onClick={() => setActiveTab("support")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs uppercase font-extrabold tracking-wider transition ${
              activeTab === "support" ? "bg-purple-600/20 border border-purple-500/20 text-purple-300 font-black" : "text-white/40 hover:text-white/85 hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-3">
              <LifeBuoy className="w-4 h-4 text-blue-400" />
              <span>Support CRM Desk</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("notifications")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs uppercase font-extrabold tracking-wider transition ${
              activeTab === "notifications" ? "bg-purple-600/20 border border-purple-500/20 text-purple-300 font-black" : "text-white/40 hover:text-white/85 hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-purple-400" />
              <span>Omnichannel Notifs</span>
            </div>
          </button>

          {/* ENTERPRISE PLATFORM & SECURITY */}
          <div className="pt-3 pb-1 px-3">
            <span className="text-[10px] font-black uppercase text-purple-400/80 tracking-widest">Xavfsizlik & Infratuzilma</span>
          </div>

          <button
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs uppercase font-extrabold tracking-wider transition ${
              activeTab === "security" ? "bg-purple-600/20 border border-purple-500/20 text-purple-300 font-black" : "text-white/40 hover:text-white/85 hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Security Vault (2FA)</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("observability")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs uppercase font-extrabold tracking-wider transition ${
              activeTab === "observability" ? "bg-purple-600/20 border border-purple-500/20 text-purple-300 font-black" : "text-white/40 hover:text-white/85 hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-3">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>APM & Prometheus</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("backup")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs uppercase font-extrabold tracking-wider transition ${
              activeTab === "backup" ? "bg-purple-600/20 border border-purple-500/20 text-purple-300 font-black" : "text-white/40 hover:text-white/85 hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-3">
              <HardDrive className="w-4 h-4 text-slate-300" />
              <span>Disaster Recovery</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("scalability")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs uppercase font-extrabold tracking-wider transition ${
              activeTab === "scalability" ? "bg-purple-600/20 border border-purple-500/20 text-purple-300 font-black" : "text-white/40 hover:text-white/85 hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-3">
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Scalability & Redis</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("rules")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs uppercase font-extrabold tracking-wider transition ${
              activeTab === "rules" ? "bg-purple-600/20 border border-purple-500/20 text-purple-300 font-black" : "text-white/40 hover:text-white/85 hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-3">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Pricing & Rules Engine</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("qa")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs uppercase font-extrabold tracking-wider transition ${
              activeTab === "qa" ? "bg-purple-600/20 border border-purple-500/20 text-purple-300 font-black" : "text-white/40 hover:text-white/85 hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-3">
              <Play className="w-4 h-4 text-emerald-400" />
              <span>QA Diagnostic Suite</span>
            </div>
            <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">100%</span>
          </button>
        </div>

        {/* Status gauges in sidebar */}
        <div className="bg-gradient-to-br from-purple-950/10 to-indigo-950/25 border border-[#3b0ca3]/20 p-4 rounded-3xl space-y-2 text-xs font-sans">
          <p className="text-[9px] uppercase font-bold text-purple-400 tracking-wider font-mono">Server Status Monitor</p>
          <div className="flex justify-between">
            <span className="text-white/40">API Gateways:</span>
            <span className="text-green-400 font-bold">ACTIVE (100%)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">Socket.io:</span>
            <span className="text-green-400 font-bold">CONNECTED 🔌</span>
          </div>
        </div>
      </div>

      {/* RIGHT CONTENT WORKSPACE */}
      <div className="lg:col-span-9 space-y-8">
        
        {/* ====================================================
           TAB VIEW 1: OPS ANALYTICS & KEY PERFORMANCE STATS
           ==================================================== */}
        {activeTab === "analytics" && (
          <div className="space-y-8 animate-fade-in font-sans">
            
            {/* 🛰️ DISPATCH & OBSERVABILITY COMMAND CENTER */}
            <div className="bg-gradient-to-br from-[#1b0d38] via-[#12082b] to-[#0a0418] border border-purple-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 blur-[130px] rounded-full pointer-events-none" />
              
              {/* Header Bar */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-white/10 relative z-10">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse ring-4 ring-emerald-500/20" />
                    <span className="text-[11px] font-mono font-black uppercase tracking-widest text-emerald-400">
                      YUKLA MARKAZIY DISPETCHERLIK VA TELEMETRIYA MONITORINGI
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Dispetcherlik & Observability Boshqaruv Markazi
                  </h2>
                  <p className="text-xs text-white/60 max-w-2xl leading-relaxed">
                    Jonli monitoring: Reysdagi mashinalar, xavfsiz Escrow depozit balansi, 1% platforma vositachilik tushumlari, obuna daromadlari va haydovchilarning KYC tekshiruvi holati.
                  </p>
                </div>

                {/* Control Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      fetchObservabilityStats();
                      onRefreshOrders();
                    }}
                    disabled={observabilityLoading}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-950/40 transition cursor-pointer"
                  >
                    <span>{observabilityLoading ? "Yangilanmoqda..." : "🔄 Telemetriyani yangilash"}</span>
                  </button>
                </div>
              </div>

              {/* Real-time Observability Gauges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 relative z-10">
                <div className="bg-black/30 border border-white/5 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] text-white/40 uppercase font-mono block">Reysdagi Mashinalar</span>
                  <p className="text-xl font-bold font-mono text-cyan-400">
                    {observabilityStats?.inTransit ?? activeOrdersList.filter(o => o.status === OrderStatus.IN_TRANSIT).length} ta
                  </p>
                  <span className="text-[10px] text-cyan-400 font-mono block">Faol tranzitda</span>
                </div>

                <div className="bg-black/30 border border-white/5 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] text-white/40 uppercase font-mono block">Escrow Depozit Balansi</span>
                  <p className="text-lg sm:text-xl font-bold font-mono text-emerald-400">
                    {(observabilityStats?.lockedEscrowSum ?? adminFinancials.escrows.reduce((s, e) => s + (e.amount || 0), 0)).toLocaleString()} UZS
                  </p>
                  <span className="text-[10px] text-emerald-400 font-mono block">100% ajratilgan xavfsiz fond</span>
                </div>

                <div className="bg-black/30 border border-white/5 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] text-white/40 uppercase font-mono block">Platforma 1% Komissiyasi</span>
                  <p className="text-lg sm:text-xl font-bold font-mono text-purple-300">
                    {takeRateProfit.toLocaleString()} UZS
                  </p>
                  <span className="text-[10px] text-purple-400 font-mono block">1% yig'ilgan vositachilik</span>
                </div>

                <div className="bg-black/30 border border-white/5 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] text-white/40 uppercase font-mono block">Obuna MRR / ARR</span>
                  <p className="text-lg sm:text-xl font-bold font-mono text-[#dda15e]">
                    {subscriptionMRR.toLocaleString()} UZS
                  </p>
                  <span className="text-[10px] text-white/40 font-mono block">ARR: {subscriptionARR.toLocaleString()} UZS</span>
                </div>

                <div className="bg-black/30 border border-purple-500/20 rounded-2xl p-4 space-y-1 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-amber-400 uppercase font-mono block">Haydovchilar KYC</span>
                  <p className="text-base sm:text-lg font-bold font-mono text-white">
                    {driversList.filter(d => d.verificationStatus === "approved").length} Tasdiqlangan
                  </p>
                  <span className="text-[10px] text-amber-300 font-mono block">
                    {driversList.filter(d => d.verificationStatus === "pending").length} ta tekshiruvda
                  </span>
                </div>
              </div>

              {/* Real-time Order Stream / Empty State */}
              <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-2 relative z-10">
                <div className="flex items-center justify-between text-[11px] font-mono text-white/50 border-b border-white/5 pb-2">
                  <span className="uppercase tracking-wider">Logistika Telemetriya Hodisalari</span>
                  <span className="text-emerald-400">Holat: Tizim to'liq operatsion</span>
                </div>
                {activeOrdersList.length === 0 ? (
                  <div className="text-center py-6 text-xs text-white/40 font-mono">
                    Hozirda faol buyurtmalar yo'q. Yangi buyurtma yaratilganda dispetcherlik panelida avtomatik aks etadi.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto font-mono text-[11px]">
                    {activeOrdersList.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between text-white/70 hover:text-white transition py-1 border-b border-white/5 last:border-0">
                        <span className="font-bold text-white">#{order.id.substring(0, 8)} • {order.cargoType || "Yuk"}</span>
                        <span className="text-purple-300">{order.pickupAddress} ➔ {order.deliveryAddress}</span>
                        <span className="px-2 py-0.5 rounded text-[9px] bg-purple-500/20 text-purple-300 font-bold uppercase">{order.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Stats matrix card grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              
              <div className="bg-[#120b2e]/40 border border-white/5 rounded-2xl p-5 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/40 uppercase font-black tracking-wider">Jami Buyurtmalar</span>
                  <span className="text-[9px] font-mono bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-bold">Real DB</span>
                </div>
                <p className="text-xl font-bold font-mono text-white mt-1.5">{realTotalOrdersCount.toLocaleString()} ta</p>
                <div className="flex items-center gap-2 mt-1 text-[9.5px]">
                  <span className="text-emerald-400 font-bold">{activeOrdersList.length} faol</span>
                  <span className="text-white/30">•</span>
                  <span className="text-purple-400 font-bold">{archivedOrdersList.length} arxivda</span>
                </div>
              </div>

              <div className="bg-[#120b2e]/40 border border-white/5 rounded-2xl p-5 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/40 uppercase font-black tracking-wider">Jami Mijozlar</span>
                  <span className="text-[9px] font-mono text-white/30">Shippers</span>
                </div>
                <p className="text-xl font-bold font-mono text-white mt-1.5">{shippersList.length.toLocaleString()} ta</p>
                <span className="text-[9.5px] text-purple-400 font-bold block mt-1">Faol ro'yxatdan o'tgan mijozlar: {shippersList.length}</span>
              </div>

              <div className="bg-[#120b2e]/40 border border-white/5 rounded-2xl p-5 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/40 uppercase font-black tracking-wider">Jami Haydovchilar</span>
                  <span className="text-[9px] font-mono text-white/30">Carriers</span>
                </div>
                <p className="text-xl font-bold font-mono text-white mt-1.5">{driversList.length.toLocaleString()} ta</p>
                <span className="text-[9.5px] text-purple-400 font-bold block mt-1">Hujjat topshirgan: {verifiedDriversCount} tasdiqlangan</span>
              </div>

              <div className="bg-[#120b2e]/40 border border-white/5 rounded-2xl p-5 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/40 uppercase font-black tracking-wider">{t("admin.analytics")} (GMV)</span>
                  <span className="text-[9px] font-mono text-[#dda15e] bg-amber-500/10 px-1.5 py-0.5 rounded">Tovarlar Hajmi</span>
                </div>
                <p className="text-base font-bold font-mono text-[#dda15e] mt-2">{totalGMV.toLocaleString()} UZS</p>
                <span className="text-[9.5px] text-white/40 block mt-1">Yetkazilgan yuklar umumiy shartnoma qiymati</span>
              </div>

              {/* 1% Escrow Take-Rate Card */}
              <div className="bg-gradient-to-br from-[#120b2e]/60 to-[#22073d]/45 border border-purple-500/20 rounded-2xl p-5 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 blur-xl rounded-full pointer-events-none"></div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-purple-400 uppercase font-black tracking-wider block font-mono">YukLa Sof Daromadi (1% Take-Rate)</span>
                  <span className="text-[9px] font-mono font-bold text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded">1% Escrow</span>
                </div>
                <p className="text-lg font-extrabold font-mono text-white mt-1.5">{takeRateProfit.toLocaleString()} UZS</p>
                <span className="text-[9.5px] text-white/40 block mt-1">Avtomatlashtirilgan 1% Escrow vositachilik foydasi</span>
              </div>

              {/* SaaS Subscription MRR Card */}
              <div className="bg-[#120b2e]/40 border border-white/5 rounded-2xl p-5 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/40 uppercase font-black tracking-wider">Obuna Daromadi (MRR)</span>
                  <span className="text-[9px] font-mono text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded">Oddiy/Pro/VIP</span>
                </div>
                <p className="text-lg font-bold font-mono text-cyan-300 mt-1.5">{subscriptionMRR.toLocaleString()} UZS</p>
                <span className="text-[9.5px] text-white/40 block mt-1">Yillik takroriy daromad (ARR): {subscriptionARR.toLocaleString()} UZS</span>
              </div>

              {/* Treasury Available for Bank Withdrawal */}
              <div className="bg-gradient-to-br from-[#0c1f20]/60 to-[#120b2e]/60 border border-emerald-500/30 rounded-2xl p-5 shadow-xl relative">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] text-emerald-400 uppercase font-black tracking-wider font-mono">Jami Sof Tushum (G'azna)</span>
                  <button
                    onClick={() => {
                      setWithdrawAmount(availableTreasuryBalance > 0 ? String(availableTreasuryBalance) : "");
                      setIsWithdrawModalOpen(true);
                    }}
                    className="text-[9.5px] font-bold bg-emerald-500 hover:bg-emerald-400 text-black px-2.5 py-1 rounded-lg transition font-mono uppercase cursor-pointer flex items-center gap-1 shadow-sm"
                    title="Korporativ bankka pul chiqarish"
                  >
                    <Download className="w-3 h-3" />
                    <span>Bankka Chiqarish</span>
                  </button>
                </div>
                <p className="text-lg font-extrabold font-mono text-emerald-400 mt-1.5">{availableTreasuryBalance.toLocaleString()} UZS</p>
                <span className="text-[9.5px] text-white/40 block mt-1">Korporativ hisob raqamiga yechib olishga tayyor</span>
              </div>

              {/* Carrier Direct Payout (99%) */}
              <div className="bg-[#120b2e]/40 border border-white/5 rounded-2xl p-5 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/40 uppercase font-black tracking-wider">{t("driver.earnings")} (99%)</span>
                  <span className="text-[9px] font-mono text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded">Karta-Karta</span>
                </div>
                <p className="text-lg font-bold font-mono text-green-400 mt-1.5">{totalCarrierEarnings.toLocaleString()} UZS</p>
                <span className="text-[9.5px] text-green-400/80 block mt-1">Haydovchilar hisobiga avtomat o'tkazilgan 99% ulush</span>
              </div>

            </div>

            {/* Glowing custom SVG line chart of monthly distribution */}
            <div className="bg-[#120b2e]/30 border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/5 blur-[125px] rounded-full pointer-events-none"></div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-white/5 mb-6 gap-2">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-400" />
                    <span>YukLa Sof Daromadi Dinamikasi (1% Escrow & SaaS Obuna)</span>
                  </h3>
                  <p className="text-[11px] text-white/40">1% avtomatlashtirilgan Escrow take-rate va SaaS obunalar hisobidan jamg'arilgan real daromad tahlili</p>
                </div>
                <span className="text-xs font-mono font-bold text-[#dda15e] bg-yellow-950/20 border border-yellow-500/20 px-2.5 py-1 rounded-xl">
                  MONETIZATION ENGINE: ACTIVE
                </span>
              </div>

              {revenue.length === 0 ? (
                <div className="h-44 flex items-center justify-center text-xs text-white/40">
                  Hozirda tahlillar mavjud emas.
                </div>
              ) : (
                <div className="h-40 w-full bg-black/45 rounded-2xl border border-white/5 p-4 flex items-end justify-between relative">
                  <div className="absolute inset-0 bg-[radial-gradient(#1e1b4b_1.5px,transparent_1.5px)] opacity-35 [background-size:16px_16px]"></div>
                  
                  <svg className="absolute inset-0 h-full w-full pointer-events-none overflow-visible" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="admin_rev_grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7209b7" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#7209b7" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path 
                      d={`M 0,110 ${revenue.slice(-8).map((rev, index) => `L ${(index + 1) * 85},${Math.max(15, 110 - ((rev.revenue || 5000) / 100000) * 80)}`).join(" ")} L 1000,110 Z`}
                      fill="url(#admin_rev_grad)"
                      stroke="#f72585"
                      strokeWidth="3.5"
                      className="drop-shadow-[0_4px_10px_rgba(247,37,133,0.4)]"
                    />
                  </svg>

                  {revenue.slice(-8).map((rev, ind) => (
                    <div key={rev.id} className="text-center w-12 relative z-10 group">
                      <span className="text-[9px] text-[#dda15e] font-mono block">{(rev.revenue / 1000).toFixed(0)}k</span>
                      <div className="h-2 w-2 rounded-full bg-purple-500 mx-auto border-2 border-[#120b2e]"></div>
                      <span className="text-[8px] text-white/30 truncate block max-w-[40px] mx-auto uppercase mt-1">#{rev.orderId.substr(0,4)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Financial Ledger Journal - permanently persistent on DB */}
            <div className="bg-[#120b2e]/30 border border-white/10 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-base font-black text-white pb-3 border-b border-white/5 mb-6 flex items-center justify-between">
                <span>Platformaning barcha moliyaviy tranzaksiyalari (YukLa Revenue Ledger)</span>
                <span className="text-xs text-white/40 font-mono font-medium">Buxgalteriya moduli</span>
              </h3>

              {(!treasuryStats?.metrics?.recentLedger || treasuryStats.metrics.recentLedger.length === 0) && revenue.length === 0 ? (
                <div className="py-12 text-center text-xs text-white/40 font-mono">
                  Hozircha moliyaviy tranzaksiyalar yo'q. Birinchi yetkazilgan yuk bilan 1% avtomatlashtirilgan komissiya yoki SaaS obunalar bu yerda aks etadi.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse font-mono">
                    <thead>
                      <tr className="border-b border-white/5 text-white/40 uppercase text-[9px] tracking-widest font-mono">
                        <th className="py-2.5 px-4 font-normal">Sana</th>
                        <th className="py-2.5 px-4 font-normal">Turi / Tranzaksiya</th>
                        <th className="py-2.5 px-4 font-normal text-right">Jami Summa</th>
                        <th className="py-2.5 px-4 font-normal text-right text-purple-400">YukLa (1% Komissiya)</th>
                        <th className="py-2.5 px-4 font-normal text-right text-green-400">Haydovchi (99%)</th>
                        <th className="py-2.5 px-4 font-normal">Tavsif</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-white/85">
                      {treasuryStats?.metrics?.recentLedger && treasuryStats.metrics.recentLedger.length > 0 ? (
                        treasuryStats.metrics.recentLedger.map((item: any) => (
                          <tr key={item.id} className="hover:bg-white/5 transition">
                            <td className="py-3 px-4 text-white/40 text-[10.5px]">
                              {new Date(item.timestamp || item.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 font-bold text-purple-300">
                              <span className="bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded text-[10px]">
                                {item.type}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right font-extrabold text-white">
                              {(item.grossAmount || item.amount || 0).toLocaleString()} UZS
                            </td>
                            <td className="py-3 px-4 text-right text-purple-400 font-extrabold">
                              {(item.netPlatformFee || (item.type === "SAAS_SUBSCRIPTION" ? item.amount : Math.round((item.grossAmount || item.amount) * 0.01))).toLocaleString()} UZS
                            </td>
                            <td className="py-3 px-4 text-right text-green-400 font-extrabold">
                              {item.carrierPayout ? item.carrierPayout.toLocaleString() : (item.type === "ESCROW_TAKE_RATE" ? Math.round((item.grossAmount || item.amount) * 0.99).toLocaleString() : 0)} UZS
                            </td>
                            <td className="py-3 px-4 font-sans text-white/70 truncate max-w-xs">
                              {item.description || item.details || "Tranzaksiya"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        revenue.map((rev) => (
                          <tr key={rev.id} className="hover:bg-white/5">
                            <td className="py-3 px-4 text-white/40 text-[10.5px]">{new Date(rev.createdAt).toLocaleDateString()}</td>
                            <td className="py-3 px-4 font-bold text-purple-400">#{rev.orderId.substr(0, 8).toUpperCase()}</td>
                            <td className="py-3 px-4 text-right font-extrabold text-white">{rev.totalPrice?.toLocaleString()} UZS</td>
                            <td className="py-3 px-4 text-right text-purple-400 font-extrabold">{Math.round((rev.totalPrice || 0) * 0.01).toLocaleString()} UZS</td>
                            <td className="py-3 px-4 text-right text-green-400 font-extrabold">{Math.round((rev.totalPrice || 0) * 0.99).toLocaleString()} UZS</td>
                            <td className="py-3 px-4 font-sans text-white/70">{rev.driverName} • {rev.customerName}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ====================================================
           TAB VIEW 2: LOGISTICS ORDERS CONTROL (Advanced Query & Edit)
           ==================================================== */}
        {activeTab === "orders" && (
          <div className="bg-[#120b2e]/30 border border-white/10 rounded-3xl p-6 lg:p-8 shadow-2xl relative animate-fade-in font-sans">
            <div className="pb-4 border-b border-white/5 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  <span>SaaS Logistic Buyurtmalar Boshqaruvi</span>
                </h3>
                <p className="text-[11px] text-white/40">Cheklanmagan buyurtmalar bazasi (100, 1,000, 10,000+), avtomatik arxiv va ma'lumotlar xavfsizligi</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-purple-400 font-bold uppercase bg-purple-500/10 border border-purple-400/20 px-3 py-1.5 rounded-xl">
                  Jami bazada: {realTotalOrdersCount.toLocaleString()} ta
                </span>
                <span className="font-mono text-xs text-emerald-400 font-bold uppercase bg-emerald-500/10 border border-emerald-400/20 px-3 py-1.5 rounded-xl">
                  Filtrda: {filteredOrders.length.toLocaleString()} ta
                </span>
              </div>
            </div>

            {/* Archive / Active Category Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <button
                onClick={() => {
                  setOrderArchiveTab("all");
                  setOrderPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  orderArchiveTab === "all"
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                    : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5"
                }`}
              >
                <span>Barcha Buyurtmalar</span>
                <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded-md font-mono">{realTotalOrdersCount}</span>
              </button>

              <button
                onClick={() => {
                  setOrderArchiveTab("active");
                  setOrderPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  orderArchiveTab === "active"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                    : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Faol Buyurtmalar</span>
                <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded-md font-mono">{activeOrdersList.length}</span>
              </button>

              <button
                onClick={() => {
                  setOrderArchiveTab("archived");
                  setOrderPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  orderArchiveTab === "archived"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5"
                }`}
              >
                <Archive className="w-3.5 h-3.5 text-indigo-300" />
                <span>Arxivlangan & Tarix</span>
                <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded-md font-mono">{archivedOrdersList.length}</span>
              </button>
            </div>

            {/* Filter controls panel */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pb-6 border-b border-white/5 mb-6 text-xs leading-relaxed">
              <div className="relative md:col-span-2">
                <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={orderSearchQuery} 
                  onChange={(e) => {
                    setOrderSearchQuery(e.target.value);
                    setOrderPage(1);
                  }}
                  placeholder="ID, Mijoz, Haydovchi, Yuk turi yoki Manzil bo'yicha qidirish..."
                  className="w-full bg-black/45 border border-white/10 h-10 pl-9 pr-4 rounded-xl focus:border-purple-500 text-white outline-none"
                />
              </div>

              <div className="relative">
                <Filter className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                <select 
                  value={orderStatusFilter} 
                  onChange={(e) => {
                    setOrderStatusFilter(e.target.value);
                    setOrderPage(1);
                  }}
                  className="w-full bg-black/45 border border-white/10 h-10 pl-9 pr-4 rounded-xl focus:border-purple-500 text-white outline-none select"
                >
                  <option value="all">Barcha yuklar holati</option>
                  <option value="pending">Kutilayotgan (Pending)</option>
                  <option value="accepted">Qabul qilingan (Accepted)</option>
                  <option value="in transit">Yetkazilmoqda (In Transit)</option>
                  <option value="delivered">Yetkazilgan (Delivered - Avto-arxiv)</option>
                  <option value="cancelled">Bekor qilingan (Cancelled)</option>
                </select>
              </div>

              <button 
                onClick={onRefreshOrders}
                className="bg-white/5 border border-white/10 hover:bg-white/15 rounded-xl transition flex items-center justify-center gap-2 h-10 cursor-pointer font-extrabold text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
                <span>Malulotlarni Refresh</span>
              </button>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="text-center py-16 text-xs text-white/30">
                <Archive className="w-8 h-8 text-white/20 mx-auto mb-2" />
                <p>Qidiruv talablariga mos buyurtmalar topilmadi</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/15 text-white/40 uppercase font-mono tracking-wider text-[9px]">
                        <th className="py-3 px-4 font-normal">Buyurtma ID</th>
                        <th className="py-3 px-4 font-normal">Yuboruvchi (SaaS)</th>
                        <th className="py-3 px-4 font-normal">Marshrut & manzil</th>
                        <th className="py-3 px-4 font-normal text-right">Yuk parametrlari</th>
                        <th className="py-3 px-4 font-normal text-right">Summa (Cassa)</th>
                        <th className="py-3 px-4 font-normal">Tizim holati</th>
                        <th className="py-3 px-4 text-right font-normal">Amal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-white/80">
                      {paginatedOrders.map((ord) => {
                        const isDeliveredOrArchived = ord.isArchived || ord.status === OrderStatus.DELIVERED || ord.status === "Delivered" || ord.status === "Completed";
                        return (
                          <tr key={ord.id} className="hover:bg-white/5 transition duration-150">
                            <td className="py-3.5 px-4 font-mono font-bold text-purple-400">
                              <div>#{ord.id.substr(0, 8).toUpperCase()}</div>
                              {ord.createdAt && (
                                <span className="text-[9px] text-white/30 font-normal font-sans block mt-0.5">
                                  {new Date(ord.createdAt).toLocaleDateString()}
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 leading-tight">
                              <p className="font-bold text-white">{ord.customerName}</p>
                              <span className="text-[10px] text-white/30 font-mono italic block">{ord.phoneNumber}</span>
                              {ord.driverName && (
                                <span className="text-[9.5px] text-purple-300/80 font-medium block mt-1">
                                  Haydovchi: {ord.driverName}
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              <p className="truncate max-w-[130px]" title={ord.pickupAddress}><span className="text-purple-400 font-bold mr-1 font-mono">A:</span>{ord.pickupAddress}</p>
                              <p className="truncate max-w-[130px] mt-1" title={ord.deliveryAddress}><span className="text-fuchsia-400 font-bold mr-1 font-mono">B:</span>{ord.deliveryAddress}</p>
                              {ord.pickupRegion && (
                                <p className="text-[9px] text-[#cca0ff] font-bold font-mono mt-1.5 uppercase leading-none">
                                  {ord.pickupRegion} &rarr; {ord.deliveryRegion}
                                </p>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right leading-none">
                              <span className="font-bold text-[#dda15e] block">{ord.cargoType}</span>
                              <span className="text-[9.5px] text-white/40 block mt-1.5">{ord.weight} kg • {ord.volume} m³</span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <p className="font-extrabold font-mono text-white">{ord.price?.toLocaleString()} UZS</p>
                              <span className="text-[9.5px] text-indigo-400 font-bold uppercase block mt-1">{ord.paymentMethod}</span>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex flex-col items-start gap-1">
                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase bg-white/5 tracking-wider border ${
                                  ord.status === OrderStatus.PENDING ? "text-yellow-400 border-yellow-500/20" :
                                  ord.status === OrderStatus.ACCEPTED ? "text-cyan-400 border-cyan-500/20" :
                                  ord.status === OrderStatus.IN_TRANSIT ? "text-purple-400 border-purple-500/20" :
                                  ord.status === OrderStatus.DELIVERED ? "text-green-400 border-green-500/20" : "text-rose-500"
                                }`}>
                                  {ord.status}
                                </span>
                                {isDeliveredOrArchived && (
                                  <span className="px-2 py-0.5 rounded-full text-[8.5px] font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 font-mono">
                                    <Archive className="w-2.5 h-2.5" />
                                    <span>Arxiv</span>
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                disabled={globalLoading}
                                title="Buyurtmani xavfsiz o'chirish (soft-delete)"
                                onClick={() => {
                                  if (confirm(`Haqiqatdan ham ushbu buyurtmani [ID: #${ord.id.substr(0,8)}] o'chirmoqchimisiz? (Tizimda moliyaviy hisobotlar va arxiv xavfsiz saqlanadi)`)) {
                                    onDeleteOrder(ord.id);
                                    triggerToast("Buyurtma muvaffaqiyatli arxivlandi va o'chirildi");
                                  }
                                }}
                                className="bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white p-2.5 rounded-xl transition border border-rose-500/20 hover:border-transparent cursor-pointer"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Unlimited Pagination Controls & Performance Virtualization */}
                <div className="mt-6 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3 text-white/50">
                    <span>
                      Jami <strong className="text-white font-mono">{filteredOrders.length.toLocaleString()}</strong> ta buyurtmadan{" "}
                      <strong className="text-purple-300 font-mono">
                        {((orderPage - 1) * orderPageSize + 1).toLocaleString()} - {Math.min(orderPage * orderPageSize, filteredOrders.length).toLocaleString()}
                      </strong> ko'rsatilmoqda
                    </span>

                    <div className="flex items-center gap-1.5 ml-2">
                      <span className="text-[10px] uppercase text-white/40">Sahifada:</span>
                      <select
                        value={orderPageSize}
                        onChange={(e) => {
                          setOrderPageSize(Number(e.target.value));
                          setOrderPage(1);
                        }}
                        className="bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-white font-mono text-xs focus:border-purple-500 outline-none"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                  </div>

                  {totalOrderPages > 1 && (
                    <div className="flex items-center gap-1.5">
                      <button
                        disabled={orderPage === 1}
                        onClick={() => setOrderPage(1)}
                        className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition text-white"
                        title="Birinchi sahifa"
                      >
                        <ChevronsLeft className="w-4 h-4" />
                      </button>
                      <button
                        disabled={orderPage === 1}
                        onClick={() => setOrderPage((p) => Math.max(1, p - 1))}
                        className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition text-white"
                        title="Oldingi sahifa"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 font-mono font-bold text-xs">
                        {orderPage} / {totalOrderPages}
                      </span>

                      <button
                        disabled={orderPage === totalOrderPages}
                        onClick={() => setOrderPage((p) => Math.min(totalOrderPages, p + 1))}
                        className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition text-white"
                        title="Keyingi sahifa"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        disabled={orderPage === totalOrderPages}
                        onClick={() => setOrderPage(totalOrderPages)}
                        className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition text-white"
                        title="Oxirgi sahifa"
                      >
                        <ChevronsRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ====================================================
           TAB VIEW 3: DRIVER DOCUMENTS AUDITOR & VERIFICATION
           ==================================================== */}
        {activeTab === "drivers" && (
          <div className="bg-[#120b2e]/30 border border-white/10 rounded-3xl p-6 lg:p-8 shadow-2xl relative animate-fade-in font-sans">
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/5 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="pb-4 border-b border-white/5 mb-6 flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-purple-450" />
                  <span>Logistika drayverlarini tekshirish auditori</span>
                </h3>
                <p className="text-[11px] text-white/40">Zvenoga ulanayotgan yuk mashinalari pasportlari va litsenziyalarini tasdiqlash boshqarmasi</p>
              </div>
              <span className="font-mono text-xs text-yellow-500 font-extrabold bg-yellow-950/20 border border-yellow-500/25 px-2.5 py-1.5 rounded-xl animate-pulse">
                Kutilmoqda (Pending): {pendingDriversCount} ta drayver
              </span>
            </div>

            {modifyingDriverId && (
              <div className="bg-black/45 border border-purple-500/20 p-5 rounded-2xl mb-6 space-y-4 animate-fade-in text-xs leading-relaxed font-sans">
                <p className="font-extrabold text-[#dda15e] flex items-center gap-1.5">
                  <AlertTriangle className="w-4.5 h-4.5" />
                  <span>Drayver ID: #{modifyingDriverId.substr(0, 8)} bo'yicha ma'muriy xulosa</span>
                </p>

                <div className="space-y-1">
                  <label className="text-white/70 block">Xalqaro feedback sharhi, xatolar yoki sababi *</label>
                  <input 
                    type="text" 
                    value={verificationFeedback} 
                    onChange={(e) => setVerificationFeedback(e.target.value)}
                    placeholder="Masalan: Haydovchi guvohnomasining amal qilish muddati tugagan..."
                    className="w-full bg-black/55 border border-white/10 h-11 px-3.5 rounded-xl text-xs focus:border-purple-500 text-white outline-none"
                  />
                </div>

                <div className="flex gap-2.5">
                  <button
                    disabled={verificationSubmitting}
                    onClick={() => handleDriverVerifyAction(modifyingDriverId, "approved")}
                    className="bg-green-600 hover:bg-green-500 text-white font-extrabold py-2 px-5 rounded-xl cursor-pointer"
                  >
                    Hujjatlarni tasdiqlash (APPROVE)
                  </button>

                  <button
                    disabled={verificationSubmitting}
                    onClick={() => handleDriverVerifyAction(modifyingDriverId, "rejected")}
                    className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold py-2 px-5 rounded-xl cursor-pointer"
                  >
                    Rad etish (REJECT)
                  </button>

                  <button
                    type="button"
                    onClick={() => setModifyingDriverId(null)}
                    className="bg-[#120b2e]/60 text-white/60 hover:text-white py-2 px-4 rounded-xl"
                  >
                    Bekor qilish
                  </button>
                </div>
              </div>
            )}

            {driversList.length === 0 ? (
              <div className="text-center py-16 text-xs text-white/30">Ro'yxatdan o'tgan haydovchilar topilmadi</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-white/40 uppercase font-mono tracking-wider text-[9px]">
                      <th className="py-2.5 px-4 font-normal">Ism Sharif / Email</th>
                      <th className="py-2.5 px-4 font-normal">Telefon</th>
                      <th className="py-2.5 px-4 font-normal">Mashina rusumi (Plates)</th>
                      <th className="py-2.5 px-4 font-normal">Hujjat ko'rinishi</th>
                      <th className="py-2.5 px-4 font-normal text-right">Auditorlik holati</th>
                      <th className="py-2.5 px-4 text-right font-normal">Ssenariy amali</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/80">
                    {driversList.map((dr: any) => (
                      <tr key={dr.id} className="hover:bg-white/5 font-sans">
                        <td className="py-4 px-4 font-bold">
                          <span className="block text-white leading-tight">{dr.name}</span>
                          <span className="text-[10px] text-purple-400 font-mono italic block mt-0.5">{dr.email}</span>
                        </td>
                        <td className="py-4 px-4 font-mono">{dr.phone || "Kiritilmagan"}</td>
                        <td className="py-4 px-4">
                          <span className="font-bold text-white block">{dr.vehicleType || "Taniqlanmagan"}</span>
                          <span className="text-[10px] text-white/40 font-mono block mt-1">Plates: {dr.vehiclePlates || dr.vehicleNumber || "N_A"}</span>
                        </td>
                        <td className="py-4 px-4 font-sans text-white/60 text-[10px]">
                          {dr.driverLicenseDoc || dr.cargoPlatesDoc ? (
                            <span className="text-green-405 font-bold uppercase tracking-wider block">YUKLANGAN (READY) 📁</span>
                          ) : (
                            <span className="text-white/30 italic block">Yozilmagan (No docs)</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right uppercase font-bold tracking-widest text-[9.5px]">
                          <span className={`px-2.5 py-0.5 rounded ${
                            dr.verificationStatus === "approved" ? "bg-green-500/10 text-green-400" :
                            dr.verificationStatus === "rejected" ? "bg-rose-500/10 text-rose-500" : "bg-yellow-500/10 text-yellow-500 animate-pulse"
                          }`}>
                            {dr.verificationStatus || "pending"}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => {
                              setModifyingDriverId(dr.id);
                              setVerificationFeedback("");
                              window.scrollTo({ top: 350, behavior: "smooth" });
                            }}
                            className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold px-3 py-1.5 rounded-xl transition text-[10px] uppercase tracking-wider cursor-pointer"
                          >
                            Auditorlik
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ====================================================
           TAB VIEW 4: SHIPPERS CLIENTS REGISTRY
           ==================================================== */}
        {activeTab === "shippers" && (
          <div className="bg-[#120b2e]/30 border border-white/10 rounded-3xl p-6 lg:p-8 shadow-2xl relative animate-fade-in font-sans">
            <div className="pb-4 border-b border-white/5 mb-6 flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-white">Mijoz Tashkilotlar Reyestri (Shipper Customers)</h3>
                <p className="text-[11px] text-white/40">SaaS hisobidan ro'yxatdan o'tgan barcha yuboruvchi yuk egalari ro'yxati</p>
              </div>
              <span className="font-mono text-xs text-purple-400 font-bold uppercase bg-purple-500/10 px-2.5 py-1.5 rounded-xl border border-purple-500/20">
                Jami: {shippersList.length} ta hamkorlik
              </span>
            </div>

            {shippersList.length === 0 ? (
              <div className="text-center py-16 text-xs text-white/30">Mijozlar topilmadi</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-white/40 uppercase font-mono tracking-wider text-[9px]">
                      <th className="py-2.5 px-4 font-normal">Identifikator ID</th>
                      <th className="py-2.5 px-4 font-normal font-sans">Kompaniya vakili Ismi</th>
                      <th className="py-2.5 px-4 font-normal">Elektron Pochta</th>
                      <th className="py-2.5 px-4 font-normal font-sans">Aloqa Aloqalari (Phone)</th>
                      <th className="py-2.5 px-4 font-normal text-right">Tizimga kirgan sana</th>
                      <th className="py-2.5 px-4 text-right font-normal">Amal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/80">
                    {shippersList.map((cp) => (
                      <tr key={cp.id} className="hover:bg-white/5 font-sans leading-relaxed">
                        <td className="py-4 px-4 font-mono text-white/40">{cp.id}</td>
                        <td className="py-4 px-4 font-extrabold text-white text-sm">{cp.name}</td>
                        <td className="py-4 px-4 font-mono text-purple-300">{cp.email}</td>
                        <td className="py-4 px-4 font-mono">{cp.phone || "Kiritilmagan"}</td>
                        <td className="py-4 px-4 text-right font-mono text-white/50">{new Date(cp.createdAt).toLocaleDateString()}</td>
                        <td className="py-4 px-4 text-right">
                          <button
                            disabled={globalLoading}
                            onClick={() => {
                              if (confirm("Ushbu yuboruvchini butunlay o'chirib yubormoqchimisiz?")) {
                                onDeleteUser(cp.id);
                                triggerToast("Mijoz portaldan zaryadsizlantirildi");
                              }
                            }}
                            className="bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white p-2.5 rounded-xl transition cursor-pointer border border-rose-500/15"
                            title="Mijozni o'chirish"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ====================================================
           TAB VIEW 5: ONLINE KASSA AUDITING (Click, Payme, Xazna)
           ==================================================== */}
        {activeTab === "payments" && (
          <div className="bg-[#120b2e]/30 border border-white/10 rounded-3xl p-6 lg:p-8 shadow-2xl relative animate-fade-in font-sans">
            <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/5 blur-[125px] rounded-full pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-white/5 gap-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-400" />
                  <span>Elektron Kassa transaksiyalar reyestri</span>
                </h3>
                <p className="text-[11px] text-white/40">Mijozlarimizdan kelib tushayotgan barcha SMS 3D-Secure onlayn to'lovlari auditoriya jurnali</p>
              </div>

              <button 
                onClick={fetchAllSystemPayments}
                className="bg-white/5 border border-white/10 hover:bg-white/15 px-3.5 py-1.5 text-xs rounded-xl flex items-center gap-2 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                <span>Kassa reyestrini Refresh</span>
              </button>
            </div>

            <div className="overflow-x-auto pt-4">
              <table className="w-full text-left text-xs border-collapse font-sans font-medium">
                <thead>
                  <tr className="border-b border-white/10 text-white/40 uppercase font-mono tracking-wider text-[9px]">
                    <th className="py-3 px-4 font-normal">Tranzaksiya ID (TX)</th>
                    <th className="py-3 px-4 font-normal">Mijoz (SaaS Shipper)</th>
                    <th className="py-3 px-4 font-normal text-right">Narx to'lov Summasi</th>
                    <th className="py-3 px-4 font-normal">Gateway Tizimi</th>
                    <th className="py-3 px-4 font-normal">Yozilgan vaqt</th>
                    <th className="py-3 px-4 font-normal">Audit holati</th>
                    <th className="py-3 px-4 text-right font-normal">Amal (Refund)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {allPayments.map((pm) => (
                    <tr key={pm.id} className="hover:bg-white/5 transition">
                      <td className="py-4 px-4 font-mono font-bold text-slate-400 select-all">{pm.id}</td>
                      <td className="py-4 px-4 font-extrabold text-white">{pm.customerName || "YukLa Client"}</td>
                      <td className="py-4 px-4 text-right font-bold text-white font-mono">{pm.amount?.toLocaleString()} UZS</td>
                      <td className="py-4 px-4 capitalize font-mono text-indigo-400 font-extrabold text-[11px]">{pm.paymentMethod}</td>
                      <td className="py-4 px-4 font-mono text-white/40 text-[10.5px]">{new Date(pm.createdAt).toLocaleString()}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                          pm.status === "Paid" ? "bg-green-500/10 text-green-400 border border-green-500/15" : "bg-red-500/10 text-red-500"
                        }`}>
                          {pm.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-sans font-bold">
                        {pm.status === "Paid" ? (
                          <button
                            onClick={() => handleRefundPaymentAction(pm.id)}
                            className="bg-purple-650/15 border border-purple-550/25 hover:bg-purple-600 text-purple-300 hover:text-white px-3 py-1.5 rounded-xl transition text-[9.5px] uppercase tracking-wider cursor-pointer font-black"
                          >
                            Rad etish (Refund)
                          </button>
                        ) : (
                          <span className="text-[10px] text-white/30 italic font-mono">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ESCROW PORTAL WITH APPROVAL CONTROLS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 pt-8 border-t border-white/5 select-none font-sans">
              
              {/* 💸 PENDING PAYOUTS SECTION */}
              <div className="bg-black/25 border border-white/5 p-6 rounded-2xl space-y-4">
                <div className="border-b border-white/5 pb-3">
                  <h4 className="text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                    <span>Karta / Bankka pul yechish so'rovlari</span>
                  </h4>
                  <p className="text-[10px] text-white/40 mt-0.5">Drayverlarning hisob balansidan pul yechish uchun yuborgan arizalari ruxsatnomasi</p>
                </div>

                {financialsLoading ? (
                  <div className="text-center py-6 text-white/30">Mantiqiy audit yuklanmoqda...</div>
                ) : !adminFinancials.withdrawals || adminFinancials.withdrawals.length === 0 ? (
                  <div className="text-center py-10 text-white/20 text-xs">Ayni damda pul yechish so'rovlari mavjud emas.</div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {adminFinancials.withdrawals.map((wd: any) => (
                      <div key={wd.id} className="bg-[#120b2e]/65 border border-white/5 p-4 rounded-xl space-y-3 hover:border-white/10 transition">
                        <div className="flex justify-between items-start font-sans">
                          <div>
                            <span className="text-[10px] text-purple-400 font-bold block">{wd.driverName || "Noma'lum Drayver"}</span>
                            <span className="text-[9px] text-white/30 block font-mono">ID: #{wd.id.substring(0, 8).toUpperCase()}</span>
                          </div>
                          <div className="text-right">
                            <strong className="text-white font-mono text-xs">{wd.amount?.toLocaleString()} UZS</strong>
                            <span className={`block text-[9px] font-bold uppercase tracking-wider mt-0.5 ${
                              wd.status === "Approved" ? "text-emerald-400" : wd.status === "Rejected" ? "text-rose-450" : "text-amber-400"
                            }`}>
                              {wd.status}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-1 text-[9.5px] bg-black/30 p-2.5 rounded border border-white/5 text-white/50 leading-tight">
                          <div>
                            <span>Tizimi:</span>
                            <strong className="text-white/80 block uppercase font-bold">{wd.method}</strong>
                          </div>
                          <div>
                            <span>Sana:</span>
                            <strong className="text-white/80 block">{new Date(wd.createdAt).toLocaleDateString()}</strong>
                          </div>
                          <div className="col-span-2 truncate">
                            <span>Karta / Hisob raqam:</span>
                            <strong className="text-white/80 block font-mono font-bold">{wd.accountDetails}</strong>
                          </div>
                        </div>

                        {wd.status === "Pending" && (
                          <div className="flex gap-2">
                            <button 
                              type="button"
                              onClick={() => handleUpdateWithdrawalStatus(wd.id, "Approved")}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold py-2 rounded-lg transition uppercase tracking-wider cursor-pointer"
                            >
                              Tasdiqlash ✓
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleUpdateWithdrawalStatus(wd.id, "Rejected")}
                              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-455 text-[10px] font-bold px-3 py-2 rounded-lg transition uppercase tracking-wider cursor-pointer border border-rose-500/15"
                            >
                              Rad etish ✗
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ❄️ ACTIVE ESCROW WALLETS SECTION */}
              <div className="bg-black/25 border border-white/5 p-6 rounded-2xl space-y-4">
                <div className="border-b border-white/5 pb-3">
                  <h4 className="text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Escrow Tranzaksiyalar va Muzlatish Nazorati</span>
                  </h4>
                  <p className="text-[10px] text-white/40 mt-0.5">Xaydovchi yetkazishini tekshirish jarayonidagi kargo mablag'larini auditorlik muzlatish boshqaruvi</p>
                </div>

                {financialsLoading ? (
                  <div className="text-center py-6 text-white/30">Mantiqiy audit yuklanmoqda...</div>
                ) : !adminFinancials.escrows || adminFinancials.escrows.length === 0 ? (
                  <div className="text-center py-10 text-white/20 text-xs">Ayni damda faol escrow tranzaksiyalari yo'q.</div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {adminFinancials.escrows.map((es: any) => (
                      <div key={es.id} className="bg-[#120b2e]/65 border border-white/5 p-4 rounded-xl space-y-3.5 hover:border-white/10 transition font-sans">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] text-white/85 block font-extrabold">{es.cargoType || "Kargo amaliyoti"}</span>
                            <span className="text-[9px] text-[#dda15e] block font-semibold mt-0.5">Mijoz: {es.customerName} | Haydovchi: {es.driverName}</span>
                          </div>
                          <div className="text-right">
                            <strong className="text-white font-mono text-xs">{es.amount?.toLocaleString()} UZS</strong>
                            <span className={`block text-[9px] font-bold uppercase tracking-wider mt-0.5 ${
                              es.escrowStatus === "Released" ? "text-emerald-400" : es.escrowStatus === "Frozen" ? "text-rose-400" : "text-amber-400"
                            }`}>
                              {es.escrowStatus === "Frozen" ? "❄️ Muzlatilgan" : es.escrowStatus === "Released" ? "✓ Topshirilgan" : "Held Segregated"}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center bg-black/25 px-3 py-2 rounded-lg text-[9px] font-mono border border-white/5 text-white/45">
                          <span>Buyurtma: #{es.id.substring(0, 8).toUpperCase()}</span>
                          <span>Holati: <strong className="text-[#a78bfa] font-bold">{es.status}</strong></span>
                        </div>

                        {es.escrowStatus !== "Released" && (
                          <div className="flex justify-end pt-1">
                            <button 
                              type="button"
                              onClick={() => handleToggleFreezeEscrow(es.id, es.escrowStatus === "Frozen")}
                              className={`p-2 px-4 text-[9.5px] font-black uppercase tracking-wider rounded-lg border transition cursor-pointer flex items-center gap-1 leading-none ${
                                es.escrowStatus === "Frozen" 
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20" 
                                  : "bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500/20"
                              }`}
                            >
                              {es.escrowStatus === "Frozen" ? (
                                <>
                                  <span>🔥 Muzdan Chiqarish</span>
                                </>
                              ) : (
                                <>
                                  <span>❄️ Muzlatish (Freeze)</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {activeTab === "driverPayments" && (
          <div className="bg-[#120b2e]/30 border border-white/10 rounded-3xl p-6 lg:p-8 shadow-2xl relative animate-fade-in font-sans space-y-6 text-xs text-white">
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 blur-[125px] rounded-full pointer-events-none"></div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-white/5 gap-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <CircleDollarSign className="w-5 h-5 text-purple-400" />
                  <span>Drayverlarga To’lovlar Monitori & Komissiya Tizimi</span>
                </h3>
                <p className="text-[11px] text-white/40">Haydovchilarning yakunlangan buyurtmalari, 3% platforma komissiyasi va 97% sof daromad to'lov jurnali</p>
              </div>

              <button 
                onClick={fetchDriverPayments}
                className="bg-white/5 border border-white/10 hover:bg-white/15 px-3.5 py-1.5 text-xs rounded-xl flex items-center gap-2 transition cursor-pointer text-white"
              >
                <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
                <span>Yangilash (Refresh)</span>
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1 */}
              <div className="bg-[#120b2e]/40 border border-white/5 p-4 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 blur-xl rounded-full"></div>
                <span className="text-white/40 text-[9.5px] uppercase font-bold tracking-widest block mb-1">Jami aylanma (SaaS GMV)</span>
                <p className="text-lg font-black text-white font-mono">{driverPayments.reduce((sum, p) => sum + (p.orderAmount || 0), 0).toLocaleString()} UZS</p>
                <span className="text-[9px] text-white/20 block mt-1">100% YukLa platformasidagi jami buyurtmalar</span>
              </div>

              {/* Card 2 */}
              <div className="bg-[#120b2e]/40 border border-purple-500/20 p-4 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 blur-xl rounded-full"></div>
                <span className="text-purple-400 text-[9.5px] uppercase font-bold tracking-widest block mb-1">Platforma komissiyasi (3%)</span>
                <p className="text-lg font-black text-purple-300 font-mono">{driverPayments.reduce((sum, p) => sum + (p.platformFee || 0), 0).toLocaleString()} UZS</p>
                <span className="text-[9px] text-purple-400/40 block mt-1">Sof dilerlik va tizim daromadi (3%)</span>
              </div>

              {/* Card 3 */}
              <div className="bg-[#120b2e]/40 border border-amber-500/20 p-4 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 blur-xl rounded-full"></div>
                <span className="text-amber-400 text-[9.5px] uppercase font-bold tracking-widest block mb-1">Kutilayotgan to'lovlar</span>
                <p className="text-lg font-black text-amber-300 font-mono">{driverPayments.filter(p => p.status === "Pending Payment" || p.status === "Approved").reduce((sum, p) => sum + (p.driverAmount || 0), 0).toLocaleString()} UZS</p>
                <span className="text-[9px] text-amber-500/40 block mt-1">To'lab berilishi lozim drayverlar ulushi (97%)</span>
              </div>

              {/* Card 4 */}
              <div className="bg-[#120b2e]/40 border border-emerald-500/20 p-4 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 blur-xl rounded-full"></div>
                <span className="text-emerald-400 text-[9.5px] uppercase font-bold tracking-widest block mb-1">To'lab berilgan to'lovlar</span>
                <p className="text-lg font-black text-emerald-300 font-mono">{driverPayments.filter(p => p.status === "Paid").reduce((sum, p) => sum + (p.driverAmount || 0), 0).toLocaleString()} UZS</p>
                <span className="text-[9px] text-emerald-500/40 block mt-1">Muvaqqiyatli hisobdan to'langan jami drayver pullari</span>
              </div>
            </div>

            {/* Filters Toolbar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-black/20 p-4 rounded-2xl border border-white/5">
              {/* Search */}
              <div className="space-y-1">
                <label className="text-white/40 text-[9.5px] font-bold uppercase tracking-wider block">Buyurtma / Haydovchi qidirish:</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input 
                    type="text" 
                    placeholder="Qidiruv matni..."
                    value={dpSearch}
                    onChange={(e) => setDpSearch(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Driver filter */}
              <div className="space-y-1">
                <label className="text-white/40 text-[9.5px] font-bold uppercase tracking-wider block">Haydovchi bo'yicha filter:</label>
                <select 
                  value={dpDriverFilter}
                  onChange={(e) => setDpDriverFilter(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-purple-500"
                >
                  <option value="all">Barcha haydovchilar</option>
                  {(() => {
                    const uniqueDrivers: any[] = [];
                    const handled = new Set();
                    (driverPayments || []).forEach((p: any) => {
                      if (p.driverId && !handled.has(p.driverId)) {
                        handled.add(p.driverId);
                        uniqueDrivers.push({ id: p.driverId, name: p.driverName });
                      }
                    });
                    return uniqueDrivers.map((d: any) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ));
                  })()}
                </select>
              </div>

              {/* Status filter */}
              <div className="space-y-1">
                <label className="text-white/40 text-[9.5px] font-bold uppercase tracking-wider block">Status bo'yicha filter:</label>
                <select 
                  value={dpStatusFilter}
                  onChange={(e) => setDpStatusFilter(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-purple-500"
                >
                  <option value="all">Barcha statuslar</option>
                  <option value="Pending Payment">Pending Payment (Kutilmoqda)</option>
                  <option value="Approved">Approved (Tasdiqlangan)</option>
                  <option value="Paid">Paid (To'lab berilgan)</option>
                  <option value="Cancelled">Cancelled (Bekor qilingan)</option>
                </select>
              </div>

              {/* Date filter */}
              <div className="space-y-1">
                <label className="text-white/40 text-[9.5px] font-bold uppercase tracking-wider block">Sana bo'yicha filter:</label>
                <input 
                  type="date"
                  value={dpDateFilter}
                  onChange={(e) => setDpDateFilter(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-1.5 px-3 text-xs text-white outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Table Listing */}
            {driverPaymentsLoading ? (
              <div className="text-center py-10 text-white/30 text-xs">Biznes to'lovlar ma'lumotlari yuklanmoqda...</div>
            ) : (() => {
              const filtered = driverPayments.filter((p: any) => {
                const query = dpSearch.toLowerCase();
                const matchesSearch = !query || 
                  p.id.toLowerCase().includes(query) || 
                  p.orderId.toLowerCase().includes(query) ||
                  (p.driverName && p.driverName.toLowerCase().includes(query)) ||
                  (p.customerName && p.customerName.toLowerCase().includes(query));

                const matchesDriver = dpDriverFilter === "all" || p.driverId === dpDriverFilter;
                const matchesStatus = dpStatusFilter === "all" || p.status === dpStatusFilter;
                const matchesDate = !dpDateFilter || p.createdAt.startsWith(dpDateFilter) || (p.paymentDate && p.paymentDate.startsWith(dpDateFilter));

                return matchesSearch && matchesDriver && matchesStatus && matchesDate;
              });

              if (filtered.length === 0) {
                return (
                  <div className="text-center py-16 bg-black/10 rounded-3xl text-white/30 text-xs border border-white/5">
                    Kiritilgan filtrlarga mos keladigan drayver to'lovi topilmadi.
                  </div>
                );
              }

              return (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse font-sans font-medium">
                    <thead>
                      <tr className="border-b border-white/10 text-white/40 uppercase font-mono tracking-wider text-[9px]">
                        <th className="py-3 px-3">Hujjat ID</th>
                        <th className="py-3 px-3">Haydovchi jurnali</th>
                        <th className="py-3 px-3">Yo'nalish / Mijoz</th>
                        <th className="py-3 px-3">Umumiy narx</th>
                        <th className="py-3 px-3">Komissiya (3%)</th>
                        <th className="py-3 px-3 text-emerald-400">Drayver ulushi (97%)</th>
                        <th className="py-3 px-3">Holati</th>
                        <th className="py-3 px-3 text-right">To'lov amali</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filtered.map((p: any) => (
                        <tr key={p.id} className="hover:bg-white/[0.02] transition">
                          <td className="py-3 px-3 font-mono text-purple-400 text-[10px] whitespace-nowrap">
                            {p.id.substring(4, 12).toUpperCase()}
                            <span className="block text-[8px] text-white/35 font-normal">Order: #{p.orderId.substring(0, 8).toUpperCase()}</span>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <p className="font-extrabold text-white text-[11px] leading-tight">{p.driverName || "Noma'lum"}</p>
                            <span className="text-[10px] font-mono text-white/30">{p.driverPhone || "Noma'lum"}</span>
                          </td>
                          <td className="py-3 px-3">
                            <p className="text-[10.5px] text-white/70 max-w-[180px] break-all truncate leading-none" title={p.orderRoute}>{p.orderRoute || "Kargo yo'nalishi"}</p>
                            <span className="text-[9.5px] text-white/30 block mt-0.5">Mijoz: {p.customerName || "Noma'lum"}</span>
                          </td>
                          <td className="py-3 px-3 font-mono text-white/60 text-[10.5px] whitespace-nowrap">
                            {(p.orderAmount || p.price)?.toLocaleString()} UZS
                          </td>
                          <td className="py-3 px-3 font-mono text-purple-300 text-[10.5px] whitespace-nowrap">
                            {(p.platformFee || Math.round(p.orderAmount * 0.03))?.toLocaleString()} UZS
                          </td>
                          <td className="py-3 px-3 font-mono font-extrabold text-emerald-400 text-[11px] whitespace-nowrap">
                            {(p.driverAmount || Math.round(p.orderAmount * 0.97))?.toLocaleString()} UZS
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider leading-none ${
                              p.status === "Paid" 
                                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-405" 
                                : p.status === "Approved"
                                ? "bg-purple-500/10 border border-purple-500/20 text-purple-300"
                                : p.status === "Cancelled"
                                ? "bg-rose-500/10 border border-rose-500/20 text-rose-455"
                                : "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right whitespace-nowrap">
                            <div className="flex justify-end gap-1.5 align-middle items-center">
                              {p.status === "Pending Payment" && (
                                <>
                                  <button 
                                    onClick={() => handleApprovePayment(p.id)}
                                    className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold p-1 px-2.5 rounded-lg text-[9.5px] tracking-wide transition cursor-pointer"
                                  >
                                    Tasdiqlash
                                  </button>
                                  <button 
                                    onClick={() => handleCancelPayment(p.id)}
                                    className="bg-rose-700/10 border border-rose-700/20 text-rose-400 hover:bg-rose-600/15 font-medium p-1 px-2 rounded-lg text-[9.5px] transition cursor-pointer"
                                  >
                                    Bekor qilish
                                  </button>
                                </>
                              )}

                              {p.status === "Approved" && (
                                <>
                                  <button 
                                    onClick={() => {
                                      setPayingId(p.id);
                                      setPayingNote(`Muvaffaqiyatli to'lab berildi. Haydovchi: ${p.driverName}, Summa: ${p.driverAmount.toLocaleString()} UZS`);
                                    }}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black p-1 px-3 rounded-lg text-[9.5px] tracking-wide transition cursor-pointer flex items-center gap-1"
                                  >
                                    <CircleDollarSign className="w-3 h-3" />
                                    <span>To'lash</span>
                                  </button>
                                  <button 
                                    onClick={() => handleCancelPayment(p.id)}
                                    className="bg-rose-700/10 border border-rose-700/20 text-rose-400 hover:bg-rose-600/15 font-medium p-1 px-2 rounded-lg text-[9.5px] transition cursor-pointer"
                                  >
                                    Bekor qilish
                                  </button>
                                </>
                              )}

                              {p.status === "Paid" && (
                                <div className="text-left bg-black/25 border border-white/5 rounded-xl p-2.5 max-w-[210px] space-y-1">
                                  <span className="text-[8px] text-white/30 block font-mono">Bajarildi: {new Date(p.paymentDate || p.updatedAt).toLocaleString()}</span>
                                  <p className="text-[10px] text-white/70 italic leading-snug break-all shrink-0 font-medium whitespace-normal">{p.paymentNote || "Muvaffaqiyatli drayverga to'landi."}</p>
                                  {p.paymentProof && (
                                    <a 
                                      href={p.paymentProof} 
                                      target="_blank" 
                                      referrerPolicy="no-referrer"
                                      rel="noopener noreferrer" 
                                      className="text-[9px] text-[#dda15e] font-bold hover:underline flex items-center gap-1 mt-1 leading-none"
                                    >
                                      <Eye className="w-2.5 h-2.5" />
                                      <span>To'lov chekini ko'rish</span>
                                    </a>
                                  )}
                                </div>
                              )}

                              {p.status === "Cancelled" && (
                                <span className="text-rose-500/40 text-[9.5px] font-mono pr-2">Bekor qilingan</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}

            {/* Modal for admin to enter manual payment note and slip proof link */}
            {payingId && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in text-[10.5px]">
                <div className="bg-[#120b2e] border border-white/10 w-full max-w-md rounded-3xl p-6 shadow-2xl relative space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <strong className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-450" />
                      <span>Haydovchiga to'lov yuborishni tasdiqlash</span>
                    </strong>
                    <button 
                      onClick={() => setPayingId(null)}
                      className="text-white/40 hover:text-white"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handlePayConfirmSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-white/50 block font-bold uppercase tracking-wider text-[8px]">Hukumat / Bank to'lov izohi:</label>
                      <textarea 
                        rows={2}
                        value={payingNote}
                        onChange={(e) => setPayingNote(e.target.value)}
                        placeholder="Masalan: Plastik karta orqali o'tkazib berildi"
                        className="w-full bg-black/60 border border-white/10 p-3 rounded-xl focus:border-purple-500 text-white outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-white/50 block font-bold uppercase tracking-wider text-[8px]">Moliya Cheki - Rivojlantirish rasm linki (URL):</label>
                      <input 
                        type="text"
                        value={payingProof}
                        onChange={(e) => setPayingProof(e.target.value)}
                        placeholder="Prefilled premium mockup link..."
                        className="w-full bg-black/60 border border-white/10 p-3 rounded-xl focus:border-purple-500 text-white font-mono outline-none"
                        required
                      />
                    </div>

                    <div className="bg-[#1c0e48] border border-purple-500/10 p-3 rounded-2xl">
                      <p className="text-white/50 leading-snug text-[9.5px]">
                        💡 "To'lash" tugmasini bosishingiz bilan ushbu mablag' haydovchi xisobiga o'shadi va drayver buni o'zining "Earnings" drayver hamyoni bo'limida ishonchli ravishda ko'radi.
                      </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button 
                        type="button"
                        onClick={() => setPayingId(null)}
                        className="p-3 px-4 rounded-xl hover:bg-white/5 text-white/50 cursor-pointer"
                      >
                        Bekor qilish
                      </button>
                      <button 
                        type="submit"
                        disabled={payingSubmitting}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-black p-3 px-6 rounded-xl uppercase tracking-wider text-[9.5px] transition cursor-pointer"
                      >
                        {payingSubmitting ? "Yuborilmoqda..." : "To'lovni yakunlash"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ====================================================
           TAB VIEW 6: FAQ CMS PORTAL
           ==================================================== */}
        {activeTab === "faq" && (
          <div className="bg-[#120b2e]/30 border border-white/10 rounded-3xl p-6 lg:p-8 shadow-2xl animate-fade-in font-sans">
            <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-6">
              <div>
                <h3 className="text-base font-black text-white">Yordam bo'limi tahrirlar paneli (FAQ CMS)</h3>
                <p className="text-[11px] text-white/40">Mijozlar shaxsiy kabinetidagi barcha savollarni boshqarish</p>
              </div>

              <button 
                onClick={() => setIsFaqFormActive(!isFaqFormActive)}
                className="bg-purple-655 hover:bg-purple-555 text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Yangi FAQ savol</span>
              </button>
            </div>

            {isFaqFormActive && (
              <form onSubmit={handleCreateFaq} className="bg-black/45 border border-white/5 p-5 rounded-2xl space-y-4 text-xs font-sans mb-6">
                <div className="space-y-1">
                  <label className="font-bold text-white/60">Yozma Savol matni o'zbek tilida *</label>
                  <input 
                    type="text" 
                    required 
                    value={newFaqQuestion} 
                    onChange={(e) => setNewFaqQuestion(e.target.value)}
                    placeholder="Masalan: Tizim haydovchilari ishonchlimi?"
                    className="w-full bg-black/55 border border-white/10 h-11 px-3.5 rounded-xl text-xs focus:border-purple-500 text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-white/60">Mukammal javobingiz *</label>
                  <textarea 
                    required 
                    value={newFaqAnswer} 
                    onChange={(e) => setNewFaqAnswer(e.target.value)}
                    placeholder="Tashuvchillarimizning barcha hujjatlari xavfsizlik adminlari tomonidan..."
                    className="w-full bg-black/55 border border-white/10 p-3 h-24 rounded-xl text-xs focus:border-purple-500 text-white outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button 
                    type="submit" 
                    className="bg-[#9d4edd] hover:bg-[#8338ec] text-white font-black px-5 py-2.5 rounded-xl transition cursor-pointer"
                  >
                    Saqlash
                  </button>

                  <button 
                    type="button" 
                    onClick={() => setIsFaqFormActive(false)} 
                    className="bg-white/5 text-white/60 px-4 py-2.5 rounded-xl transition"
                  >
                    Bekor
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-4 pt-2">
              {faqs.map((f) => (
                <div key={f.id} className="bg-black/30 border border-white/5 rounded-2xl p-4 flex justify-between items-start gap-4 transition">
                  <div className="space-y-1.5 text-xs leading-relaxed">
                    <p className="font-extrabold text-white text-sm">❓ Savol: {f.questionUz}</p>
                    <p className="text-white/60 pl-5 leading-relaxed">{f.answerUz}</p>
                  </div>

                  <button
                    onClick={() => onDeleteFaq(f.id)}
                    className="text-rose-400 hover:text-rose-350 hover:bg-rose-500/5 p-2 rounded-xl border border-white/5"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ====================================================
           TAB VIEW 7: NEWS AND RELEASES CMS BULLETIN
           ==================================================== */}
        {activeTab === "news" && (
          <div className="bg-[#120b2e]/30 border border-white/10 rounded-3xl p-6 lg:p-8 shadow-2xl animate-fade-in font-sans">
            <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-6 font-sans">
              <div>
                <h3 className="text-base font-black text-white">Platforma yangiliklar Bulletini (News CMS)</h3>
                <p className="text-[11px] text-white/40">Sanoat yangiliklari, e'lonlar va blog postlarini barcha a'zolarga tarqatish</p>
              </div>

              <button 
                onClick={() => setIsNewsFormActive(!isNewsFormActive)}
                className="bg-purple-655 hover:bg-purple-555 text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Yangi maqola yozish</span>
              </button>
            </div>

            {isNewsFormActive && (
              <form onSubmit={handleCreateNews} className="bg-black/45 border border-white/5 p-5 rounded-2xl space-y-4 text-xs font-sans mb-6">
                <div className="space-y-1">
                  <label className="font-bold text-white/60">Yangilik sarlavhasi (Title) o'zbek tilida *</label>
                  <input 
                    type="text" 
                    required 
                    value={newNewsTitle} 
                    onChange={(e) => setNewNewsTitle(e.target.value)}
                    placeholder="Masalan: Logistika tizimida yangi Labo tariflari joriy qilindi!"
                    className="w-full bg-black/55 border border-white/10 h-11 px-3.5 rounded-xl text-xs focus:border-purple-500 text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-white/60">Maqola asosiy mazmuni (Content) *</label>
                  <textarea 
                    required 
                    value={newNewsContent} 
                    onChange={(e) => setNewNewsContent(e.target.value)}
                    placeholder="Mijozlarimiz diqqatiga! Shahar bo'ylab tezkor yetkazmalarni qulaylashtirish maqsadida..."
                    className="w-full bg-black/55 border border-white/10 p-3 h-28 rounded-xl text-xs focus:border-purple-500 text-white outline-none leading-relaxed"
                  />
                </div>

                <div className="flex gap-2">
                  <button 
                    type="submit" 
                    className="bg-[#9d4edd] hover:bg-[#8338ec] text-white font-black px-5 py-2.5 rounded-xl transition cursor-pointer"
                  >
                    Nashr qilish
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsNewsFormActive(false)} 
                    className="bg-white/5 text-white/60 px-4 py-2.5 rounded-xl"
                  >
                    Bekor qilish
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed">
              {news.map((item) => (
                <div key={item.id} className="bg-black/30 border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <h4 className="font-extrabold text-[#dda15e] text-xs uppercase tracking-wider">{item.titleUz}</h4>
                      <span className="text-[9.5px] text-white/30 font-mono mt-0.5">{item.date || "Bugun"}</span>
                    </div>
                    <p className="text-xs text-white/70 line-clamp-4 leading-relaxed font-sans">{item.contentUz}</p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-white/5 flex justify-end">
                    <button
                      onClick={() => onDeleteNews(item.id)}
                      className="text-rose-400 hover:text-white bg-white/5 hover:bg-rose-600 px-3 py-1.5 border border-white/5 rounded-xl text-xs transition flex items-center gap-1.5 font-bold cursor-pointer"
                    >
                      <Trash className="w-3.5 h-3.5" />
                      <span>O'chirish</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ====================================================
           TAB VIEW 8: CYBER CONTROL SYSTEM SECURITY SECURITY AUDIT LOGS
           ==================================================== */}
        {activeTab === "audit" && (
          <div className="bg-[#120b2e]/30 border border-white/10 rounded-3xl p-6 lg:p-8 shadow-2xl animate-fade-in font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-6">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-450 animate-pulse" />
                <h3 className="text-base font-black text-white">Kiber xavfsizlik audit jurnallari (Security Logger)</h3>
              </div>
              <span className="bg-green-500/10 border border-green-500/25 text-green-400 text-[10px] font-mono px-3 py-1 rounded font-bold uppercase tracking-wider select-none animate-pulse">
                ● Tizim audit faol
              </span>
            </div>

            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 font-mono text-[10px]">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 bg-black/50 border border-white/5 rounded-2xl space-y-1.5 select-all">
                  <div className="flex flex-col sm:flex-row justify-between text-[11px] font-bold border-b border-white/5 pb-1.5 mb-1.5">
                    <span className="text-purple-300">ACTION_TAG: [{log.action.toUpperCase()}]</span>
                    <span className="text-white/30 font-normal text-[9.5px]">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  
                  <p className="text-xs font-sans text-white/75 mt-1 leading-relaxed">{log.details}</p>
                  
                  <div className="flex gap-4 text-[9.5px] text-[#dda15e] pt-1 leading-none font-bold">
                    <span>Admin ID: {log.userId}</span>
                    <span>|</span>
                    <span className="underline uppercase">Role: {log.role || "SYSTEM"}</span>
                    <span>|</span>
                    <span className="text-slate-350 select-all">{log.userEmail}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ====================================================
            TAB: OPERATIONS CENTER (MISSION CONTROL)
           ==================================================== */}
        {activeTab === "operations" && (
          <div className="animate-fade-in">
            <LogisticsOperationsCenter token={token || ""} />
          </div>
        )}

        {/* ====================================================
            TAB: ENTERPRISE SUPPORT CRM
           ==================================================== */}
        {activeTab === "support" && (
          <div className="animate-fade-in">
            <EnterpriseSupportCenterCRM token={token || ""} currentUserEmail="admin@yukla.uz" />
          </div>
        )}

        {/* ====================================================
            TAB: ENTERPRISE NOTIFICATION CENTER
           ==================================================== */}
        {activeTab === "notifications" && (
          <div className="animate-fade-in">
            <EnterpriseNotificationCenter token={token || ""} />
          </div>
        )}

        {/* ====================================================
            TAB: ENTERPRISE SECURITY SUITE
           ==================================================== */}
        {activeTab === "security" && (
          <div className="animate-fade-in">
            <EnterpriseSecuritySuite token={token || ""} />
          </div>
        )}

        {/* ====================================================
            TAB: ENTERPRISE OBSERVABILITY & APM
           ==================================================== */}
        {activeTab === "observability" && (
          <div className="animate-fade-in">
            <EnterpriseObservabilityHub token={token || ""} />
          </div>
        )}

        {/* ====================================================
            TAB: DISASTER RECOVERY & BACKUP
           ==================================================== */}
        {activeTab === "backup" && (
          <div className="animate-fade-in">
            <EnterpriseDisasterRecoveryHub token={token || ""} />
          </div>
        )}

        {/* ====================================================
            TAB: SCALABILITY & CACHE CLUSTERING
           ==================================================== */}
        {activeTab === "scalability" && (
          <div className="animate-fade-in">
            <EnterpriseScalabilityHub token={token || ""} />
          </div>
        )}

        {/* ====================================================
            TAB: DYNAMIC PRICING & RULES ENGINE
           ==================================================== */}
        {activeTab === "rules" && (
          <div className="animate-fade-in">
            <EnterpriseAdminRulesHub token={token || ""} />
          </div>
        )}

        {/* ====================================================
            TAB: QA DIAGNOSTICS & READINESS REPORT
           ==================================================== */}
        {activeTab === "qa" && (
          <div className="animate-fade-in">
            <EnterpriseQADiagnosticHub token={token || ""} />
          </div>
        )}

      </div>

      {/* ====================================================
          CORPORATE BANK WITHDRAWAL MODAL
         ==================================================== */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#120b2e] border border-emerald-500/30 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl relative text-white font-sans">
            <button
              onClick={() => setIsWithdrawModalOpen(false)}
              className="absolute top-5 right-5 text-white/50 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition cursor-pointer"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight text-white">
                  Korporativ Bank Hisobiga Pul Chiqarish
                </h3>
                <p className="text-xs text-white/50 font-mono">
                  Instant B2B Treasury Settlement • Munis / E-Hujjat
                </p>
              </div>
            </div>

            <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-2xl p-4 mb-6 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-white/50 uppercase font-mono block">Chiqarishga Tayyor Balans</span>
                <span className="text-xl font-black font-mono text-emerald-400">
                  {availableTreasuryBalance.toLocaleString()} UZS
                </span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full font-bold font-mono">
                1% Take-Rate + SaaS
              </span>
            </div>

            <form onSubmit={handleCorporateWithdraw} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-[10px] text-white/60 uppercase font-bold block mb-1">
                  Chiqariladigan Summa (UZS)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="1"
                    max={availableTreasuryBalance > 0 ? availableTreasuryBalance : 1000000000}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Masalan: 1000000"
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-emerald-400 transition"
                  />
                  {availableTreasuryBalance > 0 && (
                    <button
                      type="button"
                      onClick={() => setWithdrawAmount(String(availableTreasuryBalance))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold px-2.5 py-1 rounded-lg transition cursor-pointer"
                    >
                      Barchasi
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-white/60 uppercase font-bold block mb-1">
                    Bank Nomi
                  </label>
                  <input
                    type="text"
                    required
                    value={withdrawBank}
                    onChange={(e) => setWithdrawBank(e.target.value)}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-400 transition"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-white/60 uppercase font-bold block mb-1">
                    MFO Kodi
                  </label>
                  <input
                    type="text"
                    required
                    value={withdrawMfo}
                    onChange={(e) => setWithdrawMfo(e.target.value)}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-white/60 uppercase font-bold block mb-1">
                  Korporativ Hisob Raqam (20 xonali)
                </label>
                <input
                  type="text"
                  required
                  value={withdrawAccount}
                  onChange={(e) => setWithdrawAccount(e.target.value)}
                  className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-400 transition"
                />
              </div>

              <div>
                <label className="text-[10px] text-white/60 uppercase font-bold block mb-1">
                  Qabul Qiluvchi Korxona (Beneficiary)
                </label>
                <input
                  type="text"
                  required
                  value={withdrawCompany}
                  onChange={(e) => setWithdrawCompany(e.target.value)}
                  className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-400 transition"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={withdrawSubmitting}
                  className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-black text-sm tracking-wider uppercase transition shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {withdrawSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>Bankka O'tkazishni Tasdiqlash</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
