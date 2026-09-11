import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import { runtimeConfig } from '@/app/bootstrap/runtimeConfig';
import { workbenchTranslations } from '@/features/workbench/i18n/workbenchTranslations';
import { resources } from '@/shared/i18n/resources';

const mergedResources = {
  fr: { translation: { ...resources.fr.translation, workbench: workbenchTranslations.fr } },
  en: { translation: { ...resources.en.translation, workbench: workbenchTranslations.en } },
  ar: { translation: { ...resources.ar.translation, workbench: workbenchTranslations.ar } },
};

export const i18n = i18next.createInstance();

void i18n.use(initReactI18next).init({
  resources: mergedResources,
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
