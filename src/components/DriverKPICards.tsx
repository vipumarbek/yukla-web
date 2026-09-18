import React from "react";
import { useTranslation } from "../context/LanguageContext";
import { 
  DollarSign, 
  Truck, 
  CheckCircle2, 
  Star, 
  Activity, 
  TrendingUp, 
  Sliders, 
  Compass, 
  Award,
  ShieldCheck
} from "lucide-react";

interface KPICardsProps {
  earnings: any;
  availableCount: number;
  activeCount: number;
  completedCount: number;
  averageRating: number;
  driverStatus: string;
}

export default function DriverKPICards({
  earnings,
  availableCount,
  activeCount,
  completedCount,
  averageRating,
  driverStatus
}: KPICardsProps) {
  const { t } = useTranslation();

  const stats = [
    {
      id: "total_earnings",
      title: t("driver.totalEarnings"),
      value: `${(earnings?.netIncome || 0).toLocaleString()} UZS`,
      desc: t("driver.earnings"),
      icon: DollarSign,
      color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
    },
    {
      id: "today",
      title: t("driver.earnings"),
      value: `${(earnings?.todayEarnings || 0).toLocaleString()} UZS`,
      desc: t("driver.earnings"),
      icon: DollarSign,
      color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
    },
    {
      id: "weekly",
      title: t("driver.earnings"),
      value: `${(earnings?.weeklyEarnings || 0).toLocaleString()} UZS`,
      desc: t("driver.earnings"),
      icon: TrendingUp,
      color: "text-purple-400 border-purple-500/20 bg-purple-500/5",
    },
    {
      id: "monthly",
      title: t("driver.earnings"),
      value: `${(earnings?.monthlyEarnings || 0).toLocaleString()} UZS`,
      desc: t("driver.earnings"),
      icon: Award,
      color: "text-fuchsia-400 border-fuchsia-500/20 bg-fuchsia-500/5",
    },
    {
      id: "available",
      title: t("driver.availableOrders"),
      value: `${availableCount}`,
      desc: t("driver.availableOrders"),
      icon: Compass,
      color: "text-amber-400 border-amber-500/20 bg-amber-500/5 animate-pulse",
    },
    {
      id: "active",
      title: t("driver.activeMission"),
      value: `${activeCount}`,
      desc: t("driver.activeMission"),
      icon: NavigationIcon,
      color: "text-cyan-400 border-cyan-500/20 bg-cyan-400/5",
    },
    {
      id: "completed",
      title: t("driver.completedMissions"),
      value: `${completedCount}`,
      desc: t("statusDelivered"),
      icon: CheckCircle2,
      color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
    },
    {
      id: "rating",
      title: t("driver.overallRating"),
      value: `${averageRating.toFixed(1)} / 5.0`,
      desc: t("driver.overallRating"),
      icon: Star,
      color: "text-purple-400 border-purple-500/20 bg-purple-500/5",
    },
    {
      id: "status",
      title: t("driver.activeStatus"),
      value: driverStatus || t("statusOffline"),
      desc: t("driver.activeStatus"),
      icon: ShieldCheck,
      color: driverStatus === "Online" 
        ? "text-green-400 border-green-500/20 bg-green-500/5" 
        : "text-zinc-400 border-zinc-500/20 bg-zinc-500/5",
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s, idx) => {
        const Icon = s.icon;
        return (
          <div 
            key={s.id} 
            className={`backdrop-blur-md border rounded-2xl p-4 flex flex-col justify-between shadow-xl transition-all duration-300 hover:scale-[1.02] ${s.color}`}
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] uppercase font-bold tracking-wider text-white/40">{s.title}</span>
              <Icon className="w-5 h-5 opacity-70" />
            </div>
            <div className="mt-3">
              <p className="text-xl font-extrabold font-mono tracking-tight text-white">{s.value}</p>
              <p className="text-[10px] text-white/50 mt-1 leading-tight">{s.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Temporary inline fix for navigation icon context
function NavigationIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="3 11 22 2 13 21 11 13 3 11" />
    </svg>
  );
}
