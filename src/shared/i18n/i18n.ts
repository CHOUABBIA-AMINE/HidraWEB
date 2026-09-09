import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import { runtimeConfig } from '@/app/bootstrap/runtimeConfig';
import { resources } from '@/shared/i18n/resources';

export const i18n = i18next.createInstance();

void i18n.use(initReactI18next).init({
  resources,
  lng: runtimeConfig.defaultLocale,
  fallbackLng: 'fr',
  supportedLngs: ['fr', 'en', 'ar'],
  interpolation: {
    escapeValue: false,
  },
});

function applyDocumentDirection(language: string): void {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.lang = language;
  document.documentElement.dir = language.startsWith('ar') ? 'rtl' : 'ltr';
}

applyDocumentDirection(runtimeConfig.defaultLocale);
i18n.on('languageChanged', applyDocumentDirection);
