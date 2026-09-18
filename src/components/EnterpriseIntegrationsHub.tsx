/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User, EnterpriseIntegration } from "../types";
import { useTranslation } from "../context/LanguageContext";
import {
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  Building,
  Fuel,
  Radio,
  FileText,
  CreditCard,
  RefreshCw,
  Search,
  Filter,
  Activity,
  Globe2,
  Lock
} from "lucide-react";

interface EnterpriseIntegrationsHubProps {
  user: User;
  token: string | null;
}

export default function EnterpriseIntegrationsHub({ user, token }: EnterpriseIntegrationsHubProps) {
  const { t } = useTranslation();
  const [integrations, setIntegrations] = useState<EnterpriseIntegration[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/integrations/directory");
      if (res.ok) {
        const data = await res.json();
        setIntegrations(data || []);
      }
    } catch (err) {
      console.error("Integrations fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const filteredIntegrations = integrations.filter((item) => {
    const matchesCat = categoryFilter === "all" || item.category === categoryFilter;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getStatusBadge = (status: "implemented" | "mock_demo" | "planned") => {
    switch (status) {
      case "implemented":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            <span>Implemented (Production Live)</span>
          </span>
        );
      case "mock_demo":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertCircle className="w-3 h-3" />
            <span>Mock / Demo Sandbox</span>
          </span>
        );
      case "planned":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <Clock className="w-3 h-3" />
            <span>Planned Q3-Q4 2026</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 lg:p-8 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Globe2 className="w-3.5 h-3.5" />
                <span>Enterprise API & Ecosystem Directory</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                100% Transparent Architecture
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
              External Integrations Status & Protocols
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl mt-1">
              Barcha tashqi integratsiyalar (banklar, bojxona organlari, sug'urta kompaniyalari, yoqilg'i tarmoqlari va IoT datchiklari) to'liq shaffof tarzda holati ko'rsatilgan.
            </p>
          </div>

          <button
            onClick={fetchIntegrations}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold flex items-center gap-2 transition cursor-pointer self-start lg:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Yangilash</span>
          </button>
        </div>

        {/* Filter / Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setCategoryFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                categoryFilter === "all" ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              Barchasi ({integrations.length})
            </button>
            <button
              onClick={() => setCategoryFilter("banking")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                categoryFilter === "banking" ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              Bank & To'lovlar
            </button>
            <button
              onClick={() => setCategoryFilter("customs")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                categoryFilter === "customs" ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              Bojxona & E-Faktura
            </button>
            <button
              onClick={() => setCategoryFilter("telematics")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                categoryFilter === "telematics" ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              IoT & Telemetriya
            </button>
            <button
              onClick={() => setCategoryFilter("fuel")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                categoryFilter === "fuel" ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              Yoqilg'i Tarmoqlari
            </button>
            <button
              onClick={() => setCategoryFilter("insurance")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                categoryFilter === "insurance" ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              Sug'urta
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Integratsiyalardan izlash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full sm:w-60"
            />
          </div>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIntegrations.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 hover:border-indigo-500/30 transition space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-base font-bold text-white">{item.name}</h4>
                  <span className="text-xs text-indigo-400 font-medium">{item.provider}</span>
                </div>
                {getStatusBadge(item.status)}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-white/5 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Protokol / Standart:</span>
                <span className="font-mono text-purple-300 font-medium">{item.protocol}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Ma'lumot almashinuvi:</span>
                <span className="text-slate-300">{item.dataFlow}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Xavfsizlik & Autentifikatsiya:</span>
                <span className="font-mono text-emerald-400 text-[11px] flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>{item.authMethod}</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
