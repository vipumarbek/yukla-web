/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { LanguageCode } from "../types";
import {
  TrendingUp,
  Award,
  Globe2,
  DollarSign,
  ShieldCheck,
  Zap,
  Target,
  BarChart3,
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
  Building,
  Truck,
  Users,
  PieChart,
  Briefcase,
  Cpu,
  Check
} from "lucide-react";

interface InvestorDeckModalProps {
  currentLang: LanguageCode;
  onClose: () => void;
}

export default function InvestorDeckModal({ currentLang, onClose }: InvestorDeckModalProps) {
  const [activeTab, setActiveTab] = useState<"series_a" | "market_tam" | "financials" | "ai_moat" | "unit_economics" | "use_of_funds">("series_a");

  return (
    <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#090414] border border-purple-500/30 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative animate-fade-in">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-purple-950/50 via-[#0f0724] to-[#090414] flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-mono uppercase tracking-widest px-3 py-0.5 rounded-full font-bold">
                SERIES A ROUND • CONFIDENTIAL
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono uppercase tracking-wider px-3 py-0.5 rounded-full font-bold">
                Valuation: $5,000,000 Round / $24.0M Cap
              </span>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                GMV Run-rate: $14.8M
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 pt-1">
              <span>YukLa Technologies Inc. — Series A Investor Deck</span>
              <Sparkles className="w-5 h-5 text-purple-400" />
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center transition cursor-pointer text-lg font-bold"
          >
            &times;
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto gap-2 px-6 pt-4 pb-2 border-b border-white/5 bg-[#060210] no-scrollbar">
          {[
            { key: "series_a", label: "$5M Series A Thesis", icon: Target },
            { key: "market_tam", label: "$8.4B Central Asia TAM", icon: Globe2 },
            { key: "financials", label: "Financial Model & GMV", icon: DollarSign },
            { key: "ai_moat", label: "AI Dispatch & Moat", icon: Cpu },
            { key: "unit_economics", label: "13.8x LTV/CAC Economics", icon: BarChart3 },
            { key: "use_of_funds", label: "Use of $5M Funds", icon: PieChart },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? "bg-purple-600 text-white shadow-md shadow-purple-900/40"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-white text-xs leading-relaxed">
          
          {/* TAB 1: $5M SERIES A THESIS */}
          {activeTab === "series_a" && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                  <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider">
                    THE MASSIVE UNTAPPED OPPORTUNITY
                  </span>
                  <h3 className="text-base font-black text-white">Central Asia's Freight Infrastructure Bottleneck</h3>
                  <p className="text-white/70 text-xs leading-relaxed">
                    Logistics accounts for <strong>14.2% of Uzbekistan's GDP</strong>, yet 82% of all freight transactions are conducted via chaotic Telegram channels and telephone brokers with no verified escrow, 38% empty backhauls (deadheading), and zero cargo insurance.
                  </p>
                </div>

                <div className="bg-purple-950/30 border border-purple-500/40 rounded-2xl p-5 space-y-3">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                    THE YUKLA CATEGORY LEADER
                  </span>
                  <h3 className="text-base font-black text-white">The Digital Backbone for Modern Silk Road Trade</h3>
                  <p className="text-white/80 text-xs leading-relaxed">
                    YukLa is Central Asia's premier autonomous freight platform: <strong>AI dynamic pricing</strong>, instant 50% fuel advances to driver cards, Didox E-Faktura 1C/SAP integrations, and algorithmic return-load matching that eliminates empty trips.
                  </p>
                </div>
              </div>

              {/* 4 Key Investor Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-[#05010d] border border-white/5 p-4 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] text-white/40 uppercase font-mono">Current GMV Run-Rate</span>
                  <p className="text-xl font-black text-white font-mono">$14.8M / yr</p>
                  <span className="text-[9px] text-emerald-400 font-mono">+185% YoY Growth</span>
                </div>
                <div className="bg-[#05010d] border border-white/5 p-4 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] text-white/40 uppercase font-mono">Carrier Retention (90d)</span>
                  <p className="text-xl font-black text-purple-400 font-mono">82.4%</p>
                  <span className="text-[9px] text-purple-300 font-mono">High Switching Barrier</span>
                </div>
                <div className="bg-[#05010d] border border-white/5 p-4 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] text-white/40 uppercase font-mono">Target Take Rate</span>
                  <p className="text-xl font-black text-emerald-400 font-mono">3.0% - 5.5%</p>
                  <span className="text-[9px] text-white/40 font-mono">+ Escrow & SaaS Fees</span>
                </div>
                <div className="bg-[#05010d] border border-white/5 p-4 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] text-white/40 uppercase font-mono">Enterprise B2B Shippers</span>
                  <p className="text-xl font-black text-amber-400 font-mono">1,240+</p>
                  <span className="text-[9px] text-amber-300 font-mono">Artel, Texnopark, Akfa</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: $8.4B MARKET TAM */}
          {activeTab === "market_tam" && (
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white">Central Asia Freight TAM Breakdown</h3>
                    <p className="text-xs text-white/50">Total Addressable Market across Silk Road freight corridors</p>
                  </div>
                  <span className="text-base font-black font-mono text-emerald-400">$8.4 Billion Total</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                  <div className="p-4 bg-black/40 border border-white/5 rounded-xl space-y-2">
                    <span className="text-[10px] text-purple-400 uppercase font-bold">1. Uzbekistan Domestic</span>
                    <p className="text-xl font-black text-white">$3.8 Billion</p>
                    <p className="text-[11px] text-white/50 font-sans">
                      14 regions, 240,000+ commercial freight trucks, rapid FMCG & industrial expansion.
                    </p>
                  </div>

                  <div className="p-4 bg-black/40 border border-white/5 rounded-xl space-y-2">
                    <span className="text-[10px] text-indigo-400 uppercase font-bold">2. Kazakhstan & Cross-Border</span>
                    <p className="text-xl font-black text-white">$2.9 Billion</p>
                    <p className="text-[11px] text-white/50 font-sans">
                      Almaty-Tashkent-Shymkent bilateral trade artery with highest freight rates per ton.
                    </p>
                  </div>

                  <div className="p-4 bg-black/40 border border-white/5 rounded-xl space-y-2">
                    <span className="text-[10px] text-amber-400 uppercase font-bold">3. China-Kyrgyzstan-Uzbekistan Transit</span>
                    <p className="text-xl font-black text-white">$1.7 Billion</p>
                    <p className="text-[11px] text-white/50 font-sans">
                      Khorgos & Torugart multimodal transit gateway connecting China directly with the Middle East.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FINANCIAL MODEL & GMV */}
          {activeTab === "financials" && (
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-purple-400">
                  5-Year Financial Forecast & Scale Trajectory
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-white/40 uppercase text-[10px]">
                        <th className="pb-2">Metric</th>
                        <th className="pb-2">2026 (Live)</th>
                        <th className="pb-2">2027 (Scale)</th>
                        <th className="pb-2">2028 (Regional)</th>
                        <th className="pb-2">2029 (Leader)</th>
                        <th className="pb-2">2030 (IPO / Exit)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-white/80">
                      <tr>
                        <td className="py-2.5 font-bold text-white">Gross Merchandise Value (GMV)</td>
                        <td className="py-2.5 text-emerald-400 font-bold">$14.8M</td>
                        <td className="py-2.5 text-white">$48.0M</td>
                        <td className="py-2.5 text-white">$142.0M</td>
                        <td className="py-2.5 text-white">$380.0M</td>
                        <td className="py-2.5 text-purple-300 font-bold">$820.0M</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold text-white">Net Revenue (Take Rate + SaaS)</td>
                        <td className="py-2.5 text-emerald-400 font-bold">$444K</td>
                        <td className="py-2.5 text-white">$1.92M</td>
                        <td className="py-2.5 text-white">$6.39M</td>
                        <td className="py-2.5 text-white">$19.0M</td>
                        <td className="py-2.5 text-purple-300 font-bold">$45.1M</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold text-white">Gross Margin</td>
                        <td className="py-2.5 text-white">76%</td>
                        <td className="py-2.5 text-white">79%</td>
                        <td className="py-2.5 text-white">82%</td>
                        <td className="py-2.5 text-white">84%</td>
                        <td className="py-2.5 text-emerald-400 font-bold">86%</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold text-white">Active Verified Drivers</td>
                        <td className="py-2.5 text-white">4,200</td>
                        <td className="py-2.5 text-white">15,000</td>
                        <td className="py-2.5 text-white">38,000</td>
                        <td className="py-2.5 text-white">85,000</td>
                        <td className="py-2.5 text-white">160,000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AI MOAT & TECH ARCHITECTURE */}
          {activeTab === "ai_moat" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase">
                    <Cpu className="w-4 h-4" />
                    <span>Gemini Cognitive Freight Dispatch</span>
                  </div>
                  <p className="text-white/70 text-xs leading-relaxed">
                    Natural language and multilingual speech parser automatically translates voice notes in Uzbek/Russian/Kazakh into structured logistics dispatch parameters in under 2 seconds.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
                    <Zap className="w-4 h-4" />
                    <span>Algorithmic Backhaul Optimization</span>
                  </div>
                  <p className="text-white/70 text-xs leading-relaxed">
                    Solves the $1.2B deadheading problem by pairing outbound freight with automated returning cargo loads, boosting driver earnings by 34% while saving shippers 18%.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase">
                    <Lock className="w-4 h-4" />
                    <span>Fintech Escrow & Instant Payouts</span>
                  </div>
                  <p className="text-white/70 text-xs leading-relaxed">
                    Direct integration with Uzcard, Humo, Payme, and Click enables 50% instant fuel advances at dispatch and automatic escrow disbursement upon cryptographic QR delivery confirmation.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase">
                    <Building className="w-4 h-4" />
                    <span>Enterprise Didox & 1C/SAP Lock-in</span>
                  </div>
                  <p className="text-white/70 text-xs leading-relaxed">
                    Seamless electronic waybill (E-TTN) and 12% VAT tax compliance automation guarantees near-zero churn from large manufacturers and retail chains.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: 13.8x LTV/CAC UNIT ECONOMICS */}
          {activeTab === "unit_economics" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#05010d] border border-white/5 p-4 rounded-xl text-center">
                  <p className="text-[10px] text-white/40 uppercase font-mono">Shipper CAC</p>
                  <p className="text-lg font-bold text-white font-mono">$16.20</p>
                </div>
                <div className="bg-[#05010d] border border-white/5 p-4 rounded-xl text-center">
                  <p className="text-[10px] text-white/40 uppercase font-mono">Shipper 12m LTV</p>
                  <p className="text-lg font-bold text-emerald-400 font-mono">$224.00</p>
                </div>
                <div className="bg-[#05010d] border border-white/5 p-4 rounded-xl text-center">
                  <p className="text-[10px] text-white/40 uppercase font-mono">LTV / CAC Ratio</p>
                  <p className="text-lg font-bold text-purple-400 font-mono">13.8x</p>
                </div>
                <div className="bg-[#05010d] border border-white/5 p-4 rounded-xl text-center">
                  <p className="text-[10px] text-white/40 uppercase font-mono">CAC Payback Time</p>
                  <p className="text-lg font-bold text-white font-mono">28 Days</p>
                </div>
              </div>

              <div className="bg-purple-950/20 border border-purple-500/30 rounded-2xl p-5 space-y-2">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-purple-300">
                  Asset-Light, Hyper-Scalable Operating Model
                </h4>
                <p className="text-white/70 text-xs leading-relaxed">
                  YukLa owns zero trucks and maintains zero warehouse leases. Powered by Google Cloud Run microservices with automated failover, every incremental dollar in GMV flows directly to high-margin software marketplace revenue.
                </p>
              </div>
            </div>
          )}

          {/* TAB 6: USE OF $5M SERIES A FUNDS */}
          {activeTab === "use_of_funds" && (
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-purple-400">
                  Capital Allocation Plan ($5,000,000 USD)
                </h3>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-white font-bold font-sans">1. Engineering, AI & Product ($2,250,000 &bull; 45%)</span>
                      <p className="text-[11px] text-white/50 font-sans">Expand ML team for predictive load routing, voice AI dispatch, and mobile app performance.</p>
                    </div>
                    <span className="text-purple-400 font-bold">45%</span>
                  </div>

                  <div className="p-3 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-white font-bold font-sans">2. Regional Expansion & Enterprise Sales ($1,500,000 &bull; 30%)</span>
                      <p className="text-[11px] text-white/50 font-sans">Carrier acquisition across 14 Uzbek regions, Kazakhstan (Almaty) hub, and dedicated enterprise B2B sales force.</p>
                    </div>
                    <span className="text-indigo-400 font-bold">30%</span>
                  </div>

                  <div className="p-3 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-white font-bold font-sans">3. Working Capital & Carrier Liquidity Fund ($750,000 &bull; 15%)</span>
                      <p className="text-[11px] text-white/50 font-sans">Revolving liquidity pool for driver 50% instant fuel advances and accelerated carrier card payouts.</p>
                    </div>
                    <span className="text-emerald-400 font-bold">15%</span>
                  </div>

                  <div className="p-3 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-white font-bold font-sans">4. Regulatory, Security & Insurance Reserves ($500,000 &bull; 10%)</span>
                      <p className="text-[11px] text-white/50 font-sans">ISO 27001 data compliance, SOC-2 compliance, and institutional cargo reinsurance partnerships.</p>
                    </div>
                    <span className="text-amber-400 font-bold">10%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-[#060210] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-white/40 text-[11px]">
            YukLa Technologies Inc. &bull; Series A Pitch Deck 2026 &bull; Series A Lead Contact: founders@yukla.uz
          </span>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => alert("YukLa Series A Term Sheet & 22-slide Investor Deck tayyorlanmoqda.")}
              className="flex-1 sm:flex-none bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition cursor-pointer shadow-lg shadow-emerald-950/40"
            >
              📥 Request Term Sheet & Deck (.PDF)
            </button>
            <button
              onClick={onClose}
              className="bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition cursor-pointer"
            >
              Yopish
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
