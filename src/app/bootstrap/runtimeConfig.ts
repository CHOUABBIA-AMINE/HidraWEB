import { z } from 'zod';

const optionalUrl = z.preprocess((value) => (value === '' ? undefined : value), z.string().url().optional());
const apiBaseUrlSchema = z.union([z.literal('/'), z.string().url()]);
const credentialProviderSchema = z.enum(['LOCAL', 'LDAP', 'ACTIVE_DIRECTORY']);
const authProviderSchema = z.enum(['LOCAL', 'LDAP', 'ACTIVE_DIRECTORY', 'OIDC']);
const authModeSchema = z.enum(['basic', 'jwt', 'multi', 'disabled']);

export type HidraCredentialProvider = z.infer<typeof credentialProviderSchema>;
export type HidraAuthProvider = z.infer<typeof authProviderSchema>;
export type HidraAuthMode = z.infer<typeof authModeSchema>;
export const parseApiBaseUrl = (value: string) => apiBaseUrlSchema.parse(value);
export const parseCredentialProvider = (value: string) => credentialProviderSchema.parse(value);

/** Deployment-approved provider list. This is not a backend permission or provider-discovery response. */
export function parseEnabledAuthProviders(value: string): HidraAuthProvider[] {
  if (!value.trim()) throw new Error('VITE_HIDRA_ENABLED_AUTH_PROVIDERS is required for multi-provider login.');
  const names = value.split(',').map((item) => item.trim());
  if (names.some((item) => !item)) throw new Error('An empty authentication provider is not allowed.');
  const parsed = z.array(authProviderSchema).parse(names);
  if (new Set(parsed).size !== parsed.length) throw new Error('Duplicate authentication providers are not allowed.');
  return parsed;
}

export function resolveEnabledAuthProviders(
  mode: HidraAuthMode,
  legacyProvider: HidraCredentialProvider,
  allowlist?: string,
  oidcRedirectUri?: string,
): HidraAuthProvider[] {
  switch (mode) {
    case 'disabled': return [];
    case 'basic': return [legacyProvider];
    case 'jwt': return ['OIDC'];
    case 'multi': {
      const providers = parseEnabledAuthProviders(allowlist ?? '');
      if (providers.length < 2) throw new Error('Multi-provider login requires at least two providers.');
      if (providers.includes('OIDC') && !oidcRedirectUri) {
        throw new Error('VITE_HIDRA_OIDC_REDIRECT_URI is required when OIDC is enabled.');
      }
      return providers;
    }
  }
}

const runtimeConfigSchema = z.object({
  apiBaseUrl: apiBaseUrlSchema,
  authMode: authModeSchema,
  credentialProvider: credentialProviderSchema,
  environment: z.string().trim().min(1),
  defaultLocale: z.enum(['fr', 'en', 'ar']),
  oidcRedirectUri: optionalUrl,
});
export type HidraLocale = z.infer<typeof runtimeConfigSchema>['defaultLocale'];

const parsedConfig = runtimeConfigSchema.parse({
  apiBaseUrl: import.meta.env.VITE_HIDRA_API_BASE_URL ?? 'http://localhost:8080',
  authMode: import.meta.env.VITE_HIDRA_AUTH_MODE ?? 'basic',
  credentialProvider: import.meta.env.VITE_HIDRA_CREDENTIAL_PROVIDER ?? 'LOCAL',
  environment: import.meta.env.VITE_HIDRA_ENVIRONMENT ?? 'dev',
  defaultLocale: import.meta.env.VITE_HIDRA_DEFAULT_LOCALE ?? 'fr',
  oidcRedirectUri: import.meta.env.VITE_HIDRA_OIDC_REDIRECT_URI,
});

export const runtimeConfig = {
  ...parsedConfig,
  enabledAuthProviders: resolveEnabledAuthProviders(
    parsedConfig.authMode,
    parsedConfig.credentialProvider,
    import.meta.env.VITE_HIDRA_ENABLED_AUTH_PROVIDERS,
    parsedConfig.oidcRedirectUri,
  ),
};
