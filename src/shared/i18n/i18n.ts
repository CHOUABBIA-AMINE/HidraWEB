import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import { runtimeConfig } from '@/app/bootstrap/runtimeConfig';
import { alarmTranslations } from '@/features/alarm/i18n/alarmTranslations';
import { contextTranslations } from '@/features/context/i18n/contextTranslations';
import { eventsTranslations } from '@/features/events/i18n/eventsTranslations';
import { telemetryMonitoringTranslations } from '@/features/telemetry-monitoring/i18n/telemetryMonitoringTranslations';
import { topologyTranslations } from '@/features/topology/i18n/topologyTranslations';
import { workbenchTranslations } from '@/features/workbench/i18n/workbenchTranslations';
import { resources } from '@/shared/i18n/resources';

const mergedResources = {
  fr: { translation: { ...resources.fr.translation, alarm: alarmTranslations.fr, context: contextTranslations.fr, events: eventsTranslations.fr, telemetryMonitoring: telemetryMonitoringTranslations.fr, topology: topologyTranslations.fr, workbench: workbenchTranslations.fr } },
  en: { translation: { ...resources.en.translation, alarm: alarmTranslations.en, context: contextTranslations.en, events: eventsTranslations.en, telemetryMonitoring: telemetryMonitoringTranslations.en, topology: topologyTranslations.en, workbench: workbenchTranslations.en } },
  ar: { translation: { ...resources.ar.translation, alarm: alarmTranslations.ar, context: contextTranslations.ar, events: eventsTranslations.ar, telemetryMonitoring: telemetryMonitoringTranslations.ar, topology: topologyTranslations.ar, workbench: workbenchTranslations.ar } },
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
