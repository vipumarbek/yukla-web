import React from "react";
import { usePermissions } from "../context/PermissionContext";
import { useTranslation } from "../context/LanguageContext";
import { 
  MapPin, Camera, Image, Bell, FileText, Phone, Fingerprint, MicOff,
  Shield, CheckCircle2, AlertTriangle, Info, Compass, HelpCircle
} from "lucide-react";

export default function PermissionExplainerModal() {
  const { activeExplainer, closeExplainer, permissions } = usePermissions();
  const { t, currentLang } = useTranslation();

  if (!activeExplainer) return null;

  const { key, purpose } = activeExplainer;

  // Localized title & description details based on active permission key
  const getPermissionDetails = () => {
    switch (key) {
      case "location":
        return {
          icon: <MapPin className="w-10 h-10 text-purple-400" />,
          title: {
            uz: "📍 GPS Joylashuv ruxsati",
            en: "📍 GPS Location Access",
            ru: "📍 Доступ к геолокации GPS"
          },
          sub: {
            uz: "YukLa logistika platformasi sizga eng yaqin tashuvchilarni topishi va manzillarni aniqlashi uchun joylashuvingiz kerak.",
            en: "YukLa needs your location to match nearby carrier trucks, auto-complete addresses, and calculate precise ETAs.",
            ru: "YukLa запрашивает геопозицию для подбора ближайшего транспорта и точного расчета маршрута."
          },
          bullets: {
            uz: [
              "Hozirgi joylashuvingizni aniqlash va xaritani markazlashtirish",
              "Yuk olish manzilini avtomatik to'ldirish",
              "Yaqin atrofdagi bo'sh yuk mashinalarini xaritada ko'rish",
              "Yo'nalish va aniq yetib borish vaqtini (ETA) hisoblash"
            ],
            en: [
              "Detect your current location and center the map",
              "Auto-fill the cargo pickup and delivery address",
              "View nearby available trucks and drivers in real time",
              "Calculate accurate routes and delivery ETAs"
            ],
            ru: [
              "Определение вашей геопозиции и центрирование карты",
              "Автозаполнение адресов забора и доставки груза",
              "Отображение свободных машин поблизости в реальном времени",
              "Расчет маршрутов и времени прибытия транспорта (ETA)"
            ]
          }
        };
      case "camera":
        return {
          icon: <Camera className="w-10 h-10 text-purple-400" />,
          title: {
            uz: "📷 Kameraga ruxsat",
            en: "📷 Camera Access",
            ru: "📷 Доступ к камере"
          },
          sub: {
            uz: "Ushbu ruxsat orqali yuk holatini suratga olish, haydovchini tasdiqlash va yuk topshirilganligi to'g'risida isbot yuklash mumkin.",
            en: "YukLa needs camera access to capture driver profile snaps, verify vehicles, and take photos of delivery receipts.",
            ru: "YukLa запрашивает доступ к камере для верификации водителя, фотографий документов и подтверждения доставки."
          },
          bullets: {
            uz: [
              "Profil uchun tezkor ruxsatnoma suratini olish",
              "Yuklanayotgan yuklarni joyida suratga olib buyurtmaga biriktirish",
              "Yuk topshirilganligini tasdiqlovchi dalil surati",
              "Avtotransport va haydovchilik guvohnomasini tezkor skanerlash"
            ],
            en: [
              "Take real-time profile snaps for secure registration",
              "Attach photos of items directly to cargo postings",
              "Provide instant proof of delivery snapshots",
              "Scan driver licenses and vehicle technical passports"
            ],
            ru: [
              "Создание фотографии профиля при регистрации",
              "Прикрепление снимков грузов непосредственно к заказам",
              "Фотофиксация успешной сдачи груза клиенту",
              "Сканирование водительского удостоверения и техпаспорта"
            ]
          }
        };
      case "photoLibrary":
        return {
          icon: <Image className="w-10 h-10 text-purple-400" />,
          title: {
            uz: "🖼 Galereya va Rasmlar",
            en: "🖼 Photo & Gallery Access",
            ru: "🖼 Доступ к галерее"
          },
          sub: {
            uz: "Galereyadagi tayyor suratlarni yuk hujjatlari yoki yuk tasviri sifatida buyurtmaga biriktirish uchun foydalaniladi.",
            en: "Select and upload pre-saved images of your freight, company logs, or registration papers from your device library.",
            ru: "Позволяет выбирать готовые изображения грузов и документов из галереи вашего устройства."
          },
          bullets: {
            uz: [
              "Galereyadan yuk suratlari va chizmalarini tanlash",
              "Haydovchilik guvohnomasining skaner nusxasini yuklash",
              "Avto-mashina texnik guvohnomalarini biriktirish"
            ],
            en: [
              "Select pre-saved freight images or cargo dimensions",
              "Upload scanned driver licenses from your library",
              "Attach saved vehicle registration certificates"
            ],
            ru: [
              "Выбор фотографий грузов из памяти телефона",
              "Загрузка сохраненных документов водителя",
              "Прикрепление свидетельств о регистрации транспортного средства"
            ]
          }
        };
      case "notifications":
        return {
          icon: <Bell className="w-10 h-10 text-purple-400" />,
          title: {
            uz: "🔔 Push bildirishnomalar",
            en: "🔔 Push Notifications",
            ru: "🔔 Пуш-уведомления"
          },
          sub: {
            uz: "Siz buyurtmalar holati, haydovchi yetib kelganligi va chat xabarlarini real vaqtda o'tkazib yubormasligingiz uchun kerak.",
            en: "Stay up-to-date with instant updates on your shipments, driver status, price changes, and customer support messages.",
            ru: "Позволяет мгновенно получать обновления о статусе заказов, прибытии водителя и новых сообщениях в чате."
          },
          bullets: {
            uz: [
              "Yangi yuk buyurtmalari va auksion takliflaridan xabardor bo'lish",
              "Haydovchi yuklash joyiga yetib borganida bildirishnoma",
              "Mijoz va haydovchi o'rtasidagi chat xabarlari yetkazilishi",
              "To'lov muvaffaqiyatli o'tganligi haqidagi kvitansiyalar"
            ],
            en: [
              "Get notified about new cargo orders and bids instantly",
              "Alerts when a driver arrives at the loading site",
              "Receive push notifications for customer-driver chats",
              "Get confirmation receipts for payouts and payments"
            ],
            ru: [
              "Уведомления о новых заказах и встречных предложениях",
              "Оповещение о прибытии машины на погрузку",
              "Мгновенная доставка сообщений встроенного чата",
              "Подтверждения об оплате или выплатах баланса"
            ]
          }
        };
      case "fileAccess":
        return {
          icon: <FileText className="w-10 h-10 text-purple-400" />,
          title: {
            uz: "📁 Hujjatlar va Fayllar",
            en: "📁 Document & File Access",
            ru: "📁 Доступ к файлам"
          },
          sub: {
            uz: "Yuk tashish shartnomalari, invoyslar va elektron to'lov kvitansiyalarini PDF formatida yuklash yoki yuklab olish imkoniyati.",
            en: "Securely save or upload custom logistics documentation, waybills, cargo PDF invoices, and tax receipts.",
            ru: "Безопасное скачивание и загрузка транспортных накладных, счетов-фактур в формате PDF."
          },
          bullets: {
            uz: [
              "Tizimdan rasmiy yuk xatlarini PDF formatida saqlash",
              "Yuklarning bojxona va hisob-faktura hujjatlarini yuklash",
              "To'lov kvitansiyalari va reyting deklaratsiyalarini yuklab olish"
            ],
            en: [
              "Save official digital waybills directly as PDFs",
              "Upload custom customs clearing or invoice documents",
              "Download payment summaries and receipt statements"
            ],
            ru: [
              "Сохранение электронных накладных в PDF на устройство",
              "Загрузка таможенных или бухгалтерских документов груза",
              "Скачивание платежных квитанций и налоговых отчетов"
            ]
          }
        };
      case "phone":
        return {
          icon: <Phone className="w-10 h-10 text-purple-400" />,
          title: {
            uz: "📞 To'g'ridan-to'g'ri qo'ng'iroq",
            en: "📞 Direct Phone Calling",
            ru: "📞 Прямые звонки"
          },
          sub: {
            uz: "Mijoz va tashuvchi o'rtasida bog'lanishni tezlashtirish uchun ruxsat.",
            en: "Quickly coordinate logistics by initiating phone calls to your driver or customer without typing numbers.",
            ru: "Упрощает связь между клиентом и перевозчиком через прямой звонок одним кликом."
          },
          bullets: {
            uz: [
              "Haydovchiga to'g'ridan-to'g'ri dasturdan qo'ng'iroq qilish",
              "Yuk qabul qiluvchi bilan telefon orqali tezkor bog'lanish",
              "Platforma texnik ko'mak xizmatiga qo'ng'iroq qilish"
            ],
            en: [
              "Call the assigned cargo driver with a single tap",
              "Instantly connect with cargo receivers regarding delays",
              "Call our localized round-the-clock support dispatchers"
            ],
            ru: [
              "Звонок водителю прямо из интерфейса программы",
              "Быстрая связь с получателем груза при задержке",
              "Связь с круглосуточной службой поддержки YukLa"
            ]
          }
        };
      case "biometrics":
        return {
          icon: <Fingerprint className="w-10 h-10 text-purple-400" />,
          title: {
            uz: "🔒 Biometrik autentifikatsiya",
            en: "🔒 Biometric Authentication",
            ru: "🔒 Биометрическая аутентификация"
          },
          sub: {
            uz: "Tizimdagi balansingiz va shaxsiy ma'lumotlaringiz xavfsizligini ta'minlash uchun FaceID yoki TouchID tizimi integratsiyasi.",
            en: "Use secure Face ID, Touch ID, or Windows Hello on your device to authorize wallet payouts and sensitive edits.",
            ru: "Использование Face ID, Touch ID или Windows Hello для безопасного подтверждения вывода средств и изменения настроек."
          },
          bullets: {
            uz: [
              "Balansdan pul yechish (Payout) jarayonini himoyalash",
              "Profil va shaxsiy ma'lumotlarni o'zgartirishni tasdiqlash",
              "Parolsiz, bir soniyada xavfsiz tizimga kirish"
            ],
            en: [
              "Protect wallet withdrawals and direct credit payouts",
              "Secure critical changes to personal or profile fields",
              "Fast login without password using device biometric keys"
            ],
            ru: [
              "Защита операций по выводу средств из кошелька",
              "Подтверждение редактирования чувствительных данных профиля",
              "Вход в приложение в одно касание без ввода пароля"
            ]
          }
        };
      default:
        return {
          icon: <HelpCircle className="w-10 h-10 text-purple-400" />,
          title: { uz: "Ruxsat", en: "Permission", ru: "Разрешение" },
          sub: { uz: "Ruxsat kerak.", en: "Permission requested.", ru: "Запрос разрешения." },
          bullets: { uz: [], en: [], ru: [] }
        };
    }
  };

  const details = getPermissionDetails();
  const lang = (currentLang === "uz" || currentLang === "en" || currentLang === "ru") ? currentLang : "uz";
  
  const activeTitle = details.title[lang];
  const activeSub = details.sub[lang];
  const activeBullets = details.bullets[lang];

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md transition-opacity duration-300">
      
      {/* Container Card */}
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#19113d] to-[#0c061d] border border-purple-500/20 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col space-y-6 overflow-hidden">
        
        {/* Background glow orb */}
        <div className="absolute -top-12 -left-12 w-44 h-44 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -right-12 w-44 h-44 bg-[#dda15e]/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header Icon Block */}
        <div className="flex items-center space-x-4 shrink-0 relative">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center shadow-lg">
            {details.icon}
          </div>
          <div>
            <span className="text-[9.5px] uppercase font-bold tracking-widest text-[#dda15e] bg-[#dda15e]/10 px-2.5 py-0.5 rounded border border-[#dda15e]/25">
              YukLa SafeAccess
            </span>
            <h3 className="text-base font-extrabold text-white mt-1 leading-snug">
              {activeTitle}
            </h3>
          </div>
        </div>

        {/* Body Text */}
        <div className="space-y-4 text-white/80 flex-1 relative text-xs">
          <p className="leading-relaxed font-sans text-white/70">
            {activeSub}
          </p>

          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-[#dda15e]" />
              <span>Nimalarni faollashtiradi:</span>
            </span>
            <ul className="space-y-2">
              {activeBullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-white/75 text-[11px] leading-normal">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Secure / Privacy assurance */}
          <div className="flex items-center gap-2 text-[9.5px] text-white/40 font-medium">
            <Info className="w-3.5 h-3.5 text-purple-400/60" />
            <span>Ma'lumotlaringiz shifrlangan va hech qachon begonalarga berilmaydi.</span>
          </div>
        </div>

        {/* Buttons / CTA footer */}
        <div className="grid grid-cols-2 gap-3 shrink-0 pt-2 relative">
          <button
            type="button"
            onClick={() => closeExplainer(false)}
            className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-bold text-xs uppercase tracking-wide transition cursor-pointer"
          >
            {currentLang === "uz" ? "Keyinroq" : currentLang === "ru" ? "Позже" : "Maybe Later"}
          </button>
          
          <button
            type="button"
            onClick={() => closeExplainer(true)}
            className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-purple-900/30 border border-purple-500/25 flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <span>{currentLang === "uz" ? "Ruxsat berish" : currentLang === "ru" ? "Разрешить" : "Allow Access"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
