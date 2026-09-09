import axios from 'axios';

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
  errors?: HidraFieldError[];
  [key: string]: unknown;
}

export class HidraApiError extends Error {
  public readonly status?: number;
  public readonly correlationId?: string;
  public readonly problem?: HidraProblemDetail;

  public constructor(message: string, problem?: HidraProblemDetail) {
    super(message);
    this.name = 'HidraApiError';
    this.status = problem?.status;
    this.correlationId = problem?.correlationId;
    this.problem = problem;
  }
}

export function normalizeHidraApiError(error: unknown): HidraApiError {
  if (error instanceof HidraApiError) {
    return error;
  }

  if (axios.isAxiosError<HidraProblemDetail>(error)) {
    const problem = error.response?.data;
    const message = problem?.detail ?? problem?.title ?? error.message;
    return new HidraApiError(message, problem);
  }

  if (error instanceof Error) {
    return new HidraApiError(error.message);
  }

  return new HidraApiError('Unknown HidraAPI error.');
}
