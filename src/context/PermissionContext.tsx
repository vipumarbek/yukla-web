import React, { createContext, useContext, useState, useEffect } from "react";
import { useTranslation } from "./LanguageContext";
import { LanguageCode } from "../types";

export type PermissionStatus = "granted" | "denied" | "prompt";

export interface PermissionState {
  location: PermissionStatus;
  camera: PermissionStatus;
  photoLibrary: PermissionStatus;
  notifications: PermissionStatus;
  fileAccess: PermissionStatus;
  microphone: "disabled"; // Disabled as per instructions
  phone: PermissionStatus;
  biometrics: PermissionStatus;
}

export interface NetworkState {
  online: boolean;
  type: "fast" | "medium" | "slow" | "offline";
  rtt?: number; // Round-trip time in ms
}

export interface BatteryState {
  level: number; // 0 to 1
  charging: boolean;
  isLow: boolean;
  batterySaver: boolean;
}

export interface GpsState {
  accuracy: "excellent" | "good" | "weak";
  accuracyValue: number; // in meters
}

export interface DeviceState {
  type: "desktop" | "tablet" | "mobile";
  os: string;
}

interface PermissionContextType {
  permissions: PermissionState;
  network: NetworkState;
  battery: BatteryState;
  gps: GpsState;
  device: DeviceState;
  systemTheme: "dark" | "light";
  manualThemeOverride: "dark" | "light" | null;
  setManualThemeOverride: (theme: "dark" | "light" | null) => void;
  requestPermission: (key: keyof PermissionState, purposeKey?: string) => Promise<boolean>;
  resetPermission: (key: keyof PermissionState) => void;
  simulateGpsDegradation: () => void;
  triggerBiometricAuth: (actionDescription?: string) => Promise<boolean>;
  activeExplainer: {
    key: keyof PermissionState;
    purpose?: string;
    resolve: (val: boolean) => void;
  } | null;
  closeExplainer: (allow: boolean) => void;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const { currentLang, changeLang } = useTranslation();

  // 1. Initial State for Permissions (cached in localStorage)
  const [permissions, setPermissions] = useState<PermissionState>(() => {
    try {
      const cached = localStorage.getItem("yukla_permissions");
      if (cached) {
        const parsed = JSON.parse(cached);
        return {
          ...parsed,
          microphone: "disabled" // Always disabled as per spec
        };
      }
    } catch (e) {
      console.error("Failed to parse cached permissions:", e);
    }
    return {
      location: "prompt",
      camera: "prompt",
      photoLibrary: "prompt",
      notifications: "prompt",
      fileAccess: "prompt",
      microphone: "disabled",
      phone: "prompt",
      biometrics: "prompt",
    };
  });

  // Save permissions cache on update
  useEffect(() => {
    localStorage.setItem("yukla_permissions", JSON.stringify(permissions));
  }, [permissions]);

  // 2. Network Status Detection
  const [network, setNetwork] = useState<NetworkState>({
    online: navigator.onLine,
    type: "fast",
  });

  useEffect(() => {
    const updateNetwork = () => {
      const isOnline = navigator.onLine;
      let connectionType: "fast" | "medium" | "slow" | "offline" = isOnline ? "fast" : "offline";
      let rttValue = undefined;

      // Access Navigator Connection API if supported
      const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      if (conn && isOnline) {
        rttValue = conn.rtt;
        const effectiveType = conn.effectiveType; // 'slow-2g', '2g', '3g', '4g'
        if (effectiveType === "slow-2g" || effectiveType === "2g") {
          connectionType = "slow";
        } else if (effectiveType === "3g") {
          connectionType = "medium";
        } else {
          connectionType = "fast";
        }
      }

      setNetwork({
        online: isOnline,
        type: connectionType,
        rtt: rttValue,
      });
    };

    window.addEventListener("online", updateNetwork);
    window.addEventListener("offline", updateNetwork);
    
    const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (conn) {
      conn.addEventListener("change", updateNetwork);
    }

    updateNetwork();

    return () => {
      window.removeEventListener("online", updateNetwork);
      window.removeEventListener("offline", updateNetwork);
      if (conn) {
        conn.removeEventListener("change", updateNetwork);
      }
    };
  }, []);

  // 3. Battery Status Detection
  const [battery, setBattery] = useState<BatteryState>({
    level: 1,
    charging: true,
    isLow: false,
    batterySaver: false,
  });

  useEffect(() => {
    let batteryInstance: any = null;

    const updateBatteryInfo = (batt: any) => {
      const level = batt.level;
      const charging = batt.charging;
      const isLow = level <= 0.2 && !charging;
      setBattery({
        level,
        charging,
        isLow,
        batterySaver: isLow, // Enable battery saver when under 20% and not charging
      });
    };

    if ("getBattery" in navigator) {
      (navigator as any).getBattery().then((batt: any) => {
        batteryInstance = batt;
        updateBatteryInfo(batt);

        batt.addEventListener("levelchange", () => updateBatteryInfo(batt));
        batt.addEventListener("chargingchange", () => updateBatteryInfo(batt));
      });
    }

    return () => {
      if (batteryInstance) {
        batteryInstance.removeEventListener("levelchange", () => {});
        batteryInstance.removeEventListener("chargingchange", () => {});
      }
    };
  }, []);

  // 4. GPS Accuracy Detection
  const [gps, setGps] = useState<GpsState>({
    accuracy: "excellent",
    accuracyValue: 4, // 4 meters
  });

  const simulateGpsDegradation = () => {
    const states: Array<{ accuracy: "excellent" | "good" | "weak"; val: number }> = [
      { accuracy: "excellent", val: 3 },
      { accuracy: "good", val: 12 },
      { accuracy: "weak", val: 85 },
    ];
    // Cycle through states to simulate weak GPS scenario
    setGps((curr) => {
      const index = states.findIndex((s) => s.accuracy === curr.accuracy);
      const nextIndex = (index + 1) % states.length;
      return {
        accuracy: states[nextIndex].accuracy,
        accuracyValue: states[nextIndex].val,
      };
    });
  };

  // 5. Device Information Detection
  const [device, setDevice] = useState<DeviceState>({
    type: "desktop",
    os: "Unknown",
  });

  useEffect(() => {
    const detectDevice = () => {
      const ua = navigator.userAgent;
      const width = window.innerWidth;
      
      let type: "desktop" | "tablet" | "mobile" = "desktop";
      if (width < 768) {
        type = "mobile";
      } else if (width >= 768 && width < 1024) {
        type = "tablet";
      }

      let os = "Web Browser";
      if (ua.indexOf("Win") !== -1) os = "Windows";
      if (ua.indexOf("Mac") !== -1) os = "macOS";
      if (ua.indexOf("X11") !== -1) os = "UNIX";
      if (ua.indexOf("Linux") !== -1) os = "Linux";
      if (/Android/.test(ua)) os = "Android";
      if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";

      setDevice({ type, os });
    };

    detectDevice();
    window.addEventListener("resize", detectDevice);
    return () => window.removeEventListener("resize", detectDevice);
  }, []);

  // 6. Theme and Layout Override detection
  const [manualThemeOverride, setManualThemeOverride] = useState<"dark" | "light" | null>(() => {
    const cached = localStorage.getItem("yukla_theme_override");
    return (cached as "dark" | "light" | null) || null;
  });

  const [systemTheme, setSystemTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleThemeChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    handleThemeChange(mediaQuery);
    mediaQuery.addEventListener("change", handleThemeChange);
    return () => mediaQuery.removeEventListener("change", handleThemeChange);
  }, []);

  useEffect(() => {
    if (manualThemeOverride) {
      localStorage.setItem("yukla_theme_override", manualThemeOverride);
      document.documentElement.classList.toggle("light", manualThemeOverride === "light");
      document.documentElement.classList.toggle("dark", manualThemeOverride === "dark");
    } else {
      localStorage.removeItem("yukla_theme_override");
      document.documentElement.classList.toggle("dark", systemTheme === "dark");
      document.documentElement.classList.toggle("light", systemTheme === "light");
    }
  }, [manualThemeOverride, systemTheme]);

  // 7. Auto Language Preference Detection
  useEffect(() => {
    const cachedLang = localStorage.getItem("yukla_lang");
    if (!cachedLang) {
      const browserLang = navigator.language.slice(0, 2);
      const supportedLangs: LanguageCode[] = ["uz", "en", "ru"];
      if (supportedLangs.includes(browserLang as LanguageCode)) {
        changeLang(browserLang as LanguageCode);
      } else {
        changeLang("uz"); // default to Uzbek
      }
    }
  }, []);

  // 8. Custom Permission Flow - Intercept Explainer Dialog State
  const [activeExplainer, setActiveExplainer] = useState<{
    key: keyof PermissionState;
    purpose?: string;
    resolve: (val: boolean) => void;
  } | null>(null);

  // Helper to trigger native prompt or resolve state
  const executeNativePrompt = async (key: keyof PermissionState): Promise<boolean> => {
    if (key === "location") {
      return new Promise((resolve) => {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            () => {
              setPermissions((p) => ({ ...p, location: "granted" }));
              resolve(true);
            },
            (err) => {
              console.warn("Geolocation denied or error:", err);
              setPermissions((p) => ({ ...p, location: "denied" }));
              resolve(false);
            },
            { timeout: 5000 }
          );
        } else {
          setPermissions((p) => ({ ...p, location: "denied" }));
          resolve(false);
        }
      });
    }

    if (key === "camera") {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((t) => t.stop());
        setPermissions((p) => ({ ...p, camera: "granted" }));
        return true;
      } catch (err) {
        console.warn("Camera denied:", err);
        setPermissions((p) => ({ ...p, camera: "denied" }));
        return false;
      }
    }

    if (key === "notifications") {
      try {
        const res = await Notification.requestPermission();
        if (res === "granted") {
          setPermissions((p) => ({ ...p, notifications: "granted" }));
          return true;
        } else {
          setPermissions((p) => ({ ...p, notifications: "denied" }));
          return false;
        }
      } catch (err) {
        // Fallback simulation in sandbox/iframe environments
        setPermissions((p) => ({ ...p, notifications: "granted" }));
        return true;
      }
    }

    // Mock native approvals for remaining items (Photo Library, File Access, Phone, Biometrics)
    setPermissions((p) => ({ ...p, [key]: "granted" }));
    return true;
  };

  const requestPermission = (key: keyof PermissionState, purpose?: string): Promise<boolean> => {
    if (permissions[key] === "granted") {
      return Promise.resolve(true);
    }

    if (key === "microphone") {
      // Always prevent enabling microphone as requested
      return Promise.resolve(false);
    }

    return new Promise((resolve) => {
      setActiveExplainer({
        key,
        purpose,
        resolve: async (userAllowed) => {
          if (userAllowed) {
            const nativeGranted = await executeNativePrompt(key);
            resolve(nativeGranted);
          } else {
            // Keep it denied or prompt depending on explicit choice
            resolve(false);
          }
        },
      });
    });
  };

  const closeExplainer = (allow: boolean) => {
    if (activeExplainer) {
      activeExplainer.resolve(allow);
      setActiveExplainer(null);
    }
  };

  const resetPermission = (key: keyof PermissionState) => {
    if (key === "microphone") return;
    setPermissions((p) => ({ ...p, [key]: "prompt" }));
  };

  // 9. Biometric Authentication Trigger & Modal Simulation
  const triggerBiometricAuth = async (actionDescription: string = "To'lovni tasdiqlash"): Promise<boolean> => {
    if (permissions.biometrics !== "granted") {
      const ok = await requestPermission("biometrics", actionDescription);
      if (!ok) return false;
    }

    return new Promise((resolve) => {
      // Simulate high fidelity Touch ID / Face ID prompt
      const authSuccess = Math.random() > 0.05; // 95% success rate
      setTimeout(() => {
        resolve(authSuccess);
      }, 1500);
    });
  };

  return (
    <PermissionContext.Provider
      value={{
        permissions,
        network,
        battery,
        gps,
        device,
        systemTheme,
        manualThemeOverride,
        setManualThemeOverride,
        requestPermission,
        resetPermission,
        simulateGpsDegradation,
        triggerBiometricAuth,
        activeExplainer,
        closeExplainer,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error("usePermissions must be used within a PermissionProvider");
  }
  return context;
}
