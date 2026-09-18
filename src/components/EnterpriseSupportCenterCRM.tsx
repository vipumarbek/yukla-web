import React, { useState, useEffect } from "react";
import {
  LifeBuoy,
  MessageSquare,
  Clock,
  Send,
  BookOpen,
  User,
  Plus,
  Lock,
  ChevronRight,
  FileText
} from "lucide-react";
import { SupportTicket, KnowledgeArticle, Role } from "../types";

interface Props {
  token: string;
  userRole?: Role;
}

export const EnterpriseSupportCenterCRM: React.FC<Props> = ({ token, userRole = "admin" }) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeArticle[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [activeTab, setActiveTab] = useState<"tickets" | "kb">("tickets");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTicketData, setNewTicketData] = useState({
    subject: "",
    category: "general",
    priority: "medium",
    message: "",
    orderId: "",
  });

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/support/tickets", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
        if (data.length > 0 && !activeTicketId) {
          setActiveTicketId(data[0].id);
        }
      }

      const kbRes = await fetch("/api/support/knowledge-base");
      if (kbRes.ok) {
        const kbData = await kbRes.json();
        setKnowledgeBase(kbData);
      }
    } catch (err) {
      console.error("Support CRM data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [token]);

  const activeTicket = tickets.find(t => t.id === activeTicketId);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !activeTicketId) return;

    try {
      const res = await fetch(`/api/support/tickets/${activeTicketId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: replyMessage })
      });
      if (res.ok) {
        const newMsg = await res.json();
        setTickets(tickets.map(t => {
          if (t.id === activeTicketId) {
            return {
              ...t,
              messages: [...t.messages, newMsg],
              status: userRole === "admin" ? "in_progress" : t.status
            };
          }
          return t;
        }));
        setReplyMessage("");
      }
    } catch (err) {
      console.error("Send reply error:", err);
    }
  };

  const handleAddInternalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalNote.trim() || !activeTicketId) return;

    try {
      const res = await fetch(`/api/support/tickets/${activeTicketId}/internal-notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ note: internalNote })
      });
      if (res.ok) {
        const note = await res.json();
        setTickets(tickets.map(t => {
          if (t.id === activeTicketId) {
            return {
              ...t,
              internalNotes: [...(t.internalNotes || []), note]
            };
          }
          return t;
        }));
        setInternalNote("");
      }
    } catch (err) {
      console.error("Internal note error:", err);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/support/tickets/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setTickets(tickets.map(t => t.id === id ? updated : t));
      }
    } catch (err) {
      console.error("Update ticket status error:", err);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newTicketData)
      });
      if (res.ok) {
        const created = await res.json();
        setTickets([created, ...tickets]);
        setActiveTicketId(created.id);
        setCreateModalOpen(false);
        setNewTicketData({
          subject: "",
          category: "general",
          priority: "medium",
          message: "",
          orderId: "",
        });
      }
    } catch (err) {
      console.error("Create ticket error:", err);
    }
  };

  const filteredTickets = tickets.filter(t => statusFilter === "all" || t.status === statusFilter);

  return (
    <div className="space-y-6" id="support-crm-center">
      {/* Header Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <LifeBuoy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Customer Support CRM & Help Desk</h2>
            <p className="text-xs text-slate-500">Mijozlar, haydovchilar va korporativ logistika sheriklariga 24/7 tezkor xizmat</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setActiveTab("tickets")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "tickets" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Murojaatlar ({tickets.length})
            </button>
            <button
              onClick={() => setActiveTab("kb")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "kb" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Bilimlar Bazasi (KB)
            </button>
          </div>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Yangi Murojaat
          </button>
        </div>
      </div>

      {activeTab === "tickets" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
          {/* Ticket List Column */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Murojaatlar ro'yxati</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none"
              >
                <option value="all">Barcha holatlar</option>
                <option value="open">Ochiq</option>
                <option value="in_progress">Jarayonda</option>
                <option value="resolved">Hal qilingan</option>
              </select>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[550px]">
              {filteredTickets.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">Murojaatlar mavjud emas.</div>
              ) : (
                filteredTickets.map(t => (
                  <div
                    key={t.id}
                    onClick={() => setActiveTicketId(t.id)}
                    className={`p-4 cursor-pointer transition-colors ${
                      activeTicketId === t.id ? "bg-blue-50/70 border-l-4 border-blue-600" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold text-slate-500">{t.ticketNumber}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                        t.priority === "urgent"
                          ? "bg-rose-100 text-rose-700"
                          : t.priority === "high"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {t.priority}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{t.subject}</h4>
                    <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <User className="w-3.5 h-3.5" /> {t.userName} ({t.userRole})
                      </span>
                      <span className="flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3 text-amber-500" /> SLA: 4 soat
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Ticket Detail & Live Chat Column */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            {activeTicket ? (
              <>
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">{activeTicket.subject}</h3>
                      <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded font-semibold font-mono">
                        {activeTicket.ticketNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>Mijoz: <strong className="text-slate-800">{activeTicket.userName}</strong> ({activeTicket.userPhone})</span>
                      {activeTicket.orderId && (
                        <span>Buyurtma: <strong className="text-blue-600">#{activeTicket.orderId}</strong></span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={activeTicket.status}
                      onChange={(e) => handleUpdateStatus(activeTicket.id, e.target.value)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-300 bg-white shadow-sm"
                    >
                      <option value="open">Ochiq</option>
                      <option value="in_progress">Jarayonda</option>
                      <option value="waiting_user">Mijoz javobini kutmoqda</option>
                      <option value="resolved">Hal qilingan</option>
                      <option value="closed">Yopilgan</option>
                    </select>
                  </div>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[380px] bg-slate-50/30">
                  {activeTicket.messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.senderRole === "admin" ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1 px-1">
                        <span className="font-semibold text-slate-700">{msg.senderName}</span>
                        <span>•</span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className={`p-3.5 rounded-2xl max-w-lg text-sm ${
                        msg.senderRole === "admin"
                          ? "bg-blue-600 text-white rounded-br-none shadow-sm"
                          : "bg-white text-slate-800 rounded-bl-none border border-slate-200 shadow-sm"
                      }`}>
                        {msg.message}
                      </div>
                    </div>
                  ))}

                  {/* Internal Notes Section (Staff Only) */}
                  {userRole === "admin" && activeTicket.internalNotes?.length > 0 && (
                    <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200/60 space-y-2">
                      <span className="text-[11px] font-bold text-amber-800 uppercase flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Ichki Xodim Eslatmalari
                      </span>
                      {activeTicket.internalNotes.map(n => (
                        <div key={n.id} className="text-xs text-amber-900 bg-amber-100/60 p-2 rounded-lg">
                          <strong className="font-semibold">{n.authorName}:</strong> {n.note}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reply Box */}
                <div className="p-4 border-t border-slate-200 bg-white space-y-3">
                  <form onSubmit={handleSendReply} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Mijozga javob yozish..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors flex items-center gap-1.5"
                    >
                      <Send className="w-4 h-4" /> Yuborish
                    </button>
                  </form>

                  {userRole === "admin" && (
                    <form onSubmit={handleAddInternalNote} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="🔒 Faqat xodimlar ko'radigan ichki eslatma qo'shish..."
                        value={internalNote}
                        onChange={(e) => setInternalNote(e.target.value)}
                        className="flex-1 px-3.5 py-1.5 bg-amber-50/50 border border-amber-200 rounded-lg text-xs outline-none"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-xs"
                      >
                        Eslatmani saqlash
                      </button>
                    </form>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-12 text-center text-slate-400">
                <div>
                  <MessageSquare className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="font-medium text-slate-600">Tafsilotlarini ko'rish uchun murojaatni tanlang.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Knowledge Base Tab */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {knowledgeBase.map(article => (
            <div key={article.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 text-xs bg-slate-100 text-slate-700 font-semibold rounded-full">
                  {article.category}
                </span>
                <span className="text-xs text-slate-400 font-medium">Ko'rildi: {article.viewsCount}</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-2">{article.titleUz}</h4>
              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{article.contentUz}</p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-emerald-600 font-semibold">👍 {article.helpfulCount} kishiga foydali bo'ldi</span>
                <span className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:underline cursor-pointer">
                  To'liq o'qish <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Ticket Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-blue-600" />
                Yangi Qo'llab-quvvatlash Murojaati
              </h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
            </div>
            <form onSubmit={handleCreateTicket} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Murojaat Mavzusi</label>
                <input
                  type="text"
                  placeholder="Muammo yoki savolning qisqa mazmuni"
                  value={newTicketData.subject}
                  onChange={(e) => setNewTicketData({ ...newTicketData, subject: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Kategoriya</label>
                  <select
                    value={newTicketData.category}
                    onChange={(e) => setNewTicketData({ ...newTicketData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm outline-none"
                  >
                    <option value="general">Umumiy Savol</option>
                    <option value="billing_payment">To'lov va Hamyon</option>
                    <option value="cargo_damage">Yuk Xavfsizligi & Sug'urta</option>
                    <option value="delay_complaint">Kechikish Shikoyati</option>
                    <option value="account_verification">Hujjatlarni Tasdiqlash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Muhimlik Darajasi</label>
                  <select
                    value={newTicketData.priority}
                    onChange={(e) => setNewTicketData({ ...newTicketData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm outline-none"
                  >
                    <option value="low">Past</option>
                    <option value="medium">O'rta</option>
                    <option value="high">Yuqori</option>
                    <option value="urgent">Shoshilinch (Urgent)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Buyurtma ID (ixtiyoriy)</label>
                <input
                  type="text"
                  placeholder="Masalan: ord-1"
                  value={newTicketData.orderId}
                  onChange={(e) => setNewTicketData({ ...newTicketData, orderId: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Batafsil Xabar</label>
                <textarea
                  rows={4}
                  placeholder="Muammoni batafsil bayon qiling..."
                  value={newTicketData.message}
                  onChange={(e) => setNewTicketData({ ...newTicketData, message: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-medium"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm flex items-center gap-1.5"
                >
                  Murojaatni jo'natish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default EnterpriseSupportCenterCRM;
