/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { LanguageCode, Order, OrderStatus, Payment, User } from "../types";
import { useTranslation } from "../context/LanguageContext";
import MapLocationPicker from "./MapLocationPicker";
import PermissionsManagerTab from "./PermissionsManagerTab";
import EnterpriseTendersHub from "./EnterpriseTendersHub";
import BackhaulOptimizerHub from "./BackhaulOptimizerHub";
import SilkRoadCorridorHub from "./SilkRoadCorridorHub";
import { TRANSLATIONS, FLEET_INFO } from "../translations";
import { 
  PlusCircle, 
  MapPin, 
  Truck, 
  Scale, 
  DollarSign, 
  CheckCircle2, 
  Navigation, 
  Layers, 
  Bell, 
  CreditCard, 
  Shield, 
  Lock, 
  Check, 
  Ticket, 
  X, 
  User as UserIcon, 
  Clock, 
  Compass, 
  ChevronRight, 
  Grid, 
  Phone, 
  FileText, 
  Map, 
  HelpCircle, 
  Trash2, 
  Send, 
  Eye, 
  Activity, 
  BookOpen, 
  TrendingUp, 
  Star,
  Settings,
  Mail,
  Locate,
  MessageSquare,
  Paperclip,
  CheckCheck,
  Globe,
  Briefcase,
  Zap,
  Globe2,
  Sparkles
} from "lucide-react";

interface DashboardCustomerProps {
  currentLang: LanguageCode;
  onChangeLang?: (lang: LanguageCode) => void;
  orders: Order[];
  onCreateOrder: (orderData: Partial<Order>) => Promise<void>;
  loading: boolean;
  token: string | null;
  onRefreshOrders: () => Promise<void>;
  user?: User | null;
  onRefreshUser?: () => Promise<void>;
  prefilledBooking?: any;
  onClearPrefilledBooking?: () => void;
}

interface SavedAddress {
  id: string;
  label: string;
  address: string;
  notes?: string;
}

export default function DashboardCustomer({
  currentLang,
  onChangeLang,
  orders,
  onCreateOrder,
  loading,
  token,
  onRefreshOrders,
  user,
  onRefreshUser,
  prefilledBooking,
  onClearPrefilledBooking,
}: DashboardCustomerProps) {
  // Navigation tabs for unified dashboard sections
  const [activeTab, setActiveTab] = useState<"hub" | "book" | "track" | "tenders" | "backhaul" | "silkroad" | "history" | "addresses" | "payments" | "profile" | "help" | "permissions">("hub");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Step-by-Step Booking Wizard States (Uber Freight flow)
  const [bookingStep, setBookingStep] = useState(1);
  const [pickup, setPickup] = useState("");
  const [delivery, setDelivery] = useState("");
  const [pickupLocation, setPickupLocation] = useState({
    country: "Uzbekistan",
    region: "Toshkent shahri",
    district: "Sergeli",
    address: "",
    lat: 41.2223,
    lng: 69.2415
  });
  const [deliveryLocation, setDeliveryLocation] = useState({
    country: "Uzbekistan",
    region: "Samarqand",
    district: "Samarqand shahri",
    address: "",
    lat: 39.6542,
    lng: 66.9597
  });

  const [overridePrice, setOverridePrice] = useState<number | null>(null);
  const [aiPricingBreakdown, setAiPricingBreakdown] = useState<any>(null);
  const [calculatingAIPricing, setCalculatingAIPricing] = useState(false);

  // Prefill hook logic
  useEffect(() => {
    if (prefilledBooking) {
      const parts = prefilledBooking.location.split(" - ");
      const pAddr = parts[0] ? `${parts[0]} markazi` : "Toshkent shahri";
      const dAddr = parts[1] ? `${parts[1]} markazi` : "Toshkent, Sergeli";
      
      setPickup(pAddr);
      setDelivery(dAddr);
      setCargoType(`${prefilledBooking.category} - ${prefilledBooking.title}`);
      
      // Assign weight/volume thresholds based on category or titles
      const isHeavy = prefilledBooking.category.includes("Container") || prefilledBooking.category.includes("Freight") || prefilledBooking.category.includes("Warehouse");
      setWeight(isHeavy ? "18000" : "500");
      setVolume(isHeavy ? "80" : "5");

      // Set matched vehicle
      let prefilledVeh = "Labo";
      if (prefilledBooking.category.includes("Cold")) {
        prefilledVeh = "Refrejirator";
      } else if (isHeavy) {
        prefilledVeh = "Fura Tent";
      } else if (prefilledBooking.category.includes("Courier") || prefilledBooking.category.includes("Express")) {
        prefilledVeh = "Bongo";
      }
      setVehicle(prefilledVeh);

      setOverridePrice(prefilledBooking.price);
      setActiveTab("book");
      setBookingStep(1);

      if (onClearPrefilledBooking) {
        onClearPrefilledBooking();
      }
    }
  }, [prefilledBooking]);

  // Automatically compute distance between coordinates using the Haversine formula
  useEffect(() => {
    if (pickupLocation.lat && pickupLocation.lng && deliveryLocation.lat && deliveryLocation.lng) {
      const lat1 = pickupLocation.lat;
      const lon1 = pickupLocation.lng;
      const lat2 = deliveryLocation.lat;
      const lon2 = deliveryLocation.lng;
      
      const R = 6371; // Earth's radius in kilometers
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = Math.round(R * c);
      
      setEstDistance(String(Math.max(1, distance)));
    }
  }, [pickupLocation.lat, pickupLocation.lng, deliveryLocation.lat, deliveryLocation.lng]);
  const [cargoType, setCargoType] = useState("");
  const [weight, setWeight] = useState("");
  const [volume, setVolume] = useState("");
  const [vehicle, setVehicle] = useState("Labo");
  const [phone, setPhone] = useState(user?.phone || "");
  const [receiver, setReceiver] = useState("");
  const [payment, setPayment] = useState<"cash" | "transfer" | "click" | "payme" | "xazna">("cash");
  const [comment, setComment] = useState("");
  const [image, setImage] = useState("");
  const [docs, setDocs] = useState("");
  const [estDistance, setEstDistance] = useState("10");

  // Local storage address list
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [newAddrLabel, setNewAddrLabel] = useState("");
  const [newAddrVal, setNewAddrVal] = useState("");
  const [newAddrNotes, setNewAddrNotes] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Notifications centers simulation
  const [notifications, setNotifications] = useState<Array<{id: string; title: string; text: string; time: string; read: boolean}>>([]);

  // Profile update states
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profilePhone, setProfilePhone] = useState(user?.phone || "");
  const [profileEmail, setProfileEmail] = useState(user?.email || "");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [profileRegion, setProfileRegion] = useState("Toshkent shahar");
  const [profileCity, setProfileCity] = useState("Yunusobod");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");

  // Tracking selection state
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState<Order | null>(null);

  // Payment overlays
  const [selectedCheckoutOrder, setSelectedCheckoutOrder] = useState<Order | null>(null);
  const [checkoutProvider, setCheckoutProvider] = useState<"click" | "payme" | "xazna" | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<"card_entry" | "otp_verify" | "success" | "failed">("card_entry");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [activeTransactionId, setActiveTransactionId] = useState("");
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);

  // Driver Rating States
  const [ratingModalOrder, setRatingModalOrder] = useState<Order | null>(null);
  const [activeRatingScore, setActiveRatingScore] = useState<number>(5);
  const [activeRatingReview, setActiveRatingReview] = useState<string>("");
  const [submittingRating, setSubmittingRating] = useState<boolean>(false);

  // Escrow Release states
  const [confirmDeliveryModalOrder, setConfirmDeliveryModalOrder] = useState<Order | null>(null);
  const [confirmMethod, setConfirmMethod] = useState<"direct" | "otp" | "signature">("direct");
  const [confirmOtp, setConfirmOtp] = useState("");
  const [signatureData, setSignatureData] = useState("");
  const [confirmRating, setConfirmRating] = useState<number>(5);
  const [confirmFeedback, setConfirmFeedback] = useState("");
  const [confirmingRelease, setConfirmingRelease] = useState(false);
  const [invoiceReady, setInvoiceReady] = useState<any | null>(null);

  // Customer <-> Driver Chat States
  const [activeChatOrderId, setActiveChatOrderId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState<string>("");
  const [sendingChat, setSendingChat] = useState<boolean>(false);
  const [chatImgBase64, setChatImgBase64] = useState<string>("");

  // Flash UI messages
  const [toastMessage, setToastMessage] = useState({ show: false, text: "", type: "success" });

  const { t } = useTranslation();

  // Initialize data
  useEffect(() => {
    // Sync phone number from authenticated user
    if (user?.phone && !phone) {
      setPhone(user.phone);
    }
    if (user) {
      setProfileName(user.name);
      setProfilePhone(user.phone || "");
      setProfileEmail(user.email);
    }

    // Load saved addresses from local storage unique to user
    if (user?.id) {
      const cache = localStorage.getItem(`yukla_addr_${user.id}`);
      if (cache) {
        setSavedAddresses(JSON.parse(cache));
      } else {
        const defaultAddrs: SavedAddress[] = [
          { id: "1", label: "Toshkent HQ Office", address: "Toshkent shahar, Mustaqillik maydoni 5", notes: "Asosiy bosh bino darvozasi" },
          { id: "2", label: "Yunusobod Omborxona", address: "Toshkent, Yunusobod tumani, 12-mavze", notes: "12-blok yuk eshigi" }
        ];
        setSavedAddresses(defaultAddrs);
        localStorage.setItem(`yukla_addr_${user.id}`, JSON.stringify(defaultAddrs));
      }
    }

    // Load notifications simulator
    setNotifications([
      { id: "1", title: "Xush kelibsiz!", text: "YukLa aqlli logistika xizmatiga muvaffaqiyatli kirdingiz.", time: "Bugun", read: false },
      { id: "2", title: "Yangi imkoniyat", text: "Endi Click, Payme va Xazna orqali onlayn komissiya to'lash mutlaq xavfsiz va tezkor.", time: "Kecha", read: true }
    ]);
  }, [user]);

  // Retrieve payment transaction history records for the current user
  const fetchPaymentLogs = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/payments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPaymentHistory(data);
      }
    } catch (err) {
      console.error("Error reading payments history:", err);
    }
  };

  useEffect(() => {
    fetchPaymentLogs();
  }, [orders, token]);

  // Load message history from Express backend and register a polling effect
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

  // Handler to send message
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

  // Handler to handle image/file upload and convert to base64
  const handleChatImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setChatImgBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit Driver Rating Score & Review Comments
  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingModalOrder || !token) return;

    setSubmittingRating(true);
    try {
      const res = await fetch(`/api/orders/${ratingModalOrder.id}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: activeRatingScore,
          review: activeRatingReview
        })
      });

      if (res.ok) {
        triggerToast("Sizning baxonigiz muvaffaqiyatli saqlandi! Rahmat.", "success");
        setRatingModalOrder(null);
        setActiveRatingReview("");
        setActiveRatingScore(5);
        if (onRefreshOrders) {
          await onRefreshOrders();
        }
      } else {
        const data = await res.json();
        triggerToast(data.error || "Xatolik yuz berdi.", "error");
      }
    } catch (err) {
      console.error("Error submitting rating:", err);
      triggerToast("Baxolashda server xatoligi yuz berdi.", "error");
    } finally {
      setSubmittingRating(false);
    }
  };

  // Escrow confirmation and release functions
  const handleReleaseEscrowAndConfirm = async () => {
    if (!confirmDeliveryModalOrder) return;
    if (confirmMethod === "otp" && !confirmOtp.trim()) {
      triggerToast("SMS tasdiqlash kodini kiritishingiz shart.", "error");
      return;
    }
    if (confirmMethod === "signature" && !signatureData) {
      triggerToast("Raqamli imzo namunasi chizishingiz shart.", "error");
      return;
    }

    setConfirmingRelease(true);
    try {
      const res = await fetch(`/api/orders/${confirmDeliveryModalOrder.id}/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          method: confirmMethod,
          otp: confirmOtp,
          signature: signatureData,
          rating: confirmRating,
          feedback: confirmFeedback
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Metod tasdiqlashda xato yuz berdi.");
      }

      setInvoiceReady({
        orderId: confirmDeliveryModalOrder.id,
        price: confirmDeliveryModalOrder.price,
        commission: confirmDeliveryModalOrder.price * 0.03,
        driverPayout: confirmDeliveryModalOrder.price * 0.97,
        driverName: confirmDeliveryModalOrder.driverName || "YukLa Haydovchisi",
        pickup: confirmDeliveryModalOrder.pickupAddress,
        delivery: confirmDeliveryModalOrder.deliveryAddress,
        cargo: confirmDeliveryModalOrder.cargoType,
        confirmedAt: new Date().toISOString(),
        paymentMethod: confirmDeliveryModalOrder.paymentMethod || "wallet",
        signature: signatureData,
        method: confirmMethod
      });

      triggerToast("Escrow mablag'i muvaffaqiyatli drayverga topshirildi! 🎉", "success");
      if (onRefreshOrders) {
        await onRefreshOrders();
      }
    } catch (err: any) {
      triggerToast(err.message || "Tasdiqlashda xatolik.", "error");
    } finally {
      setConfirmingRelease(false);
    }
  };

  // Canvas drawing event handlers for Option C (Digital signature)
  const startDrawing = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#a78bfa"; // Violet-400
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    
    const rect = canvas.getBoundingClientRect();
    const x = e.touches ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = e.touches ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.touches ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = e.touches ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureData(canvas.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData("");
  };

  // Pricing engine calculations matching system rates - strictly enforcing 15,000,000 UZS minimum
  const calculateEstimate = (vehicleName: string, distanceKm: number) => {
    const dist = distanceKm || 180;
    let base = 15000000;
    let rate = 14000;

    if (vehicleName.includes("Refrejirator") || vehicleName.includes("Volvo")) {
      base = 22000000;
      rate = 24000;
    } else if (vehicleName.includes("MAN") || vehicleName.includes("Kamaz") || vehicleName.includes("Scania") || vehicleName.includes("Fura")) {
      base = 18000000;
      rate = 19000;
    } else {
      base = 15000000;
      rate = 14000;
    }

    const price = base + (dist * rate);
    return Math.max(Math.round(price), 15000000);
  };

  const calculatedPrice = calculateEstimate(vehicle, Number(estDistance));

  // AI Fair Price Calculator API invocation
  const handleCalculateAIFairPrice = async () => {
    setCalculatingAIPricing(true);
    try {
      const res = await fetch("/api/pricing/calculate-fair-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickupRegion: pickupLocation.region || pickup,
          deliveryRegion: deliveryLocation.region || delivery,
          distanceKm: Number(estDistance) || 250,
          vehicleType: vehicle,
          cargoType: cargoType || "Tijorat yuki",
          weightKg: (Number(weight) || 12) * 1000
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAiPricingBreakdown(data);
        setOverridePrice(data.fairPrice);
        triggerToast(`AI adolatli narx hisoblandi: ${data.fairPrice.toLocaleString()} UZS (Minimal 15M UZS kafolati bilan)`);
      }
    } catch (e) {
      console.error(e);
      triggerToast("AI narxlash serveriga ulanishda xatolik yuz berdi", "error");
    } finally {
      setCalculatingAIPricing(false);
    }
  };

  // Auto trigger tracking if deep tracking mode opened
  const triggerTraceMode = (ord: Order) => {
    setSelectedTrackingOrder(ord);
    setActiveTab("track");
  };

  // Toast notifier trigger
  const triggerToast = (text: string, type = "success") => {
    setToastMessage({ show: true, text, type });
    setTimeout(() => setToastMessage({ show: false, text: "", type: "success" }), 4500);
  };

  // Create Order Action
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickup || !delivery || !cargoType || !weight || !volume || !phone || !receiver) {
      triggerToast("Iltimos, barcha kerakli ma'lumotlarni bosqichma-bosqich kiriting", "error");
      return;
    }

    try {
      const newOrderPayload = {
        pickupAddress: pickup,
        pickupCountry: pickupLocation.country,
        pickupRegion: pickupLocation.region,
        pickupDistrict: pickupLocation.district,
        pickupLat: pickupLocation.lat,
        pickupLng: pickupLocation.lng,
        deliveryAddress: delivery,
        deliveryCountry: deliveryLocation.country,
        deliveryRegion: deliveryLocation.region,
        deliveryDistrict: deliveryLocation.district,
        deliveryLat: deliveryLocation.lat,
        deliveryLng: deliveryLocation.lng,
        cargoType,
        weight: Number(weight),
        volume: Number(volume),
        vehicleType: vehicle,
        phoneNumber: phone,
        receiverNumber: receiver,
        price: overridePrice || calculatedPrice,
        paymentMethod: payment,
        comment,
        cargoImage: image,
        documents: docs,
      };

      await onCreateOrder(newOrderPayload);
      triggerToast("Yangi buyurtmangiz muvaffaqiyatli yaratildi va e'lon qilindi! 🎉");
      
      // Reset Booking form
      setPickup("");
      setDelivery("");
      setPickupLocation({
        country: "Uzbekistan",
        region: "Toshkent shahri",
        district: "Sergeli",
        address: "",
        lat: 41.2223,
        lng: 69.2415
      });
      setDeliveryLocation({
        country: "Uzbekistan",
        region: "Samarqand",
        district: "Samarqand shahri",
        address: "",
        lat: 39.6542,
        lng: 66.9597
      });
      setCargoType("");
      setWeight("");
      setVolume("");
      setReceiver("");
      setComment("");
      setImage("");
      setDocs("");
      setOverridePrice(null);
      setBookingStep(1);
      setActiveTab("hub");
    } catch (err) {
      triggerToast("Buyurtmani yuborishda xatolik yuz berdi", "error");
    }
  };

  // Profile Form Action
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setProfileLoading(true);
    setProfileSuccess("");

    try {
      const res = await fetch("/api/driver/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: profileName,
          phone: profilePhone,
          email: profileEmail,
          profilePhoto: profilePhoto || undefined,
          region: profileRegion,
          city: profileCity,
        })
      });

      const data = await res.json();
      if (res.ok) {
        setProfileSuccess("Profilingiz muvaffaqiyatli saqlandi!");
        triggerToast("Profil ma'lumotlari yangilandi ✅");
        if (onRefreshUser) await onRefreshUser();
      } else {
        triggerToast(data.error || "Profilni saqlashda xatoki", "error");
      }
    } catch (err) {
      triggerToast("Aloqa xatoligi", "error");
    } finally {
      setProfileLoading(false);
    }
  };

  // Secure payment process helper methods
  const handleStartCheckout = async (ord: Order) => {
    setPaymentLoading(true);
    setPaymentError("");
    const providerKey = ord.paymentMethod;

    if (!["click", "payme", "xazna"].includes(providerKey || "")) {
      triggerToast("Onlayn to'lov faqat Click, Payme yoki Xazna uslublariga ruxsat etilgan.", "error");
      setPaymentLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: ord.id,
          provider: providerKey
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Merchant chekout xizmati xatosi.");
      }

      setActiveTransactionId(data.payment.id);
      setCheckoutProvider(providerKey as any);
      setCheckoutStep("card_entry");
      setCardNumber("");
      setCardExpiry("");
      setCardCVV("");
      setOtpCode("");
      setSelectedCheckoutOrder(ord);
    } catch (err: any) {
      triggerToast(err.message || String(err), "error");
    } finally {
      setPaymentLoading(false);
    }
  };

  // Sandbox card validation
  const verifyCheckoutCard = () => {
    const sanitizedCard = cardNumber.replace(/\s+/g, "");
    if (sanitizedCard.length < 16) {
      setPaymentError("Xato: Plastik karta raqami kamida 16 xonali bo'lishi kerak.");
      return;
    }
    if (!cardExpiry || !cardExpiry.includes("/")) {
      setPaymentError("Xato: Karta amal qilish muddatini kiriting (e.g., 08/29).");
      return;
    }
    setPaymentError("");
    setCheckoutStep("otp_verify");
  };

  const handleConfirmOtpSignature = async () => {
    if (otpCode.length < 5) {
      setPaymentError("Tasdiqlash kodi 5 ta xonadan iborat bo'lishi zarur.");
      return;
    }

    setPaymentLoading(true);
    setPaymentError("");

    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          transactionId: activeTransactionId,
          status: "Paid"
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "To'lovni tasdiqlashda xato.");
      }

      setCheckoutStep("success");
      triggerToast("To'lov muvaffaqiyatli qabul qilindi! 💳");
      await onRefreshOrders();
      await fetchPaymentLogs();
    } catch (err: any) {
      setPaymentError(err.message || "Tasdiqlashda xatolik.");
      setCheckoutStep("failed");
    } finally {
      setPaymentLoading(false);
    }
  };

  // Saved addresses operations
  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrLabel.trim() || !newAddrVal.trim()) {
      triggerToast("Sarlavha va manzil majburiy", "error");
      return;
    }

    const item: SavedAddress = {
      id: Math.random().toString(),
      label: newAddrLabel,
      address: newAddrVal,
      notes: newAddrNotes
    };

    const updated = [...savedAddresses, item];
    setSavedAddresses(updated);
    if (user?.id) {
      localStorage.setItem(`yukla_addr_${user.id}`, JSON.stringify(updated));
    }
    setNewAddrLabel("");
    setNewAddrVal("");
    setNewAddrNotes("");
    setShowAddressForm(false);
    triggerToast("Manzil saqlandi");
  };

  const handleDeleteAddress = (id: string) => {
    const updated = savedAddresses.filter(a => a.id !== id);
    setSavedAddresses(updated);
    if (user?.id) {
      localStorage.setItem(`yukla_addr_${user.id}`, JSON.stringify(updated));
    }
    triggerToast("Manzil o'chirildi");
  };

  // Base64 file photo helper
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProfilePhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Helper displays
  const getCardIconLabel = (num: string) => {
    const clean = num.replace(/\s+/g, "");
    if (clean.startsWith("8600")) return "UzCard (O'zbekiston)";
    if (clean.startsWith("9860")) return "Humo (O'zbekiston)";
    if (clean.startsWith("4")) return "Visa Signature";
    if (clean.startsWith("5")) return "Mastercard World";
    return "Universal Bank Karta";
  };

  const statusColors: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    [OrderStatus.ACCEPTED]: "bg-indigo-500/10 text-cyan-400 border-indigo-500/20",
    [OrderStatus.LOADING]: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    [OrderStatus.IN_TRANSIT]: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    [OrderStatus.DELIVERED]: "bg-[#dda15e]/10 text-[#dda15e] border-[#dda15e]/20",
    [OrderStatus.CONFIRMATION]: "bg-amber-500/10 text-rose-300 border-rose-500/20",
    [OrderStatus.COMPLETED]: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    [OrderStatus.CANCELLED]: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  };

  const getStatusLabelText = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return t("statusPending");
      case OrderStatus.ACCEPTED: return t("statusAccepted");
      case OrderStatus.LOADING: return "Yuklanmoqda (Loading)";
      case OrderStatus.IN_TRANSIT: return t("statusInTransit");
      case OrderStatus.DELIVERED: return t("statusDelivered");
      case OrderStatus.CONFIRMATION: return "Tasdiqlash kutilmoqda";
      case OrderStatus.COMPLETED: return "Tugallandi (Completed)";
      case OrderStatus.CANCELLED: return t("statusCancelled");
      default: return status;
    }
  };

  // Statistical calculations (Real DB & Unlimited Support)
  const totalSpending = orders
    .filter(o => !o.isDeleted && (o.status === OrderStatus.DELIVERED || o.status === OrderStatus.COMPLETED || o.isArchived))
    .reduce((sum, ord) => sum + (ord.price || 0), 0);

  const pendingOrdersCount = orders.filter(o => !o.isDeleted && !o.isArchived && o.status === OrderStatus.PENDING).length;
  const activeOrdersCount = orders.filter(o => !o.isDeleted && !o.isArchived && (o.status === OrderStatus.ACCEPTED || o.status === OrderStatus.IN_TRANSIT)).length;
  const completedOrdersCount = orders.filter(o => !o.isDeleted && (o.status === OrderStatus.DELIVERED || o.status === OrderStatus.COMPLETED || o.isArchived)).length;
  const cancelledOrdersCount = orders.filter(o => !o.isDeleted && o.status === OrderStatus.CANCELLED).length;
  const totalOrdersCount = orders.filter(o => !o.isDeleted).length;

  const activeCustomerOrders = orders.filter(
    o => !o.isDeleted && !o.isArchived && o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.CANCELLED
  );

  return (
    <div id="customer_portal_container" className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-white max-w-7xl mx-auto font-sans animate-fade-in relative pb-16">
      
      {/* Toast Alert message system */}
      {toastMessage.show && (
        <div 
          id="custom_portal_toast" 
          className={`fixed bottom-6 right-6 z-[150] px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border transition-all duration-300 animate-bounce ${
            toastMessage.type === "success" 
              ? "bg-purple-900/90 border-purple-500 text-purple-200" 
              : "bg-rose-950/95 border-rose-600 text-rose-300"
          }`}
        >
          {toastMessage.type === "success" ? <CheckCircle2 className="w-5 h-5 text-purple-400" /> : <Shield className="w-5 h-5 text-rose-400" />}
          <span className="text-xs font-bold font-sans">{toastMessage.text}</span>
        </div>
      )}

      {/* MOBILE TAB BAR (Only visible on screens < lg) */}
      <div className="lg:hidden col-span-1 bg-[#120b2e]/80 border border-white/10 rounded-2xl p-2.5 backdrop-blur-md sticky top-20 z-40">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => { setActiveTab("hub"); setSelectedTrackingOrder(null); }}
            className={`px-3 py-2 rounded-xl whitespace-nowrap font-bold transition shrink-0 ${
              activeTab === "hub" ? "bg-purple-600 text-white shadow-md" : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("book")}
            className={`px-3 py-2 rounded-xl whitespace-nowrap font-bold transition shrink-0 ${
              activeTab === "book" ? "bg-purple-600 text-white shadow-md" : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            + {t("dashboard.newOrderWizard")}
          </button>
          <button
            onClick={() => setActiveTab("tenders")}
            className={`px-3 py-2 rounded-xl whitespace-nowrap font-bold transition shrink-0 ${
              activeTab === "tenders" ? "bg-purple-600 text-white shadow-md" : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            Tenderlar
          </button>
          <button
            onClick={() => setActiveTab("backhaul")}
            className={`px-3 py-2 rounded-xl whitespace-nowrap font-bold transition shrink-0 ${
              activeTab === "backhaul" ? "bg-emerald-600 text-white shadow-md" : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            Backhaul AI
          </button>
          <button
            onClick={() => setActiveTab("silkroad")}
            className={`px-3 py-2 rounded-xl whitespace-nowrap font-bold transition shrink-0 ${
              activeTab === "silkroad" ? "bg-blue-600 text-white shadow-md" : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            Ipak Yo'li
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-3 py-2 rounded-xl whitespace-nowrap font-bold transition shrink-0 ${
              activeTab === "history" ? "bg-purple-600 text-white shadow-md" : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            Buyurtmalar ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("addresses")}
            className={`px-3 py-2 rounded-xl whitespace-nowrap font-bold transition shrink-0 ${
              activeTab === "addresses" ? "bg-purple-600 text-white shadow-md" : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            Manzillar
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-3 py-2 rounded-xl whitespace-nowrap font-bold transition shrink-0 ${
              activeTab === "payments" ? "bg-purple-600 text-white shadow-md" : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            Hamyon
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-3 py-2 rounded-xl whitespace-nowrap font-bold transition shrink-0 ${
              activeTab === "profile" ? "bg-purple-600 text-white shadow-md" : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            Sozlamalar
          </button>
          <button
            onClick={() => setActiveTab("help")}
            className={`px-3 py-2 rounded-xl whitespace-nowrap font-bold transition shrink-0 ${
              activeTab === "help" ? "bg-purple-600 text-white shadow-md" : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            Yordam
          </button>
        </div>
      </div>

      {/* LEFT NAVIGATION COLUMN (Unified bolt-style glassmorphic tab console) */}
      <div className="hidden lg:flex lg:col-span-3 flex-col gap-6">
        
        {/* Simple customer identity card */}
        <div className="bg-[#120b2e]/60 border border-purple-500/10 rounded-3xl p-5 flex flex-col items-center text-center shadow-xl backdrop-blur-md">
          <div className="relative">
            {profilePhoto || user?.email ? (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-fuchsia-600 flex items-center justify-center font-black text-white text-xl border border-purple-400/30 shadow-inner">
                {user?.name?.charAt(0) || "U"}
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center text-white/40">
                <UserIcon className="w-7 h-7" />
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 bg-green-500 border-2 border-[#090412] rounded-full"></span>
          </div>

          <p className="font-extrabold text-base tracking-tight mt-3 text-white/95">{user?.name || "Shipper Customer"}</p>
          <p className="text-[10.5px] text-white/40 font-semibold uppercase tracking-wider mt-0.5">{user?.role || "Mijoz"}</p>
          <span className="text-[11px] text-purple-400/80 italic mt-1 font-mono">{user?.email}</span>
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

        {/* Tab switcher buttons */}
        <div className="bg-[#120b2e]/40 border border-white/5 p-2 rounded-3xl space-y-1 shadow-md">
          <button
            onClick={() => { setActiveTab("hub"); setSelectedTrackingOrder(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs uppercase font-extrabold tracking-wider transition ${
              activeTab === "hub" ? "bg-purple-600/20 border border-purple-500/20 text-purple-300 font-black shadow-inner" : "text-white/40 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Mening Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab("book")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs uppercase font-extrabold tracking-wider transition ${
              activeTab === "book" ? "bg-purple-600/20 border border-purple-500/20 text-purple-300 font-black shadow-inner" : "text-white/40 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            <PlusCircle className="w-4 h-4 text-purple-400" />
            <span>{t("dashboard.newOrderWizard")}</span>
          </button>

          <button
            onClick={() => setActiveTab("tenders")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs uppercase font-extrabold tracking-wider transition ${
              activeTab === "tenders" ? "bg-purple-600/20 border border-purple-500/20 text-purple-300 font-black shadow-inner" : "text-white/40 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            <Briefcase className="w-4 h-4 text-purple-400" />
            <span>B2B Tenderlar & RFQ</span>
          </button>

          <button
            onClick={() => setActiveTab("backhaul")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs uppercase font-extrabold tracking-wider transition ${
              activeTab === "backhaul" ? "bg-emerald-600/20 border border-emerald-500/20 text-emerald-300 font-black shadow-inner" : "text-white/40 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Backhaul AI (Qaytish)</span>
          </button>

          <button
            onClick={() => setActiveTab("silkroad")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs uppercase font-extrabold tracking-wider transition ${
              activeTab === "silkroad" ? "bg-blue-600/20 border border-blue-500/20 text-blue-300 font-black shadow-inner" : "text-white/40 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            <Globe2 className="w-4 h-4 text-blue-400" />
            <span>Ipak Yo'li Koridorlari</span>
          </button>

          <button
            onClick={() => setActiveTab("addresses")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs uppercase font-extrabold tracking-wider transition ${
              activeTab === "addresses" ? "bg-purple-600/20 border border-purple-500/20 text-purple-300 font-black" : "text-white/40 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            <MapPin className="w-4 h-4 text-fuchsia-400" />
            <span>{t("dashboard.savedAddresses")}</span>
          </button>

          <button
            onClick={() => { setActiveTab("history"); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs uppercase font-extrabold tracking-wider transition ${
              activeTab === "history" ? "bg-purple-600/20 border border-purple-500/20 text-purple-300 font-black" : "text-white/40 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>{t("dashboard.activityLogs")} ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("payments")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs uppercase font-extrabold tracking-wider transition ${
              activeTab === "payments" ? "bg-purple-600/20 border border-purple-500/20 text-purple-300 font-black" : "text-white/40 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>{t("dashboard.walletCashier")}</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs uppercase font-extrabold tracking-wider transition ${
              activeTab === "profile" ? "bg-purple-600/20 border border-purple-500/20 text-purple-300 font-black" : "text-white/40 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>{t("dashboard.accountSettings")}</span>
          </button>

          <button
            onClick={() => setActiveTab("permissions")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs uppercase font-extrabold tracking-wider transition ${
              activeTab === "permissions" ? "bg-purple-600/20 border border-purple-500/20 text-purple-300 font-black" : "text-white/40 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Ruxsatnomalar & HUD</span>
          </button>

          <button
            onClick={() => setActiveTab("help")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs uppercase font-extrabold tracking-wider transition ${
              activeTab === "help" ? "bg-purple-600/20 border border-purple-500/20 text-purple-300 font-black" : "text-white/40 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>{t("dashboard.customerSupport")}</span>
          </button>
        </div>

        {/* Dynamic instant actions sidebar buttons */}
        <div className="bg-gradient-to-br from-purple-950/20 to-indigo-950/20 border border-purple-500/10 rounded-3xl p-5 space-y-3 shadow-inner">
          <p className="text-[10px] uppercase font-bold text-purple-400 tracking-widest block font-mono">{t("dashboard.quickActions")}</p>
          <button 
            onClick={() => setActiveTab("book")}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-extrabold uppercase py-3 rounded-2xl text-xs tracking-wider cursor-pointer shadow-lg shadow-purple-900/40 border border-purple-500/20 transition-all"
          >
            Yuk yuborish
          </button>
        </div>
      </div>

      {/* RIGHT CONTENT COLUMN */}
      <div className="lg:col-span-9 space-y-8">
        
        {/* ====================================================
           TAB VIEW 1: HUB OVERVIEW (STUNNING BENTO GRID & KPI)
           ==================================================== */}
        {activeTab === "hub" && (
          <div className="space-y-8 animate-fade-in font-sans">
            
            {/* KPI overview */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              
              <div className="bg-[#120b2e]/40 border border-white/5 rounded-2xl p-4 shadow-xl">
                <span className="text-[9.5px] uppercase font-bold text-white/40 tracking-wider">{t("dashboard.totalOrders")}</span>
                <p className="text-xl font-bold font-mono text-white mt-1.5">{totalOrdersCount} ta</p>
                <span className="text-[9px] text-white/40 block mt-1">Siz tomoningizdan yaratilgan jami</span>
              </div>

              <div className="bg-[#120b2e]/40 border border-white/5 rounded-2xl p-4 shadow-xl">
                <span className="text-[9.5px] uppercase font-bold text-white/40 tracking-wider">{t("dashboard.activeOrders")}</span>
                <p className="text-xl font-bold font-mono text-purple-400 mt-1.5">{activeOrdersCount} ta</p>
                <span className="text-[9px] text-white/40 block mt-1 font-sans">Ayni vaqtda faol/yo'lda bo'lgan</span>
              </div>

              <div className="bg-[#120b2e]/40 border border-white/5 rounded-2xl p-4 shadow-xl font-sans">
                <span className="text-[9.5px] uppercase font-bold text-white/40 tracking-wider">{t("dashboard.completedCargo")}</span>
                <p className="text-xl font-bold font-mono text-green-400 mt-1.5">{completedOrdersCount} ta</p>
                <span className="text-[9px] text-green-400 block mt-1 font-sans">Muvaffaqiyatli topshirilgan</span>
              </div>

              <div className="bg-[#120b2e]/40 border border-white/5 rounded-2xl p-4 shadow-xl">
                <span className="text-[9.5px] uppercase font-bold text-white/40 tracking-wider">{t("dashboard.cancelledCargo")}</span>
                <p className="text-xl font-bold font-mono text-rose-400 mt-1.5">{cancelledOrdersCount} ta</p>
                <span className="text-[9px] text-rose-400/80 block mt-1">Bekor qilingan buyurtmalar</span>
              </div>

              <div className="bg-[#120b2e]/40 border border-white/5 rounded-2xl p-4 shadow-xl">
                <span className="text-[9.5px] uppercase font-bold text-white/40 tracking-wider">Jami xarajat</span>
                <p className="text-base font-bold font-mono text-[#dda15e] mt-1.5">{totalSpending.toLocaleString()} UZS</p>
                <div className="flex items-center gap-1 text-[9px] text-green-400 mt-1 font-semibold">
                  <TrendingUp className="w-3 h-3" />
                  <span>Muvaffaqiyatli to'langan</span>
                </div>
              </div>
            </div>

            {/* Custom Interactive SVG Spending Trend Chart - High Contrast & Glowing */}
            <div className="bg-[#120b2e]/30 border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/5 blur-[100px] rounded-full pointer-events-none"></div>
              
              <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-6">
                <div>
                  <h3 className="text-base font-black flex items-center gap-2 text-white">
                    <Activity className="w-4.5 h-4.5 text-purple-450" />
                    <span>Yuk tashuvlar qiymat dinamikasi (SaaS Logs)</span>
                  </h3>
                  <p className="text-[11px] text-white/40">Oxirgi kiritilgan buyurtmalar hajimi va sarflangan mablag'lar nisbati hamyonda</p>
                </div>
                <span className="text-xs font-mono font-bold text-purple-400">Trendline Analytics Widget</span>
              </div>

              {orders.length === 0 ? (
                <div className="h-44 flex items-center justify-center text-xs text-white/40">
                  Hali tahlil qilish uchun yetarli buyurtmalar mavjud emas.
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Glowing SVG vector curve chart */}
                  <div className="h-36 w-full bg-black/40 rounded-2xl border border-white/5 p-4 flex items-end justify-between relative">
                    <div className="absolute inset-0 bg-[radial-gradient(#1e1b4b_1px,transparent_1px)] [background-size:16px_16px] opacity-35"></div>
                    
                    {/* SVG Curve logic drawn in high contrast */}
                    <svg className="absolute inset-0 h-full w-full pointer-events-none overflow-visible" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="spending_grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#9d4edd" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#9d4edd" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path 
                        d={`M 0,110 ${orders.slice(-6).map((ord, idx) => `L ${(idx + 1) * 110},${Math.max(20, 110 - ((ord.price || 50000) / 1000000) * 80)}`).join(" ")} L 1000,110 Z`}
                        fill="url(#spending_grad)"
                        stroke="#b5179e"
                        strokeWidth="3.5"
                        className="drop-shadow-[0_4px_12px_rgba(181,23,158,0.5)]"
                      />
                    </svg>

                    {/* Vector pointers info overlay */}
                    {orders.slice(-6).map((ord, idx) => (
                      <div key={ord.id} className="text-center w-16 relative z-10 space-y-1 group">
                        <span className="text-[9px] text-[#dda15e] font-mono group-hover:text-white transition block pointer-events-none">
                          {(ord.price / 1000).toFixed(0)}k
                        </span>
                        <div className="h-2 w-2 rounded-full bg-purple-500 mx-auto border-2 border-[#120b2e] group-hover:bg-fuchsia-400 cursor-pointer"></div>
                        <span className="text-[8px] text-white/30 block tracking-widest uppercase font-mono mt-1">
                          #{ord.id.substr(0,4).toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div 
                onClick={() => setActiveTab("book")}
                className="bg-gradient-to-br from-purple-950/20 to-stone-900/30 border border-purple-500/10 hover:border-purple-500/40 rounded-2xl p-5 cursor-pointer hover:scale-[1.02] transition-all group shadow-md"
              >
                <div className="bg-purple-600/10 text-purple-400 h-10 w-10 rounded-xl flex items-center justify-center border border-purple-500/20 mb-4 group-hover:animate-bounce">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-sm text-white">Yangi logistika buyurtmasi</h4>
                <p className="text-[11px] text-white/40 mt-1 leading-relaxed">Yuk o'lchamlari, marshruti va mashina turiga moslashtirilgan 5 basqichli Uber formatidagi forma.</p>
                <span className="text-[10px] text-purple-400 font-bold block mt-3 flex items-center gap-1">
                  <span>Birja yuklash jarayoni</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition" />
                </span>
              </div>

              <div 
                onClick={() => setActiveTab("addresses")}
                className="bg-[#120b2e]/40 border border-white/5 hover:border-fuchsia-500/30 rounded-2xl p-5 cursor-pointer hover:scale-[1.02] transition-all group shadow-md"
              >
                <div className="bg-fuchsia-600/10 text-fuchsia-400 h-10 w-10 rounded-xl flex items-center justify-center border border-fuchsia-500/20 mb-4">
                  <MapPin className="w-5 h-5 text-fuchsia-400" />
                </div>
                <h4 className="font-extrabold text-sm text-white">Saqlangan manzillar ombori</h4>
                <p className="text-[11px] text-white/40 mt-1 leading-relaxed">Doimiy yuk tushirish yoki yuklash manzillarini shaxsiy daftarimizda saqlang va tezkor chaqiring.</p>
                <span className="text-[10px] text-fuchsia-400 font-bold block mt-3 flex items-center gap-1">
                  <span>Manzillar daftari ({savedAddresses.length})</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition" />
                </span>
              </div>

              <div 
                onClick={() => setActiveTab("payments")}
                className="bg-[#120b2e]/40 border border-white/5 hover:border-teal-500/30 rounded-2xl p-5 cursor-pointer hover:scale-[1.02] transition-all group shadow-md"
              >
                <div className="bg-teal-600/10 text-teal-400 h-10 w-10 rounded-xl flex items-center justify-center border border-teal-500/20 mb-4">
                  <CreditCard className="w-5 h-5 text-teal-400" />
                </div>
                <h4 className="font-extrabold text-sm text-white">Click / Payme hisob-kitob</h4>
                <p className="text-[11px] text-white/40 mt-1 leading-relaxed">Platforma tranzaksiyalari kassa balansini tekshirish hamda to'g'ridan-to'g'ri integratsiyalangan holda to'lash.</p>
                <span className="text-[10px] text-teal-400 font-bold block mt-3 flex items-center gap-1">
                  <span>Tranzaksiyalarga o'tish</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition" />
                </span>
              </div>
            </div>

            {/* Recent Shipments ongoing table card list */}
            <div className="bg-[#120b2e]/30 border border-white/10 rounded-3xl p-6 shadow-2xl relative">
              <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-6">
                <div>
                  <h3 className="text-base font-black text-white">Mening faol yuk tashuvlarim</h3>
                  <p className="text-[11px] text-white/40">Zvenoda harakatlanayotgan faol buyurtmalar (yetkazilgan buyurtmalar avtomatik arxivlanadi)</p>
                </div>
                
                <button 
                  onClick={() => setActiveTab("history")}
                  className="text-xs text-purple-400 font-bold hover:underline"
                >
                  Arxiv & Tarix ({completedOrdersCount}) &rarr;
                </button>
              </div>

              {activeCustomerOrders.length === 0 ? (
                <div className="text-center py-12 text-xs text-white/40 border border-dashed border-white/5 rounded-2xl">
                  <p className="font-semibold">Hozirda faol harakatdagi buyurtmalar mavjud emas.</p>
                  <p className="text-white/30 text-[11px] mt-1">Yakunlangan buyurtmalarni <button onClick={() => setActiveTab("history")} className="text-purple-400 underline font-bold">Arxiv & Tarix</button> bo'limida ko'rishingiz mumkin.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeCustomerOrders.slice(0, 5).map((ord) => (
                    <div 
                      key={ord.id} 
                      className="bg-black/30 border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-purple-500/20 transition-all duration-300"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[9.5px] font-mono font-bold text-purple-400 select-all font-semibold uppercase bg-purple-500/10 px-2.5 py-1 rounded">
                            ID: #{ord.id.substr(0, 8).toUpperCase()}
                          </span>
                          <span className="text-xs font-extrabold text-[#dda15e]">{ord.cargoType}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-white/70">
                          <p className="truncate"><span className="text-emerald-450 font-bold font-mono text-[10px] mr-1">Dan:</span> {ord.pickupAddress}</p>
                          <p className="truncate"><span className="text-purple-450 font-bold font-mono text-[10px] mr-1">Gacha:</span> {ord.deliveryAddress}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 justify-between w-full md:w-auto md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-white/5">
                        <div className="text-left md:text-right">
                          <p className="font-extrabold text-sm text-white font-mono">{ord.price?.toLocaleString()} UZS</p>
                          <span className="text-[10px] text-white/40 italic block flex items-center justify-end gap-1">
                            <Clock className="w-3.5 h-3.5 inline text-purple-450" />
                            {new Date(ord.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[ord.status]}`}>
                            {getStatusLabelText(ord.status)}
                          </span>

                          <button 
                            onClick={() => triggerTraceMode(ord)}
                            className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] px-3.5 py-2 rounded-xl transition cursor-pointer"
                          >
                            Kuzatish
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ====================================================
           TAB VIEW 2: STEP-BY-STEP UBER-LIKE BOOKING EXPERIENCE
           ==================================================== */}
        {activeTab === "book" && (
          <div className="bg-[#120b2e]/30 border border-white/10 rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden animate-fade-in font-sans">
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/5 blur-[120px] rounded-full pointer-events-none animate-pulse"></div>

            <div className="pb-6 border-b border-white/5 mb-8">
              <span className="text-[10px] sm:text-[10.5px] uppercase font-bold text-purple-400 tracking-widest block font-mono">YukLa Shipper Wizard • Mobile-Optimized</span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">Intellektual buyurtma yaratish</h2>
              
              {/* Stepper Progress bar */}
              <div className="mt-6">
                <div className="flex flex-wrap sm:flex-nowrap justify-between gap-1.5 text-[10px] sm:text-xs font-mono font-bold text-white/40 max-w-lg mx-auto mb-3">
                  <span className={`px-2 py-1 rounded-lg ${bookingStep === 1 ? "bg-purple-600/30 text-purple-300 font-black border border-purple-500/30" : bookingStep > 1 ? "text-purple-400" : ""}`}>1. Marshrut</span>
                  <span className={`px-2 py-1 rounded-lg ${bookingStep === 2 ? "bg-purple-600/30 text-purple-300 font-black border border-purple-500/30" : bookingStep > 2 ? "text-purple-400" : ""}`}>2. Yuk Tavsifi</span>
                  <span className={`px-2 py-1 rounded-lg ${bookingStep === 3 ? "bg-purple-600/30 text-purple-300 font-black border border-purple-500/30" : bookingStep > 3 ? "text-purple-400" : ""}`}>3. Transport</span>
                  <span className={`px-2 py-1 rounded-lg ${bookingStep === 4 ? "bg-purple-600/30 text-purple-300 font-black border border-purple-500/30" : bookingStep > 4 ? "text-purple-400" : ""}`}>4. Ma'lumotlar</span>
                  <span className={`px-2 py-1 rounded-lg ${bookingStep === 5 ? "bg-purple-600/30 text-purple-300 font-black border border-purple-500/30" : ""}`}>5. To'lov</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full max-w-lg mx-auto overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 transition-all duration-300 rounded-full"
                    style={{ width: `${(bookingStep / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-8">
              
              {/* BOOKING STEP 1: ROUTE PARAMETERS */}
              {bookingStep === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-purple-950/20 p-4 rounded-2xl border border-purple-500/10">
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-wider">Bosqich 1: Marshrut va Lokatsiyalar</h3>
                      <p className="text-[11px] text-white/50 mt-0.5">Xarita va aqlli GPS xizmati orqali yuklash va yetkazish manzillarini belgilang</p>
                    </div>
                    <span className="text-xs bg-purple-500/20 text-purple-300 font-mono px-3 py-1.5 rounded-lg font-bold uppercase shrink-0">Uzbekistan & Global</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pickup Address Picker */}
                    <div className="space-y-3">
                      <MapLocationPicker
                        label="Yuklash manzili (Pickup Source) *"
                        value={pickupLocation}
                        onChange={(val) => {
                          setPickupLocation(val);
                          setPickup(val.address);
                        }}
                        accentColor="purple"
                      />
                      
                      {/* Saved addresses helper */}
                      <div className="bg-[#120b2e]/20 border border-white/5 p-3.5 rounded-xl">
                        <span className="text-[10px] text-white/40 block font-bold uppercase tracking-wider mb-2">Saqlangan manzillardan tezkor yuklash:</span>
                        <div className="flex flex-wrap gap-2">
                          {savedAddresses.length > 0 ? (
                            savedAddresses.map(addr => (
                              <button 
                                key={addr.id}
                                type="button"
                                onClick={() => {
                                  setPickup(addr.address);
                                  setPickupLocation(prev => ({
                                    ...prev,
                                    address: addr.address
                                  }));
                                }}
                                className="bg-white/5 hover:bg-purple-600/20 text-[11px] px-3 py-2 rounded-xl border border-white/5 font-semibold text-purple-300 transition shrink-0 min-h-[38px]"
                              >
                                📍 {addr.label}
                              </button>
                            ))
                          ) : (
                            <span className="text-[10px] text-white/30 italic">Hozircha saqlangan manzillar yo'q.</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Delivery Address Picker */}
                    <div className="space-y-3">
                      <MapLocationPicker
                        label="Topshirish manzili (Delivery Destination) *"
                        value={deliveryLocation}
                        onChange={(val) => {
                          setDeliveryLocation(val);
                          setDelivery(val.address);
                        }}
                        accentColor="pink"
                      />

                      {/* Distance and cost helper */}
                      <div className="bg-gradient-to-r from-purple-950/20 to-fuchsia-950/20 border border-purple-500/10 p-4 rounded-xl space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-white/70 font-semibold flex items-center gap-1.5">
                            <Navigation className="w-4 h-4 text-purple-400 animate-pulse" />
                            <span>GPS orqali hisoblangan masofa:</span>
                          </span>
                          <span className="font-mono text-purple-300 font-extrabold text-sm">{estDistance} km</span>
                        </div>
                        <input 
                          type="hidden" 
                          value={estDistance} 
                        />
                        <p className="text-[10.5px] text-[#a5a5cc] leading-relaxed">
                          Haversine GIS dasturi yuklash va topshirish koordinatalari o'rtasidagi to'g'ri masofani hisobladi.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Distance override option */}
                  <div className="bg-[#120b2e]/30 border border-white/5 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
                    <div className="space-y-0.5 text-left">
                      <span className="text-xs font-bold text-white block">Tuzatish kiritish (Masofa o'zgartirish)</span>
                      <span className="text-[11px] text-white/40 block leading-relaxed">Haydovchilar bilan real kelishilgan yo'l masofasini (km) yozing</span>
                    </div>
                    <div className="relative w-full sm:w-48 shrink-0">
                      <Navigation className="w-4.5 h-4.5 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="number" 
                        min="1" 
                        required 
                        value={estDistance} 
                        onChange={(e) => setEstDistance(e.target.value)}
                        className="w-full bg-black/45 border border-white/10 h-12 min-h-[48px] pl-11 pr-4 text-xs rounded-xl focus:border-purple-500 text-white outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      disabled={!pickup.trim() || !delivery.trim()}
                      onClick={() => setBookingStep(2)}
                      className="w-full sm:w-auto min-h-[48px] bg-purple-600 hover:bg-purple-500 hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-xs uppercase tracking-widest px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-purple-950/40"
                    >
                      <span>Keyingi bosqich</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* BOOKING STEP 2: CARGO INFO */}
              {bookingStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <h3 className="text-base sm:text-lg font-extrabold text-white">Bosqich 2: Yuk tavsifi va og'irligi</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

                    <div className="space-y-2 col-span-1 md:col-span-2">
                      <label className="text-xs font-bold text-white/70 block break-words">Yuk turi tavsifi (Cargo Type) *</label>
                      <div className="relative">
                        <Layers className="w-4.5 h-4.5 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input 
                          type="text" 
                          required 
                          value={cargoType} 
                          onChange={(e) => setCargoType(e.target.value)}
                          placeholder="Masalan: Qurilish mollari, ehtiyot qismlar, mebel"
                          className="w-full bg-black/45 border border-white/10 h-12 min-h-[48px] pl-11 pr-4 text-xs rounded-xl focus:border-purple-500 text-white outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 col-span-1">
                      <label className="text-xs font-bold text-white/70 block break-words">Sof yuk og'irligi (kg) *</label>
                      <div className="relative">
                        <Scale className="w-4.5 h-4.5 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input 
                          type="number" 
                          required 
                          value={weight} 
                          onChange={(e) => setWeight(e.target.value)}
                          placeholder="500 kg"
                          className="w-full bg-black/45 border border-white/10 h-12 min-h-[48px] pl-11 pr-4 text-xs rounded-xl focus:border-purple-500 text-white outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 col-span-1">
                      <label className="text-xs font-bold text-white/70 block break-words">Maximal hajmi (m³) *</label>
                      <div className="relative">
                        <BookOpen className="w-4.5 h-4.5 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input 
                          type="number" 
                          step="0.1" 
                          required 
                          value={volume} 
                          onChange={(e) => setVolume(e.target.value)}
                          placeholder="e.g. 3.5"
                          className="w-full bg-black/45 border border-white/10 h-12 min-h-[48px] pl-11 pr-4 text-xs rounded-xl focus:border-purple-500 text-white outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 col-span-1 md:col-span-2">
                      <label className="text-xs font-bold text-white/70 block break-words">Yuk kvitansiyasi / Hisobfaktura docs</label>
                      <input 
                        type="text" 
                        value={docs} 
                        onChange={(e) => setDocs(e.target.value)}
                        placeholder="Shartnoma #65-ABC (SaaS Invoice)"
                        className="w-full bg-black/45 border border-white/10 h-12 min-h-[48px] px-4 text-xs rounded-xl focus:border-purple-500 text-white outline-none"
                      />
                    </div>

                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-between">
                    <button
                      type="button"
                      onClick={() => setBookingStep(1)}
                      className="w-full sm:w-auto min-h-[48px] bg-white/5 hover:bg-white/10 text-white/70 font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-xl transition cursor-pointer"
                    >
                      Orqaga qaytish
                    </button>

                    <button
                      type="button"
                      disabled={!cargoType.trim() || !weight || !volume}
                      onClick={() => setBookingStep(3)}
                      className="w-full sm:w-auto min-h-[48px] bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-widest px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-purple-950/40"
                    >
                      <span>Keyingi bosqich</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* BOOKING STEP 3: VEHICLE CARD SELECTOR */}
              {bookingStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <h3 className="text-base sm:text-lg font-extrabold text-white">Bosqich 3: Avtotransport vositasi toifasini tanlash</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {FLEET_INFO.map((f) => {
                      const est = calculateEstimate(f.name, Number(estDistance));
                      const isSelected = vehicle === f.name;

                      return (
                        <div 
                          key={f.name}
                          onClick={() => setVehicle(f.name)}
                          className={`border rounded-2xl p-4 cursor-pointer transition flex flex-col justify-between ${
                            isSelected 
                              ? "bg-purple-650/25 border-purple-500 shadow-xl shadow-purple-950/30 ring-2 ring-purple-500/20" 
                              : "bg-black/30 border-white/5 hover:border-white/10"
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-extrabold text-sm text-white">{f.name}</span>
                              <span className="bg-purple-500/10 border border-purple-500/10 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded">
                                {f.capacity}
                              </span>
                            </div>
                            <p className="text-[11px] text-white/50 leading-relaxed font-sans">
                              {(f as any)[`${currentLang}Desc`] || f.desc}
                            </p>
                            <span className="text-[10px] block font-mono text-white/30">
                              {{
                                uz: "O'lchamlari",
                                en: "Dimensions",
                                ru: "Габариты",
                                tr: "Boyutlar",
                                ar: "الأبعاد",
                                zh: "货厢尺寸",
                                fr: "Dimensions",
                                de: "Abmessungen",
                                es: "Dimensiones",
                                pt: "Dimensões",
                                it: "Dimensioni"
                              }[currentLang] || "Dimensions"}: {f.dimensions}
                            </span>
                          </div>

                          <div className="pt-3 border-t border-white/5 mt-4 flex justify-between items-center">
                            <span className="text-[9px] text-white/30 uppercase font-mono">Book est list:</span>
                            <span className="font-bold text-xs text-green-400 font-mono">{est.toLocaleString()} UZS</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-between">
                    <button
                      type="button"
                      onClick={() => setBookingStep(2)}
                      className="w-full sm:w-auto min-h-[48px] bg-white/5 hover:bg-white/10 text-white/70 font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-xl transition cursor-pointer"
                    >
                      Orqaga qaytish
                    </button>

                    <button
                      type="button"
                      onClick={() => setBookingStep(4)}
                      className="w-full sm:w-auto min-h-[48px] bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-widest px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-purple-950/40"
                    >
                      <span>Keyingi bosqich</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* BOOKING STEP 4: DETAILS AND NOTES */}
              {bookingStep === 4 && (
                <div className="space-y-6 animate-fade-in">
                  <h3 className="text-base sm:text-lg font-extrabold text-white">Bosqich 4: Yuk jo'natuvchi va qabul qiluvchi telefon zvenolari</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

                    <div className="space-y-2 col-span-1">
                      <label className="text-xs font-bold text-white/70 block break-words">Yuk jo'natuvchi shaxsiy telefoni *</label>
                      <input 
                        type="text" 
                        required 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Masalan: +998 90 123 45 67"
                        className="w-full bg-black/45 border border-white/10 h-12 min-h-[48px] px-4 text-xs rounded-xl focus:border-purple-500 text-white outline-none font-mono"
                      />
                    </div>

                    <div className="space-y-2 col-span-1">
                      <label className="text-xs font-bold text-white/70 block break-words">Yuk qabul qiluvchi telefoni *</label>
                      <input 
                        type="text" 
                        required 
                        value={receiver} 
                        onChange={(e) => setReceiver(e.target.value)}
                        placeholder="Masalan: +998 94 987 65 43"
                        className="w-full bg-black/45 border border-white/10 h-12 min-h-[48px] px-4 text-xs rounded-xl focus:border-purple-500 text-white outline-none font-mono"
                      />
                    </div>

                    <div className="space-y-2 col-span-1 md:col-span-2">
                      <label className="text-xs font-bold text-white/70 block break-words">Haydovchi uchun maxsus eslatmalar, kommentariya</label>
                      <textarea 
                        value={comment} 
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Masalan: Yuk eshigini uchinchi korpus omboridan bering, yuklayotganda juda ehtiyot bo'ling..."
                        className="w-full bg-black/45 border border-white/10 p-3.5 text-xs rounded-xl h-24 focus:border-purple-500 text-white outline-none font-sans"
                      />
                    </div>

                    <div className="space-y-2 col-span-1 md:col-span-2">
                      <label className="text-xs font-bold text-white/70 block break-words">Hujjat yoki Yuk surati (URL manba manzili)</label>
                      <input 
                        type="text" 
                        value={image} 
                        onChange={(e) => setImage(e.target.value)}
                        placeholder="e.g. Havola: https://myimages.com/mycargo.png"
                        className="w-full bg-black/45 border border-white/10 h-12 min-h-[48px] px-4 text-xs rounded-xl focus:border-purple-500 text-white outline-none"
                      />
                    </div>

                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-between">
                    <button
                      type="button"
                      onClick={() => setBookingStep(3)}
                      className="w-full sm:w-auto min-h-[48px] bg-white/5 hover:bg-white/10 text-white/70 font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-xl transition cursor-pointer"
                    >
                      Orqaga qaytish
                    </button>

                    <button
                      type="button"
                      disabled={!phone.trim() || !receiver.trim()}
                      onClick={() => setBookingStep(5)}
                      className="w-full sm:w-auto min-h-[48px] bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-widest px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-purple-950/40"
                    >
                      <span>Keyingi bosqich</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* BOOKING STEP 5: REVIEW AND SELECT PAYMENT */}
              {bookingStep === 5 && (
                <div className="space-y-6 animate-fade-in">
                  <h3 className="text-base sm:text-lg font-extrabold text-white">Bosqich 5: Buyurtma sharhi va to'lov turlari</h3>
                  
                  <div className="bg-black/40 border border-white/5 p-5 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-white/40 block">Yuklash manzili (Pickup):</span>
                      <span className="font-semibold text-white mt-1 block">{pickup}</span>
                    </div>

                    <div>
                      <span className="text-white/40 block">Yetkazib berish manzili (Destination):</span>
                      <span className="font-semibold text-white mt-1 block">{delivery}</span>
                    </div>

                    <div>
                      <span className="text-white/40 block">Mashina turi & yuk tavsifi:</span>
                      <span className="font-semibold text-white mt-1 block font-mono text-purple-300">{vehicle} • {cargoType}</span>
                    </div>

                    <div>
                      <span className="text-white/40 block">Aloqa vakillari telefonlari:</span>
                      <span className="font-semibold text-white mt-1 block font-mono">Yuboruvchi: {phone} • Qabul qiluvchi: {receiver}</span>
                    </div>
                  </div>

                  {/* Payment selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/70 block break-words">Xavfsiz hisob-kitobni amalga oshirish turi *</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3.5">
                      
                      <div 
                        onClick={() => setPayment("cash")}
                        className={`border rounded-xl p-3.5 cursor-pointer text-center transition flex flex-col items-center justify-center min-h-[64px] ${
                          payment === "cash" ? "bg-purple-650/15 border-purple-500 text-purple-300 font-extrabold scale-102" : "bg-black/30 border-white/5 hover:border-white/10"
                        }`}
                      >
                        <span className="text-lg block">💵</span>
                        <span className="text-[10px] block mt-1 uppercase tracking-wider leading-none">Naqd pul</span>
                      </div>

                      <div 
                        onClick={() => setPayment("transfer")}
                        className={`border rounded-xl p-3.5 cursor-pointer text-center transition flex flex-col items-center justify-center min-h-[64px] ${
                          payment === "transfer" ? "bg-purple-650/15 border-purple-500 text-purple-300 font-extrabold scale-102" : "bg-black/30 border-white/5 hover:border-white/10"
                        }`}
                      >
                        <span className="text-lg block">🏢</span>
                        <span className="text-[10px] block mt-1 uppercase tracking-wider leading-none">Bank hisobi</span>
                      </div>

                      <div 
                        onClick={() => setPayment("click")}
                        className={`border rounded-xl p-3.5 cursor-pointer text-center transition flex flex-col items-center justify-center min-h-[64px] ${
                          payment === "click" ? "bg-purple-650/15 border-purple-500 text-purple-300 font-extrabold scale-102" : "bg-black/30 border-white/5 hover:border-white/10"
                        }`}
                      >
                        <span className="text-lg block">📲</span>
                        <span className="text-[10px] block mt-1 uppercase tracking-wider leading-none">Click</span>
                      </div>

                      <div 
                        onClick={() => setPayment("payme")}
                        className={`border rounded-xl p-3.5 cursor-pointer text-center transition flex flex-col items-center justify-center min-h-[64px] ${
                          payment === "payme" ? "bg-purple-650/15 border-purple-500 text-purple-300 font-extrabold scale-102" : "bg-black/30 border-white/5 hover:border-white/10"
                        }`}
                      >
                        <span className="text-lg block">📱</span>
                        <span className="text-[10px] block mt-1 uppercase tracking-wider leading-none">Payme</span>
                      </div>

                      <div 
                        onClick={() => setPayment("xazna")}
                        className={`border rounded-xl p-3.5 cursor-pointer text-center transition flex flex-col items-center justify-center min-h-[64px] col-span-2 sm:col-span-1 ${
                          payment === "xazna" ? "bg-purple-500/15 border-purple-500 text-purple-300 font-extrabold scale-102" : "bg-black/30 border-white/5 hover:border-white/10"
                        }`}
                      >
                        <span className="text-lg block">🏦</span>
                        <span className="text-[10px] block mt-1 uppercase tracking-wider leading-none">Xazna</span>
                      </div>

                    </div>
                  </div>

                  {/* Freight Minimum & AI Fair Price Guarantee */}
                  <div className="p-4 bg-purple-950/30 border border-purple-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-base shrink-0">
                        🛡️
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">Minimal yuk tashish standarti: 15,000,000 UZS</span>
                        <span className="text-[10px] text-white/50 block">YukLa platformasida har bir buyurtma kafolatlangan tijoriy minimal tarifga ega.</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCalculateAIFairPrice}
                      disabled={calculatingAIPricing}
                      className="w-full sm:w-auto min-h-[40px] px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition cursor-pointer disabled:opacity-50"
                    >
                      <span>🤖 {calculatingAIPricing ? "Hisoblanmoqda..." : "AI Fair Price Hisoblash"}</span>
                    </button>
                  </div>

                  {/* AI Pricing Breakdown Card if computed */}
                  {aiPricingBreakdown && (
                    <div className="p-4 bg-black/40 border border-purple-500/20 rounded-2xl space-y-3 animate-fade-in text-xs">
                      <div className="flex justify-between items-center pb-2 border-b border-white/5 font-mono">
                        <span className="text-purple-300 font-bold">AI Adolatli Narxlash Hisoboti:</span>
                        <span className="text-emerald-400 font-black">{aiPricingBreakdown.fairPrice.toLocaleString()} UZS</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                        <div className="bg-white/5 p-2 rounded-lg">
                          <span className="text-white/40 block text-[9px]">Masofa to'lovi:</span>
                          <span className="text-white font-bold">{aiPricingBreakdown.breakdown?.distanceFee?.toLocaleString()} UZS</span>
                        </div>
                        <div className="bg-white/5 p-2 rounded-lg">
                          <span className="text-white/40 block text-[9px]">Yoqilg'i narxi:</span>
                          <span className="text-amber-400 font-bold">{aiPricingBreakdown.breakdown?.fuelSurcharge?.toLocaleString()} UZS</span>
                        </div>
                        <div className="bg-white/5 p-2 rounded-lg">
                          <span className="text-white/40 block text-[9px]">Haydovchi ulushi:</span>
                          <span className="text-green-400 font-bold">{aiPricingBreakdown.breakdown?.driverEarnings?.toLocaleString()} UZS</span>
                        </div>
                        <div className="bg-white/5 p-2 rounded-lg">
                          <span className="text-white/40 block text-[9px]">Tizim komissiyasi (5%):</span>
                          <span className="text-purple-300 font-bold">{aiPricingBreakdown.breakdown?.platformCommission?.toLocaleString()} UZS</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Costs and booking action trigger */}
                  <div className="p-5 bg-gradient-to-r from-purple-950/20 to-indigo-950/20 border border-purple-500/10 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <span className="text-[9px] text-[#dda15e] uppercase tracking-widest block font-mono">Tasdiqlangan umumiy hisob:</span>
                      <p className="text-xl sm:text-2xl font-black text-white font-mono mt-1">
                        {(overridePrice || calculatedPrice).toLocaleString()} UZS
                      </p>
                      <span className="text-[10px] text-white/40 block mt-0.5 font-sans">Barcha brokerlik, komissiya, soliq va xizmat kafolatlari kiritilgan.</span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setBookingStep(4)}
                        className="w-full sm:w-auto min-h-[48px] bg-white/5 hover:bg-white/10 text-white/80 font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-xl transition cursor-pointer"
                      >
                        Tuzatish
                      </button>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto min-h-[48px] bg-[#9d4edd] hover:bg-[#8338ec] disabled:opacity-40 text-white font-extrabold text-xs uppercase tracking-widest px-8 py-3.5 rounded-xl shadow-lg shadow-purple-900/30 transition cursor-pointer flex items-center justify-center"
                      >
                        {loading ? "Birjaga yozilmoqda..." : "Buyurtmani birjaga chiqarish"}
                      </button>
                    </div>
                  </div>

                </div>
              )}

            </form>
          </div>
        )}

        {/* ====================================================
           TAB VIEW 3: LIVE TRACKING SIMULATOR PORTAL
           ==================================================== */}
        {activeTab === "track" && (
          <div className="space-y-8 animate-fade-in font-sans">
            
            {/* If has tracking selection, render the full detailed screen */}
            {selectedTrackingOrder ? (
              <div id="shipper_live_tracking_map_console" className="bg-[#120b2e]/30 border border-purple-500/15 rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none"></div>

                <div className="flex justify-between items-start pb-4 border-b border-white/5 gap-3">
                  <div className="space-y-1">
                    <span className="px-3 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] uppercase font-bold tracking-widest animate-pulse inline-block">
                      Mijoz uchun xaritada jonli kuzatish
                    </span>
                    <h3 className="text-xl font-bold text-white">Buyurtma #{selectedTrackingOrder.id.substr(0, 8).toUpperCase()}</h3>
                  </div>

                  <button 
                    onClick={() => setSelectedTrackingOrder(null)}
                    className="text-white/50 hover:text-white bg-white/5 px-3.5 py-2 border border-white/5 rounded-2xl transition text-xs"
                  >
                    Kuzatishni yopish
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
                  
                  {/* Left core credentials */}
                  <div className="space-y-6">
                    
                    <div className="bg-black/30 p-4 border border-white/5 rounded-2xl space-y-3">
                      <p className="text-[10.5px] text-white/30 uppercase font-black font-mono tracking-wider">Tasdiqlangan tashuvchi drayver:</p>
                      {selectedTrackingOrder.driverName ? (
                        <>
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center font-bold text-white">
                              {selectedTrackingOrder.driverName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-extrabold text-white text-sm leading-none">{selectedTrackingOrder.driverName}</p>
                              <span className="text-[10px] text-purple-400 block font-mono mt-1">{selectedTrackingOrder.driverPhone || "+998 90 321 09 87"}</span>
                            </div>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setActiveChatOrderId(selectedTrackingOrder.id)}
                            className="w-full mt-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-2 rounded-xl transition flex items-center justify-center gap-1.5"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Chat (Xabar almashish)</span>
                          </button>
                        </>
                      ) : (
                        <div className="text-yellow-500 font-semibold text-xs flex items-center gap-1.5 animate-pulse pt-1">
                          <Clock className="w-4 h-4" />
                          <span>Hali haydovchi birjadan qabul qilmadi. Operatorlarimiz yukni taklif qilishmoqda</span>
                        </div>
                      )}
                    </div>

                    <div className="bg-black/30 p-4 border border-white/5 rounded-2xl space-y-4 font-sans text-xs">
                      <p className="text-[10.5px] text-white/30 uppercase font-black font-mono tracking-wider">Yo'nalish va transport ma'lumotlari:</p>
                      
                      <div className="space-y-2 leading-relaxed">
                        <p className="text-white/80"><span className="text-emerald-400 font-bold font-mono">Yuklash nuqtasi:</span> {selectedTrackingOrder.pickupAddress}</p>
                        <p className="text-white/80"><span className="text-purple-400 font-bold font-mono">Topshirish manzili:</span> {selectedTrackingOrder.deliveryAddress}</p>
                        <p className="text-white/80"><span className="text-white/40 block mt-1">Avtotransport toifasi: {selectedTrackingOrder.vehicleType} yuk mashinasi</span></p>
                      </div>

                      <div className="p-3 bg-white/5 rounded-xl text-xs space-y-1 border border-white/5">
                        <p className="font-semibold text-white">{selectedTrackingOrder.cargoType}</p>
                        <span className="text-[10.5px] text-white/40 block mt-0.5">Vazn parametrlari: {selectedTrackingOrder.weight} kg • {selectedTrackingOrder.volume} m³</span>
                      </div>
                    </div>

                  </div>

                  {/* Right map visual coordinates */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    <div className="space-y-1">
                      <span className="text-[10px] text-white/30 uppercase font-mono tracking-widest">Oqim Progress Shkalasi:</span>
                      <div className="relative pt-3">
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full animate-pulse"
                            style={{
                              width: selectedTrackingOrder.status === OrderStatus.PENDING ? "15%" :
                                     selectedTrackingOrder.status === OrderStatus.ACCEPTED ? "45%" :
                                     selectedTrackingOrder.status === OrderStatus.IN_TRANSIT ? "75%" :
                                     selectedTrackingOrder.status === OrderStatus.DELIVERED ? "100%" : "0%"
                            }}
                          ></div>
                        </div>

                        <div className="flex justify-between text-[10px] font-mono mt-3 text-white/40">
                          <span className={selectedTrackingOrder.status === OrderStatus.PENDING ? "text-yellow-500 font-extrabold" : ""}>Birjada</span>
                          <span className={selectedTrackingOrder.status === OrderStatus.ACCEPTED ? "text-cyan-400 font-extrabold" : ""}>Accepted</span>
                          <span className={selectedTrackingOrder.status === OrderStatus.IN_TRANSIT ? "text-purple-400 font-extrabold" : ""}>In Transit</span>
                          <span className={selectedTrackingOrder.status === OrderStatus.DELIVERED ? "text-green-400 font-extrabold" : ""}>Completed ✅</span>
                        </div>
                      </div>
                    </div>

                    {/* Animated visual transit canvas mock chart */}
                    <div className="h-64 bg-black/60 border border-white/5 rounded-3xl flex flex-col justify-between p-6 relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(#2d1b54_1.5px,transparent_1.5px)] [background-size:20px_20px] opacity-25"></div>
                      
                      {/* Grid background effect */}
                      <div className="absolute top-4 left-4 font-mono text-[9px] text-white/10">GPS GATEWAY: ONLINE</div>
                      
                      <div className="flex items-center justify-around relative z-10 w-full h-full">
                        <div className="text-center font-sans">
                          <span className="text-2xl block animate-pulse">🏢</span>
                          <p className="text-[11px] font-black text-white mt-1 leading-none">Pickup Sklad</p>
                          <span className="text-[9px] text-white/30 block mt-1">Start point</span>
                        </div>

                        {/* Dashed trajectory vector representation */}
                        <div className="flex-1 border-t-2 border-dashed border-purple-500/20 relative h-1 mx-4">
                          <div 
                            className="absolute -top-4 text-3xl font-bold animate-bounce transition-all duration-1000"
                            style={{
                              left: selectedTrackingOrder.status === OrderStatus.PENDING ? "10%" :
                                    selectedTrackingOrder.status === OrderStatus.ACCEPTED ? "40%" :
                                    selectedTrackingOrder.status === OrderStatus.IN_TRANSIT ? "70%" : "90%"
                            }}
                          >
                            🚚
                          </div>
                        </div>

                        <div className="text-center">
                          <span className="text-2xl block">📍</span>
                          <p className="text-[11px] font-black text-white mt-1 leading-none">Destination</p>
                          <span className="text-[9px] text-white/30 block mt-1">Mijoz manzili</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center z-10 pt-2 border-t border-white/5">
                        <span className="text-[10px] text-white/30 font-mono">Sensor koordinatalari aniqlangan</span>
                        <span className="text-xs text-purple-400 font-bold font-mono">ETA: {
                          selectedTrackingOrder.status === OrderStatus.PENDING ? "Haydovchi qabulini kutmoqda" :
                          selectedTrackingOrder.status === OrderStatus.ACCEPTED ? "Haydovchi yuklash punktiga kelmoqda" :
                          selectedTrackingOrder.status === OrderStatus.IN_TRANSIT ? "Yo'nalishda • 35 daqiqa qoldi" : "Yetkazildi!"
                        }</span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-[#120b2e]/40 border border-dashed border-purple-500/20 rounded-3xl p-12 text-center space-y-3">
                <Compass className="w-12 h-12 text-purple-400/40 mx-auto animate-spin" />
                <h3 className="font-extrabold text-base">Hozirda kuzatilayotgan yuk buyurtmasi yo'q</h3>
                <p className="text-white/40 text-xs max-w-sm mx-auto">
                  Tashuvchi drayverning yo'nalish harakatini real vaqtda kuzatish hamda GPS sensorini ochish uchun quyidagi so'nggi yuk tashuvlar ro'yxatidan "Kuzatish" tugmasini bosing
                </p>
                
                <div className="pt-4">
                  <button 
                    onClick={() => setActiveTab("hub")}
                    className="bg-purple-600/15 border border-purple-500/25 hover:bg-purple-650/30 text-purple-300 text-xs font-bold px-4 py-2.5 rounded-xl uppercase transition cursor-pointer"
                  >
                    Asosiy Dashbordga qaytish
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ====================================================
           TAB VIEW 4: TRANSACTION HISTORY
           ==================================================== */}
        {activeTab === "history" && (
          <div className="bg-[#120b2e]/30 border border-white/10 rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden animate-fade-in font-sans">
            <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-6">
              <div>
                <h3 className="text-base font-black text-white">Hamkorlik Amaliyotlar Jurnali (Order History Ledger)</h3>
                <p className="text-[11px] text-white/40">Zvenolardan olingan va kiritilgan barcha yuk tashuv turlari ro'yxati</p>
              </div>
              <span className="bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono px-3 py-1.5 rounded-xl font-bold uppercase">
                {orders.length} buyurtmalar
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-16 text-xs text-white/30 border border-dashed border-white/5 rounded-2xl">
                Amaliyotlar jurnali bo'sh
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="border-b border-white/10 text-white/40 uppercase font-mono tracking-wider text-[9.5px]">
                      <th className="py-3 px-4 font-normal">Buyurtma ID</th>
                      <th className="py-3 px-4 font-normal">Mashina / Yuk Toifasi</th>
                      <th className="py-3 px-4 font-normal">Yuklash / Topshirish Mansili</th>
                      <th className="py-3 px-4 font-normal">Og'irligi</th>
                      <th className="py-3 px-4 font-normal">Narx & to'lov statusi</th>
                      <th className="py-3 px-4 font-normal text-right">Amal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/80">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-white/5 transition duration-150">
                        <td className="py-4 px-4 font-bold text-purple-400 font-mono">
                          <div>#{ord.id.substr(0, 8).toUpperCase()}</div>
                          {(ord.isArchived || ord.status === OrderStatus.DELIVERED || ord.status === OrderStatus.COMPLETED) && (
                            <span className="inline-flex items-center gap-1 text-[8.5px] uppercase font-bold text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 px-1.5 py-0.5 rounded-md mt-1">
                              Arxiv
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-extrabold text-white leading-tight">{ord.cargoType}</p>
                          <span className="text-[9.5px] text-white/40 mt-0.5 block">{ord.vehicleType}</span>
                        </td>
                        <td className="py-4 px-4">
                          <p className="truncate max-w-[150px]"><span className="text-purple-400 font-bold mr-1 font-mono text-[9.5px]">A:</span>{ord.pickupAddress}</p>
                          <p className="truncate max-w-[150px] mt-1"><span className="text-fuchsia-400 font-bold mr-1 font-mono text-[9.5px]">B:</span>{ord.deliveryAddress}</p>
                        </td>
                        <td className="py-4 px-4 font-mono text-white/60">
                          {ord.weight} kg • {ord.volume} m³
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-extrabold text-white font-mono">{ord.price?.toLocaleString()} UZS</p>
                          <span className={`text-[9px] mt-1 inline-flex items-center gap-1 uppercase font-extrabold tracking-wider ${
                            ord.paymentStatus === "paid" ? "text-green-400" : "text-yellow-405"
                          }`}>
                            💳 {ord.paymentMethod?.toUpperCase()} ({ord.paymentStatus === "paid" ? "Paid" : "Unpaid"})
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end gap-2.5">
                            {(!ord.paymentStatus || ord.paymentStatus === "unpaid" || ord.paymentStatus === "failed" || ord.paymentStatus === "pending") && 
                             ["click", "payme", "xazna"].includes(ord.paymentMethod || "") && (
                              <button 
                                onClick={() => handleStartCheckout(ord)}
                                className="bg-green-600 hover:bg-green-500 text-white font-black text-[9.5px] uppercase tracking-wider px-3 py-1.5 rounded-xl transition"
                              >
                                To'lash
                              </button>
                            )}

                            {(ord.status === "Delivered" || ord.status === "In Transit" || ord.status === "Customer Confirmation") && (
                              <button 
                                onClick={() => {
                                  setConfirmDeliveryModalOrder(ord);
                                  setConfirmMethod("direct");
                                  setConfirmOtp("");
                                  setSignatureData("");
                                  setConfirmRating(5);
                                  setConfirmFeedback("");
                                  setInvoiceReady(null);
                                }}
                                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-[9.5px] uppercase tracking-wider px-3.5 py-1.5 rounded-xl transition shadow-[0_0_12px_rgba(16,185,129,0.3)] cursor-pointer"
                              >
                                Tasdiqlash & To'lash 💸
                              </button>
                            )}

                            {ord.status === "Completed" && (
                              <span className="text-emerald-400 font-bold text-[10px] uppercase border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 rounded-xl">
                                Tugallandi ✓
                              </span>
                            )}

                            <button 
                              onClick={() => triggerTraceMode(ord)}
                              className="bg-white/5 hover:bg-[#8338ec]/20 hover:text-purple-300 transform duration-155 px-3 py-1.5 rounded-xl border border-white/5"
                            >
                              Kuzatish
                            </button>
                          </div>
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
           TAB VIEW: ENTERPRISE B2B TENDERS & RFQ MARKETPLACE
           ==================================================== */}
        {activeTab === "tenders" && (
          <div className="animate-fade-in">
            <EnterpriseTendersHub
              currentLang={currentLang}
              token={token}
              user={user}
              onRefresh={onRefreshOrders}
            />
          </div>
        )}

        {/* ====================================================
           TAB VIEW: BACKHAUL DUAL-HOP ROUTE OPTIMIZER (AI)
           ==================================================== */}
        {activeTab === "backhaul" && (
          <div className="animate-fade-in">
            <BackhaulOptimizerHub
              currentLang={currentLang}
              token={token}
              user={user}
            />
          </div>
        )}

        {/* ====================================================
           TAB VIEW: SILK ROAD CORRIDORS & CROSS-BORDER CUSTOMS
           ==================================================== */}
        {activeTab === "silkroad" && (
          <div className="animate-fade-in">
            <SilkRoadCorridorHub
              currentLang={currentLang}
              token={token}
              user={user}
            />
          </div>
        )}

        {/* ====================================================
           TAB VIEW 5: SAVED ADDRESSES SECTION (LOCAL STORAGE PERSISTED)
           ==================================================== */}
        {activeTab === "addresses" && (
          <div className="bg-[#120b2e]/30 border border-white/10 rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden animate-fade-in font-sans">
            <div className="absolute top-0 right-0 w-80 h-80 bg-fuchsia-500/5 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-white/5 mb-6 gap-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <MapPin className="w-4.5 h-4.5 text-fuchsia-400" />
                  <span>Tezkor Yuklash va yetkazish manzillari ombori</span>
                </h3>
                <p className="text-[11px] text-white/40">Yo'nalish formida takroran ishlatiladigan manzillar jurnali</p>
              </div>

              <button 
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition duration-150 cursor-pointer shadow"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Yangi manzil yozish</span>
              </button>
            </div>

            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="bg-black/40 border border-white/5 p-5 rounded-2xl space-y-4 animate-fade-in text-xs leading-relaxed">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-white/60">Manzil nomi (e.g. Asosiy sklad, Sergeli do'kon) *</label>
                    <input 
                      type="text" 
                      required 
                      value={newAddrLabel} 
                      onChange={(e) => setNewAddrLabel(e.target.value)}
                      placeholder="Sergeli 5-blok omborxona"
                      className="w-full bg-black/45 border border-white/10 h-10 px-3.5 text-xs rounded-xl focus:border-purple-500 text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-white/60">Kommentariya / Eslatma bo'limi</label>
                    <input 
                      type="text" 
                      value={newAddrNotes} 
                      onChange={(e) => setNewAddrNotes(e.target.value)}
                      placeholder="Darvozaning o'ng taraf eshigi, qorovul Qobiljon aka"
                      className="w-full bg-black/45 border border-white/10 h-10 px-3.5 text-xs rounded-xl focus:border-purple-500 text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1 col-span-2">
                    <label className="font-bold text-white/60">Mukammal manzil matni *</label>
                    <div className="relative">
                      <MapPin className="w-4.5 h-4.5 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        required 
                        value={newAddrVal} 
                        onChange={(e) => setNewAddrVal(e.target.value)}
                        placeholder="Toshkent shahri, Sergeli tumani, Do'stlik ko'chasi 16"
                        className="w-full bg-black/45 border border-white/10 h-10 pl-10 pr-4 text-xs rounded-xl focus:border-purple-500 text-white outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    type="submit" 
                    className="bg-purple-650 hover:bg-purple-505 text-white font-bold px-5 py-2.5 rounded-xl transition"
                  >
                    Saqlash
                  </button>

                  <button 
                    type="button" 
                    onClick={() => setShowAddressForm(false)} 
                    className="bg-white/5 hover:bg-white/10 text-white/70 font-bold px-4 py-2.5 rounded-xl transition"
                  >
                    Bekor qilish
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {savedAddresses.map((addr) => (
                <div key={addr.id} className="bg-black/30 border border-white/5 hover:border-purple-500/20 rounded-2xl p-4 flex justify-between items-start gap-3 transition">
                  <div className="space-y-1 text-xs leading-relaxed">
                    <span className="font-black text-sm text-purple-300 flex items-center gap-1.5">
                      <Locate className="w-4 h-4 text-purple-450" />
                      {addr.label}
                    </span>
                    <p className="text-white/80 font-medium pl-5 mt-1">{addr.address}</p>
                    {addr.notes && <p className="text-[11px] text-[#dda15e] italic pl-5 mt-1">"{addr.notes}"</p>}
                  </div>

                  <button 
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 p-2 rounded-xl transition"
                    title="Manzilni o'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ====================================================
           TAB VIEW 6: MENING KASSA & HAMYONIM (PAYMENTS INDEX)
           ==================================================== */}
        {activeTab === "payments" && (
          <div className="bg-[#120b2e]/30 border border-white/10 rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden animate-fade-in font-sans">
            <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/5 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-6">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-450" />
                  <span>Mening Kassa & Hamyonim</span>
                </h3>
                <p className="text-[11px] text-white/40">Sizning Click, Payme hamyonlaridagi real logistika to'lovlari hisob-fakturalari reyestri</p>
              </div>
              <span className="bg-teal-500/10 border border-teal-500/25 text-teal-400 font-mono text-xs px-3 py-1.5 rounded-xl font-bold">
                Online Checkout audit
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans text-xs">
              <div className="bg-black/35 p-5 rounded-2xl border border-white/5">
                <span className="text-white/40 uppercase font-bold text-[9.5px]">Online transaksiyalar</span>
                <p className="text-xl font-black text-white mt-1.5">{paymentHistory.length} ta</p>
                <p className="text-[10px] text-purple-300 block mt-1 font-mono">Barcha billing hamyonlari</p>
              </div>

              <div className="bg-black/35 p-5 rounded-2xl border border-white/5">
                <span className="text-white/40 uppercase font-bold text-[9.5px]">Muvaffaqiyatli drayvlar</span>
                <p className="text-xl font-black text-green-400 mt-1.5">
                  {paymentHistory.filter(pm => pm.status === "Paid").length} ta
                </p>
                <p className="text-[10px] text-green-400/80 mt-1 font-semibold block leading-none">To'liq to'langan ✅</p>
              </div>

              <div className="bg-black/35 p-5 rounded-2xl border border-white/5">
                <span className="text-white/40 uppercase font-bold text-[9.5px]">Hamyon to'lov balansi (Paid)</span>
                <p className="text-xl font-black text-white font-mono mt-1.5">
                  {paymentHistory.filter(pm => pm.status === "Paid").reduce((acc, current) => acc + current.amount, 0).toLocaleString()} UZS
                </p>
                <p className="text-[10px] text-white/40 block mt-1">Platforma tasdiqlangan onlayn to'lovlari</p>
              </div>
            </div>

            <div className="overflow-x-auto pt-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-white/40 uppercase font-mono tracking-widest text-[9.5px]">
                    <th className="py-3 px-4 font-normal">Tranzaksiya (TX) ID</th>
                    <th className="py-3 px-4 font-normal">Buyurtma ID</th>
                    <th className="py-3 px-4 font-normal text-right">To'lov Tizimi</th>
                    <th className="py-3 px-4 font-normal">Sana</th>
                    <th className="py-3 px-4 font-normal text-right">Summa Qiymat</th>
                    <th className="py-3 px-4 font-normal text-right">Holati</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80 font-sans">
                  {paymentHistory.map((pm) => (
                    <tr key={pm.id} className="hover:bg-white/5 transition">
                      <td className="py-4 px-4 font-mono font-bold text-slate-300 select-all">{pm.id}</td>
                      <td className="py-4 px-4 font-mono text-purple-300">#{pm.orderId.substr(0, 8)}</td>
                      <td className="py-4 px-4 text-right uppercase font-extrabold font-mono text-indigo-400">{pm.paymentMethod}</td>
                      <td className="py-4 px-4 font-mono text-white/40 text-[10.5px]">{new Date(pm.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 px-4 text-right font-bold text-white font-mono">{pm.amount.toLocaleString()} UZS</td>
                      <td className="py-4 px-4 text-right">
                        <span className={`px-2 py-0.5 rounded text-[9.5px] uppercase font-bold tracking-wider ${
                          pm.status === "Paid" ? "bg-green-500/10 text-green-400 border border-green-500/15" : "bg-purple-500/10 text-purple-400"
                        }`}>
                          {pm.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ====================================================
           TAB VIEW 7: PROFILE SETTINGS
           ==================================================== */}
        {activeTab === "profile" && (
          <div className="bg-[#120b2e]/30 border border-white/10 rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden animate-fade-in font-sans">
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-650/5 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="pb-4 border-b border-white/5 mb-6">
              <h3 className="text-base font-black text-white">Hisob Sozlamalari & Passport</h3>
              <p className="text-[11px] text-white/40">Sizning shaxsiy jo'natuvchi profilingiz tahrirlari</p>
            </div>

            {profileSuccess && (
              <div className="p-4 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-xl font-semibold text-xs leading-relaxed mb-6">
                ✅ {profileSuccess}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-6">
              
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/5">
                <div className="relative">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Upload draft" className="w-20 h-20 rounded-2xl object-cover border-2 border-purple-500" />
                  ) : (
                    <div className="w-20 h-20 bg-zinc-800 rounded-2xl flex items-center justify-center font-black text-xs text-white/40">No photo</div>
                  )}
                  <label className="absolute -bottom-1 -right-1 bg-purple-600 hover:bg-purple-500 cursor-pointer h-7 w-7 rounded-lg flex items-center justify-center border border-white/10 shadow-lg" title="Rasm yuklash">
                    <span className="text-xs font-bold font-mono">+</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>

                <div className="space-y-1 text-center sm:text-left leading-snug">
                  <h4 className="font-bold text-sm text-white">Shaxsiy Profilingiz surati</h4>
                  <p className="text-white/40 text-[11px]">Kompyuter yoki smartfondan yangi tasvirni biriktiring.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed text-xs">
                
                <div className="space-y-1.5">
                  <label className="font-bold text-white/60 block">Ism Sharifingiz (Full name) *</label>
                  <input 
                    type="text" 
                    required 
                    value={profileName} 
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-black/45 border border-white/10 h-11 px-3.5 rounded-xl focus:border-purple-500 text-white outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-white/60 block">Telefon raqam *</label>
                  <input 
                    type="text" 
                    required 
                    value={profilePhone} 
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full bg-black/45 border border-white/10 h-11 px-3.5 rounded-xl focus:border-purple-500 text-white outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-white/60 block">Elektron pochta (Email) *</label>
                  <input 
                    type="email" 
                    required 
                    value={profileEmail} 
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full bg-black/45 border border-white/10 h-11 px-3.5 rounded-xl focus:border-purple-500 text-white outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-white/60 block">Hududiy viloyat markazi</label>
                  <select 
                    value={profileRegion} 
                    onChange={(e) => setProfileRegion(e.target.value)}
                    className="w-full bg-black/45 border border-white/10 h-11 px-3.5 rounded-xl focus:border-purple-500 text-white outline-none cursor-pointer font-bold select"
                  >
                    <option value="Toshkent shahar">Toshkent shahar</option>
                    <option value="Toshkent viloyati">Toshkent viloyati</option>
                    <option value="Samarqand viloyati">Samarqand viloyati</option>
                    <option value="Farg'ona viloyati">Farg'ona viloyati</option>
                    <option value="Andijon viloyati">Andijon viloyati</option>
                    <option value="Buxoro viloyati">Buxoro viloyati</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-white/60 block">Shahar / Tumaniy manzil</label>
                  <input 
                    type="text" 
                    value={profileCity} 
                    onChange={(e) => setProfileCity(e.target.value)}
                    className="w-full bg-black/45 border border-white/10 h-11 px-3.5 rounded-xl focus:border-purple-500 text-white outline-none"
                  />
                </div>

              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="bg-purple-600 hover:bg-purple-500 hover:scale-[1.02] text-white font-extrabold text-xs uppercase tracking-widest px-8 py-4 rounded-xl shadow transition cursor-pointer"
                >
                  {profileLoading ? "Saqlanmoqda..." : "Profilni yangilash"}
                </button>
              </div>

            </form>
          </div>
        )}

        {activeTab === "permissions" && (
          <PermissionsManagerTab />
        )}

        {/* ====================================================
           TAB VIEW 8: SUPPORT & ACCORDION FAQS SYSTEM
           ==================================================== */}
        {activeTab === "help" && (
          <div className="bg-[#120b2e]/30 border border-white/10 rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden animate-fade-in font-sans">
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-650/5 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="pb-4 border-b border-white/5 mb-6">
              <h3 className="text-base font-black text-white flex items-center gap-1.5">
                <HelpCircle className="w-5 h-5 text-purple-400" />
                <span>Mijozlarni Qo'llab-quvvatlash bo'limi</span>
              </h3>
              <p className="text-[11px] text-white/40">Sizda yuklar, hisob-kitoblar yoki haydovchilar bilan bog'liq savollar bormi?</p>
            </div>

            {/* Quick contacts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6 border-b border-white/5 font-sans leading-relaxed text-xs">
              <div className="bg-black/35 p-4 rounded-2xl border border-white/5">
                <p className="font-black text-white flex items-center gap-1">
                  <Phone className="w-4.5 h-4.5 text-purple-400 inline" />
                  <span>Tekor call call-center:</span>
                </p>
                <p className="text-sm font-extrabold text-purple-350 font-mono mt-1">+998 71 200 66 00</p>
                <span className="text-[10px] text-white/30 block mt-1">Sutka davomida 24/7 ishlaydi</span>
              </div>

              <div className="bg-black/35 p-4 rounded-2xl border border-white/5">
                <p className="font-black text-white flex items-center gap-1">
                  <Mail className="w-4.5 h-4.5 text-purple-400 inline" />
                  <span>Elektron pochta aloqalari:</span>
                </p>
                <p className="text-sm font-extrabold text-purple-350 font-mono mt-1">support@yukla.uz</p>
                <span className="text-[10px] text-white/30 block mt-1">Bizga istalgan fikringizni yozib yuboring</span>
              </div>
            </div>

            {/* Simulated interactive FAQ accordion */}
            <div className="space-y-4 pt-4">
              <h4 className="font-extrabold text-sm text-white">Ko'p beriladigan savollar (FAQ)</h4>
              
              <div className="border border-white/5 rounded-2xl p-4 bg-black/40 space-y-1.5 leading-snug">
                <p className="font-extrabold text-purple-300 text-xs text-purple-400">❓ 1. Buyurtmaning narxi qanday shakllanadi?</p>
                <p className="text-[11px] text-white/60 leading-relaxed font-sans">
                  Mashina toifasining start asosi portali hamda bosib o'tish masofa ko'rsatkichiga qarab tizim drayveri avtomatik aqlli narx hisobini qilib beradi. Boshqa maxfiy soliqlardan holi.
                </p>
              </div>

              <div className="border border-white/5 rounded-2xl p-4 bg-black/40 space-y-1.5 leading-snug">
                <p className="font-extrabold text-purple-300 text-xs text-purple-400">❓ 2. Drayver haydovchini yo'lda qanday kuzatish shart?</p>
                <p className="text-[11px] text-white/60 leading-relaxed font-sans">
                  "Dashboard" yoki "Amaliyotlar jurnali" ro'yxatidan "Kuzatish" drayverini bosishingiz kifoya. Xarita tahlil shkalasida uning hozirgi yo'nalish harakati koordinatalarini simulyatsiya ko'rsatiladi.
                </p>
              </div>

              <div className="border border-white/5 rounded-2xl p-4 bg-black/40 space-y-1.5 leading-snug">
                <p className="font-extrabold text-purple-300 text-xs text-purple-400">❓ 3. Click, Payme hamyon to'lovlari hisobi xavfsizligi?</p>
                <p className="text-[11px] text-white/60 leading-relaxed">
                  Barcha bank tranzaksiyalarimiz OTP kodi orqali tasdiqlangan holda amalga oshiriladi. Ma'lumotlaringiz SSL va kiber sertifikatlar orqali mutlaq himoyalangan.
                </p>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* SECURE ONLINE PAYMENT GATEWAY CHECKOUT OVERLAY (Click, Payme, Xazna) */}
      {selectedCheckoutOrder && (
        <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="bg-[#0b0518] border border-white/10 rounded-3xl p-6 lg:p-8 max-w-lg w-full relative shadow-2xl overflow-hidden text-xs text-left">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 blur-[60px] rounded-full pointer-events-none"></div>

            <button
              onClick={() => {
                setSelectedCheckoutOrder(null);
                setCheckoutProvider(null);
                setPaymentError("");
              }}
              className="absolute top-4 right-4 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 h-8 w-8 rounded-full flex items-center justify-center cursor-pointer text-xl font-bold"
            >
              &times;
            </button>

            {/* Step 1: Card Entry Information */}
            {checkoutStep === "card_entry" && (
              <div className="space-y-6">
                <div className="text-center space-y-1">
                  <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest block font-mono">
                    {checkoutProvider?.toUpperCase()} Milliy To'lov Shlyuzi
                  </span>
                  <h3 className="text-xl font-black text-white">Xavfsiz Tranzaksiya To'lovi</h3>
                  <p className="text-white/40 text-[11px]">YukLa billing xizmati orqali to'g'ridan-to'g'ri xavfsiz to'lash.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 grid grid-cols-2 gap-y-2 gap-x-4 text-xs leading-relaxed">
                  <span className="text-white/40">Buyurtma ID:</span>
                  <span className="text-right font-bold font-mono text-purple-400">#{selectedCheckoutOrder.id.substr(0, 8).toUpperCase()}</span>
                  <span className="text-white/40 font-sans">Yo'nalish:</span>
                  <span className="text-right truncate max-w-[150px] inline-block font-semibold text-white/80">{selectedCheckoutOrder.pickupAddress.split(",")[0]} &rarr; {selectedCheckoutOrder.deliveryAddress.split(",")[0]}</span>
                  <span className="text-white/40 font-bold block">Ushbu buyurtma to'lov summasi:</span>
                  <span className="text-right font-black text-green-400 font-mono text-sm">{selectedCheckoutOrder.price?.toLocaleString()} UZS</span>
                </div>

                {paymentError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl font-semibold leading-relaxed">
                    ⚠️ {paymentError}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1 bg-transparent">
                    <label className="text-xs text-white/70 font-semibold block">Karta raqami (16 xonali) *</label>
                    <div className="relative bg-transparent">
                      <CreditCard className="w-4.5 h-4.5 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        maxLength={19}
                        placeholder="8600 0000 0000 0000 (UzCard / Humo)"
                        value={cardNumber}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, "");
                          const matches = raw.match(/\d{4,16}/g);
                          const match = (matches && matches[0]) || "";
                          const parts = [];
                          for (let i = 0, len = match.length; i < len; i += 4) {
                            parts.push(match.substring(i, i + 4));
                          }
                          setCardNumber(parts.length > 0 ? parts.join(" ") : raw);
                        }}
                        className="w-full bg-black/45 border border-white/10 h-11 pl-10 pr-4 text-xs rounded-xl focus:border-purple-500 text-white outline-none font-mono"
                      />
                    </div>
                    {cardNumber.replace(/\s+/g, "").length >= 4 && (
                      <span className="text-[10px] text-purple-400 italic block mt-1 font-semibold">
                        Karta provayderi: {getCardIconLabel(cardNumber)}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-transparent">
                    <div className="space-y-1">
                      <label className="text-xs text-white/70 font-semibold block">Muddati (MM/YY) *</label>
                      <input
                        type="text"
                        maxLength={5}
                        placeholder="12/29"
                        value={cardExpiry}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          if (val.length >= 2) {
                            setCardExpiry(val.substring(0, 2) + "/" + val.substring(2, 4));
                          } else {
                            setCardExpiry(val);
                          }
                        }}
                        className="w-full bg-black/45 border border-white/10 h-11 px-3.5 text-xs rounded-xl focus:border-purple-500 text-white outline-none font-mono text-center"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-white/70 font-semibold block">CVV/CVC *</label>
                      <input
                        type="password"
                        maxLength={3}
                        placeholder="***"
                        value={cardCVV}
                        onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, ""))}
                        className="w-full bg-black/45 border border-white/10 h-11 px-3.5 text-xs rounded-xl focus:border-purple-500 text-white outline-none font-mono text-center"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2 text-white/40">
                  <Shield className="w-5 h-5 text-purple-450 flex-shrink-0" />
                  <p className="text-[10px] leading-relaxed">Click PCI DSS va SSL ma'lumotlar shifrlash sertifikatlari yordamida himoyalangan.</p>
                </div>

                <button
                  onClick={verifyCheckoutCard}
                  className="w-full bg-purple-650 hover:bg-purple-555 text-white font-extrabold uppercase py-3.5 rounded-xl transition shadow cursor-pointer text-xs"
                >
                  Hammasi to'g'ri • SMS tasdiqlatuvini so'rash
                </button>
              </div>
            )}

            {/* Step 2: SMS OTP code input */}
            {checkoutStep === "otp_verify" && (
              <div className="space-y-6">
                <div className="text-center space-y-1 text-xs">
                  <span className="text-lg block animate-bounce">💬</span>
                  <h3 className="text-lg font-black text-white">Xavfsizlik 3D-Secure SMS Kodu</h3>
                  <p className="text-white/40">Sizning telefoningizga yuborilgan 5 xonali tasdiqlash kodini kiriting.</p>
                </div>

                {paymentError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[10.5px] rounded-xl font-bold">
                    ⚠️ {paymentError}
                  </div>
                )}

                <div className="space-y-3">
                  <div className="relative">
                    <Lock className="w-4 h-4 text-purple-450 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="e.g. 54321"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      className="w-full bg-black/45 border border-white/10 h-11 pl-10 pr-4 text-center text-sm tracking-widest rounded-xl focus:border-purple-500 text-white outline-none font-mono"
                    />
                  </div>
                  <span className="text-[10.5px] text-white/30 text-center block">Sandboks kodi istalgan 5 xonali son bo'lishi mumkin.</span>
                </div>

                <div className="flex gap-2">
                  <button
                    disabled={paymentLoading}
                    onClick={handleConfirmOtpSignature}
                    className="flex-1 bg-green-600 hover:bg-green-500 text-white font-black py-3.5 rounded-xl uppercase transition cursor-pointer text-xs"
                  >
                    {paymentLoading ? "Tranzaksiya tasdiqlanmoqda..." : "To'lovni yakunlash"}
                  </button>

                  <button
                    onClick={() => setCheckoutStep("card_entry")}
                    className="bg-white/5 hover:bg-white/10 text-white/70 px-4 py-3.5 rounded-xl text-xs transition font-semibold"
                  >
                    Orqaga return
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Success billing feedback message */}
            {checkoutStep === "success" && (
              <div className="text-center space-y-5 py-4">
                <div className="h-14 w-14 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto text-green-400">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-1 text-xs">
                  <h3 className="text-lg font-black text-white">To'lov muvaffaqiyatli yakunlandi!</h3>
                  <p className="text-white/40">Sizning mablag'ingiz drayver haydovchi buyurtmani yetkazgan zahoti uning balansiga o'tkaziladi.</p>
                </div>

                <div className="bg-white/5 p-4 rounded-xl text-xs text-left max-w-xs mx-auto space-y-1">
                  <p className="text-white/40">To'langan Summa:</p>
                  <p className="font-extrabold text-white text-base font-mono">{selectedCheckoutOrder.price?.toLocaleString()} UZS</p>
                </div>

                <button
                  onClick={() => {
                    setSelectedCheckoutOrder(null);
                    setCheckoutProvider(null);
                    setCheckoutStep("card_entry");
                  }}
                  className="w-full bg-purple-650 hover:bg-purple-500 text-white font-extrabold py-3.5 rounded-xl transition cursor-pointer text-xs"
                >
                  Ajoyib! Portalga qaytish
                </button>
              </div>
            )}

            {/* Step 4: Failed transition status */}
            {checkoutStep === "failed" && (
              <div className="text-center space-y-5 py-4">
                <div className="h-14 w-14 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center justify-center mx-auto text-rose-500 select-none">
                  <X className="w-8 h-8" />
                </div>

                <div className="space-y-1.5 text-xs">
                  <h3 className="text-base font-black text-white">To'lov tasdiqlanmadi</h3>
                  <p className="text-white/40">Xatolik kodi: Bank hisobingizda yetarli mablag' mavjud bo'lmasligi mumkin.</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setCheckoutStep("card_entry")}
                    className="flex-1 bg-purple-600 text-white font-extrabold py-3 rounded-xl uppercase transition cursor-pointer"
                  >
                    Qayta urinish
                  </button>
                  <button
                    onClick={() => setSelectedCheckoutOrder(null)}
                    className="bg-zinc-800 text-white/50 px-4 py-3 rounded-xl"
                  >
                    Yopish
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
      
      {/* 💬 REAL-TIME CHAT DRAWER */}
      {activeChatOrderId && (
        <div id="customer_driver_chat_overlay" className="fixed inset-0 bg-black/75 backdrop-blur-sm flex justify-end z-[999] animate-fade-in font-sans">
          <div className="w-full max-w-md bg-[#0a0517]/95 border-l border-white/10 h-full flex flex-col relative shadow-2xl">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
            
            {/* Header */}
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-[#120b2e]/90 pt-7">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/15 border border-purple-500/20 flex items-center justify-center font-bold text-purple-400">
                  💬
                </div>
                <div>
                  <h4 className="text-white font-extrabold text-sm">Haydovchi bilan chat</h4>
                  <span className="text-[10px] text-green-400 font-mono flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-ping"></span>
                    <span>Operator kanali • Real-time</span>
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setActiveChatOrderId(null)}
                className="h-8 w-8 rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-400 flex items-center justify-center border border-white/5 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat message threads */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-black/40">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-center space-y-2 opacity-50 px-4">
                  <span className="text-3xl animate-bounce">💬</span>
                  <h5 className="font-bold text-xs text-white">Muloqot boshlanishi</h5>
                  <p className="text-[10px] text-white/50">Yo'ldagi haydovchiga manzil haqida yoki yukingiz xolati bo'yicha xabar qoldiring.</p>
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"} space-y-1`}>
                      <span className="text-[8px] text-white/40 font-mono">{msg.senderName} ({msg.senderRole === "driver" ? "Haydovchi" : "Mijoz"})</span>
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
                <div className="flex-1">
                  <p className="text-[10px] text-white font-bold">Rasm biriktirildi</p>
                  <span className="text-[8.5px] text-white/40">Yuborilishga tayyor</span>
                </div>
                <button 
                  onClick={() => setChatImgBase64("")}
                  className="p-1 rounded bg-white/5 hover:bg-rose-500 text-white/50 hover:text-white transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
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
                placeholder="Xabarni kiriting..."
                className="flex-1 bg-black/45 border border-white/10 h-11 px-4 text-xs rounded-xl focus:border-purple-500 text-white outline-none"
              />

              <button 
                type="submit"
                disabled={sendingChat || (!chatInput.trim() && !chatImgBase64)}
                className="h-11 w-11 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-purple-950/30 transition shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ⭐ DRIVER RATING MODAL */}
      {ratingModalOrder && (
        <div id="driver_rating_modal_overlay" className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[999] p-4 animate-fade-in font-sans">
          <div className="w-full max-w-md bg-[#0e0722] border border-white/10 p-6 rounded-3xl relative shadow-2xl text-center space-y-6">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-purple-500 to-pink-500 rounded-t-3xl"></div>
            
            <div className="space-y-1">
              <span className="text-3xl block">🏆</span>
              <h3 className="text-lg font-black text-white">Xizmatga baho berish</h3>
              <p className="text-white/40 text-xs">Buyurtma #{ratingModalOrder.id.substr(0, 8).toUpperCase()} yakunlandi. Haydovchi sizga yoqdimi?</p>
            </div>

            <div className="bg-black/30 p-4 border border-white/5 rounded-2xl flex items-center gap-3 text-left">
              <div className="w-10 h-10 bg-purple-600/10 border border-purple-500/20 text-purple-400 font-bold rounded-xl flex items-center justify-center">
                🚚
              </div>
              <div>
                <p className="font-extrabold text-[#dda15e] text-sm leading-none">{ratingModalOrder.driverName || "YukLa Haydovchisi"}</p>
                <span className="text-[10px] text-white/40 block mt-1">{ratingModalOrder.cargoType} • {ratingModalOrder.price?.toLocaleString()} UZS</span>
              </div>
            </div>

            {/* Stars selection array */}
            <div className="flex justify-center gap-3 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star}
                  type="button"
                  onClick={() => setActiveRatingScore(star)}
                  className="transition transform hover:scale-125 cursor-pointer text-2xl"
                >
                  <Star 
                    className={`w-8 h-8 ${
                      star <= activeRatingScore 
                        ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" 
                        : "text-white/20"
                    }`} 
                  />
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmitRating} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-xs text-white/60 font-semibold block">Izoh yoki fikringizni yozing (ixtiyoriy):</label>
                <textarea 
                  value={activeRatingReview}
                  onChange={(e) => setActiveRatingReview(e.target.value)}
                  placeholder="Masalan: Haydovchi juda muloyim va tez yetkazib berdi..."
                  className="w-full bg-black/45 border border-white/10 h-20 p-3 text-xs rounded-xl focus:border-purple-500 text-white outline-none resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button 
                  type="submit"
                  disabled={submittingRating}
                  className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl transition cursor-pointer shadow"
                >
                  {submittingRating ? "Baxolayotir..." : "Baholashni yuborish"}
                </button>
                <button 
                  type="button"
                  onClick={() => setRatingModalOrder(null)}
                  className="bg-white/5 hover:bg-white/10 text-white/50 border border-white/5 font-bold px-4 py-3.5 rounded-xl text-xs transition"
                >
                  Bekor qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 💸 ESCROW DELIVERY CONFIRMATION & INVOICE MODALS */}
      {confirmDeliveryModalOrder && (
        <div id="escrow_confirmation_modal_overlay" className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[999] p-4 animate-fade-in font-sans">
          
          {invoiceReady ? (
            /* PRINTABLE INVOICE COMPONENT */
            <div className="w-full max-w-lg bg-white text-slate-900 p-8 rounded-3xl shadow-2xl relative space-y-6 animate-scale-up">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-t-3xl"></div>
              
              <div className="flex justify-between items-start border-b border-slate-100 pb-5">
                <div>
                  <h3 className="text-xl font-mono font-black text-slate-900 tracking-tight">YUKLA ESCROW RECEIPT</h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">TRX ID: #{invoiceReady.orderId.substring(0, 12).toUpperCase()}</p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono tracking-widest font-black uppercase px-2.5 py-1 rounded-full">
                  Paid & Released
                </span>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                  <div>
                    <span className="text-slate-400 block font-semibold">Yuk yuboruvchi (Customer)</span>
                    <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">{user?.name || "YukLa Mijoz"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Tashuvchi (Driver)</span>
                    <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">{invoiceReady.driverName}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl text-xs space-y-2.5 font-sans">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Yetkazilgan yuk:</span>
                    <strong className="text-slate-800">{invoiceReady.cargo}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">To'lov usuli:</span>
                    <strong className="text-emerald-600 uppercase font-mono">{invoiceReady.paymentMethod} (Escrow Protected)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Tasdiqlash usuli:</span>
                    <strong className="text-slate-800 uppercase font-mono text-[10px]">{invoiceReady.method} verification</strong>
                  </div>
                  <div className="flex justify-between border-t border-slate-200/60 pt-2.5">
                    <span className="text-slate-500 font-semibold">Umumiy kargo bahosi:</span>
                    <strong className="text-slate-900 font-mono text-sm">{invoiceReady.price.toLocaleString()} UZS</strong>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Komissiya tushumi (3% Platform):</span>
                    <span className="font-mono">{invoiceReady.commission.toLocaleString()} UZS</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-emerald-700 font-bold border-b border-dashed border-slate-200 pb-2">
                    <span>Drayver sof daromadi (97% Payout):</span>
                    <span className="font-mono">{invoiceReady.driverPayout.toLocaleString()} UZS</span>
                  </div>
                </div>

                {invoiceReady.signature && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Mijoz elektron imzosi</span>
                    <div className="p-2 bg-slate-50 border border-slate-100 rounded-2xl flex justify-center items-center">
                      <img src={invoiceReady.signature} alt="Mijoz Imzosi" className="max-h-16 object-contain" referrerPolicy="no-referrer" />
                    </div>
                  </div>
                )}
                
                <div className="text-[9px] text-center text-slate-400 font-mono py-1.5 border-t border-slate-100 uppercase tracking-widest">
                  Thank you for using safe ESCROW logistics!
                </div>
              </div>

              <button 
                type="button"
                onClick={() => {
                  setConfirmDeliveryModalOrder(null);
                  setInvoiceReady(null);
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-2xl uppercase tracking-wider text-xs transition cursor-pointer"
              >
                Yopish va qaytish
              </button>
            </div>
          ) : (
            /* INTERACTIVE ESCROW RELEASE FORM WITH SEV METHODS */
            <div className="w-full max-w-lg bg-[#0e0722] border border-white/10 p-7 rounded-3xl relative shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-t-3xl"></div>
              
              <div className="space-y-1 text-center">
                <span className="text-3xl block">🔒</span>
                <h3 className="text-lg font-black text-white">Xavfsiz Kargo Qabuli & To'lov</h3>
                <p className="text-white/40 text-xs">Yuklamangizni yetib kelganini tasdiqlang va Escrow hisobidagi mablag'ni drayverga chiqaring.</p>
              </div>

              {/* Secure Split Visual panel */}
              <div className="bg-black/40 p-5 border border-white/5 rounded-2xl font-sans space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/50">Umumiy kargo to'lovi:</span>
                  <strong className="text-white text-base font-mono">{confirmDeliveryModalOrder.price?.toLocaleString()} UZS</strong>
                </div>
                
                <div className="h-1 bg-white/5 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-500 w-[97%] h-full"></div>
                  <div className="bg-[#8338ec] w-[3%] h-full"></div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] uppercase font-mono font-bold tracking-wider pt-1.5">
                  <div className="text-emerald-400">
                    <span>🚚 Drayver (97%):</span>
                    <p className="text-xs text-white font-mono mt-0.5">{(confirmDeliveryModalOrder.price * 0.97).toLocaleString()} UZS</p>
                  </div>
                  <div className="text-[#8338ec] text-right">
                    <span>🛡️ Platforma (3%):</span>
                    <p className="text-xs text-white font-mono mt-0.5">{(confirmDeliveryModalOrder.price * 0.03).toLocaleString()} UZS</p>
                  </div>
                </div>
              </div>

              {/* Option Methods selector */}
              <div className="space-y-2">
                <label className="text-xs text-white/60 font-semibold block">Tasdiqlash va imzolash uslubini tanlang:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setConfirmMethod("direct");
                      clearSignature();
                    }}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      confirmMethod === "direct" 
                        ? "bg-purple-600/20 border-purple-500 text-purple-300 shadow" 
                        : "bg-black/30 border-white/5 text-white/50 hover:border-white/10"
                    }`}
                  >
                    <span className="text-xs font-bold leading-none">Tezkor</span>
                    <span className="text-[9px] text-white/40 block mt-0.5 leading-none">Bir martalik</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setConfirmMethod("otp");
                      clearSignature();
                    }}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      confirmMethod === "otp" 
                        ? "bg-purple-600/20 border-purple-500 text-purple-300 shadow" 
                        : "bg-black/30 border-white/5 text-white/50 hover:border-white/10"
                    }`}
                  >
                    <span className="text-xs font-bold leading-none">SMS OTP</span>
                    <span className="text-[9px] text-white/40 block mt-0.5 leading-none">Tasdiqlash kodi</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setConfirmMethod("signature")}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      confirmMethod === "signature" 
                        ? "bg-purple-600/20 border-purple-500 text-purple-300 shadow" 
                        : "bg-black/30 border-white/5 text-white/50 hover:border-white/10"
                    }`}
                  >
                    <span className="text-xs font-bold leading-none">Raqamli Imzo</span>
                    <span className="text-[9px] text-white/40 block mt-0.5 leading-none">Chizish namunasi</span>
                  </button>
                </div>
              </div>

              {/* Dynamic input fields based on method */}
              {confirmMethod === "otp" && (
                <div className="bg-black/40 border border-white/5 p-4 rounded-2xl space-y-3">
                  <span className="text-yellow-405 font-mono bg-yellow-400/10 border border-yellow-400/20 px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wider float-right">
                    Kod: {confirmDeliveryModalOrder.otpCode || "4218"}
                  </span>
                  <label className="text-xs text-white/70 font-semibold block">SMS tasdiqlash kodini kiritish</label>
                  <input 
                    type="text"
                    value={confirmOtp}
                    onChange={(e) => setConfirmOtp(e.target.value)}
                    placeholder="Masalan: 4218"
                    maxLength={6}
                    className="w-full bg-black/50 border border-white/10 p-3 text-center text-base tracking-widest font-mono font-bold rounded-xl text-white outline-none focus:border-purple-500"
                  />
                  <p className="text-[10px] text-white/35">Drayver yetkazib berish vaqtida taqdim etgan va simulyatsiya kodingizni kiriting.</p>
                </div>
              )}

              {confirmMethod === "signature" && (
                <div className="bg-black/40 border border-white/5 p-4 rounded-2xl space-y-3">
                  <button 
                    type="button"
                    onClick={clearSignature}
                    className="float-right text-[10px] text-[#dda15e] hover:underline"
                  >
                    Tozalash
                  </button>
                  <label className="text-xs text-white/70 font-semibold block">Pastdagi maydonga imzolang</label>
                  <div className="bg-black/60 border border-white/10 rounded-xl overflow-hidden flex justify-center">
                    <canvas 
                      ref={canvasRef}
                      width={400}
                      height={150}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="cursor-crosshair bg-[#0e0722] block max-w-full w-full"
                    />
                  </div>
                  <p className="text-[10px] text-white/35">Barmoq yoki sichqoncha yordamida kargo kvitansiyasini tasdiqlagan xolda imzolang.</p>
                </div>
              )}

              {/* Driver Rating & Review Comments */}
              <div className="space-y-3 border-t border-white/5 pt-4">
                <div className="flex justify-between items-center bg-black/30 p-3 rounded-xl border border-white/5">
                  <label className="text-xs text-white/60 font-semibold">Haydovchiga baho bering:</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button 
                        key={s}
                        type="button" 
                        onClick={() => setConfirmRating(s)}
                        className="transition transform hover:scale-125 cursor-pointer text-lg leading-none"
                      >
                        <Star className={`w-5 h-5 ${s <= confirmRating ? "fill-yellow-400 text-yellow-400" : "text-white/20"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-white/60 font-semibold block">Sertifikat fikr-mulohazalari (ixtiyoriy):</label>
                  <textarea 
                    value={confirmFeedback}
                    onChange={(e) => setConfirmFeedback(e.target.value)}
                    placeholder="Masalan: Kargo xavfsiz va o'z vaqtida yetib keldi. Rahmat!"
                    className="w-full bg-black/45 border border-white/10 p-3 text-xs rounded-xl focus:border-purple-500 text-white outline-none resize-none h-16"
                  />
                </div>
              </div>

              {/* Buttons controls */}
              <div className="flex gap-2.5 pt-2">
                <button 
                  type="button"
                  onClick={handleReleaseEscrowAndConfirm}
                  disabled={confirmingRelease}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 text-white font-black py-4 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer shadow-lg shadow-emerald-950/20"
                >
                  {confirmingRelease ? "Mablag' yuborilmoqda..." : "Yetkazishni tasdiqlash & To'lash"}
                </button>
                <button 
                  type="button"
                  onClick={() => setConfirmDeliveryModalOrder(null)}
                  className="bg-white/5 hover:bg-white/10 border border-white/5 font-bold px-4 py-4 rounded-xl text-xs transition text-white/50"
                >
                  Yopish
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
