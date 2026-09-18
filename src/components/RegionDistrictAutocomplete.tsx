/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useId } from "react";
import { COUNTRIES, Region, District } from "../locationData";
import { MapPin, Search, Check, ChevronDown, Building, X } from "lucide-react";

interface StructuredLocationResult {
  address: string;
  region: string;
  district: string;
  lat: number;
  lng: number;
}

interface RegionDistrictAutocompleteProps {
  label: string;
  value: string;
  onChange: (result: StructuredLocationResult) => void;
  placeholder?: string;
  required?: boolean;
  accentColor?: "purple" | "pink" | "blue" | "emerald";
  className?: string;
  id?: string;
}

export default function RegionDistrictAutocomplete({
  label,
  value,
  onChange,
  placeholder = "Viloyat, shahar yoki tuman qidiring...",
  required = false,
  accentColor = "purple",
  className = "",
  id: customId,
}: RegionDistrictAutocompleteProps) {
  const generatedId = useId();
  const inputId = customId || `loc-autocomplete-${generatedId}`;
  const listboxId = `listbox-${generatedId}`;

  const [inputValue, setInputValue] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Flatten regions and districts for fast searching
  const uzbekistan = COUNTRIES.find((c) => c.code === "UZ") || COUNTRIES[0];
  const allLocations = React.useMemo(() => {
    const list: Array<{
      type: "region" | "district";
      nameUz: string;
      nameRu: string;
      regionName: string;
      lat: number;
      lng: number;
      displayText: string;
    }> = [];

    uzbekistan.regions.forEach((reg) => {
      list.push({
        type: "region",
        nameUz: reg.nameUz,
        nameRu: reg.nameRu,
        regionName: reg.nameUz,
        lat: reg.lat,
        lng: reg.lng,
        displayText: `${reg.nameUz}`,
      });

      reg.districts.forEach((dist) => {
        list.push({
          type: "district",
          nameUz: dist.nameUz,
          nameRu: dist.nameRu,
          regionName: reg.nameUz,
          lat: dist.lat,
          lng: dist.lng,
          displayText: `${reg.nameUz}, ${dist.nameUz} tumani`,
        });
      });
    });

    return list;
  }, [uzbekistan]);

  // Synchronize local input state with external value changes
  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  // Filter locations based on input
  const filteredSuggestions = React.useMemo(() => {
    const q = inputValue.trim().toLowerCase();
    if (!q) {
      // Return major regional transport hubs by default
      return allLocations.filter((l) => l.type === "region").slice(0, 8);
    }
    return allLocations
      .filter((loc) => {
        return (
          loc.displayText.toLowerCase().includes(q) ||
          loc.nameUz.toLowerCase().includes(q) ||
          loc.nameRu.toLowerCase().includes(q) ||
          loc.regionName.toLowerCase().includes(q)
        );
      })
      .slice(0, 10);
  }, [inputValue, allLocations]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: (typeof allLocations)[0]) => {
    const newAddress = item.displayText;
    setInputValue(newAddress);
    setIsOpen(false);
    setHighlightedIndex(-1);

    onChange({
      address: newAddress,
      region: item.regionName,
      district: item.type === "district" ? item.nameUz : "",
      lat: item.lat,
      lng: item.lng,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredSuggestions.length) {
        handleSelect(filteredSuggestions[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const ringColor =
    accentColor === "pink"
      ? "focus:border-pink-500 focus:ring-pink-500/20"
      : accentColor === "emerald"
      ? "focus:border-emerald-500 focus:ring-emerald-500/20"
      : "focus:border-purple-500 focus:ring-purple-500/20";

  return (
    <div ref={containerRef} className={`relative space-y-1.5 ${className}`}>
      <div className="flex justify-between items-center">
        <label
          htmlFor={inputId}
          className="text-xs font-bold text-slate-200 block"
        >
          {label} {required && <span className="text-purple-400">*</span>}
        </label>
        <span className="text-[10px] text-purple-300/80 font-mono font-semibold">
          O'zbekiston viloyatlari
        </span>
      </div>

      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-purple-400">
          <MapPin className="w-4 h-4" />
        </div>

        <input
          id={inputId}
          type="text"
          value={inputValue}
          required={required}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          className={`w-full bg-[#0a0518]/90 border border-white/15 h-12 min-h-[48px] pl-10 pr-10 text-xs rounded-xl text-white placeholder-slate-400 outline-none transition duration-150 focus:ring-2 ${ringColor}`}
        />

        {inputValue ? (
          <button
            type="button"
            onClick={() => {
              setInputValue("");
              setIsOpen(true);
            }}
            aria-label="Manzilni tozalash"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      {/* Autocomplete Dropdown Listbox */}
      {isOpen && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={label}
          className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-xl bg-[#0f0826] border border-purple-500/30 shadow-2xl p-1.5 space-y-1 backdrop-blur-xl animate-fade-in"
        >
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((item, idx) => {
              const isSelected = highlightedIndex === idx;
              return (
                <li
                  key={`${item.displayText}-${idx}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs cursor-pointer transition ${
                    isSelected
                      ? "bg-purple-600/30 text-white font-bold border border-purple-500/40"
                      : "text-slate-200 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {item.type === "region" ? (
                      <Building className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    ) : (
                      <MapPin className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                    )}
                    <div className="truncate">
                      <span className="block truncate font-semibold">
                        {item.displayText}
                      </span>
                      <span className="block text-[10px] text-slate-400 font-mono">
                        {item.type === "region" ? "Viloyat / Markaz" : `Tuman (${item.regionName})`}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] text-purple-300/70 font-mono shrink-0 ml-2">
                    {item.lat.toFixed(2)}, {item.lng.toFixed(2)}
                  </span>
                </li>
              );
            })
          ) : (
            <li className="px-3 py-3 text-xs text-slate-400 text-center italic">
              Mos keluvchi shahar yoki tuman topilmadi. Qo'lda yozishingiz mumkin.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
