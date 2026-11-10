import axios, { CanceledError, type InternalAxiosRequestConfig } from 'axios';

import {
  HIDRA_CORRELATION_ID_HEADER,
  HIDRA_REQUEST_ID_HEADER,
} from '@/api/client/diagnosticHeaders';
import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import { dispatchUnauthorizedEvent } from '@/app/auth/authEvents';
import { currentAuthorization, resolveAuthorizationHeader } from '@/app/auth/authorizationHeaderRegistry';
import { runtimeConfig } from '@/app/bootstrap/runtimeConfig';
import { reportTechnicalError, toSafeDiagnosticPath } from '@/app/observability/technicalErrorReporter';

export const hidraAxios = axios.create({
  baseURL: runtimeConfig.apiBaseUrl,
  headers: {
    Accept: 'application/json',
  },
});

type SessionRequest = InternalAxiosRequestConfig & { hidraEpoch?: number; hidraReplayed?: boolean };

function isProtectedRead(config: InternalAxiosRequestConfig): boolean {
  const method = config.method?.toUpperCase();
  return (method === 'GET' || method === 'HEAD') && !!config.url?.startsWith('/api/v1/')
    && !config.url.startsWith('/api/v1/identity/authentication/');
}

hidraAxios.interceptors.request.use(async (config: SessionRequest) => {
  const active = currentAuthorization();
  config.hidraEpoch ??= active.epoch;
  if (config.hidraEpoch !== active.epoch) throw new CanceledError('Session changed.');
  if (active.renewal) {
    if (isProtectedRead(config)) {
      const pending = config.hidraReplayed ? active.renewal.pending() : active.renewal.prepareRead();
      if (pending && !await pending) throw new CanceledError('Session renewal failed.');
    } else if (active.renewal.pending()) {
      throw new CanceledError('Session renewal in progress. Submit the operation again after review.');
    }
  }
  if (active !== currentAuthorization()) throw new CanceledError('Session changed.');
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
  async (response) => {
    const config: SessionRequest = response.config;
    const active = currentAuthorization();
    if (config.hidraEpoch !== active.epoch) throw new CanceledError('Session changed.');
    if (active.renewal && isProtectedRead(config)) {
      await active.renewal.pending();
      if (active !== currentAuthorization() || config.headers.get('Authorization') !== active.header()) {
        throw new CanceledError('The read belongs to a retired session credential.');
      }
    }
    return response;
  },
  async (cause: unknown) => {
    if (axios.isCancel(cause)) throw cause;
    const config: SessionRequest | undefined = axios.isAxiosError(cause) ? cause.config : undefined;
    const active = currentAuthorization();
    if (config?.hidraEpoch !== undefined && config.hidraEpoch !== active.epoch) {
      throw new CanceledError('Session changed.');
    }
    const normalized = normalizeHidraApiError(cause);

    if (normalized.status === undefined || normalized.status >= 500) {
      reportTechnicalError({
        source: 'api',
        message: 'HidraAPI request failed.',
        errorName: normalized.name,
        correlationId: normalized.correlationId,
        requestId: normalized.requestId,
        http: {
          method: config?.method,
          path: toSafeDiagnosticPath(config?.url),
          status: normalized.status,
          code: normalized.problem?.code,
        },
      });
    }

    if (normalized.status === 401) {
      const sent = config?.headers.get('Authorization');
      if (config && typeof sent === 'string' && !config.hidraReplayed && isProtectedRead(config)) {
        const recovery = active.renewal?.recoverRead(sent);
        if (recovery && await recovery && active === currentAuthorization()) {
          return hidraAxios.request({ ...config, hidraReplayed: true } as SessionRequest);
        }
      }
      if (active === currentAuthorization() && !active.renewal?.pending()
          && (typeof sent !== 'string' || sent === active.header())) dispatchUnauthorizedEvent();
    }
    throw normalized;
  },
);
