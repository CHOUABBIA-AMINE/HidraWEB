import { z } from 'zod';

const runtimeConfigSchema = z.object({
  apiBaseUrl: z.string().url(),
  authMode: z.enum(['basic', 'jwt', 'disabled']),
  defaultLocale: z.enum(['fr', 'en', 'ar']),
});

export type HidraAuthMode = z.infer<typeof runtimeConfigSchema>['authMode'];
export type HidraLocale = z.infer<typeof runtimeConfigSchema>['defaultLocale'];

export const runtimeConfig = runtimeConfigSchema.parse({
  apiBaseUrl: import.meta.env.VITE_HIDRA_API_BASE_URL ?? 'http://localhost:8080',
  authMode: import.meta.env.VITE_HIDRA_AUTH_MODE ?? 'basic',
  defaultLocale: import.meta.env.VITE_HIDRA_DEFAULT_LOCALE ?? 'fr',
});
