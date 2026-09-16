import { z } from 'zod';

const optionalUrl = z.preprocess((value) => (value === '' ? undefined : value), z.string().url().optional());

const apiBaseUrlSchema = z.union([z.literal('/'), z.string().url()]);
const credentialProviderSchema = z.enum(['LOCAL', 'LDAP', 'ACTIVE_DIRECTORY']);

export const parseApiBaseUrl = (value: string) => apiBaseUrlSchema.parse(value);
export const parseCredentialProvider = (value: string) => credentialProviderSchema.parse(value);

const runtimeConfigSchema = z.object({
  apiBaseUrl: apiBaseUrlSchema,
  authMode: z.enum(['basic', 'jwt', 'disabled']),
  credentialProvider: credentialProviderSchema,
  environment: z.string().trim().min(1),
  defaultLocale: z.enum(['fr', 'en', 'ar']),
  oidcRedirectUri: optionalUrl,
});

export type HidraAuthMode = z.infer<typeof runtimeConfigSchema>['authMode'];
export type HidraCredentialProvider = z.infer<typeof runtimeConfigSchema>['credentialProvider'];
export type HidraLocale = z.infer<typeof runtimeConfigSchema>['defaultLocale'];

export const runtimeConfig = runtimeConfigSchema.parse({
  apiBaseUrl: import.meta.env.VITE_HIDRA_API_BASE_URL ?? 'http://localhost:8080',
  authMode: import.meta.env.VITE_HIDRA_AUTH_MODE ?? 'basic',
  credentialProvider: import.meta.env.VITE_HIDRA_CREDENTIAL_PROVIDER ?? 'LOCAL',
  environment: import.meta.env.VITE_HIDRA_ENVIRONMENT ?? 'dev',
  defaultLocale: import.meta.env.VITE_HIDRA_DEFAULT_LOCALE ?? 'fr',
  oidcRedirectUri: import.meta.env.VITE_HIDRA_OIDC_REDIRECT_URI,
});
