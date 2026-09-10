import axios from 'axios';

import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import { dispatchUnauthorizedEvent } from '@/app/auth/authEvents';
import { resolveAuthorizationHeader } from '@/app/auth/authorizationHeaderRegistry';
import { runtimeConfig } from '@/app/bootstrap/runtimeConfig';

export const hidraAxios = axios.create({
  baseURL: runtimeConfig.apiBaseUrl,
  headers: {
    Accept: 'application/json',
  },
});

hidraAxios.interceptors.request.use((config) => {
  const authorization = resolveAuthorizationHeader();

  if (authorization) {
    config.headers.set('Authorization', authorization);
  } else {
    config.headers.delete('Authorization');
  }

  if (!config.headers.has('X-Correlation-ID')) {
    config.headers.set('X-Correlation-ID', crypto.randomUUID());
  }

  return config;
});

hidraAxios.interceptors.response.use(
  (response) => response,
  (cause: unknown) => {
    const normalized = normalizeHidraApiError(cause);
    if (normalized.status === 401) {
      dispatchUnauthorizedEvent();
    }
    return Promise.reject(normalized);
  },
);
