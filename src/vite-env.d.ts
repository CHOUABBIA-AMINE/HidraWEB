/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HIDRA_API_BASE_URL?: string;
  readonly VITE_HIDRA_AUTH_MODE?: 'basic' | 'jwt' | 'disabled';
  readonly VITE_HIDRA_ENVIRONMENT?: string;
  readonly VITE_HIDRA_DEFAULT_LOCALE?: 'fr' | 'en' | 'ar';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
