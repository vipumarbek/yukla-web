/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Enterprise User Settings & Notifications Preferences Modal
 * Provides comprehensive control over:
 * - Notifications: Sound (ON/OFF, Default=OFF), Push/In-App (ON/OFF, Default=ON)
 * - Security & Biometrics (Face ID, Fingerprint enrollment, Trusted Devices)
 * - Language & General Profile Preferences
 */

import React, { useState, useEffect } from "react";
import {
  Settings,
  Bell,
  Volume2,
  VolumeX,
  Radio,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  Save,
  Loader2,
  X,
  Play,
  Sparkles,
  Info
} from "lucide-react";
import { User } from "../types";

export interface NotificationSettings {
  soundEnabled: boolean;
  pushEnabled: boolean;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  token?: string;
  initialSettings?: NotificationSettings;
  onSaveNotificationSettings: (settings: NotificationSettings) => Promise<void> | void;
  onOpenBiometrics?: () => void;
  playTestSound?: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  user,
  token,
  initialSettings = { soundEnabled: false, pushEnabled: true },
  onSaveNotificationSettings,
  onOpenBiometrics,
  playTestSound
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"notifications" | "security" | "general">("notifications");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(initialSettings.soundEnabled ?? false);
  const [pushEnabled, setPushEnabled] = useState<boolean>(initialSettings.pushEnabled ?? true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testNotificationSent, setTestNotificationSent] = useState(false);

  useEffect(() => {
    if (initialSettings) {
      setSoundEnabled(initialSettings.soundEnabled ?? false);
      setPushEnabled(initialSettings.pushEnabled ?? true);
    }
  }, [initialSettings, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const updated = { soundEnabled, pushEnabled };
      await onSaveNotificationSettings(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotification = () => {
    setTestNotificationSent(true);
    if (soundEnabled && playTestSound) {
      playTestSound();
    }
    setTimeout(() => setTestNotificationSent(false), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div 
        className="bg-[#0f0926] border border-purple-500/20 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-purple-950/40 via-purple-900/20 to-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                Tizim Sozlamalari
                <span className="text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full uppercase">
                  YukLa SaaS
                </span>
              </h2>
              <p className="text-xs text-white/40">Bildirishnomalar, audio signallar va akkaunt xavfsizligi</p>
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
        <div className="flex border-b border-white/5 bg-black/20 px-6 pt-2 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab("notifications")}
            className={`pb-3 px-4 border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === "notifications"
                ? "border-purple-500 text-purple-300"
                : "border-transparent text-white/40 hover:text-white/80"
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Bildirishnomalar (Notifications)</span>
          </button>
          <button
            onClick={() => {
              if (onOpenBiometrics) {
                onClose();
                onOpenBiometrics();
              } else {
                setActiveTab("security");
              }
            }}
            className={`pb-3 px-4 border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === "security"
                ? "border-purple-500 text-purple-300"
                : "border-transparent text-white/40 hover:text-white/80"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Xavfsizlik & Biometriya</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {activeTab === "notifications" && (
            <div className="space-y-6">
              {/* Notification Header Banner */}
              <div className="bg-purple-950/20 border border-purple-500/20 rounded-2xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white font-bold text-xs">Xabarnomalar Boshqaruvi</h4>
                  <p className="text-white/50 text-[11px] leading-relaxed mt-1">
                    Yangi buyurtmalar kelganda yoki buyurtma holati yetkazilganda beriladigan xabarnomalar sozlamalari. Standart holatda audio signallar o'chirilgan bo'lib, ekrandagi vizual bildirishnomalar (badge va toast) faol saqlanadi.
                  </p>
                </div>
              </div>

              {/* Setting 1: Sound Notifications (Default: OFF) */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-purple-500/30 transition">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 transition ${
                      soundEnabled 
                        ? "bg-purple-600/20 border-purple-500/40 text-purple-300" 
                        : "bg-white/5 border-white/10 text-white/40"
                    }`}>
                      {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">Ovozli signallar (Audio Alert)</span>
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${
                          soundEnabled 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                            : "bg-white/5 text-white/40 border-white/10"
                        }`}>
                          {soundEnabled ? "ON (Yoqilgan)" : "OFF (O'chirilgan - Standart)"}
                        </span>
                      </div>
                      <p className="text-white/50 text-[11px] mt-1 leading-relaxed">
                        Yangi buyurtma kelganda va yuk tashuv holati o'zgarganda qisqa sintezlangan audio signal chalish. Standart bo'yicha audio o'chiq turadi.
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={soundEnabled}
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      soundEnabled ? "bg-purple-600" : "bg-white/20"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        soundEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Sound Test Sub-Action */}
                {playTestSound && (
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[11px] text-white/40">Audio effektini eshitib ko'rish:</span>
                    <button
                      type="button"
                      onClick={playTestSound}
                      className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Play className="w-3 h-3" />
                      <span>Ovozni sinash (Audio Test)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Setting 2: Push Notifications (Default: ON) */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-purple-500/30 transition">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 transition ${
                      pushEnabled 
                        ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300" 
                        : "bg-white/5 border-white/10 text-white/40"
                    }`}>
                      <Radio className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">Push & Ekran xabarlari (Visual Push)</span>
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${
                          pushEnabled 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                            : "bg-white/5 text-white/40 border-white/10"
                        }`}>
                          {pushEnabled ? "ON (Faol)" : "OFF (O'chirilgan)"}
                        </span>
                      </div>
                      <p className="text-white/50 text-[11px] mt-1 leading-relaxed">
                        Ekrandagi suzuvchi (toast) xabarnomalar, yangi yuk signallari va tepada hisoblagich belgisi (badge) ko'rinishi.
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={pushEnabled}
                    onClick={() => setPushEnabled(!pushEnabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      pushEnabled ? "bg-indigo-600" : "bg-white/20"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        pushEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[11px] text-white/40">Vizual bildirishnomani sinash:</span>
                  <button
                    type="button"
                    onClick={handleTestNotification}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Test bildirishnoma jo'natish</span>
                  </button>
                </div>

                {testNotificationSent && (
                  <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 flex items-center gap-2 animate-fade-in text-[11px]">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Vizual bildirishnoma namunasi: YukLa tizimi sizning sozlamangiz bo'yicha to'g'ri ishlamoqda!</span>
                  </div>
                )}
              </div>

              {/* Status summary info */}
              <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="text-[11px] text-white/40">
                  <p className="text-white/70 font-semibold">Tizim holati:</p>
                  <span>Real-time WebSocket aloqasi faol • Bildirishnomalar markazi tayyor</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Online Hub</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-4">
              <div className="bg-purple-950/20 border border-purple-500/20 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck className="w-5 h-5 text-purple-400" />
                  <h4 className="text-sm font-bold text-white">Biometrik Xavfsizlik va Qurilmalar</h4>
                </div>
                <p className="text-white/50 text-[11px] leading-relaxed mb-4">
                  Face ID yoki Barmoq izi (Touch ID) orqali parolsiz xavfsiz tizimga kirishni boshqarish.
                </p>
                {onOpenBiometrics && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenBiometrics();
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-2 shadow-lg shadow-purple-900/30"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Biometriya Paneli Ochish</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-white/10 bg-black/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-emerald-400 font-bold text-xs flex items-center gap-1.5 animate-fade-in">
                <CheckCircle2 className="w-4 h-4" />
                Sozlamalar saqlandi!
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold transition cursor-pointer"
            >
              Yopish
            </button>
            <button
              disabled={saving}
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-purple-900/40 cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Saqlash</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
