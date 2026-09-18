/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User, Order, LanguageCode, CompanyEntity, CompanyDriver, CompanyTruck, CompanyInvoice, CompanyExpense, CompanyApiKey, CompanyWebhook, CompanyFinanceSummary } from "../types";
import { useTranslation } from "../context/LanguageContext";
import EnterpriseYuklaPayFactoring from "./EnterpriseYuklaPayFactoring";
import EnterpriseCustomsBorderHub from "./EnterpriseCustomsBorderHub";
import EnterpriseColdChainHub from "./EnterpriseColdChainHub";
import EnterpriseLTLConsolidationHub from "./EnterpriseLTLConsolidationHub";
import EnterpriseRouteOptimizerHub from "./EnterpriseRouteOptimizerHub";
import EnterpriseIntegrationsHub from "./EnterpriseIntegrationsHub";
import {
  Building,
  Truck,
  Users,
  CreditCard,
  FileCheck,
  BarChart3,
  Key,
  ShieldCheck,
  Sparkles,
  Download,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  TrendingUp,
  Boxes,
  Zap,
  Globe2,
  RefreshCw,
  Send,
  Fuel,
  FileText,
  DollarSign,
  Phone,
  Mail,
  Edit3,
  Trash2,
  ExternalLink,
  Shield,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Check,
  Copy,
  Sliders,
  Filter,
  Navigation,
  FileSpreadsheet,
  Wallet,
  Globe,
  ThermometerSnowflake
} from "lucide-react";

interface DashboardCompanyProps {
  currentLang: LanguageCode;
  onChangeLang: (lang: LanguageCode) => void;
  user: User;
  orders: Order[];
  loading: boolean;
  token: string | null;
  onRefreshOrders?: () => void;
  onRefreshUser?: () => void;
}

export default function DashboardCompany({
  currentLang,
  user,
  orders,
  loading: globalLoading,
  token,
  onRefreshOrders,
  onRefreshUser,
}: DashboardCompanyProps) {
  const { t } = useTranslation();
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<
    "overview" | "fleet" | "drivers" | "dispatch" | "telematics" | "finances" | "factoring" | "customs" | "coldchain" | "ltl" | "routes" | "integrations" | "tenders" | "settings"
  >("overview");

  // Loading & State
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Entities state
  const [company, setCompany] = useState<CompanyEntity | null>(null);
  const [drivers, setDrivers] = useState<CompanyDriver[]>([]);
  const [trucks, setTrucks] = useState<CompanyTruck[]>([]);
  const [companyOrders, setCompanyOrders] = useState<Order[]>([]);
  const [marketplaceOrders, setMarketplaceOrders] = useState<Order[]>([]);
  const [finances, setFinances] = useState<CompanyFinanceSummary | null>(null);
  const [expenses, setExpenses] = useState<CompanyExpense[]>([]);
  const [invoices, setInvoices] = useState<CompanyInvoice[]>([]);
  const [tenders, setTenders] = useState<any[]>([]);
  const [apiKeys, setApiKeys] = useState<CompanyApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<CompanyWebhook[]>([]);
  const [telematics, setTelematics] = useState<any[]>([]);

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [fleetFilter, setFleetFilter] = useState("all");
  const [orderFilter, setOrderFilter] = useState("all");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Modals state
  const [showAddTruckModal, setShowAddTruckModal] = useState(false);
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState<Order | null>(null);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false);
  const [showBidModal, setShowBidModal] = useState<any | null>(null);
  const [showAddApiKeyModal, setShowAddApiKeyModal] = useState(false);

  // Form states - Add Truck
  const [truckPlate, setTruckPlate] = useState("");
  const [truckModel, setTruckModel] = useState("ISUZU 10");
  const [truckCapacity, setTruckCapacity] = useState("10 tonna");
  const [truckVolume, setTruckVolume] = useState("45 m³");
  const [truckYear, setTruckYear] = useState("2023");
  const [truckFuelType, setTruckFuelType] = useState<"diesel" | "gas" | "petrol">("diesel");

  // Form states - Add Driver
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [driverLicenseNumber, setDriverLicenseNumber] = useState("");
  const [driverTruckId, setDriverTruckId] = useState("");
  const [driverSalaryShare, setDriverSalaryShare] = useState("20");

  // Form states - Dispatch
  const [dispatchDriverId, setDispatchDriverId] = useState("");
  const [dispatchTruckId, setDispatchTruckId] = useState("");

  // Form states - Add Expense
  const [expenseCategory, setExpenseCategory] = useState<any>("fuel");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseTruckId, setExpenseTruckId] = useState("");

  // Form states - Add Invoice
  const [invoiceClientName, setInvoiceClientName] = useState("");
  const [invoiceClientTaxId, setInvoiceClientTaxId] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [invoiceDueDate, setInvoiceDueDate] = useState("");
  const [invoiceItemsDesc, setInvoiceItemsDesc] = useState("Shaharlararo yuk tashish xizmati");

  // Form states - Tender Bid
  const [bidAmount, setBidAmount] = useState("");
  const [bidProposalText, setBidProposalText] = useState("");
  const [bidTruckCount, setBidTruckCount] = useState("3");

  // Form states - API Key
  const [apiKeyName, setApiKeyName] = useState("");
  const [apiKeyEnv, setApiKeyEnv] = useState<"production" | "sandbox">("production");

  // Form states - Company Profile Edit
  const [profileName, setProfileName] = useState("");
  const [profileOwner, setProfileOwner] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileAddress, setProfileAddress] = useState("");
  const [profileTaxNumber, setProfileTaxNumber] = useState("");
  const [profileLicenseNumber, setProfileLicenseNumber] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Initial Data Fetching
  const fetchAllCompanyData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // 1. Profile
      const pRes = await fetch("/api/company/profile", { headers: { Authorization: `Bearer ${token}` } });
      if (pRes.ok) {
        const pData = await pRes.json();
        setCompany(pData.company);
        if (pData.company) {
          setProfileName(pData.company.companyName || "");
          setProfileOwner(pData.company.ownerName || "");
          setProfilePhone(pData.company.phone || "");
          setProfileAddress(pData.company.address || "");
          setProfileTaxNumber(pData.company.taxNumber || "");
          setProfileLicenseNumber(pData.company.licenseNumber || "");
        }
      }

      // 2. Trucks
      const trRes = await fetch("/api/company/trucks", { headers: { Authorization: `Bearer ${token}` } });
      if (trRes.ok) {
        const trData = await trRes.json();
        setTrucks(trData);
      }

      // 3. Drivers
      const drRes = await fetch("/api/company/drivers", { headers: { Authorization: `Bearer ${token}` } });
      if (drRes.ok) {
        const drData = await drRes.json();
        setDrivers(drData);
      }

      // 4. Orders
      const ordRes = await fetch("/api/company/orders", { headers: { Authorization: `Bearer ${token}` } });
      if (ordRes.ok) {
        const ordData = await ordRes.json();
        setCompanyOrders(ordData.companyOrders || []);
        setMarketplaceOrders(ordData.marketplaceOrders || []);
      }

      // 5. Finances
      const finRes = await fetch("/api/company/finances", { headers: { Authorization: `Bearer ${token}` } });
      if (finRes.ok) {
        const finData = await finRes.json();
        setFinances(finData.summary);
        setExpenses(finData.expenses || []);
        setInvoices(finData.invoices || []);
      }

      // 6. Tenders
      const tndRes = await fetch("/api/company/tenders", { headers: { Authorization: `Bearer ${token}` } });
      if (tndRes.ok) {
        const tndData = await tndRes.json();
        setTenders(tndData);
      }

      // 7. API Keys
      const keyRes = await fetch("/api/company/api-keys", { headers: { Authorization: `Bearer ${token}` } });
      if (keyRes.ok) {
        const keyData = await keyRes.json();
        setApiKeys(keyData);
      }

      // 8. Telematics
      const telRes = await fetch("/api/company/telematics", { headers: { Authorization: `Bearer ${token}` } });
      if (telRes.ok) {
        const telData = await telRes.json();
        setTelematics(telData);
      }
    } catch (err) {
      console.error("Error fetching company data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCompanyData();
  }, [token]);

  // Handlers
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch("/api/company/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          companyName: profileName,
          ownerName: profileOwner,
          phone: profilePhone,
          address: profileAddress,
          taxNumber: profileTaxNumber,
          licenseNumber: profileLicenseNumber,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCompany(updated.company);
        showToast("Kompaniya profili muvaffaqiyatli saqlandi!");
        if (onRefreshUser) onRefreshUser();
      }
    } catch (err) {
      showToast("Profilni saqlashda xatolik yuz berdi");
    }
  };

  const handleAddTruck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !truckPlate) return;
    try {
      const res = await fetch("/api/company/trucks", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          plateNumber: truckPlate.toUpperCase(),
          model: truckModel,
          capacity: truckCapacity,
          volume: truckVolume,
          year: parseInt(truckYear) || 2023,
          fuelType: truckFuelType,
        }),
      });
      if (res.ok) {
        const newTruck = await res.json();
        setTrucks([newTruck, ...trucks]);
        setShowAddTruckModal(false);
        setTruckPlate("");
        showToast(`Yangi avtotransport #${newTruck.plateNumber} qo'shildi!`);
      }
    } catch (err) {
      showToast("Avtotransport qo'shishda xatolik");
    }
  };

  const handleDeleteTruck = async (id: string) => {
    if (!token || !confirm("Ushbu avtomobilni ro'yxatdan o'chirishni tasdiqlaysizmi?")) return;
    try {
      const res = await fetch(`/api/company/trucks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTrucks(trucks.filter((t) => t.id !== id));
        showToast("Avtomobil muvaffaqiyatli o'chirildi");
      }
    } catch (err) {
      showToast("O'chirishda xatolik");
    }
  };

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !driverName || !driverPhone) return;
    try {
      const res = await fetch("/api/company/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: driverName,
          phone: driverPhone,
          licenseNumber: driverLicenseNumber || "AA 1234567",
          assignedTruckId: driverTruckId || undefined,
          salarySharePercent: parseFloat(driverSalaryShare) || 20,
        }),
      });
      if (res.ok) {
        const newDriver = await res.json();
        setDrivers([newDriver, ...drivers]);
        setShowAddDriverModal(false);
        setDriverName("");
        setDriverPhone("");
        setDriverLicenseNumber("");
        showToast(`Haydovchi ${newDriver.name} muvaffaqiyatli biriktirildi!`);
        fetchAllCompanyData();
      }
    } catch (err) {
      showToast("Haydovchi qo'shishda xatolik");
    }
  };

  const handleDeleteDriver = async (id: string) => {
    if (!token || !confirm("Haydovchini o'chirishni tasdiqlaysizmi?")) return;
    try {
      const res = await fetch(`/api/company/drivers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setDrivers(drivers.filter((d) => d.id !== id));
        showToast("Haydovchi tizimdan o'chirildi");
      }
    } catch (err) {
      showToast("Xatolik");
    }
  };

  const handleClaimMarketplaceOrder = async (orderId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/company/orders/${orderId}/claim`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const claimed = await res.json();
        setMarketplaceOrders(marketplaceOrders.filter((o) => o.id !== orderId));
        setCompanyOrders([claimed, ...companyOrders]);
        showToast(`Buyurtma #${orderId.slice(0, 6)} kompaniyaga biriktirildi!`);
      }
    } catch (err) {
      showToast("Buyurtmani qabul qilishda xatolik");
    }
  };

  const handleDispatchOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !showDispatchModal || !dispatchDriverId || !dispatchTruckId) return;
    try {
      const res = await fetch(`/api/company/orders/${showDispatchModal.id}/dispatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          driverId: dispatchDriverId,
          truckId: dispatchTruckId,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCompanyOrders(companyOrders.map((o) => (o.id === updated.id ? updated : o)));
        setShowDispatchModal(null);
        showToast(`Reys #${updated.id.slice(0, 6)} dispetcherlikdan yo'lga chiqarildi!`);
        fetchAllCompanyData();
      }
    } catch (err) {
      showToast("Dispetcherlikda xatolik");
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    if (!token || !confirm("Ushbu buyurtmani muvaffaqiyatli yetkazildi deb belgilashni tasdiqlaysizmi?")) return;
    try {
      const res = await fetch(`/api/company/orders/${orderId}/complete`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const updated = await res.json();
        setCompanyOrders(companyOrders.map((o) => (o.id === updated.id ? updated : o)));
        showToast(`Buyurtma #${orderId.slice(0, 6)} yakunlandi va tushum hisoblandi!`);
        fetchAllCompanyData();
      }
    } catch (err) {
      showToast("Yakunlashda xatolik");
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !expenseAmount || !expenseDescription) return;
    try {
      const res = await fetch("/api/company/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          category: expenseCategory,
          amount: parseFloat(expenseAmount),
          description: expenseDescription,
          truckId: expenseTruckId || undefined,
        }),
      });
      if (res.ok) {
        const newExp = await res.json();
        setExpenses([newExp, ...expenses]);
        setShowAddExpenseModal(false);
        setExpenseAmount("");
        setExpenseDescription("");
        showToast("Xarajat muvaffaqiyatli qayd etildi!");
        fetchAllCompanyData();
      }
    } catch (err) {
      showToast("Xarajat qo'shishda xatolik");
    }
  };

  const handleAddInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !invoiceClientName || !invoiceAmount) return;
    try {
      const res = await fetch("/api/company/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          clientName: invoiceClientName,
          clientTaxId: invoiceClientTaxId,
          amount: parseFloat(invoiceAmount),
          dueDate: invoiceDueDate || new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
          items: [{ description: invoiceItemsDesc, quantity: 1, unitPrice: parseFloat(invoiceAmount), total: parseFloat(invoiceAmount) }],
        }),
      });
      if (res.ok) {
        const newInv = await res.json();
        setInvoices([newInv, ...invoices]);
        setShowAddInvoiceModal(false);
        setInvoiceClientName("");
        setInvoiceClientTaxId("");
        setInvoiceAmount("");
        showToast(`Hisob-faktura #${newInv.invoiceNumber} yaratildi!`);
        fetchAllCompanyData();
      }
    } catch (err) {
      showToast("Hisob-faktura yaratishda xatolik");
    }
  };

  const handlePayInvoice = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/company/invoices/${id}/pay`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const updated = await res.json();
        setInvoices(invoices.map((inv) => (inv.id === updated.id ? updated : inv)));
        showToast("Hisob-faktura to'langan deb belgilandi");
        fetchAllCompanyData();
      }
    } catch (err) {
      showToast("Xatolik");
    }
  };

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !showBidModal || !bidAmount) return;
    try {
      const res = await fetch(`/api/company/tenders/${showBidModal.id}/bid`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          bidAmount: parseFloat(bidAmount),
          proposal: bidProposalText,
          truckCount: parseInt(bidTruckCount) || 1,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTenders(tenders.map((t) => (t.id === updated.id ? updated : t)));
        setShowBidModal(null);
        setBidAmount("");
        setBidProposalText("");
        showToast("Tender taklifingiz muvaffaqiyatli topshirildi!");
      }
    } catch (err) {
      showToast("Taklif yuborishda xatolik");
    }
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !apiKeyName) return;
    try {
      const res = await fetch("/api/company/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: apiKeyName,
          environment: apiKeyEnv,
        }),
      });
      if (res.ok) {
        const newKey = await res.json();
        setApiKeys([newKey, ...apiKeys]);
        setShowAddApiKeyModal(false);
        setApiKeyName("");
        showToast("Yangi B2B API kaliti yaratildi!");
      }
    } catch (err) {
      showToast("API kalit yaratishda xatolik");
    }
  };

  const handleDeleteApiKey = async (id: string) => {
    if (!token || !confirm("API kalitini bekor qilishni tasdiqlaysizmi?")) return;
    try {
      const res = await fetch(`/api/company/api-keys/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setApiKeys(apiKeys.filter((k) => k.id !== id));
        showToast("API kalit o'chirildi");
      }
    } catch (err) {
      showToast("Xatolik");
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Filtered lists
  const filteredTrucks = trucks.filter((t) => {
    const matchesSearch =
      t.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.model.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = fleetFilter === "all" || t.status === fleetFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredDrivers = drivers.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6 animate-fade-in text-white">
      {/* Toast Alert Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-[120] bg-purple-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-purple-400/40 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Enterprise Company Hero Banner */}
      <div className="bg-gradient-to-r from-purple-950/60 via-[#100725] to-indigo-950/40 border border-purple-500/20 rounded-3xl p-6 lg:p-8 backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2 z-10">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="bg-purple-500/20 text-purple-300 text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full border border-purple-500/30 flex items-center gap-1.5 font-bold">
              <Building className="w-3.5 h-3.5 text-purple-400" />
              LOGISTIKA KOMPANIYASI
            </span>
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              {company?.verificationStatus === "verified" ? "Tasdiqlangan Yuridik Shaxs" : "Verifikatsiya Jarayonida"}
            </span>
            <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full border border-indigo-500/30">
              STIR: {company?.taxNumber || "309876543"}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <span>{company?.companyName || user.companyName || user.name}</span>
            <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
          </h1>

          <p className="text-xs text-white/60 max-w-2xl leading-relaxed">
            Korporativ avtopark boshqaruvi, real-vaqt telematika, ommaviy yuk dispetcherligi, B2B tenderlar va avtomatlashtirilgan elektron hisob-faktura (1C / Didox) integratsiyasi.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap gap-2.5 z-10">
          <button
            onClick={() => setShowAddTruckModal(true)}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl flex items-center gap-2 transition cursor-pointer shadow-lg shadow-purple-950/50"
          >
            <Plus className="w-4 h-4" />
            <span>Transport Qo'shish</span>
          </button>
          <button
            onClick={() => setShowAddDriverModal(true)}
            className="bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl flex items-center gap-2 transition cursor-pointer"
          >
            <Users className="w-4 h-4 text-purple-300" />
            <span>Haydovchi Biriktirish</span>
          </button>
          <button
            onClick={fetchAllCompanyData}
            disabled={loading}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white p-2.5 rounded-xl transition cursor-pointer"
            title="Yangilash"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-purple-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex overflow-x-auto gap-2 border-b border-white/10 pb-3 no-scrollbar">
        {[
          { key: "overview", label: "Umumiy Tahlil", icon: BarChart3 },
          { key: "fleet", label: `Avtopark (${trucks.length})`, icon: Truck },
          { key: "drivers", label: `Haydovchilar (${drivers.length})`, icon: Users },
          { key: "dispatch", label: `Dispetcherlik (${companyOrders.length})`, icon: Send },
          { key: "telematics", label: "Jonli GPS Xarita", icon: Navigation },
          { key: "finances", label: "Moliya", icon: DollarSign },
          { key: "factoring", label: "YukLa Pay & Faktoring", icon: Wallet },
          { key: "customs", label: "Bojxona e-CMR & TIR", icon: FileCheck },
          { key: "coldchain", label: "Cold Chain IoT", icon: ThermometerSnowflake },
          { key: "ltl", label: "LTL & Hublar", icon: Boxes },
          { key: "routes", label: "Marshrut Optimizer", icon: Navigation },
          { key: "integrations", label: "Integratsiyalar", icon: Globe },
          { key: "tenders", label: `Tenderlar (${tenders.length})`, icon: FileSpreadsheet },
          { key: "settings", label: "Kompaniya & API", icon: Key },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-950/60"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-purple-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0c0618] border border-white/10 p-5 rounded-2xl space-y-2 relative overflow-hidden">
              <div className="flex justify-between items-center text-white/50">
                <span className="text-[11px] font-mono uppercase tracking-wider">Jami Avtopark</span>
                <Truck className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-3xl font-black text-white">{trucks.length} ta</div>
              <div className="flex items-center gap-2 text-[10.5px] font-mono text-emerald-400">
                <span>🟢 {trucks.filter((t) => t.status === "idle").length} ta bo'sh</span>
                <span className="text-white/20">•</span>
                <span className="text-blue-400">🔵 {trucks.filter((t) => t.status === "in_transit").length} ta yo'lda</span>
              </div>
            </div>

            <div className="bg-[#0c0618] border border-white/10 p-5 rounded-2xl space-y-2 relative overflow-hidden">
              <div className="flex justify-between items-center text-white/50">
                <span className="text-[11px] font-mono uppercase tracking-wider">Sof Foyda (Oy)</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-emerald-400 font-mono">
                {(finances?.netOperatingProfit || 124500000).toLocaleString()} <span className="text-xs text-white/40">UZS</span>
              </div>
              <div className="text-[10.5px] text-white/50 font-mono">Rentabellik: {finances?.profitMarginPercent || 36.8}%</div>
            </div>

            <div className="bg-[#0c0618] border border-white/10 p-5 rounded-2xl space-y-2 relative overflow-hidden">
              <div className="flex justify-between items-center text-white/50">
                <span className="text-[11px] font-mono uppercase tracking-wider">Faol Buyurtmalar</span>
                <Boxes className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-3xl font-black text-white font-mono">{companyOrders.length} ta</div>
              <div className="text-[10.5px] text-purple-300 font-mono">
                {companyOrders.filter((o) => o.status === "in_transit").length} ta yetkazilmoqda
              </div>
            </div>

            <div className="bg-[#0c0618] border border-white/10 p-5 rounded-2xl space-y-2 relative overflow-hidden">
              <div className="flex justify-between items-center text-white/50">
                <span className="text-[11px] font-mono uppercase tracking-wider">Shtatdagi Haydovchilar</span>
                <Users className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-3xl font-black text-white font-mono">{drivers.length} nafar</div>
              <div className="text-[10.5px] text-emerald-400 font-mono">O'rtacha reyting: 4.9 ★</div>
            </div>
          </div>

          {/* Quick Telematics & Live Map Snapshot */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#0c0618] border border-white/10 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Globe2 className="w-5 h-5 text-purple-400" />
                    <span>O'zbekiston Logistika Koridorlari (Jonli GPS Radar)</span>
                  </h3>
                  <p className="text-xs text-white/40">Toshkent &bull; Samarqand &bull; Buxoro &bull; Farg'ona vodiysi magistrallari</p>
                </div>
                <button
                  onClick={() => setActiveTab("telematics")}
                  className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>To'liq Xaritani Ochish</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>

              {/* Uzbekistan Interactive SVG Logistics Radar Map */}
              <div className="w-full h-64 bg-[#070312] border border-purple-500/20 rounded-2xl p-4 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#9333ea_1px,transparent_1px)] [background-size:16px_16px]"></div>

                {/* Major routes visualization */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 240">
                  {/* Highway M39 / M37 / A373 lines */}
                  <path d="M 120 180 Q 220 160 300 140 T 450 80" fill="none" stroke="#6b21a8" strokeWidth="2" strokeDasharray="4 4" />
                  <path d="M 450 80 Q 510 100 560 130" fill="none" stroke="#6b21a8" strokeWidth="2" strokeDasharray="4 4" />
                  
                  {/* City Nodes */}
                  <circle cx="450" cy="80" r="6" fill="#a855f7" />
                  <text x="440" y="65" fill="#e9d5ff" fontSize="10" fontFamily="monospace" fontWeight="bold">Toshkent (HQ)</text>

                  <circle cx="300" cy="140" r="5" fill="#3b82f6" />
                  <text x="280" y="160" fill="#93c5fd" fontSize="9" fontFamily="monospace">Samarqand</text>

                  <circle cx="180" cy="160" r="5" fill="#3b82f6" />
                  <text x="160" y="180" fill="#93c5fd" fontSize="9" fontFamily="monospace">Buxoro</text>

                  <circle cx="100" cy="190" r="4" fill="#3b82f6" />
                  <text x="70" y="210" fill="#93c5fd" fontSize="9" fontFamily="monospace">Navoiy EEZ</text>

                  <circle cx="550" cy="130" r="5" fill="#10b981" />
                  <text x="520" y="150" fill="#6ee7b7" fontSize="9" fontFamily="monospace">Farg'ona Vodiy</text>

                  {/* Active moving vehicle markers */}
                  <circle cx="380" cy="110" r="7" fill="#ec4899" className="animate-ping opacity-75" />
                  <circle cx="380" cy="110" r="5" fill="#ec4899" />
                  <text x="370" y="100" fill="#fbcfe8" fontSize="8" fontFamily="monospace">01 777 ZZZ (92 km/h)</text>

                  <circle cx="240" cy="150" r="5" fill="#10b981" />
                  <text x="230" y="140" fill="#a7f3d0" fontSize="8" fontFamily="monospace">01 555 BBB (84 km/h)</text>
                </svg>

                <div className="z-10 flex justify-between items-end text-[11px] font-mono text-white/60">
                  <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                    <span className="text-emerald-400">● 4 ta avtotransport</span> yo'lda harakatlanmoqda
                  </div>
                  <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                    Yoqilg'i sarfi: <span className="text-white font-bold">28.4 L / 100km</span>
                  </div>
                </div>
              </div>

              {/* Mini Fleet Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {trucks.slice(0, 2).map((tr) => (
                  <div key={tr.id} className="bg-[#070311] border border-white/5 p-3.5 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold">
                        🚚
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white font-mono">{tr.plateNumber}</p>
                        <p className="text-[10.5px] text-white/50">{tr.model} &bull; {tr.capacity}</p>
                      </div>
                    </div>
                    <span className={`text-[9.5px] font-mono uppercase px-2 py-0.5 rounded-full ${
                      tr.status === "in_transit" ? "bg-blue-500/20 text-blue-300" : "bg-emerald-500/20 text-emerald-300"
                    }`}>
                      {tr.status === "in_transit" ? "Yo'lda" : "Bo'sh"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Marketplace Open Orders (One-click claim) */}
            <div className="bg-[#0c0618] border border-white/10 rounded-3xl p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Boxes className="w-5 h-5 text-purple-400" />
                    <span>Yangi Ochiq Yuklar</span>
                  </h3>
                  <span className="text-[10.5px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
                    {marketplaceOrders.length} ta mavjud
                  </span>
                </div>
                <p className="text-xs text-white/40">Birja orqali darhol qabul qilib, o'z haydovchingizga yuboring</p>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-80 pr-1">
                {marketplaceOrders.length === 0 ? (
                  <div className="text-center py-8 text-white/40 text-xs">
                    Hozirda ochiq birja buyurtmalari yo'q
                  </div>
                ) : (
                  marketplaceOrders.slice(0, 3).map((ord) => (
                    <div key={ord.id} className="bg-[#070311] border border-white/5 p-3.5 rounded-2xl space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-white truncate max-w-[160px]">{ord.cargoType}</span>
                        <span className="text-xs font-mono font-bold text-emerald-400">{ord.price.toLocaleString()} so'm</span>
                      </div>
                      <div className="text-[11px] text-white/60 font-mono space-y-0.5">
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3 h-3 text-purple-400 shrink-0" />
                          <span className="truncate">{ord.pickupAddress} &rarr; {ord.deliveryAddress}</span>
                        </div>
                        <div className="text-[10px] text-white/40">
                          Og'irlik: {ord.weight} kg &bull; Transport: {ord.vehicleType}
                        </div>
                      </div>
                      <button
                        onClick={() => handleClaimMarketplaceOrder(ord.id)}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold py-1.5 rounded-xl transition cursor-pointer mt-1"
                      >
                        Kompaniyaga Qabul Qilish
                      </button>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={() => setActiveTab("dispatch")}
                className="w-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold py-2 rounded-xl transition cursor-pointer text-center"
              >
                Barcha Buyurtmalarni Ko'rish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FLEET MANAGEMENT (AVTOPARK) */}
      {/* ========================================================================= */}
      {activeTab === "fleet" && (
        <div className="space-y-6">
          {/* Action & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Davlat raqami yoki model bo'yicha qidiruv..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0c0618] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={fleetFilter}
                onChange={(e) => setFleetFilter(e.target.value)}
                className="bg-[#0c0618] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white/80 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="all">Barcha holatlar</option>
                <option value="idle">Faqat bo'sh</option>
                <option value="in_transit">Faqat yo'lda</option>
                <option value="maintenance">Ta'mirlashda</option>
              </select>

              <button
                onClick={() => setShowAddTruckModal(true)}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Yangi Transport</span>
              </button>
            </div>
          </div>

          {/* Trucks Table */}
          <div className="bg-[#0c0618] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-white/40 uppercase text-[10px] font-mono tracking-wider">
                  <tr>
                    <th className="py-4 px-5">Davlat Raqami</th>
                    <th className="py-4 px-5">Model & Yil</th>
                    <th className="py-4 px-5">Yuk Ko'tarish / Hajm</th>
                    <th className="py-4 px-5">Biriktirilgan Haydovchi</th>
                    <th className="py-4 px-5">Yoqilg'i</th>
                    <th className="py-4 px-5">Holati</th>
                    <th className="py-4 px-5 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTrucks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-white/40">
                        Hech qanday avtotransport topilmadi
                      </td>
                    </tr>
                  ) : (
                    filteredTrucks.map((truck) => (
                      <tr key={truck.id} className="hover:bg-white/[0.02] transition">
                        <td className="py-4 px-5">
                          <span className="font-mono font-black text-sm bg-black/60 border border-white/10 px-2.5 py-1 rounded-lg text-white">
                            {truck.plateNumber}
                          </span>
                        </td>
                        <td className="py-4 px-5 font-medium text-white">
                          <div>{truck.model}</div>
                          <div className="text-[10px] text-white/40 font-mono">{truck.year} &bull; {truck.fuelType}</div>
                        </td>
                        <td className="py-4 px-5 font-mono text-purple-300">
                          {truck.capacity} / {truck.volume}
                        </td>
                        <td className="py-4 px-5 text-white/80">
                          {truck.assignedDriverName ? (
                            <span className="font-bold text-white flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                              {truck.assignedDriverName}
                            </span>
                          ) : (
                            <span className="text-white/30 italic">Biriktirilmagan</span>
                          )}
                        </td>
                        <td className="py-4 px-5 font-mono text-white/80">
                          <div className="flex items-center gap-2">
                            <Fuel className="w-3.5 h-3.5 text-amber-400" />
                            <span>{truck.fuelLevel || 85}%</span>
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <span
                            className={`text-[9.5px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full ${
                              truck.status === "in_transit"
                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                : truck.status === "maintenance"
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            }`}
                          >
                            {truck.status === "in_transit" ? "Yo'lda" : truck.status === "maintenance" ? "Ta'mirda" : "Bo'sh"}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleDeleteTruck(truck.id)}
                              className="p-1.5 hover:bg-red-500/20 text-white/40 hover:text-red-400 rounded-lg transition cursor-pointer"
                              title="O'chirish"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DRIVERS MANAGEMENT (HAYDOVCHILAR) */}
      {/* ========================================================================= */}
      {activeTab === "drivers" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Haydovchi ismi yoki telefon raqami..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0c0618] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              onClick={() => setShowAddDriverModal(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi Haydovchi</span>
            </button>
          </div>

          {/* Drivers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDrivers.length === 0 ? (
              <div className="col-span-full py-12 text-center text-white/40 text-xs">
                Birorta ham haydovchi topilmadi
              </div>
            ) : (
              filteredDrivers.map((driver) => (
                <div
                  key={driver.id}
                  className="bg-[#0c0618] border border-white/10 hover:border-purple-500/30 p-5 rounded-3xl space-y-4 transition shadow-lg"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center font-bold text-purple-300 text-base">
                        {driver.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{driver.name}</h4>
                        <p className="text-[11px] text-white/50 font-mono">{driver.phone}</p>
                      </div>
                    </div>

                    <span
                      className={`text-[9.5px] font-mono uppercase px-2.5 py-1 rounded-full ${
                        driver.status === "active"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-white/10 text-white/50"
                      }`}
                    >
                      {driver.status === "active" ? "Faol" : "Dam olishda"}
                    </span>
                  </div>

                  <div className="bg-black/40 rounded-2xl p-3.5 space-y-2 border border-white/5 text-xs">
                    <div className="flex justify-between items-center text-white/60">
                      <span>Guvohnoma:</span>
                      <span className="font-mono font-bold text-white">{driver.licenseNumber}</span>
                    </div>
                    <div className="flex justify-between items-center text-white/60">
                      <span>Transport:</span>
                      <span className="font-mono font-bold text-purple-300">
                        {driver.assignedTruckPlate || "Biriktirilmagan"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-white/60">
                      <span>Oylik Reyslar:</span>
                      <span className="font-mono font-bold text-white">{driver.totalTrips || 0} ta</span>
                    </div>
                    <div className="flex justify-between items-center text-white/60">
                      <span>Ulush / Maosh:</span>
                      <span className="font-mono font-bold text-emerald-400">{driver.salarySharePercent}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="text-[11px] text-amber-400 font-bold font-mono">
                      ★ {driver.rating ? driver.rating.toFixed(1) : "5.0"} Reyting
                    </div>
                    <button
                      onClick={() => handleDeleteDriver(driver.id)}
                      className="text-xs text-red-400/60 hover:text-red-400 font-bold cursor-pointer transition"
                    >
                      O'chirish
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: DISPATCH & ORDER MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === "dispatch" && (
        <div className="space-y-6">
          <div className="bg-[#0c0618] border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Send className="w-5 h-5 text-purple-400" />
                  <span>Kompaniya Reyslari & Dispetcherlik Markazi</span>
                </h3>
                <p className="text-xs text-white/40">Biriktirilgan haydovchi va mashinalar marshruti, yuk xatlari va hisobot</p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={orderFilter}
                  onChange={(e) => setOrderFilter(e.target.value)}
                  className="bg-[#070311] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="all">Barcha reyslar</option>
                  <option value="pending">Kutilmoqda</option>
                  <option value="in_transit">Yo'lda</option>
                  <option value="delivered">Yetkazilgan</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-white/40 uppercase text-[10px] font-mono tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Buyurtma ID</th>
                    <th className="py-3.5 px-4">Yo'nalish</th>
                    <th className="py-3.5 px-4">Yuk Tafsiloti</th>
                    <th className="py-3.5 px-4">Summa</th>
                    <th className="py-3.5 px-4">Haydovchi</th>
                    <th className="py-3.5 px-4">Holati</th>
                    <th className="py-3.5 px-4 text-right">Amal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {companyOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-white/40">
                        Kompaniyaga biriktirilgan faol buyurtmalar yo'q
                      </td>
                    </tr>
                  ) : (
                    companyOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-white/[0.02] transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-white">
                          #{ord.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="py-3.5 px-4 max-w-[200px] truncate">
                          <div className="font-bold text-white truncate">{ord.pickupAddress}</div>
                          <div className="text-[10px] text-white/40 truncate">&rarr; {ord.deliveryAddress}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-purple-300">{ord.cargoType}</span>
                          <span className="text-[10px] text-white/40 block font-mono">{ord.weight} kg &bull; {ord.vehicleType}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                          {ord.price.toLocaleString()} so'm
                        </td>
                        <td className="py-3.5 px-4">
                          {ord.driverName ? (
                            <div>
                              <p className="font-bold text-white">{ord.driverName}</p>
                              <p className="text-[10px] text-white/40 font-mono">{ord.driverPhone}</p>
                            </div>
                          ) : (
                            <span className="text-amber-400 text-[11px] font-bold">Dispetcherlik qilinmagan</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[9.5px] font-mono uppercase px-2.5 py-1 rounded-full ${
                              ord.status === "in_transit"
                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                : ord.status === "delivered"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            }`}
                          >
                            {ord.status === "in_transit" ? "Yo'lda" : ord.status === "delivered" ? "Yetkazildi" : "Kutilmoqda"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {ord.status !== "delivered" && (
                              <button
                                onClick={() => setShowDispatchModal(ord)}
                                className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer"
                              >
                                Dispetcherlik
                              </button>
                            )}
                            {ord.status === "in_transit" && (
                              <button
                                onClick={() => handleCompleteOrder(ord.id)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer"
                              >
                                Yetkazildi ✓
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: LIVE TELEMATICS & GPS MAP */}
      {/* ========================================================================= */}
      {activeTab === "telematics" && (
        <div className="space-y-6">
          <div className="bg-[#0c0618] border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-purple-400" />
                  <span>Real-Vaqt Telemetriya & GPS Xarita</span>
                </h3>
                <p className="text-xs text-white/40">Barcha faol transportlarning tezligi, yoqilg'i darajasi va marshrutlari</p>
              </div>
              <button
                onClick={fetchAllCompanyData}
                className="bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Yangilash</span>
              </button>
            </div>

            {/* Telematics Radar Screen */}
            <div className="h-96 w-full bg-[#05010d] border border-purple-500/30 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#9333ea_1.5px,transparent_1.5px)] [background-size:20px_20px]"></div>

              {/* Uzbekistan Map Visuals */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 350">
                {/* Arterial Lines */}
                <path d="M 150 250 Q 280 220 400 180 T 600 100" fill="none" stroke="#7e22ce" strokeWidth="3" strokeDasharray="6 6" />
                <path d="M 600 100 Q 680 130 750 170" fill="none" stroke="#7e22ce" strokeWidth="3" strokeDasharray="6 6" />

                {/* Cities */}
                <circle cx="600" cy="100" r="8" fill="#c084fc" />
                <text x="590" y="80" fill="#f3e8ff" fontSize="12" fontFamily="monospace" fontWeight="bold">Toshkent (Markaz)</text>

                <circle cx="400" cy="180" r="7" fill="#60a5fa" />
                <text x="380" y="205" fill="#bfdbfe" fontSize="11" fontFamily="monospace">Samarqand</text>

                <circle cx="250" cy="220" r="7" fill="#60a5fa" />
                <text x="230" y="245" fill="#bfdbfe" fontSize="11" fontFamily="monospace">Buxoro</text>

                <circle cx="150" cy="250" r="6" fill="#60a5fa" />
                <text x="110" y="275" fill="#bfdbfe" fontSize="11" fontFamily="monospace">Navoiy EEZ</text>

                <circle cx="750" cy="170" r="7" fill="#34d399" />
                <text x="710" y="195" fill="#a7f3d0" fontSize="11" fontFamily="monospace">Andijon / Farg'ona</text>

                {/* Active Truck 1 */}
                <g transform="translate(500, 140)">
                  <circle cx="0" cy="0" r="14" fill="#ec4899" className="animate-ping opacity-60" />
                  <circle cx="0" cy="0" r="8" fill="#ec4899" />
                  <rect x="-40" y="-32" width="80" height="20" rx="6" fill="#1e1035" stroke="#ec4899" strokeWidth="1" />
                  <text x="0" y="-19" fill="#ffffff" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">01 777 ZZZ</text>
                </g>

                {/* Active Truck 2 */}
                <g transform="translate(320, 200)">
                  <circle cx="0" cy="0" r="14" fill="#10b981" className="animate-ping opacity-60" />
                  <circle cx="0" cy="0" r="8" fill="#10b981" />
                  <rect x="-40" y="-32" width="80" height="20" rx="6" fill="#1e1035" stroke="#10b981" strokeWidth="1" />
                  <text x="0" y="-19" fill="#ffffff" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">01 555 BBB</text>
                </g>
              </svg>

              <div className="z-10 flex justify-between items-end">
                <div className="bg-black/80 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-xs font-mono space-y-1">
                  <div className="text-emerald-400 font-bold">🟢 GPS Aloqa: 100% Barqaror</div>
                  <div className="text-white/60">Server vaqt farqi: 12ms</div>
                </div>

                <div className="bg-black/80 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-xs font-mono space-y-1 text-right">
                  <div className="text-purple-300 font-bold">Yoqilg'i Nazorati: CAN-Bus Online</div>
                  <div className="text-white/60">O'rtacha tezlik: 88 km/soat</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: CORPORATE FINANCES & INVOICING (MOLIYA & DIDoX) */}
      {/* ========================================================================= */}
      {activeTab === "finances" && (
        <div className="space-y-6">
          {/* Finance Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#0c0618] border border-white/10 p-5 rounded-2xl space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-white/40">Brutto Tushum</span>
              <div className="text-2xl font-black text-white font-mono">
                {(finances?.grossRevenue || 185000000).toLocaleString()} <span className="text-xs text-white/40">UZS</span>
              </div>
              <div className="text-[10px] text-white/40">Kompaniya orqali o'tgan umumiy oborot</div>
            </div>

            <div className="bg-[#0c0618] border border-white/10 p-5 rounded-2xl space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-white/40">Jami Xarajatlar</span>
              <div className="text-2xl font-black text-red-400 font-mono">
                {(finances?.totalExpenses || 60500000).toLocaleString()} <span className="text-xs text-white/40">UZS</span>
              </div>
              <div className="text-[10px] text-white/40">Yoqilg'i, ta'mirlash, maosh va soliqlar</div>
            </div>

            <div className="bg-[#0c0618] border border-white/10 p-5 rounded-2xl space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-white/40">Kompaniya Sof Foydasi</span>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                {(finances?.netOperatingProfit || 124500000).toLocaleString()} <span className="text-xs text-white/40">UZS</span>
              </div>
              <div className="text-[10px] text-emerald-400/80 font-mono">Rentabellik darajasi: {finances?.profitMarginPercent || 36.8}%</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Invoices (Hisob-fakturalar) */}
            <div className="bg-[#0c0618] border border-white/10 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-400" />
                    <span>Elektron Hisob-fakturalar (Didox / 1C)</span>
                  </h3>
                  <p className="text-xs text-white/40">QQS 12% va yuridik shartnomalar</p>
                </div>
                <button
                  onClick={() => setShowAddInvoiceModal(true)}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Faktura Chiqarish</span>
                </button>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-80 pr-1">
                {invoices.length === 0 ? (
                  <div className="text-center py-8 text-white/40 text-xs">Hisob-fakturalar mavjud emas</div>
                ) : (
                  invoices.map((inv) => (
                    <div key={inv.id} className="bg-[#070311] border border-white/5 p-4 rounded-2xl flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white text-xs">{inv.invoiceNumber}</span>
                          <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full ${
                            inv.status === "paid" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                          }`}>
                            {inv.status === "paid" ? "To'langan" : "To'lov kutilmoqda"}
                          </span>
                        </div>
                        <p className="text-xs text-white/70 font-medium">{inv.clientName}</p>
                        <p className="text-[10px] text-white/40 font-mono">Muddat: {inv.dueDate}</p>
                      </div>

                      <div className="text-right space-y-1">
                        <div className="font-mono font-bold text-emerald-400 text-sm">{inv.amount.toLocaleString()} UZS</div>
                        {inv.status !== "paid" && (
                          <button
                            onClick={() => handlePayInvoice(inv.id)}
                            className="text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg font-bold cursor-pointer"
                          >
                            To'landi deb belgilash
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Expenses (Operatsion Xarajatlar) */}
            <div className="bg-[#0c0618] border border-white/10 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Fuel className="w-5 h-5 text-purple-400" />
                    <span>Operatsion Xarajatlar Jurnali</span>
                  </h3>
                  <p className="text-xs text-white/40">Yoqilg'i, ta'mir va maoshlar hisobi</p>
                </div>
                <button
                  onClick={() => setShowAddExpenseModal(true)}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-purple-400" />
                  <span>Xarajat Kiritish</span>
                </button>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-80 pr-1">
                {expenses.length === 0 ? (
                  <div className="text-center py-8 text-white/40 text-xs">Xarajatlar kiritilmagan</div>
                ) : (
                  expenses.map((exp) => (
                    <div key={exp.id} className="bg-[#070311] border border-white/5 p-4 rounded-2xl flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{exp.description}</span>
                          <span className="text-[9px] font-mono uppercase bg-white/10 text-purple-300 px-2 py-0.5 rounded-full">
                            {exp.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/40 font-mono">{exp.date}</p>
                      </div>

                      <div className="font-mono font-bold text-red-400 text-sm">
                        -{exp.amount.toLocaleString()} UZS
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: B2B TENDERS & RFQ (TENDERLAR) */}
      {/* ========================================================================= */}
      {activeTab === "tenders" && (
        <div className="space-y-6">
          <div className="bg-[#0c0618] border border-white/10 rounded-3xl p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-purple-400" />
                <span>B2B Korporativ Logistika Tenderlari & Kontraktlar</span>
              </h3>
              <p className="text-xs text-white/40">Yirik sanoat ishlab chiqaruvchilari (Artel, UZAuto, Korzinka) dan tenderlar</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {tenders.map((tnd) => (
                <div key={tnd.id} className="bg-[#070311] border border-white/10 hover:border-purple-500/40 p-5 rounded-3xl space-y-3 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono uppercase bg-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded-full border border-purple-500/30">
                        {tnd.initiator}
                      </span>
                      <h4 className="font-bold text-white text-sm mt-1">{tnd.title}</h4>
                    </div>
                    <span className="font-mono font-bold text-emerald-400 text-xs bg-emerald-500/10 px-2.5 py-1 rounded-xl">
                      Byudjet: {tnd.budget}
                    </span>
                  </div>

                  <p className="text-xs text-white/60 leading-relaxed">{tnd.description}</p>

                  <div className="bg-black/40 p-3 rounded-xl text-[11px] font-mono text-white/70 space-y-1">
                    <div>Talab qilingan: <span className="text-white font-bold">{tnd.requiredTrucks}</span></div>
                    <div>Muddati: <span className="text-white font-bold">{tnd.duration}</span></div>
                  </div>

                  <button
                    onClick={() => setShowBidModal(tnd)}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-2 rounded-xl transition cursor-pointer mt-2"
                  >
                    Tijoriy Taklif (Bid) Topshirish
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: SETTINGS & B2B API / 1C INTEGRATION */}
      {/* ========================================================================= */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Company Legal Profile Form */}
            <div className="bg-[#0c0618] border border-white/10 rounded-3xl p-6 space-y-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building className="w-5 h-5 text-purple-400" />
                  <span>Kompaniya Yuridik Ma'lumotlari</span>
                </h3>
                <p className="text-xs text-white/40">Shartnomalar va hisob-fakturalarda aks etuvchi rekvizitlar</p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-white/60 font-semibold">Kompaniya Nomi</label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-[#070311] border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-white/60 font-semibold">Rahbar Ism-sharifi</label>
                  <input
                    type="text"
                    value={profileOwner}
                    onChange={(e) => setProfileOwner(e.target.value)}
                    className="w-full bg-[#070311] border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-white/60 font-semibold">STIR (INN)</label>
                    <input
                      type="text"
                      value={profileTaxNumber}
                      onChange={(e) => setProfileTaxNumber(e.target.value)}
                      className="w-full bg-[#070311] border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-white/60 font-semibold">Litsenziya Raqami</label>
                    <input
                      type="text"
                      value={profileLicenseNumber}
                      onChange={(e) => setProfileLicenseNumber(e.target.value)}
                      className="w-full bg-[#070311] border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-white/60 font-semibold">Telefon Raqami</label>
                  <input
                    type="text"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full bg-[#070311] border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-white/60 font-semibold">Yuridik Manzil</label>
                  <input
                    type="text"
                    value={profileAddress}
                    onChange={(e) => setProfileAddress(e.target.value)}
                    className="w-full bg-[#070311] border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-purple-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl transition cursor-pointer mt-2"
                >
                  Saqlash
                </button>
              </form>
            </div>

            {/* B2B API Keys & 1C TMS Integration */}
            <div className="bg-[#0c0618] border border-white/10 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Key className="w-5 h-5 text-purple-400" />
                    <span>B2B API & 1C / SAP Kalitlari</span>
                  </h3>
                  <p className="text-xs text-white/40">Kompaniya ERP va TMS tizimlarini ulash uchun</p>
                </div>
                <button
                  onClick={() => setShowAddApiKeyModal(true)}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yangi Kalit</span>
                </button>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-80 pr-1">
                {apiKeys.length === 0 ? (
                  <div className="text-center py-8 text-white/40 text-xs">API kalitlar mavjud emas</div>
                ) : (
                  apiKeys.map((k) => (
                    <div key={k.id} className="bg-[#070311] border border-white/5 p-4 rounded-2xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white text-xs">{k.name}</span>
                        <span className="text-[9px] font-mono uppercase bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
                          {k.environment}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 bg-black/60 p-2 rounded-xl border border-white/5 font-mono text-[11px] text-white/80">
                        <span className="truncate flex-1">{k.key}</span>
                        <button
                          onClick={() => handleCopy(k.key, k.id)}
                          className="text-purple-400 hover:text-purple-300 p-1 cursor-pointer"
                        >
                          {copiedKey === k.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-white/40 font-mono pt-1">
                        <span>Yaratildi: {new Date(k.createdAt).toLocaleDateString()}</span>
                        <button
                          onClick={() => handleDeleteApiKey(k.id)}
                          className="text-red-400 hover:underline cursor-pointer"
                        >
                          Bekor qilish
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ENTERPRISE MODULE TABS */}
      {/* ========================================================================= */}
      {activeTab === "factoring" && (
        <div className="animate-fade-in">
          <EnterpriseYuklaPayFactoring user={user} token={token} />
        </div>
      )}

      {activeTab === "customs" && (
        <div className="animate-fade-in">
          <EnterpriseCustomsBorderHub user={user} token={token} />
        </div>
      )}

      {activeTab === "coldchain" && (
        <div className="animate-fade-in">
          <EnterpriseColdChainHub user={user} token={token} />
        </div>
      )}

      {activeTab === "ltl" && (
        <div className="animate-fade-in">
          <EnterpriseLTLConsolidationHub user={user} token={token} />
        </div>
      )}

      {activeTab === "routes" && (
        <div className="animate-fade-in">
          <EnterpriseRouteOptimizerHub user={user} token={token} />
        </div>
      )}

      {activeTab === "integrations" && (
        <div className="animate-fade-in">
          <EnterpriseIntegrationsHub user={user} token={token} />
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD TRUCK */}
      {/* ========================================================================= */}
      {showAddTruckModal && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b0518] border border-white/10 rounded-3xl p-6 max-w-md w-full relative shadow-2xl animate-fade-in space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Truck className="w-5 h-5 text-purple-400" />
                <span>Yangi Avtotransport Qo'shish</span>
              </h3>
              <button onClick={() => setShowAddTruckModal(false)} className="text-white/40 hover:text-white cursor-pointer font-bold">✕</button>
            </div>

            <form onSubmit={handleAddTruck} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-white/60 font-semibold">Davlat Raqami</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: 01 777 AAA"
                  value={truckPlate}
                  onChange={(e) => setTruckPlate(e.target.value)}
                  className="w-full bg-[#070311] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono uppercase focus:border-purple-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-white/60 font-semibold">Model</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: ISUZU 10 / MAN Fura"
                  value={truckModel}
                  onChange={(e) => setTruckModel(e.target.value)}
                  className="w-full bg-[#070311] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-purple-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-white/60 font-semibold">Yuk Ko'tarish</label>
                  <input
                    type="text"
                    value={truckCapacity}
                    onChange={(e) => setTruckCapacity(e.target.value)}
                    className="w-full bg-[#070311] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-purple-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-white/60 font-semibold">Kuzov Hajmi</label>
                  <input
                    type="text"
                    value={truckVolume}
                    onChange={(e) => setTruckVolume(e.target.value)}
                    className="w-full bg-[#070311] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-purple-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-white/60 font-semibold">Ishlab chiqarilgan yil</label>
                  <input
                    type="number"
                    value={truckYear}
                    onChange={(e) => setTruckYear(e.target.value)}
                    className="w-full bg-[#070311] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:border-purple-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-white/60 font-semibold">Yoqilg'i turi</label>
                  <select
                    value={truckFuelType}
                    onChange={(e) => setTruckFuelType(e.target.value as any)}
                    className="w-full bg-[#070311] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-purple-500 outline-none cursor-pointer"
                  >
                    <option value="diesel">Dizel</option>
                    <option value="gas">Metan / Propan</option>
                    <option value="petrol">Benzin</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl transition cursor-pointer mt-3"
              >
                Qo'shish
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD DRIVER */}
      {/* ========================================================================= */}
      {showAddDriverModal && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b0518] border border-white/10 rounded-3xl p-6 max-w-md w-full relative shadow-2xl animate-fade-in space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span>Haydovchi Biriktirish</span>
              </h3>
              <button onClick={() => setShowAddDriverModal(false)} className="text-white/40 hover:text-white cursor-pointer font-bold">✕</button>
            </div>

            <form onSubmit={handleAddDriver} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-white/60 font-semibold">Ism va Familiya</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Sardor Rustamov"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full bg-[#070311] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-purple-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-white/60 font-semibold">Telefon Raqami</label>
                <input
                  type="text"
                  required
                  placeholder="+998 90 123 45 67"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  className="w-full bg-[#070311] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:border-purple-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-white/60 font-semibold">Haydovchilik Guvohnomasi</label>
                <input
                  type="text"
                  placeholder="AA 7654321"
                  value={driverLicenseNumber}
                  onChange={(e) => setDriverLicenseNumber(e.target.value)}
                  className="w-full bg-[#070311] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono uppercase focus:border-purple-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-white/60 font-semibold">Biriktiriladigan Avtotransport</label>
                <select
                  value={driverTruckId}
                  onChange={(e) => setDriverTruckId(e.target.value)}
                  className="w-full bg-[#070311] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-purple-500 outline-none cursor-pointer"
                >
                  <option value="">Transport biriktirmasdan</option>
                  {trucks.map((tr) => (
                    <option key={tr.id} value={tr.id}>{tr.plateNumber} ({tr.model})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-white/60 font-semibold">Maosh / Reysdan Ulush (%)</label>
                <input
                  type="number"
                  value={driverSalaryShare}
                  onChange={(e) => setDriverSalaryShare(e.target.value)}
                  className="w-full bg-[#070311] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:border-purple-500 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl transition cursor-pointer mt-3"
              >
                Biriktirish
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DISPATCH ORDER */}
      {/* ========================================================================= */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b0518] border border-white/10 rounded-3xl p-6 max-w-md w-full relative shadow-2xl animate-fade-in space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Send className="w-5 h-5 text-purple-400" />
                <span>Reysni Dispetcherlash</span>
              </h3>
              <button onClick={() => setShowDispatchModal(null)} className="text-white/40 hover:text-white cursor-pointer font-bold">✕</button>
            </div>

            <div className="bg-black/40 p-3.5 rounded-2xl border border-white/5 text-xs space-y-1">
              <div className="font-bold text-white">{showDispatchModal.cargoType} ({showDispatchModal.weight} kg)</div>
              <div className="text-white/60 font-mono">{showDispatchModal.pickupAddress} &rarr; {showDispatchModal.deliveryAddress}</div>
              <div className="text-emerald-400 font-mono font-bold">{showDispatchModal.price.toLocaleString()} UZS</div>
            </div>

            <form onSubmit={handleDispatchOrderSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-white/60 font-semibold">Haydovchini tanlang</label>
                <select
                  required
                  value={dispatchDriverId}
                  onChange={(e) => setDispatchDriverId(e.target.value)}
                  className="w-full bg-[#070311] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-purple-500 outline-none cursor-pointer"
                >
                  <option value="">Haydovchini tanlang</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.phone})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-white/60 font-semibold">Avtotransportni tanlang</label>
                <select
                  required
                  value={dispatchTruckId}
                  onChange={(e) => setDispatchTruckId(e.target.value)}
                  className="w-full bg-[#070311] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-purple-500 outline-none cursor-pointer"
                >
                  <option value="">Transportni tanlang</option>
                  {trucks.map((tr) => (
                    <option key={tr.id} value={tr.id}>{tr.plateNumber} - {tr.model} ({tr.capacity})</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl transition cursor-pointer mt-3"
              >
                Reysga Chiqarish (Yo'lga Jo'natish)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD EXPENSE */}
      {/* ========================================================================= */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b0518] border border-white/10 rounded-3xl p-6 max-w-md w-full relative shadow-2xl animate-fade-in space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Fuel className="w-5 h-5 text-purple-400" />
                <span>Xarajat Kiritish</span>
              </h3>
              <button onClick={() => setShowAddExpenseModal(false)} className="text-white/40 hover:text-white cursor-pointer font-bold">✕</button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-white/60 font-semibold">Xarajat Yo'nalishi</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="w-full bg-[#070311] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-purple-500 outline-none cursor-pointer"
                >
                  <option value="fuel">Yoqilg'i (Dizel / Gaz)</option>
                  <option value="maintenance">Ta'mirlash & Extiyot qismlar</option>
                  <option value="driver_salary">Haydovchi Maoshi</option>
                  <option value="tolls_customs">Poytaxt / Bojxona to'lovlari</option>
                  <option value="insurance">Yuk Sug'urtasi</option>
                  <option value="other">Boshqa xarajatlar</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-white/60 font-semibold">Summa (UZS)</label>
                <input
                  type="number"
                  required
                  placeholder="Masalan: 850000"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="w-full bg-[#070311] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:border-purple-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-white/60 font-semibold">Izoh</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Toshkent-Samarqand dizel quyish"
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  className="w-full bg-[#070311] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-purple-500 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl transition cursor-pointer mt-3"
              >
                Xarajatni Saqlash
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD INVOICE */}
      {/* ========================================================================= */}
      {showAddInvoiceModal && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b0518] border border-white/10 rounded-3xl p-6 max-w-md w-full relative shadow-2xl animate-fade-in space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                <span>Yangi Hisob-Faktura (Didox)</span>
              </h3>
              <button onClick={() => setShowAddInvoiceModal(false)} className="text-white/40 hover:text-white cursor-pointer font-bold">✕</button>
            </div>

            <form onSubmit={handleAddInvoice} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-white/60 font-semibold">Buyurtmachi Kompaniya Nomi</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Artel Electronics MCHJ"
                  value={invoiceClientName}
                  onChange={(e) => setInvoiceClientName(e.target.value)}
                  className="w-full bg-[#070311] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-purple-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-white/60 font-semibold">Buyurtmachi STIR (INN)</label>
                <input
                  type="text"
                  placeholder="301234567"
                  value={invoiceClientTaxId}
                  onChange={(e) => setInvoiceClientTaxId(e.target.value)}
                  className="w-full bg-[#070311] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:border-purple-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-white/60 font-semibold">Jami Summa (QQS bilan, UZS)</label>
                <input
                  type="number"
                  required
                  placeholder="Masalan: 12000000"
                  value={invoiceAmount}
                  onChange={(e) => setInvoiceAmount(e.target.value)}
                  className="w-full bg-[#070311] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:border-purple-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-white/60 font-semibold">Xizmat Tavsifi</label>
                <input
                  type="text"
                  value={invoiceItemsDesc}
                  onChange={(e) => setInvoiceItemsDesc(e.target.value)}
                  className="w-full bg-[#070311] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-purple-500 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl transition cursor-pointer mt-3"
              >
                Faktura Yaratish & Didox ga Yuborish
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SUBMIT TENDER BID */}
      {/* ========================================================================= */}
      {showBidModal && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b0518] border border-white/10 rounded-3xl p-6 max-w-md w-full relative shadow-2xl animate-fade-in space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-purple-400" />
                <span>Tender Taklifini Yuborish</span>
              </h3>
              <button onClick={() => setShowBidModal(null)} className="text-white/40 hover:text-white cursor-pointer font-bold">✕</button>
            </div>

            <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-xs space-y-1">
              <div className="font-bold text-white">{showBidModal.title}</div>
              <div className="text-white/50 font-mono">Byudjet: {showBidModal.budget}</div>
            </div>

            <form onSubmit={handleBidSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-white/60 font-semibold">Tijoriy Taklif Narxi (UZS)</label>
                <input
                  type="number"
                  required
                  placeholder="Masalan: 320000000"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="w-full bg-[#070311] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:border-purple-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-white/60 font-semibold">Ajratiladigan Avtomobillar Soni</label>
                <input
                  type="number"
                  value={bidTruckCount}
                  onChange={(e) => setBidTruckCount(e.target.value)}
                  className="w-full bg-[#070311] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:border-purple-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-white/60 font-semibold">Kompaniya Kafolatlari va SLA shartlari</label>
                <textarea
                  rows={3}
                  placeholder="Masalan: 100% yuk sug'urtasi, GPS monitoring, 24/7 dispetcherlik xizmati..."
                  value={bidProposalText}
                  onChange={(e) => setBidProposalText(e.target.value)}
                  className="w-full bg-[#070311] border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl transition cursor-pointer mt-3"
              >
                Taklifni Tasdiqlash
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD API KEY */}
      {/* ========================================================================= */}
      {showAddApiKeyModal && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b0518] border border-white/10 rounded-3xl p-6 max-w-md w-full relative shadow-2xl animate-fade-in space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Key className="w-5 h-5 text-purple-400" />
                <span>Yangi B2B API Kaliti</span>
              </h3>
              <button onClick={() => setShowAddApiKeyModal(false)} className="text-white/40 hover:text-white cursor-pointer font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateApiKey} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-white/60 font-semibold">Kalit Nomi (Tizim)</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: 1C Korxona 8.3 Integratsiyasi"
                  value={apiKeyName}
                  onChange={(e) => setApiKeyName(e.target.value)}
                  className="w-full bg-[#070311] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-purple-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-white/60 font-semibold">Muhit</label>
                <select
                  value={apiKeyEnv}
                  onChange={(e) => setApiKeyEnv(e.target.value as any)}
                  className="w-full bg-[#070311] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-purple-500 outline-none cursor-pointer"
                >
                  <option value="production">Production (Jonli)</option>
                  <option value="sandbox">Sandbox (Sinov)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl transition cursor-pointer mt-3"
              >
                API Kalit Generatsiya Qilish
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
