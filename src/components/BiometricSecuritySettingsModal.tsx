/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Enterprise Biometric Security & Device Management Modal
 * Allows users across all roles (Admin, Driver, Customer, Company, Super Admin)
 * to enroll Face ID / Fingerprint, manage trusted devices, and view audit history.
 */

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Fingerprint,
  ScanFace,
  Smartphone,
  Laptop,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  Loader2,
  History,
  Lock,
  Eye,
  KeyRound,
  RefreshCw
} from "lucide-react";
import {
  enrollBiometricCredential,
  detectDeviceDetails,
  checkBiometricHardwareSupport,
  BiometricType,
  BiometricDevice,
  BiometricAuditLog,
  removeLocalEnrolledAccount
} from "../services/biometricAuth";
import { User } from "../types";

interface BiometricSecuritySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  token: string;
  onRefreshUser?: () => void;
}

export default function BiometricSecuritySettingsModal({
  isOpen,
  onClose,
  user,
  token,
  onRefreshUser
}: BiometricSecuritySettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"enroll" | "devices" | "history">("enroll");
  const [devices, setDevices] = useState<BiometricDevice[]>([]);
  const [auditLogs, setAuditLogs] = useState<BiometricAuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Enrollment form states
  const [selectedType, setSelectedType] = useState<BiometricType>("face_id");
  const [customDeviceName, setCustomDeviceName] = useState("");
  const [enrollStep, setEnrollStep] = useState<"choose" | "scanning" | "done">("choose");

  // Edit device states
  const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState("");

  // Hardware status
  const [hwSupport, setHwSupport] = useState<{ supported: boolean; platformAuthenticator: boolean } | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setErrorMessage("");
    setSuccessMessage("");
    setEnrollStep("choose");

    // Pre-populate device name
    const { defaultName, suggestedType } = detectDeviceDetails();
    setCustomDeviceName(defaultName);
    setSelectedType(suggestedType);

    checkBiometricHardwareSupport().then((support) => {
      setHwSupport(support);
      if (support.suggestedType) {
        setSelectedType(support.suggestedType);
      }
    });

    loadDevicesAndLogs();
  }, [isOpen, token]);

  const loadDevicesAndLogs = async () => {
    setLoading(true);
    try {
      const [devRes, logsRes] = await Promise.all([
        fetch("/api/auth/biometric/devices", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("/api/auth/biometric/logs", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (devRes.ok) {
        const devData = await devRes.json();
        setDevices(devData.devices || []);
        if (devData.devices && devData.devices.length > 0) {
          // If already has devices, show devices tab by default
          setActiveTab("devices");
        }
      }

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setAuditLogs(logsData.logs || []);
      }
    } catch (e) {
      console.error("Failed to load biometric data:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setActionLoading(true);
    setEnrollStep("scanning");

    try {
      const deviceLabel = customDeviceName.trim() || "Mening Qurilmam";
      const result = await enrollBiometricCredential(token, user, selectedType, deviceLabel);

      setSuccessMessage(result.message || "Biometrik profil muvaffaqiyatli saqlandi!");
      setEnrollStep("done");

      // Reload devices list
      await loadDevicesAndLogs();
      if (onRefreshUser) onRefreshUser();

      setTimeout(() => {
        setActiveTab("devices");
        setEnrollStep("choose");
        setSuccessMessage("");
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || "Biometrik ro'yxatdan o'tishda xatolik yuz berdi.");
      setEnrollStep("choose");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleDevice = async (device: BiometricDevice) => {
    try {
      const res = await fetch(`/api/auth/biometric/devices/${device.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ enabled: !device.enabled })
      });

      if (res.ok) {
        setDevices((prev) =>
          prev.map((d) => (d.id === device.id ? { ...d, enabled: !d.enabled } : d))
        );
      }
    } catch (e) {
      console.error("Toggle failed:", e);
    }
  };

  const handleRenameDevice = async (deviceId: string) => {
    if (!editNameValue.trim()) return;
    try {
      const res = await fetch(`/api/auth/biometric/devices/${deviceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ deviceName: editNameValue.trim() })
      });

      if (res.ok) {
        setDevices((prev) =>
          prev.map((d) => (d.id === deviceId ? { ...d, deviceName: editNameValue.trim() } : d))
        );
        setEditingDeviceId(null);
      }
    } catch (e) {
      console.error("Rename failed:", e);
    }
  };

  const handleDeleteDevice = async (device: BiometricDevice) => {
    if (!window.confirm(`Haqiqatan ham "${device.deviceName}" qurilmasini o'chirmoqchimisiz?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/auth/biometric/devices/${device.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        removeLocalEnrolledAccount(device.credentialId);
        setDevices((prev) => prev.filter((d) => d.id !== device.id));
        loadDevicesAndLogs();
      }
    } catch (e) {
      console.error("Delete failed:", e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in font-sans">
      <div className="bg-[#120b24] border border-purple-500/25 rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
        {/* Accent top line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-indigo-600" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white">
                Biometrik Xavfsizlik & Sozlamalar
              </h3>
              <p className="text-[11px] text-white/50">
                Face ID & Barmoq izi orqali hisobingizni himoyalang
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/5 mt-3">
          <button
            onClick={() => setActiveTab("enroll")}
            className={`flex-1 py-2.5 text-xs font-bold transition border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "enroll"
                ? "border-purple-500 text-purple-300 bg-purple-500/5"
                : "border-transparent text-white/50 hover:text-white/80"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yangi Ro'yxatdan O'tkazish</span>
          </button>

          <button
            onClick={() => setActiveTab("devices")}
            className={`flex-1 py-2.5 text-xs font-bold transition border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "devices"
                ? "border-purple-500 text-purple-300 bg-purple-500/5"
                : "border-transparent text-white/50 hover:text-white/80"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Ishonchli Qurilmalar ({devices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-2.5 text-xs font-bold transition border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "history"
                ? "border-purple-500 text-purple-300 bg-purple-500/5"
                : "border-transparent text-white/50 hover:text-white/80"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Xavfsizlik Tarixi</span>
          </button>
        </div>

        {/* Feedback alerts */}
        {errorMessage && (
          <div className="mt-3 p-3 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="mt-3 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* TAB 1: ENROLL NEW BIOMETRICS */}
          {activeTab === "enroll" && (
            <div className="space-y-5">
              <div className="bg-[#16131F] border border-white/10 rounded-2xl p-4 space-y-3">
                <span className="text-[10px] text-purple-400 font-mono font-bold uppercase tracking-wider block">
                  1-QADAM: BIOMETRIYA TURINI TANLANG
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedType("face_id")}
                    className={`p-3.5 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-2 ${
                      selectedType === "face_id"
                        ? "bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-900/30"
                        : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    <ScanFace className="w-8 h-8 text-purple-400" />
                    <div>
                      <span className="text-xs font-bold block">Face ID</span>
                      <span className="text-[10px] text-white/40">Yuz skaneri</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedType("fingerprint")}
                    className={`p-3.5 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-2 ${
                      selectedType === "fingerprint"
                        ? "bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-900/30"
                        : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    <Fingerprint className="w-8 h-8 text-purple-400" />
                    <div>
                      <span className="text-xs font-bold block">Touch ID / Barmoq izi</span>
                      <span className="text-[10px] text-white/40">Datchik skaneri</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="bg-[#16131F] border border-white/10 rounded-2xl p-4 space-y-2">
                <span className="text-[10px] text-purple-400 font-mono font-bold uppercase tracking-wider block">
                  2-QADAM: QURILMA NOMI
                </span>
                <input
                  type="text"
                  value={customDeviceName}
                  onChange={(e) => setCustomDeviceName(e.target.value)}
                  placeholder="Masalan: Apple iPhone 15 Pro, Samsung Galaxy"
                  className="w-full bg-[#16131F] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                />
                <p className="text-[10px] text-white/40">
                  Ushbu nom ishonchli qurilmalar ro'yxatida ko'rsatiladi.
                </p>
              </div>

              <div className="bg-purple-950/20 border border-purple-500/20 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-purple-200/80">
                <KeyRound className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Xavfsizlik Kafolati:</strong> Biometrik ma'lumotlaringiz (surat yoki barmoq izi) hech qachon YukLa serverlariga yuklanmaydi. Ular faqat qurilmangizning xavfsiz apparat chipida (Secure Enclave) saqlanadi va WebAuthn kriptografik kaliti orqali tekshiriladi.
                </p>
              </div>

              <button
                type="button"
                onClick={handleEnroll}
                disabled={actionLoading}
                className="w-full min-h-[44px] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider py-3 rounded-2xl shadow-lg shadow-purple-900/40 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Qurilma tasdiqlanmoqda...</span>
                  </>
                ) : (
                  <>
                    {selectedType === "face_id" ? (
                      <ScanFace className="w-4 h-4" />
                    ) : (
                      <Fingerprint className="w-4 h-4" />
                    )}
                    <span>
                      {selectedType === "face_id" ? "Face ID-ni Faollashtirish" : "Barmoq Izini Faollashtirish"}
                    </span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 2: TRUSTED DEVICES LIST */}
          {activeTab === "devices" && (
            <div className="space-y-3">
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center text-white/40 space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                  <span className="text-xs">Qurilmalar yuklanmoqda...</span>
                </div>
              ) : devices.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white/30">
                    <Smartphone className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">Ishonchli qurilmalar mavjud emas</p>
                    <p className="text-[11px] text-white/50">
                      Tezkor kirish uchun yuqoridagi "Yangi Ro'yxatdan O'tkazish" tugmasini bosing.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("enroll")}
                    className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 transition cursor-pointer"
                  >
                    Biometriyalarni Sozlash
                  </button>
                </div>
              ) : (
                devices.map((device) => (
                  <div
                    key={device.id}
                    className="bg-[#16131F] border border-white/10 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-purple-400 shrink-0">
                        {device.biometricType === "face_id" ? (
                          <ScanFace className="w-5 h-5" />
                        ) : (
                          <Fingerprint className="w-5 h-5" />
                        )}
                      </div>

                      <div className="space-y-0.5">
                        {editingDeviceId === device.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={editNameValue}
                              onChange={(e) => setEditNameValue(e.target.value)}
                              className="bg-black/50 border border-purple-500 rounded px-2 py-0.5 text-xs text-white"
                              autoFocus
                            />
                            <button
                              onClick={() => handleRenameDevice(device.id)}
                              className="px-2 py-0.5 bg-purple-600 text-white text-[10px] font-bold rounded"
                            >
                              Saqlash
                            </button>
                            <button
                              onClick={() => setEditingDeviceId(null)}
                              className="px-1.5 py-0.5 text-white/50 text-[10px]"
                            >
                              Bekor
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-white">{device.deviceName}</p>
                            <button
                              onClick={() => {
                                setEditingDeviceId(device.id);
                                setEditNameValue(device.deviceName);
                              }}
                              className="text-white/40 hover:text-white transition cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        <p className="text-[10px] text-white/40">
                          {device.biometricType === "face_id" ? "Face ID" : "Fingerprint"} • Oxirgi foydalanish:{" "}
                          {new Date(device.lastUsedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/5">
                      <button
                        onClick={() => handleToggleDevice(device)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition cursor-pointer ${
                          device.enabled
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-white/10 text-white/50 border border-white/10"
                        }`}
                      >
                        {device.enabled ? "Faol" : "O'chirilgan"}
                      </button>

                      <button
                        onClick={() => handleDeleteDevice(device)}
                        className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 flex items-center justify-center transition cursor-pointer"
                        title="O'chirish / Revoke"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: AUDIT LOGS */}
          {activeTab === "history" && (
            <div className="space-y-2">
              {auditLogs.length === 0 ? (
                <div className="py-12 text-center text-white/40 text-xs">
                  Xavfsizlik jurnali bo'sh
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-[#16131F] border border-white/5 rounded-xl p-2.5 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase ${
                            log.status === "SUCCESS"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : log.status === "REVOKED"
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-red-500/20 text-red-300"
                          }`}
                        >
                          {log.status}
                        </span>
                        <span className="font-bold text-white text-[11px]">{log.action}</span>
                      </div>
                      <p className="text-[10px] text-white/50">{log.details}</p>
                    </div>
                    <span className="text-[10px] text-white/30 font-mono shrink-0 ml-2">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-white/5 pt-3 flex items-center justify-between text-[11px] text-white/40">
          <span>YukLa Enterprise Security Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold transition cursor-pointer"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
}
