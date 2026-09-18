import React, { useState, useEffect } from "react";
import { X, Shield, FileText, CheckCircle, Award } from "lucide-react";
import { LanguageCode } from "../types";

interface SaaSPoliciesProps {
  currentLang: LanguageCode;
  onClose: () => void;
  initialTab?: "terms" | "privacy" | "cookie";
}

const POLICY_DATA = {
  uz: {
    termsTitle: "Foydalanish shartlari (Ommaviy Oferta)",
    privacyTitle: "Maxfiylik Siyosati",
    cookieTitle: "Cookie siyosati",
    back: "Yopish",
    lastUpdated: "Oxirgi yangilanish: 5-Iyun, 2026",
    sections: {
      terms: [
        {
          h: "1. Shartnomani qabul qilish",
          p: "YukLa logistika platformasi xizmatlaridan foydalanish orqali siz mazkur Foydalanish Shartlarini va Ommaviy Ofertani to'liq qabul qilgan hisoblanasiz. Agar ushbu shartlarga rozilik bermasangiz, iltimos platformadan foydalanmang."
        },
        {
          h: "2. Xizmat ko'rsatish reglakmenti",
          p: "Platforma mustaqil yuk jo'natuvchi mijozlar va mustaqil drayverlarni (yuk tashish drayverlari) to'g'ridan-to'g'ri birlashtiruvchi axborot-vositachilik tizimidir. YukLa yuklarning holatiga, to'lovlar barqarorligiga mustaqil hamkorlar reglamenti doirasida tranzaksiyalar va ruxsat berish darajasida yordam beradi."
        },
        {
          h: "3. Komissiya va to'lov shartlari",
          p: "YukLa har bir muvaffaqiyatli yetkazilgan buyurtmadan 3% (uch foiz) miqdorida flat komissiya undiradi. Qolgan 97% to'liq drayverning balansiga o'tkaziladi. Mijozlar CLICK, Payme, Xazna yoki naqd/o'tkazma usullaridan foydalanishlari mumkin."
        },
        {
          h: "4. Drayverlar va mijozlar javobgarligi",
          p: "Drayverlar barcha transport hujjatlari, litsenziyalar va avtoulov texnik sozligini o'z zimmasiga oladi. Mijozlar yuklarning xavfsizligi, taqiqlangan mahsulotlar emasligi va manzillar aniqligi uchun javobgardirlar."
        }
      ],
      privacy: [
        {
          h: "1. Ma'lumotlarni yig'ish",
          p: "Siz platformada ro'yxatdan o'tayotganingizda ismingiz, telefon raqamingiz, elektron pochtangiz hamda drayver sifatida avtotransport raqamlari, guvohnoma suratlari va GPS joylashuv ma'lumotlaringizni yig'amiz."
        },
        {
          h: "2. GPS Joylashuv Tracing",
          p: "Drayverlar aktiv yuk eshelonini bajarayotgan vaqtda real vaqt rejimida GPS koordinatalari yig'iladi va yuk egasiga tracking xaritasi taqdim etiladi. Bu logistika xavfsizligini ta'minlash uchun zarur."
        },
        {
          h: "3. Ma'lumotlar xavfsizligi va uning himoyasi",
          p: "Sizning barcha parollaringiz bcrypt kodi yordamida shifrlangan holatda saqlanadi. Tranzaksiyalar va JWT kirish tokenlari saqlashda HTTPS va HttpOnly cookie protokoli qo'llaniladi."
        }
      ],
      cookie: [
        {
          h: "1. Kukilar nima?",
          p: "Kuki-fayllar — bu brauzeringizda sizning til tanlovingiz (masalan, UZ, RU, EN) yoki sessiyangizni saqlab qolish uchun yoziladigan kichik ma'lumot fayllaridir."
        },
        {
          h: "2. Qanday kuki turlaridan foydalanamiz?",
          p: "Tizim barqaror ishlashi va xavfsiz JWT token sessiya izolyatsiyasini ta'minlash uchun 'yukla_access_token' va 'yukla_refresh_token' deb nomlangan HttpOnly kukilaridan foydalanamiz. Ular uchinchi shaxslarga berilmaydi."
        }
      ]
    }
  },
  ru: {
    termsTitle: "Условия использования (Публичная оферта)",
    privacyTitle: "Политика конфиденциальности",
    cookieTitle: "Политика Cookie",
    back: "Закрыть",
    lastUpdated: "Последнее обновление: 5 июня 2026 г.",
    sections: {
      terms: [
        {
          h: "1. Принятие соглашения",
          p: "Используя логистическую платформу YukLa, вы безоговорочно принимаете условия настоящего Пользовательского соглашения и Публичной оферты. Если вы не согласны, пожалуйста, прекратите использование."
        },
        {
          h: "2. Регламент услуг",
          p: "Платформа является информационно-посредническим сервисом, напрямую связывающим отправителей грузов и независимых перевозчиков. Мы предоставляем цифровой биллинг и мониторинг сделок."
        },
        {
          h: "3. Комиссия и платежи",
          p: "Сервисный сбор платформы составляет фиксированные 3% от стоимости выполненного заказа. Оставшиеся 97% напрямую зачисляются водителю. Доступны варианты оплаты по картам, переводам или наличными."
        },
        {
          h: "4. Ответственность сторон",
          p: "Водитель обязуется иметь все необходимые лицензии и держать транспорт в исправном состоянии. Заказчик несет ответственность за законность и точное описание грузов."
        }
      ],
      privacy: [
        {
          h: "1. Сбор информации",
          p: "Мы собираем личные данные (имя, телефон, почта), а также регистрационные документы, номера автотранспорта и геолокацию водителей для обеспечения безопасности логистической сети."
        },
        {
          h: "2. Живой GPS Мониторинг",
          p: "Геолокация водителей транслируется клиентам только во время выполнения активного заказа для отслеживания груза в реальном времени."
        },
        {
          h: "3. Безопасность данных",
          p: "Все пароли хранятся в зашифрованном виде (асинхронный алгоритм bcrypt). Сессии защищены HttpOnly JWT cookies с высокой степенью изоляции."
        }
      ],
      cookie: [
        {
          h: "1. Что такое cookies?",
          p: "Это небольшие текстовые файлы, сохраняемые браузером для запоминания ваших предпочтений языка или сеансов входа."
        },
        {
          h: "2. Наши служебные файлы cookie",
          p: "Мы используем строго защищенные куки 'yukla_access_token' и 'yukla_refresh_token' для аутентификации без угрозы XSS-атак."
        }
      ]
    }
  },
  en: {
    termsTitle: "Terms of Service (Public Offer)",
    privacyTitle: "Privacy Policy",
    cookieTitle: "Cookie Policy",
    back: "Dismiss",
    lastUpdated: "Last updated: June 5, 2026",
    sections: {
      terms: [
        {
          h: "1. Terms Acceptance",
          p: "By visiting or using the YukLa Logistics Marketplace, you agree to these Terms of Service. If you do not accept, please immediately cease using our services."
        },
        {
          h: "2. Scope of Service",
          p: "YukLa acts as a smart matching venue connecting shippers and professional third-party freight drivers. All transport contracts are direct agreements between the corresponding customer and driver."
        },
        {
          h: "3. Fees & Revenue Sharing",
          p: "We charge a standard 3% flat platform commission on completed trips. Shippers pay 100% of the calculated freight pricing, out of which 97% is directly credited as driver earnings."
        },
        {
          h: "4. User Commitments",
          p: "Drivers guarantee they hold commercial insurance and valid vehicle registration. Customers assert that cargo descriptions are truthful and that cargos do not violate local regulations."
        }
      ],
      privacy: [
        {
          h: "1. Information Collection",
          p: "We collect direct personal records (names, email addresses, phone contacts) and supplementary legal documents like driver's licenses and license plates for verification."
        },
        {
          h: "2. Active GPS Tracing",
          p: "Continuous precise location streams are tracked for drivers carrying live shipment boards, shared solely with the specific client tracking that parcel in real-time."
        },
        {
          h: "3. Dynamic Encryption Protocols",
          p: "User passwords are secure-hashed via bcrypt. Transport communication, REST APIs, and authentication tokens occupy secure HttpOnly SameSite=Strict transport envelopes."
        }
      ],
      cookie: [
        {
          h: "1. What are Cookie Files?",
          p: "Cookies are small data parcels stored browser-side to remember UI locales or active authenticated sessions."
        },
        {
          h: "2. Strictly Required Cookies",
          p: "Authorized paths use 'yukla_access_token' and 'yukla_refresh_token' strictly as secure cookies, maintaining isolated browser session parameters."
        }
      ]
    }
  }
};

export default function SaaSPolicies({ currentLang, onClose, initialTab = "terms" }: SaaSPoliciesProps) {
  const [activeTab, setActiveTab] = useState<"terms" | "privacy" | "cookie">(initialTab);
  const langKey: "uz" | "ru" | "en" = ["uz", "ru", "en"].includes(currentLang) ? (currentLang as any) : "en";
  const content = POLICY_DATA[langKey];

  useEffect(() => {
    // Lock background scrolling
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const activeSections = content.sections[activeTab];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all duration-300">
      <div className="bg-[#0e071e] border border-white/10 w-full max-w-4xl max-h-[85vh] rounded-3xl flex flex-col shadow-2xl relative overflow-hidden animate-scale-up font-sans">
        
        {/* Dynamic Glow background */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 blur-[130px] rounded-full pointer-events-none"></div>

        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between z-10 relative">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-purple-450" />
            <div>
              <h2 className="text-xl font-extrabold text-white">YUKLA Legal Center</h2>
              <p className="text-[11px] text-white/40">{content.lastUpdated}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Navigation */}
        <div className="flex border-b border-white/5 bg-[#0a0416]">
          <button
            onClick={() => setActiveTab("terms")}
            className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === "terms"
                ? "border-[#dda15e] text-[#dda15e] bg-white/[0.02]"
                : "border-transparent text-white/40 hover:text-white/80 hover:bg-white/[0.01]"
            }`}
          >
            <h3>{content.termsTitle.split(" (")[0]}</h3>
          </button>
          <button
            onClick={() => setActiveTab("privacy")}
            className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === "privacy"
                ? "border-[#dda15e] text-[#dda15e] bg-white/[0.02]"
                : "border-transparent text-white/40 hover:text-white/80 hover:bg-white/[0.01]"
            }`}
          >
            <h3>{content.privacyTitle}</h3>
          </button>
          <button
            onClick={() => setActiveTab("cookie")}
            className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === "cookie"
                ? "border-[#dda15e] text-[#dda15e] bg-white/[0.02]"
                : "border-transparent text-white/40 hover:text-white/80 hover:bg-white/[0.01]"
            }`}
          >
            <h3>{content.cookieTitle}</h3>
          </button>
        </div>

        {/* Scrollable Policy Body */}
        <div className="overflow-y-auto p-8 space-y-6 text-sm leading-relaxed text-white/70 max-h-[50vh] scrollbar-thin">
          <div className="space-y-6">
            {activeSections.map((sec, idx) => (
              <div key={idx} className="space-y-2">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#dda15e]" />
                  <span>{sec.h}</span>
                </h4>
                <p className="text-white/65 pl-6">{sec.p}</p>
              </div>
            ))}
          </div>

          {/* Compliance stamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-white/5 font-mono text-[10px] text-purple-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Uzbekistan ICT Ministry Law Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-green-400" />
              <span>PCI-DSS Core Encryption Standard</span>
            </div>
          </div>
        </div>

        {/* Dismiss Footer */}
        <div className="p-5 border-t border-white/10 bg-[#090414] text-right z-10">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
          >
            {content.back}
          </button>
        </div>

      </div>
    </div>
  );
}
