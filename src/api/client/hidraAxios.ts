import axios from 'axios';

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
  }

  if (!config.headers.has('X-Correlation-ID')) {
    config.headers.set('X-Correlation-ID', crypto.randomUUID());
  }

  return config;
});
