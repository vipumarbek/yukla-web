/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { LanguageCode, User } from "../types";
import {
  Building2,
  ShieldCheck,
  FileCheck2,
  Code2,
  Lock,
  ArrowRight,
  Sparkles,
  Award,
  Zap,
  TrendingUp,
  CheckCircle2,
  Users,
  Briefcase
} from "lucide-react";

interface EnterpriseShipperHubProps {
  currentLang: LanguageCode;
  user: User | null;
  onOpenTenders: () => void;
  onOpenCompanyAuth: () => void;
}

export default function EnterpriseShipperHub({
  currentLang,
  user,
  onOpenTenders,
  onOpenCompanyAuth
}: EnterpriseShipperHubProps) {
  const enterpriseClients = [
    { name: "TEXNOPARK MCHJ", sector: "Sanoat Ishlab Chiqarish", volume: "450+ reys/oy", tag: "Enterprise" },
    { name: "ARTEL ELECTRONICS", sector: "Maishiy Texnika", volume: "1,200+ reys/oy", tag: "Tier-1 Partner" },
    { name: "AKFA GROUP", sector: "Qurilish Materiallari", volume: "800+ reys/oy", tag: "Enterprise" },
    { name: "NESTLE UZBEKISTAN", sector: "FMCG & Oziq-ovqat", volume: "350+ reys/oy (Ref)", tag: "Cold Chain" },
    { name: "KORZINKA LOGISTICS", sector: "Retail & Distribyutsiya", volume: "1,500+ reys/oy", tag: "Daily SLA" }
  ];

  return (
    <section id="enterprise-hub" className="py-24 relative px-4 lg:px-10 bg-gradient-to-b from-[#060212] via-[#0b051e] to-[#060212] border-b border-white/5 overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-16 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="px-3.5 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] uppercase font-mono font-bold tracking-widest rounded-full">
            B2B & ENTERPRISE TMS SUITE
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Katta Korxonalar va Zavodlar Uchun Korporativ Logistika
          </h2>
          <p className="text-xs sm:text-sm text-white/60">
            Didox E-Faktura bilan avtomatlashtirilgan hisob-kitoblar, 100% sug'urta kafolati, 1C/SAP API va maxsus korporativ tariflar.
          </p>
        </div>

        {/* 4 Feature Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Pillar 1: Sug'urta Kafolati */}
          <div className="bg-white/5 border border-white/10 hover:border-amber-500/30 rounded-3xl p-6 space-y-4 transition duration-300">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">500 Mln UZS Sug'urta Kafolati</h3>
            <p className="text-xs text-white/50 leading-relaxed">
              Barcha korporativ yuklar Apex & Gross Insurance kafolati ostida avtomatik 100% sug'urtalanadi.
            </p>
          </div>

          {/* Pillar 2: Didox & E-Nakladnaya */}
          <div className="bg-white/5 border border-white/10 hover:border-purple-500/30 rounded-3xl p-6 space-y-4 transition duration-300">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Didox E-Faktura & QQS</h3>
            <p className="text-xs text-white/50 leading-relaxed">
              12% QQS hisob-fakturalari, elektron shartnomalar va E-TTN hujjatlari Didox orqali 1 daqiqada tasdiqlanadi.
            </p>
          </div>

          {/* Pillar 3: 1C & SAP API */}
          <div className="bg-white/5 border border-white/10 hover:border-indigo-500/30 rounded-3xl p-6 space-y-4 transition duration-300">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Code2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">1C / SAP / ERP Integratsiya</h3>
            <p className="text-xs text-white/50 leading-relaxed">
              RESTful Webhooks va API kalitlari orqali omboringizdan to'g'ridan-to'g'ri fura chaqiring.
            </p>
          </div>

          {/* Pillar 4: Dedicated Key Account Manager */}
          <div className="bg-white/5 border border-white/10 hover:border-emerald-500/30 rounded-3xl p-6 space-y-4 transition duration-300">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">99.4% On-Time SLA & Menejer</h3>
            <p className="text-xs text-white/50 leading-relaxed">
              Har bir enterprise mijoz uchun 24/7 shaxsiy logist dispetcher va doimiy zaxira furalar kafolati.
            </p>
          </div>

        </div>

        {/* Enterprise Client Ticker / Proof Wall */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Ishonchli Korporativ Hamkorlarimiz</h3>
              <p className="text-xs text-white/50">O'zbekistonning eng yirik sanoat va FMCG gigantlari</p>
            </div>
            <span className="text-xs font-mono text-emerald-400">● 1,240+ Korporativ Shartnomalar</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {enterpriseClients.map((client, i) => (
              <div key={i} className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-bold">
                    {client.tag}
                  </span>
                </div>
                <h4 className="text-xs font-black text-white truncate">{client.name}</h4>
                <p className="text-[10px] text-white/40">{client.sector}</p>
                <p className="text-[10px] font-mono text-emerald-400 pt-1 border-t border-white/5">{client.volume}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Call to Action Banner */}
        <div className="bg-gradient-to-r from-purple-900/40 via-[#190d38] to-[#0f0724] border border-purple-500/30 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-2xl font-black text-white">
              Korporativ Tender E'lon Qiling Yoki API Ulanishni So'rang
            </h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Oylik 30 tadan ortiq qatnovga ega korxonalar uchun narxlarni 15-25% ga arzonlashtiruvchi B2B tender tizimi.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={onOpenTenders}
              className="bg-white hover:bg-purple-600 text-black hover:text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-lg"
            >
              <Briefcase className="w-4 h-4" />
              <span>B2B Tenderlar Zali</span>
            </button>

            <button
              onClick={onOpenCompanyAuth}
              className="bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/40 font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Building2 className="w-4 h-4" />
              <span>Kompaniya Kabinetiga Kirish</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
