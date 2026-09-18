import React, { useState, useEffect } from "react";
import {
  Bell,
  Send,
  MessageSquare,
  Smartphone,
  Mail,
  CheckCircle2,
  Clock,
  Radio,
  FileCode,
  History
} from "lucide-react";
import { NotificationChannelStatus, NotificationTemplate, NotificationHistoryItem } from "../types";

interface Props {
  token: string;
}

export const EnterpriseNotificationCenter: React.FC<Props> = ({ token }) => {
  const [channels, setChannels] = useState<NotificationChannelStatus[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [history, setHistory] = useState<NotificationHistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<"broadcast" | "channels" | "templates" | "history">("channels");
  const [broadcastForm, setBroadcastForm] = useState({
    channel: "sms",
    recipient: "+998 90 123 45 67",
    title: "YukLa Bildirishnomasi",
    body: "Sizning buyurtmangiz bo'yicha yangilanish mavjud.",
  });
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchNotificationCenterData = async () => {
    try {
      const res = await fetch("/api/notifications/center", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setChannels(data.channels || []);
        setTemplates(data.templates || []);
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error("Failed to load notifications center:", err);
    }
  };

  useEffect(() => {
    fetchNotificationCenterData();
  }, [token]);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSuccessMsg("");
    try {
      const res = await fetch("/api/notifications/broadcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(broadcastForm)
      });
      if (res.ok) {
        const data = await res.json();
        setHistory([data.item, ...history]);
        setSuccessMsg("Xabar barcha provayderlar orqali yetkazib berish navbatiga qo'yildi!");
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err) {
      console.error("Broadcast failed:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6" id="notification-center-hub">
      {/* Header Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Omnichannel Notification Engine</h2>
            <p className="text-xs text-slate-500">SMS, FCM Push, Email va Telegram orqali real-vaqt xabarnomalar</p>
          </div>
        </div>
        <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab("channels")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "channels" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Shlyuzlar & Kanallar
          </button>
          <button
            onClick={() => setActiveTab("broadcast")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "broadcast" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tezkor Xabar Yuborish
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "templates" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Shablonlar ({templates.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "history" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tarix & Jurnal ({history.length})
          </button>
        </div>
      </div>

      {/* Tab: Channels Gateway Status */}
      {activeTab === "channels" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {channels.map((ch, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                    {ch.channel === "sms" ? <Smartphone className="w-4 h-4" /> : ch.channel === "push" ? <Radio className="w-4 h-4" /> : ch.channel === "email" ? <Mail className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm uppercase">{ch.channel} Shlyuzi</h4>
                    <span className="text-[11px] text-slate-400 font-mono">{ch.name}</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full uppercase ${
                  ch.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                }`}>
                  {ch.status === "active" ? "Faol" : "Kutishda"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase">O'tkazuvchanlik</span>
                  <p className="font-bold text-slate-800">{ch.throughputMsgSec} msg/sec</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase">Yetkazish Aniqligi</span>
                  <p className="font-bold text-emerald-600">{ch.successRatePct}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Broadcast Form */}
      {activeTab === "broadcast" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-2xl mx-auto space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base">Tezkor Xabarnoma Tarqatish (Broadcast)</h3>
            <p className="text-xs text-slate-500">Mijoz yoki haydovchiga SMS / Push / Telegram orqali xabar yuborish</p>
          </div>

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSendBroadcast} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Xabar Kanali</label>
                <select
                  value={broadcastForm.channel}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, channel: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm outline-none font-medium"
                >
                  <option value="sms">SMS (PlayMobile / Eskiz)</option>
                  <option value="push">FCM Push Bildirishnoma</option>
                  <option value="telegram">Telegram Bot Webhook</option>
                  <option value="email">Email Xabarnoma</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Qabul Qiluvchi</label>
                <input
                  type="text"
                  placeholder="+998 90 123 45 67 yoki user-id"
                  value={broadcastForm.recipient}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, recipient: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Xabar Sarlavhasi</label>
              <input
                type="text"
                value={broadcastForm.title}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Xabar Matni</label>
              <textarea
                rows={4}
                value={broadcastForm.body}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, body: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm outline-none"
                required
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={sending}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm flex items-center gap-2 transition-all shadow-md active:scale-95"
              >
                <Send className="w-4 h-4" /> {sending ? "Yuborilmoqda..." : "Xabarni jo'natish"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: Templates */}
      {activeTab === "templates" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map(tmpl => (
            <div key={tmpl.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-purple-600" />
                  {tmpl.name}
                </h4>
                <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-purple-50 text-purple-700 rounded">
                  {tmpl.code}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Shablon Matni:</span>
                <p className="text-xs text-slate-700 font-mono leading-relaxed">{tmpl.bodyTemplate}</p>
              </div>
              <div className="flex flex-wrap items-center gap-1 pt-1">
                <span className="text-[10px] text-slate-400 font-semibold mr-1">O'zgaruvchilar:</span>
                {tmpl.variables.map(v => (
                  <span key={v} className="px-2 py-0.5 text-[10px] bg-slate-100 text-slate-600 rounded font-mono">
                    {`{{${v}}}`}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: History */}
      {activeTab === "history" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4" /> Yuborilgan Xabarnomalar Jurnali
            </span>
            <span className="text-xs text-slate-400">Jami: {history.length} ta yozuv</span>
          </div>
          <div className="divide-y divide-slate-100">
            {history.map(item => (
              <div key={item.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold uppercase text-slate-700">
                    {item.channel}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-slate-900 text-xs">{item.title}</h5>
                      <span className="text-[11px] text-slate-500 font-mono">({item.recipient})</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{item.body}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full">
                    {item.status}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">
                    {new Date(item.sentAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default EnterpriseNotificationCenter;
