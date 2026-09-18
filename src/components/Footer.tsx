import React from "react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Instagram, 
  Linkedin, 
  Twitter, 
  Shield, 
  Globe, 
  ArrowUpRight 
} from "lucide-react";
import { useTranslation } from "../context/LanguageContext";

interface FooterProps {
  currentLang?: string;
}

export default function Footer({ currentLang = "uz" }: FooterProps) {
  const { t } = useTranslation();

  return (
    <footer id="yukla_startup_global_footer" className="relative mt-auto border-t border-purple-500/10 bg-[#060211] overflow-hidden font-sans select-none">
      
      {/* Decorative Blur Ambient Background Elements */}
      <div className="absolute -bottom-24 -left-20 w-80 h-80 bg-purple-600/5 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute top-10 right-10 w-60 h-60 bg-indigo-600/5 blur-[90px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 items-start">
          
          {/* Brand & Slogan block */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-black text-white text-base shadow-lg shadow-purple-950/50">
                YL
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-wider block leading-none">YUKLA</span>
                <span className="text-[9px] text-[#dda15e] uppercase tracking-[0.2em] font-bold block mt-1 font-mono">{t("slogan")}</span>
              </div>
            </div>
            <p className="text-xs text-white/50 leading-relaxed max-w-sm font-sans">
              {t("aboutYukla")}
            </p>
            {/* Social Network Links */}
            <div className="flex items-center gap-3 pt-2">
              <a 
                href="https://telegram.org" 
                target="_blank" 
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-purple-600/20 text-white/40 hover:text-purple-400 border border-white/5 flex items-center justify-center transition-all duration-300"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-purple-600/20 text-white/40 hover:text-purple-400 border border-white/5 flex items-center justify-center transition-all duration-300"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-purple-600/20 text-white/40 hover:text-purple-400 border border-white/5 flex items-center justify-center transition-all duration-300"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-purple-600/20 text-white/40 hover:text-purple-400 border border-white/5 flex items-center justify-center transition-all duration-300"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-purple-600/20 text-white/40 hover:text-purple-400 border border-white/5 flex items-center justify-center transition-all duration-300"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links block 1 */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-sm font-extrabold text-white tracking-wide uppercase">{t("contactUs")}</h4>
            <div className="space-y-3 font-sans text-xs text-white/50">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>{t("address")}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="font-mono">+998 71 200 45 61</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#dda15e] shrink-0" />
                <span className="font-mono lowercase hover:text-white transition cursor-pointer">support@yukla.com</span>
              </div>
            </div>
          </div>

          {/* Links block 2 - document & legals */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-sm font-extrabold text-white tracking-wide uppercase">{t("documents")}</h4>
            <ul className="space-y-2.5 font-sans text-xs text-white/50">
              <li>
                <a href="#terms-of-service" className="hover:text-purple-400 flex items-center gap-1 transition-colors duration-250">
                  <span>{t("terms")}</span>
                  <ArrowUpRight className="w-3 h-3 opacity-40 shrink-0" />
                </a>
              </li>
              <li>
                <a href="#privacy-policy" className="hover:text-purple-400 flex items-center gap-1 transition-colors duration-250">
                  <span>{t("privacy")}</span>
                  <ArrowUpRight className="w-3 h-3 opacity-40 shrink-0" />
                </a>
              </li>
              <li>
                <a href="#commission" className="hover:text-purple-400 flex items-center gap-1 transition-colors duration-250">
                  <span>{t("commissionRule")}</span>
                  <ArrowUpRight className="w-3 h-3 opacity-40 shrink-0" />
                </a>
              </li>
              <li className="flex items-center gap-1.5 text-purple-400/80 font-bold">
                <Shield className="w-3.5 h-3.5" />
                <span>{t("safeSecure")}</span>
              </li>
            </ul>
          </div>

          {/* Small utility / Live server indicator */}
          <div className="md:col-span-2 space-y-4 bg-purple-950/10 border border-purple-500/10 p-4 rounded-2xl">
            <h5 className="text-[10px] font-bold tracking-wider uppercase text-purple-400 font-mono">Platform status</h5>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
              <span className="text-[11px] font-bold text-white font-mono uppercase">ONLINE 24/7</span>
            </div>
            <p className="text-[10px] text-white/40 leading-normal font-sans">
              {t("statusDesc")}
            </p>
          </div>

        </div>

        {/* Brand Bottom line bar */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-center">
          <p className="text-[10px] text-white/30 font-mono">
            &copy; 2026 YukLa Logistics Platform. {t("allRights")}
          </p>
          <p className="text-[9px] text-white/20 font-mono">
            {t("bottomSlogan")}
          </p>
        </div>
      </div>
    </footer>
  );
}
