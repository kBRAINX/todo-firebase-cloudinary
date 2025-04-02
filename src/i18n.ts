import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  // Chargement des traductions via xhr
  .use(Backend)
  // Détection de la langue du navigateur
  .use(LanguageDetector)
  // Passer i18n à react-i18next
  .use(initReactI18next)
  // Initialisation i18next
  .init({
    fallbackLng: 'fr',
    debug: false,

    // Options courantes
    interpolation: {
      escapeValue: false, // non nécessaire pour React
    },

    // Chemins de détection de la langue
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },

    // Charger les traductions depuis /public/locales
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    }
  });

export default i18n;