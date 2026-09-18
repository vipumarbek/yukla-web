/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Enterprise Biometric Login Modal (Face ID / Fingerprint)
 * Fully compliant with WebAuthn / FIDO2 standards, lockout protection, and multi-user isolation.
 */

import React, { useState, useEffect } from "react";
import {
  Fingerprint,
  ScanFace,
  ShieldCheck,
  ShieldAlert,
  X,
  Check,
  Loader2,
  AlertTriangle,
  Lock,
  UserCheck,
  ArrowRight,
  RefreshCw,
  Users
} from "lucide-react";
import {
  authenticateWithBiometrics,
  getLocalEnrolledAccounts,
  EnrolledLocalAccount,
  checkBiometricHardwareSupport
} from "../services/biometricAuth";
import { User } from "../types";

interface BiometricLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: { token: string; refreshToken?: string; user: User; role: string }) => void;
  userEmail?: string;
  onSwitchToPasswordLogin?: () => void;
}

export default function BiometricLoginModal({
  isOpen,
  onClose,
  onSuccess,
  userEmail,
  onSwitchToPasswordLogin
}: BiometricLoginModalProps) {
  const [enrolledAccounts, setEnrolledAccounts] = useState<EnrolledLocalAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<EnrolledLocalAccount | null>(null);
  const [status, setStatus] = useState<"idle" | "scanning" | "success" | "error" | "locked" | "not_enrolled">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [lockSeconds, setLockSeconds] = useState(0);
  const [biometricType, setBiometricType] = useState<"face_id" | "fingerprint">("face_id");
  const [hasCheckedSupport, setHasCheckedSupport] = useState(false);

  // Initialize on open
  useEffect(() => {
    if (!isOpen) return;

    // Reset states
    setStatus("idle");
    setErrorMessage("");
    setLockSeconds(0);

    // Load local accounts enrolled on this device
    const accounts = getLocalEnrolledAccounts();
    setEnrolledAccounts(accounts);

    // Determine target account
    let target = null;
    if (userEmail && userEmail.trim()) {
      target = accounts.find((a) => a.email.toLowerCase() === userEmail.toLowerCase().trim()) || null;
    } else if (accounts.length === 1) {
      target = accounts[0];
    }

    setSelectedAccount(target);

    // Detect hardware support
    checkBiometricHardwareSupport().then((support) => {
      setHasCheckedSupport(true);
      if (target) {
        setBiometricType(target.biometricType);
      } else {
        setBiometricType(support.suggestedType);
      }

      // If user specified an email that is NOT enrolled anywhere, verify with server or show not enrolled
      if (userEmail && userEmail.trim() && !target) {
        checkServerEnrollment(userEmail.trim());
      } else if (!userEmail && accounts.length === 0) {
        // No local accounts enrolled on this device
        setStatus("not_enrolled");
        setErrorMessage("Biometric login is not configured for this account.");
      } else if (target) {
        // Auto trigger biometric scan after a brief smooth entrance delay
        const timer = setTimeout(() => {
          triggerBiometricScan(target);
        }, 350);
        return () => clearTimeout(timer);
      }
    });
  }, [isOpen, userEmail]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockSeconds((prev) => {
        if (prev <= 1) {
          setStatus("idle");
          setErrorMessage("");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockSeconds]);

  const checkServerEnrollment = async (email: string) => {
    try {
      const res = await fetch(`/api/auth/biometric/status?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (!data.enrolled) {
        setStatus("not_enrolled");
        setErrorMessage("Biometric login is not configured for this account.");
      } else if (data.isLocked) {
        setStatus("locked");
        setLockSeconds(data.remainingSeconds || 300);
        setErrorMessage(data.error || "Biometrik kirish vaqtincha bloklangan.");
      } else {
        const syntheticTarget: EnrolledLocalAccount = {
          credentialId: data.devices?.[0]?.id || "",
          email: data.account.email,
          name: data.account.name,
          role: data.account.role,
          biometricType: data.devices?.[0]?.biometricType || "face_id",
          deviceName: data.devices?.[0]?.deviceName || "YukLa Device",
          enrolledAt: data.devices?.[0]?.createdAt || new Date().toISOString(),
          lastUsedAt: data.devices?.[0]?.lastUsedAt || new Date().toISOString()
        };
        setSelectedAccount(syntheticTarget);
        setBiometricType(syntheticTarget.biometricType);
        triggerBiometricScan(syntheticTarget);
      }
    } catch {
      setStatus("not_enrolled");
      setErrorMessage("Biometric login is not configured for this account.");
    }
  };

  const triggerBiometricScan = async (accountToUse?: EnrolledLocalAccount | null) => {
    const target = accountToUse || selectedAccount;
    const targetEmail = target ? target.email : userEmail;

    if (!target && !targetEmail) {
      setStatus("not_enrolled");
      setErrorMessage("Biometric login is not configured for this account.");
      return;
    }

    setStatus("scanning");
    setErrorMessage("");

    try {
      const result = await authenticateWithBiometrics(targetEmail, target?.credentialId);

      setStatus("success");
      try {
        if ("vibrate" in navigator) {
          navigator.vibrate([20, 30, 40]);
        }
      } catch {
        // ignore
      }

      setTimeout(() => {
        onSuccess(result);
        onClose();
      }, 700);
    } catch (err: any) {
      console.error("Biometric authentication failure:", err);
      const msg = err.message || "Biometrik tasdiqlash xatoligi.";

      if (msg.includes("not configured") || msg.includes("sozlanmagan")) {
        setStatus("not_enrolled");
        setErrorMessage("Biometric login is not configured for this account.");
      } else if (msg.includes("bloklangan") || msg.includes("5 daqiqa")) {
        setStatus("locked");
        setLockSeconds(300);
        setErrorMessage(msg);
      } else {
        setStatus("error");
        setErrorMessage(msg);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[160] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-sans">
      <div className="bg-[#120b24] border border-purple-500/30 rounded-3xl max-w-sm w-full p-6 sm:p-7 relative shadow-2xl text-center space-y-5 overflow-hidden transition-all">
        {/* Subtle glowing accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-mono font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3 h-3 text-purple-400" />
            <span>FIDO2 • Secure Enclave</span>
          </div>
          <h3 className="text-xl font-black text-white">Biometrik Kirish</h3>
          <p className="text-xs text-white/60">
            {biometricType === "face_id" ? "Apple Face ID / Yuz bilan tanish" : "Touch ID / Barmoq izi bilan tanish"}
          </p>
        </div>

        {/* Target Account Indicator or Multi-Account Selector */}
        {enrolledAccounts.length > 1 && !userEmail && status !== "not_enrolled" && (
          <div className="space-y-2 text-left bg-black/30 border border-white/5 rounded-2xl p-3">
            <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider block">
              Hisobni tanlang:
            </span>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {enrolledAccounts.map((acc) => (
                <button
                  key={acc.credentialId}
                  onClick={() => {
                    setSelectedAccount(acc);
                    setBiometricType(acc.biometricType);
                    triggerBiometricScan(acc);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition cursor-pointer border ${
                    selectedAccount?.credentialId === acc.credentialId
                      ? "bg-purple-600/30 border-purple-500 text-white"
                      : "bg-white/5 border-transparent text-white/70 hover:bg-white/10"
                  }`}
                >
                  <div className="truncate">
                    <p className="text-xs font-bold truncate text-white">{acc.name}</p>
                    <span className="text-[10px] text-white/40 block truncate">{acc.email}</span>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded uppercase font-mono font-bold bg-purple-500/20 text-purple-300 ml-2">
                    {acc.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected Account preview if single or prefilled */}
        {selectedAccount && enrolledAccounts.length <= 1 && status !== "not_enrolled" && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center justify-between text-left">
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{selectedAccount.name}</p>
              <p className="text-[10px] text-white/50 truncate">{selectedAccount.email}</p>
            </div>
            <span className="text-[10px] px-2 py-1 rounded uppercase font-mono font-bold bg-purple-500/20 text-purple-300">
              {selectedAccount.role}
            </span>
          </div>
        )}

        {/* MAIN SCANNER / STATUS INTERFACE */}
        {status === "not_enrolled" ? (
          <div className="py-4 space-y-4 animate-fade-in text-center">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-10 h-10" />
            </div>

            <div className="space-y-1.5 px-2">
              <h4 className="text-sm font-bold text-white">Biometric login is not configured for this account.</h4>
              <p className="text-xs text-white/60 leading-relaxed">
                Ushbu hisob uchun biometrik kirish hali sozlanmagan. Avval odatiy login orqali kiring va <strong>Xavfsizlik Sozlamalari</strong> bo'limida Face ID yoki Barmoq izini faollashtiring.
              </p>
            </div>

            <button
              onClick={() => {
                onClose();
                if (onSwitchToPasswordLogin) onSwitchToPasswordLogin();
              }}
              className="w-full min-h-[44px] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-wider py-3 rounded-xl transition cursor-pointer shadow-lg shadow-purple-900/40"
            >
              Parol orqali kirish
            </button>
          </div>
        ) : status === "locked" ? (
          <div className="py-4 space-y-4 animate-fade-in text-center">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center text-red-400">
              <Lock className="w-10 h-10" />
            </div>

            <div className="space-y-1.5 px-2">
              <h4 className="text-sm font-bold text-red-400">Biometrik Kirish Bloklandi</h4>
              <p className="text-xs text-white/70 leading-relaxed">
                Xavfsizlik maqsadida ketma-ket xato urinishlar tufayli biometriya vaqtincha to'xtatildi.
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-950/40 border border-red-500/30 rounded-full text-xs font-mono text-red-300 font-bold mt-2">
                <span>Qolgan vaqt: {lockSeconds} soniya</span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                if (onSwitchToPasswordLogin) onSwitchToPasswordLogin();
              }}
              className="w-full min-h-[44px] bg-white/10 hover:bg-white/15 text-white text-xs font-bold uppercase tracking-wider py-3 rounded-xl transition cursor-pointer"
            >
              Parol yoki SMS bilan kiring
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-3 space-y-4">
            <div className="relative">
              {status === "scanning" && (
                <span className="absolute -inset-4 rounded-full bg-purple-600/30 animate-ping pointer-events-none" />
              )}

              <button
                type="button"
                onClick={() => triggerBiometricScan()}
                disabled={status === "scanning"}
                className={`w-24 h-24 rounded-3xl border-2 flex items-center justify-center transition-all duration-300 cursor-pointer shadow-2xl ${
                  status === "success"
                    ? "bg-emerald-600/20 border-emerald-500 text-emerald-400 scale-105"
                    : status === "scanning"
                    ? "bg-purple-600/25 border-purple-400 text-purple-300 animate-pulse scale-100"
                    : status === "error"
                    ? "bg-red-500/15 border-red-500 text-red-400"
                    : "bg-[#16131F] border-white/10 text-white/70 hover:border-purple-500 hover:text-white"
                }`}
              >
                {status === "success" ? (
                  <Check className="w-12 h-12 text-emerald-400 animate-bounce" />
                ) : status === "scanning" ? (
                  biometricType === "face_id" ? (
                    <ScanFace className="w-12 h-12 text-purple-400 animate-pulse" />
                  ) : (
                    <Fingerprint className="w-12 h-12 text-purple-400 animate-pulse" />
                  )
                ) : status === "error" ? (
                  <AlertTriangle className="w-10 h-10 text-red-400" />
                ) : biometricType === "face_id" ? (
                  <ScanFace className="w-12 h-12 text-purple-400" />
                ) : (
                  <Fingerprint className="w-12 h-12 text-purple-400" />
                )}
              </button>
            </div>

            <div className="space-y-1 max-w-xs">
              <p className="text-xs font-bold text-white">
                {status === "scanning"
                  ? "Qurilma biometrik tekshiruvi kutilyapti..."
                  : status === "success"
                  ? "Muvaffaqiyatli tasdiqlandi!"
                  : status === "error"
                  ? errorMessage || "Tekshirish amalga oshmadi"
                  : "Skanerlashni boshlash uchun bosing"}
              </p>
              <p className="text-[10px] text-white/40">
                YukLa Secure Enclave • Shaxsiy biometrik suratlar saqlanmaydi
              </p>
            </div>

            {status === "error" && (
              <button
                onClick={() => triggerBiometricScan()}
                className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-bold pt-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Qayta urinish</span>
              </button>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onSwitchToPasswordLogin) onSwitchToPasswordLogin();
                }}
                className="text-xs text-white/50 hover:text-purple-300 transition underline cursor-pointer"
              >
                Parol orqali kirish
              </button>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="border-t border-white/5 pt-3 text-[10px] text-white/30 flex items-center justify-between">
          <span>Enterprise Biometrics v2.4</span>
          <span className="text-purple-400 font-mono">FIDO2 / WebAuthn</span>
        </div>
      </div>
    </div>
  );
}
