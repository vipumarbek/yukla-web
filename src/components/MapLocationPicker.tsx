/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { COUNTRIES, Country, Region, District } from "../locationData";
import { MapPin, Navigation, Compass, Search, Globe, ChevronDown, CheckCircle, Info, Loader2 } from "lucide-react";
import { usePermissions } from "../context/PermissionContext";

interface LocationData {
  country: string;
  region: string;
  district: string;
  address: string;
  lat: number;
  lng: number;
}

interface MapLocationPickerProps {
  label: string;
  value: LocationData;
  onChange: (value: LocationData) => void;
  accentColor?: string; // e.g., 'purple' or 'fuchsia'
}

export default function MapLocationPicker({
  label,
  value,
  onChange,
  accentColor = "purple",
}: MapLocationPickerProps) {
  const { requestPermission } = usePermissions();
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    COUNTRIES.find((c) => c.nameEn === value.country || c.nameUz === value.country) || COUNTRIES[0]
  );
  const [gpsLoading, setGpsLoading] = useState(false);
  const [geocodingLoading, setGeocodingLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const regionOptions = selectedCountry.regions || [];
  const currentRegion = regionOptions.find(
    (r) => r.nameUz === value.region || r.nameEn === value.region
  );
  const districtOptions = currentRegion ? currentRegion.districts : [];

  // Update country handler
  const handleCountryChange = (countryName: string) => {
    const found = COUNTRIES.find((c) => c.nameUz === countryName || c.nameEn === countryName);
    if (found) {
      setSelectedCountry(found);
      const defaultReg = found.regions[0]?.nameUz || "";
      const defaultDist = found.regions[0]?.districts[0]?.nameUz || "";
      const defaultLat = found.regions[0]?.districts[0]?.lat || found.lat;
      const defaultLng = found.regions[0]?.districts[0]?.lng || found.lng;

      onChange({
        ...value,
        country: found.nameUz,
        region: defaultReg,
        district: defaultDist,
        lat: defaultLat,
        lng: defaultLng,
      });
    }
  };

  // Update region handler
  const handleRegionChange = (regionName: string) => {
    const foundReg = regionOptions.find((r) => r.nameUz === regionName || r.nameEn === regionName);
    if (foundReg) {
      const defaultDist = foundReg.districts[0]?.nameUz || "";
      const defaultLat = foundReg.districts[0]?.lat || foundReg.lat;
      const defaultLng = foundReg.districts[0]?.lng || foundReg.lng;

      onChange({
        ...value,
        region: foundReg.nameUz,
        district: defaultDist,
        lat: defaultLat,
        lng: defaultLng,
      });
    }
  };

  // Update district handler
  const handleDistrictChange = (districtName: string) => {
    const foundDist = districtOptions.find((d) => d.nameUz === districtName || d.nameEn === districtName);
    if (foundDist) {
      onChange({
        ...value,
        district: foundDist.nameUz,
        lat: foundDist.lat,
        lng: foundDist.lng,
      });
    }
  };

  // Direct address typing with backend geocoding proxy
  const handleManualAddressChange = (addr: string) => {
    onChange({
      ...value,
      address: addr,
    });

    // Debounced geocoding via secure backend reverse-proxy (/api/maps/geocode)
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (addr.trim().length >= 4) {
      debounceTimerRef.current = setTimeout(async () => {
        setGeocodingLoading(true);
        try {
          const res = await fetch(`/api/maps/geocode?address=${encodeURIComponent(addr)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.location) {
              onChange({
                ...value,
                address: addr,
                lat: data.location.lat,
                lng: data.location.lng,
                region: data.region || value.region,
              });
            }
          }
        } catch {
          // Graceful fallback
        } finally {
          setGeocodingLoading(false);
        }
      }, 800);
    }
  };

  // GPS Current position locator using backend geocode proxy
  const handleUseGPSLocation = async () => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setFeedbackMessage("Qurilmangizda geolokatsiya xizmati mavjud emas.");
      return;
    }

    setGpsLoading(true);
    setFeedbackMessage(null);

    const allowed = await requestPermission(
      "location",
      "Yuklarni to'g'ri nuqtadan yuklash va drayverlar uchun ETA xaritasini optimallashtirish"
    );

    if (!allowed) {
      setGpsLoading(false);
      setFeedbackMessage("Geolokatsiyaga ruxsat berilmadi. Manzilni ro'yxatdan tanlang.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Call backend geocode proxy to reverse-geocode coordinates securely
          const res = await fetch(`/api/maps/geocode?lat=${latitude}&lng=${longitude}`);
          if (res.ok) {
            const data = await res.json();
            onChange({
              ...value,
              address: data.formattedAddress || value.address || "Aniqlangan joriy manzil",
              region: data.region || value.region,
              lat: latitude,
              lng: longitude,
            });
            setFeedbackMessage("Joriy GPS koordinatalari muvaffaqiyatli aniqlandi.");
          } else {
            onChange({
              ...value,
              lat: latitude,
              lng: longitude,
            });
          }
        } catch {
          onChange({
            ...value,
            lat: latitude,
            lng: longitude,
          });
        } finally {
          setGpsLoading(false);
          setTimeout(() => setFeedbackMessage(null), 4000);
        }
      },
      (err) => {
        console.warn("GPS lookup failed:", err);
        setGpsLoading(false);
        setFeedbackMessage("GPS joylashuvni aniqlab bo'lmadi. Tuman yoki shaharni tanlang.");
        setTimeout(() => setFeedbackMessage(null), 4000);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Click on the interactive map canvas to reposition pin
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Relative offset around Uzbekistan bounding box (Lat: 37.0 - 45.5, Lng: 56.0 - 73.0)
    const baseLat = value.lat || 41.2995;
    const baseLng = value.lng || 69.2401;

    const deltaLat = (0.5 - y) * 0.08;
    const deltaLng = (x - 0.5) * 0.12;

    const newLat = Number((baseLat + deltaLat).toFixed(5));
    const newLng = Number((baseLng + deltaLng).toFixed(5));

    onChange({
      ...value,
      lat: newLat,
      lng: newLng,
    });
  };

  const accentBorder =
    accentColor === "fuchsia"
      ? "focus:border-fuchsia-500 text-fuchsia-400"
      : "focus:border-purple-500 text-purple-400";

  return (
    <div className="space-y-3 bg-[#0d0722]/80 border border-white/10 p-4 rounded-2xl">
      {/* Header with Title and GPS Action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${accentColor === "fuchsia" ? "bg-fuchsia-500/20 text-fuchsia-400" : "bg-purple-500/20 text-purple-400"}`}>
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-wide">{label}</h4>
            <p className="text-[10px] text-slate-300">Respublika va xalqaro transport logistika nuqtasi</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleUseGPSLocation}
          disabled={gpsLoading}
          aria-label="Joriy GPS manzilimni aniqlash"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-[11px] font-semibold transition disabled:opacity-50"
        >
          {gpsLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Compass className="w-3.5 h-3.5" />
          )}
          <span>{gpsLoading ? "Aniqlanmoqda..." : "GPS Lokatsiya"}</span>
        </button>
      </div>

      {feedbackMessage && (
        <div className="px-3 py-2 rounded-xl bg-purple-900/30 border border-purple-500/20 text-[11px] text-purple-200 flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Structured Region and District Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Country Selector */}
        <div className="space-y-1 text-xs">
          <label className="text-[10px] text-slate-300 font-bold uppercase block tracking-wider">
            Davlat (Country)
          </label>
          <div className="relative">
            <Globe className="w-3.5 h-3.5 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedCountry.nameUz}
              onChange={(e) => handleCountryChange(e.target.value)}
              aria-label="Davlatni tanlang"
              className="w-full bg-black/60 border border-white/15 h-10 pl-8 pr-4 text-xs rounded-xl focus:border-purple-500 text-white outline-none appearance-none"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.nameUz} className="bg-slate-900 text-white">
                  {c.nameUz} ({c.code})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Region Selector */}
        <div className="space-y-1 text-xs">
          <label className="text-[10px] text-slate-300 font-bold uppercase block tracking-wider">
            Viloyat / Shahar *
          </label>
          <div className="relative">
            <MapPin className="w-3.5 h-3.5 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={value.region}
              onChange={(e) => handleRegionChange(e.target.value)}
              aria-label="Viloyat yoki shaharni tanlang"
              className="w-full bg-black/60 border border-white/15 h-10 pl-8 pr-4 text-xs rounded-xl focus:border-purple-500 text-white outline-none appearance-none"
            >
              {regionOptions.map((r, i) => (
                <option key={i} value={r.nameUz} className="bg-slate-900 text-white">
                  {r.nameUz}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* District Selector */}
        <div className="space-y-1 text-xs">
          <label className="text-[10px] text-slate-300 font-bold uppercase block tracking-wider">
            Tuman (District)
          </label>
          <div className="relative">
            <Navigation className="w-3.5 h-3.5 text-fuchsia-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={value.district}
              disabled={districtOptions.length === 0}
              onChange={(e) => handleDistrictChange(e.target.value)}
              aria-label="Tumanni tanlang"
              className="w-full bg-black/60 border border-white/15 h-10 pl-8 pr-4 text-xs rounded-xl focus:border-purple-500 text-white outline-none disabled:opacity-40 appearance-none"
            >
              {districtOptions.map((d, i) => (
                <option key={i} value={d.nameUz} className="bg-slate-900 text-white">
                  {d.nameUz}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Manual street / warehouse address input with proxy geocoding */}
      <div className="space-y-1 relative">
        <div className="flex justify-between items-center">
          <label className="text-[10px] text-slate-300 font-bold uppercase block tracking-wider">
            Aniq manzil yoki mo'ljal *
          </label>
          {geocodingLoading && (
            <span className="text-[10px] text-purple-300 flex items-center gap-1 font-mono">
              <Loader2 className="w-2.5 h-2.5 animate-spin" /> Geokodlanmoqda...
            </span>
          )}
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            required
            value={value.address}
            onChange={(e) => handleManualAddressChange(e.target.value)}
            placeholder="Ko'cha nomi, ombor yoki bozor nomi..."
            aria-label="Aniq manzil yoki mo'ljal"
            className={`w-full bg-black/60 border border-white/15 h-11 pl-10 pr-4 text-xs rounded-xl outline-none font-sans text-white placeholder-slate-400 ${accentBorder}`}
          />
        </div>
      </div>

      {/* Interactive GIS Spatial Radar & Coordinate Vector Map */}
      <div
        onClick={handleCanvasClick}
        title="Xarita nuqtasini siljitish uchun bosing"
        role="region"
        aria-label="Interaktiv koordinatalar xaritasi"
        className="relative w-full h-44 sm:h-48 bg-gradient-to-tr from-[#120a2e] to-[#040212] rounded-2xl overflow-hidden border border-purple-500/20 cursor-crosshair group shadow-inner"
      >
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1.5px,transparent_1.5px)] [background-size:18px_18px] opacity-70"></div>

        {/* Animated grid radar lines */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-32 h-32 rounded-full border border-purple-500/20 animate-ping opacity-30"></div>
          <div className="w-20 h-20 rounded-full border border-purple-500/30"></div>
          <div className="w-48 h-48 rounded-full border border-dashed border-purple-500/15"></div>
        </div>

        {/* Centered Target Pin */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
          <div className="relative flex flex-col items-center">
            <div className={`p-2 rounded-full shadow-lg ${accentColor === "fuchsia" ? "bg-fuchsia-600 text-white" : "bg-purple-600 text-white"} ring-4 ring-purple-500/30 animate-bounce`}>
              <MapPin className="w-5 h-5 fill-current" />
            </div>
            <span className="mt-1 px-2 py-0.5 rounded-full bg-black/80 border border-white/20 text-[10px] font-bold text-white font-mono shadow">
              {value.district || value.region || "Belgilangan nuqta"}
            </span>
          </div>
        </div>

        {/* Coordinates info footer */}
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between bg-black/75 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-md z-30">
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-200">
            <span className="text-yellow-400 font-bold">Lat: {(value.lat || 41.2995).toFixed(4)}</span>
            <span className="text-slate-500">•</span>
            <span className="text-cyan-400 font-bold">Lng: {(value.lng || 69.2401).toFixed(4)}</span>
          </div>
          <span className="text-[10px] text-purple-300 font-sans hidden sm:inline">
            Xaritada siljitish uchun bosing
          </span>
        </div>
      </div>
    </div>
  );
}
