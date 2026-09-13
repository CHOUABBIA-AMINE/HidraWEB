import { z } from 'zod';

const optionalUrl = z.preprocess((value) => (value === '' ? undefined : value), z.string().url().optional());

const runtimeConfigSchema = z.object({
  apiBaseUrl: z.string().url(),
  authMode: z.enum(['basic', 'jwt', 'disabled']),
  environment: z.string().trim().min(1),
  defaultLocale: z.enum(['fr', 'en', 'ar']),
  oidcRedirectUri: optionalUrl,
});

export type HidraAuthMode = z.infer<typeof runtimeConfigSchema>['authMode'];
export type HidraLocale = z.infer<typeof runtimeConfigSchema>['defaultLocale'];

export const runtimeConfig = runtimeConfigSchema.parse({
  apiBaseUrl: import.meta.env.VITE_HIDRA_API_BASE_URL ?? 'http://localhost:8080',
  authMode: import.meta.env.VITE_HIDRA_AUTH_MODE ?? 'basic',
  environment: import.meta.env.VITE_HIDRA_ENVIRONMENT ?? 'dev',
  defaultLocale: import.meta.env.VITE_HIDRA_DEFAULT_LOCALE ?? 'fr',
  oidcRedirectUri: import.meta.env.VITE_HIDRA_OIDC_REDIRECT_URI,
});
