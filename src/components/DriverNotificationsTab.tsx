import React from "react";
import { useTranslation } from "../context/LanguageContext";
import { Bell, ShieldCheck, Mail, Sliders, CheckCircle2 } from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  text: string;
  time: string;
  read: boolean;
}

interface NotificationsTabProps {
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
}

export default function DriverNotificationsTab({
  notifications,
  onMarkRead,
  onClearAll
}: NotificationsTabProps) {
  const { t } = useTranslation();
  return (
    <div className="bg-[#120b2e]/40 border border-purple-500/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden animate-fade-in text-xs text-white">
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-white/5 mb-6 gap-3">
        <div className="space-y-0.5">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-400" />
            <span>Mening bildirishnomalarim • Alerts Center</span>
          </h3>
          <p className="text-white/40 text-[11px]">Dilerlik tizimi, zakaz zayavkalari va adminlik tekshiruvlari haqidagi xabarlar oqimi</p>
        </div>

        {notifications.length > 0 && (
          <button 
            onClick={onClearAll}
            className="text-purple-300 hover:text-purple-400 font-bold uppercase text-[10px] tracking-wider cursor-pointer"
          >
            Hammasini o'qilgan qilish
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 bg-[#120b2e]/10 rounded-2xl border border-dashed border-white/5 space-y-2">
          <p className="text-3xl">📭</p>
          <p className="text-white/40">Sizda mutlaqo yangi xabarlar yo'q.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div 
              key={n.id}
              onClick={() => onMarkRead(n.id)}
              className={`p-4 rounded-2xl border transition duration-150 cursor-pointer relative hover:scale-[1.005] ${
                n.read 
                  ? "bg-white/5 border-white/5 text-white/60" 
                  : "bg-purple-500/5 border-purple-500/15 text-white shadow-md shadow-purple-900/5"
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center mt-0.5 ${
                    n.read ? "bg-white/5 text-white/40" : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                  }`}>
                    {n.id === "1" ? <ShieldCheck className="w-4 h-4" /> : n.id === "2" ? <Bell className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm">{n.title}</h4>
                    <p className="text-xs leading-relaxed">{n.text}</p>
                    <span className="text-[9.5px] text-white/30 block font-mono">{n.time}</span>
                  </div>
                </div>

                {!n.read && (
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 absolute top-4 right-4"></span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
