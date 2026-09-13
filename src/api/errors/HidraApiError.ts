import axios from 'axios';

import {
  HIDRA_CORRELATION_ID_HEADER,
  HIDRA_REQUEST_ID_HEADER,
  readDiagnosticHeader,
} from '@/api/client/diagnosticHeaders';

export interface HidraFieldError {
  field?: string;
  code?: string;
  message?: string;
}

export interface HidraProblemDetail {
  type?: string;
  title?: string;
  status?: number;
  code?: string;
  detail?: string;
  instance?: string;
  correlationId?: string;
  requestId?: string;
  errors?: HidraFieldError[];
  [key: string]: unknown;
}

export class HidraApiError extends Error {
  public readonly status?: number;
  public readonly correlationId?: string;
  public readonly requestId?: string;
  public readonly problem?: HidraProblemDetail;

  public constructor(message: string, problem?: HidraProblemDetail) {
    super(message);
    this.name = 'HidraApiError';
    this.status = problem?.status;
    this.correlationId = problem?.correlationId;
    this.requestId = problem?.requestId;
    this.problem = problem;
  }
}

function isProblemDetail(value: unknown): value is HidraProblemDetail {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizedIdentifier(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

export function normalizeHidraApiError(error: unknown): HidraApiError {
  if (error instanceof HidraApiError) {
    return error;
  }

  if (axios.isAxiosError<HidraProblemDetail>(error)) {
    const responseStatus = error.response?.status;
    const responseProblem = isProblemDetail(error.response?.data) ? error.response.data : undefined;
    const correlationId =
      normalizedIdentifier(responseProblem?.correlationId) ??
      readDiagnosticHeader(error.response?.headers, HIDRA_CORRELATION_ID_HEADER) ??
      readDiagnosticHeader(error.config?.headers, HIDRA_CORRELATION_ID_HEADER);
    const requestId =
      normalizedIdentifier(responseProblem?.requestId) ??
      readDiagnosticHeader(error.response?.headers, HIDRA_REQUEST_ID_HEADER) ??
      readDiagnosticHeader(error.config?.headers, HIDRA_REQUEST_ID_HEADER);

    const hasProblemMetadata = Boolean(responseProblem || responseStatus || correlationId || requestId);
    const problem: HidraProblemDetail | undefined = hasProblemMetadata
      ? {
          ...responseProblem,
          status: responseProblem?.status ?? responseStatus,
          correlationId,
          requestId,
        }
      : undefined;
    const message = problem?.detail ?? problem?.title ?? error.message;
    return new HidraApiError(message, problem);
  }

  if (error instanceof Error) {
    return new HidraApiError(error.message);
  }

  return new HidraApiError('Unknown HidraAPI error.');
}
