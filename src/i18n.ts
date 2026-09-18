import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import uz from './locales/uz.json';
import en from './locales/en.json';
import ru from './locales/ru.json';
import tr from './locales/tr.json';
import ar from './locales/ar.json';
import zh from './locales/zh.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import es from './locales/es.json';
import pt from './locales/pt.json';
import it from './locales/it.json';

const resources = {
  uz: { translation: uz },
  en: { translation: en },
  ru: { translation: ru },
  tr: { translation: tr },
  ar: { translation: ar },
  zh: { translation: zh },
  fr: { translation: fr },
  de: { translation: de },
  es: { translation: es },
  pt: { translation: pt },
  it: { translation: it },
};

const savedLang =
  localStorage.getItem('yukla_lang') ||
  sessionStorage.getItem('yukla_lang') ||
  'uz';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

const updateDocumentDirection = (lang: string) => {
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lang;
};

updateDocumentDirection(savedLang);

i18n.on('languageChanged', (lang: string) => {
  updateDocumentDirection(lang);
});

export default i18n;
