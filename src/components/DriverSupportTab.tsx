import React, { useState } from "react";
import { useTranslation } from "../context/LanguageContext";
import { HelpCircle, ArrowRight, MessageSquare, Phone, Send, CheckCircle2 } from "lucide-react";

export default function DriverSupportTab() {
  const { t } = useTranslation();
  const [ticketMsg, setTicketMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const faqs = [
    {
      q: "YukLa dilerlik platformasi haydovchilardan qancha komissiya oladi?",
      a: "Bizda mutlaqo shaffof va o'zgarmas vositachilik stavkasi mavjud bo'lib, jami yakunlangan yuk buyurtmasi summasidan flat 3% yig'im hisoblanadi. Hech qanday boshqa yashirin to'lovlar mavjud emas."
    },
    {
      q: "Sof daromad va hisoblangan kassa qancha vaqt ichida hamyonga kelib tushadi?",
      a: "Tugallangan yuklar hisobidan keladigan sof 97% foyda mijoz yukni 'Topshirildi' deb qabul qilingan zahoti haydovchining ichki kassa hamyoniga o'tkaziladi va balansingizda aks etadi."
    },
    {
      q: "Yukni yetkazib berish jarayonida avtoulov buzilsa nima qilish lozim?",
      a: "Birinchi navbatda dispatcherlik call-centeri bilan zudlik bilan bog'laning hamda yuk jo'natuvchi mijozni ogohlantirishingiz shart. Tizim orqali buyurtmani zaxira yuk mashinasiga biriktirish choralari ko'riladi."
    },
    {
      q: "Haydovchi guvohnomasi va texnik hujjatlar qancha vaqtda moderatsiyadan o'tadi?",
      a: "Siz tomoningizdan YukLa audit tizimiga yuklangan barcha materiallar odatda 15 daqiqadan 2 soatgacha bo'lgan vaqt oralig'ida dispatcher jamoamiz tomonidan to'liq tekshiriladi va tasdiqlanadi."
    }
  ];

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketMsg.trim()) return;
    setSubmitted(true);
    setTicketMsg("");
    setTimeout(() => {
      setSubmitted(false);
    }, 4000);
  };

  return (
    <div className="bg-[#120b2e]/40 border border-purple-500/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden animate-fade-in text-xs text-white">
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="pb-4 border-b border-white/5 mb-6 space-y-1">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-purple-400" />
          <span>YukLa Qo'llab Quvvatlash Markazi • Driver Help Center</span>
        </h3>
        <p className="text-white/40 text-[11px]">Avtotransport muammolari, to'lovlar, buyurtmalar bo'yicha ko'p so'raladigan savollar va dispatcher yordami</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* FAQs */}
        <div className="lg:col-span-7 space-y-4">
          <h4 className="text-sm font-extrabold text-white/85 uppercase tracking-wider mb-2">Eng ko'p so'raladigan savollar (FAQs)</h4>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-1.5 hover:border-purple-500/20 transition"
              >
                <h5 className="font-extrabold text-sm text-purple-300">Q: {faq.q}</h5>
                <p className="text-white/70 leading-relaxed font-sans mt-1">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Support Ticket Submission */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-4 bg-purple-550/5 border border-purple-500/15 rounded-3xl space-y-3">
            <h4 className="text-xs uppercase font-black text-purple-300 tracking-widest flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              <span>Dispatcherlik Yordami (Direct Ticket)</span>
            </h4>
            <p className="text-white/50 text-[11px]">Bizning aloqa markazimiz 24/7 rejimda ishlaydi. dispatcherlarimiz siz bilan 5 daqiqada bog'lanishadi</p>
            
            {submitted ? (
              <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl space-y-1 animate-pulse">
                <p className="font-extrabold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Murakkab tiket yuborildi!</p>
                <p className="text-[10px] text-white/50">Yaqin daqiqa ichida mutaxassis siz bilan +998 raqamingiz orqali bog'lanadi.</p>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-3">
                <textarea 
                  value={ticketMsg}
                  onChange={(e) => setTicketMsg(e.target.value)}
                  placeholder="Muammo yoki savolingizni batafsil yozing, masalan: Toshkent-Sirdaryo yo'lidagi yuk to'lovi..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 focus:border-purple-500 text-white outline-none min-height-[100px] text-xs resize-none placeholder-white/20"
                />
                <button
                  type="submit"
                  className="w-full bg-purple-650 hover:bg-purple-550 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition text-xs uppercase tracking-widest cursor-pointer shadow-lg shadow-purple-950/40"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Xabarni Yuborish</span>
                </button>
              </form>
            )}
          </div>

          {/* Quick contact list */}
          <div className="p-4 bg-white/5 border border-white/5 rounded-3xl space-y-3 font-sans text-xs">
            <h4 className="font-extrabold text-white text-[12px]">YukLa Direct Helplines:</h4>
            <div className="space-y-2 text-white/70">
              <div className="flex justify-between items-center bg-[#070312] p-2.5 rounded-xl border border-white/5">
                <span>📞 Call Center (Toshkent):</span>
                <span className="font-mono text-purple-400 font-extrabold">+998 (71) 200-88-88</span>
              </div>
              <div className="flex justify-between items-center bg-[#070312] p-2.5 rounded-xl border border-white/5">
                <span>🤖 Telegram Bot:</span>
                <span className="font-mono text-purple-400 font-extrabold">@YuklaDriverSupportBot</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
