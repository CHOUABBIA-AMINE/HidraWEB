import { normalizeHidraApiError } from '@/api/errors/HidraApiError';

export type OwnerErrorKind = 'authentication' | 'denied' | 'conflict' | 'validation' | 'unavailable';
export interface OwnerErrorFeedback {
  kind: OwnerErrorKind;
  /** Opaque safe reference, never the raw backend ProblemDetail. */
  supportReference?: string;
}

/** Presentation only. Protected 403 and deliberately masked 404 are indistinguishable. */
export function classifyOwnerError(error: unknown): OwnerErrorFeedback {
  const normalized = normalizeHidraApiError(error);
  const kind: OwnerErrorKind = normalized.status === 401 ? 'authentication'
    : normalized.status === 403 || normalized.status === 404 ? 'denied'
    : normalized.status === 409 ? 'conflict'
    : normalized.status === 400 || normalized.status === 422 ? 'validation'
    : 'unavailable';
  const raw = normalized.correlationId ?? normalized.requestId;
  const supportReference = kind !== 'denied' && kind !== 'authentication'
    && typeof raw === 'string' && /^[a-zA-Z0-9._:-]{1,96}$/.test(raw)
    ? raw : undefined;
  return { kind, ...(supportReference ? { supportReference } : {}) };
}
