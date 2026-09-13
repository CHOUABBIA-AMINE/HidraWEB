import axios from 'axios';

import {
  HIDRA_CORRELATION_ID_HEADER,
  HIDRA_REQUEST_ID_HEADER,
} from '@/api/client/diagnosticHeaders';
import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import { dispatchUnauthorizedEvent } from '@/app/auth/authEvents';
import { resolveAuthorizationHeader } from '@/app/auth/authorizationHeaderRegistry';
import { runtimeConfig } from '@/app/bootstrap/runtimeConfig';
import { reportTechnicalError, toSafeDiagnosticPath } from '@/app/observability/technicalErrorReporter';

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

  if (!config.headers.has(HIDRA_CORRELATION_ID_HEADER)) {
    config.headers.set(HIDRA_CORRELATION_ID_HEADER, globalThis.crypto.randomUUID());
  }

  if (!config.headers.has(HIDRA_REQUEST_ID_HEADER)) {
    config.headers.set(HIDRA_REQUEST_ID_HEADER, globalThis.crypto.randomUUID());
  }

  return config;
});

hidraAxios.interceptors.response.use(
  (response) => response,
  (cause: unknown) => {
    const normalized = normalizeHidraApiError(cause);

    if (normalized.status === undefined || normalized.status >= 500) {
      const requestConfig = axios.isAxiosError(cause) ? cause.config : undefined;
      reportTechnicalError({
        source: 'api',
        message: 'HidraAPI request failed.',
        errorName: normalized.name,
        correlationId: normalized.correlationId,
        requestId: normalized.requestId,
        http: {
          method: requestConfig?.method,
          path: toSafeDiagnosticPath(requestConfig?.url),
          status: normalized.status,
          code: normalized.problem?.code,
        },
      });
    }

    if (normalized.status === 401) {
      dispatchUnauthorizedEvent();
    }
    return Promise.reject(normalized);
  },
);
