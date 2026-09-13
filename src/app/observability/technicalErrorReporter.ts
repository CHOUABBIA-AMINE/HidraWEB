export const HIDRA_TECHNICAL_ERROR_EVENT = 'hidra:technical-error';

export type TechnicalErrorSource = 'api' | 'react' | 'window' | 'unhandled-rejection';

export interface TechnicalHttpContext {
  method?: string;
  path?: string;
  status?: number;
  code?: string;
}

export interface TechnicalErrorInput {
  source: TechnicalErrorSource;
  message: string;
  errorName?: string;
  correlationId?: string;
  requestId?: string;
  route?: string;
  http?: TechnicalHttpContext;
}

export interface TechnicalErrorReport {
  schemaVersion: 1;
  eventId: string;
  occurredAt: string;
  source: TechnicalErrorSource;
  message: string;
  errorName?: string;
  route?: string;
  correlationId?: string;
  requestId?: string;
  http?: TechnicalHttpContext;
}

export type TechnicalErrorSink = (report: Readonly<TechnicalErrorReport>) => void;

let configuredSink: TechnicalErrorSink | undefined;
let globalCleanup: (() => void) | undefined;

function createEventId(): string {
  const randomUuid = globalThis.crypto?.randomUUID;
  if (typeof randomUuid === 'function') {
    return randomUuid.call(globalThis.crypto);
  }

  return `hidra-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeText(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

export function toSafeDiagnosticPath(value: string | undefined): string | undefined {
  const normalized = normalizeText(value);
  if (!normalized) {
    return undefined;
  }

  try {
    return new URL(normalized, 'https://hidra.invalid').pathname;
  } catch {
    return normalized.split(/[?#]/, 1)[0] || undefined;
  }
}

function currentRoute(): string | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return window.location.pathname || '/';
}

function emitReport(report: Readonly<TechnicalErrorReport>): void {
  if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
    window.dispatchEvent(new CustomEvent(HIDRA_TECHNICAL_ERROR_EVENT, { detail: report }));
  }

  if (configuredSink) {
    configuredSink(report);
    return;
  }

  console.error('HidraWeb technical error', report);
}

export function configureTechnicalErrorSink(sink?: TechnicalErrorSink): void {
  configuredSink = sink;
}

export function reportTechnicalError(input: TechnicalErrorInput): Readonly<TechnicalErrorReport> {
  const http = input.http
    ? Object.freeze({
        method: normalizeText(input.http.method)?.toUpperCase(),
        path: toSafeDiagnosticPath(input.http.path),
        status: input.http.status,
        code: normalizeText(input.http.code),
      })
    : undefined;

  const report = Object.freeze({
    schemaVersion: 1 as const,
    eventId: createEventId(),
    occurredAt: new Date().toISOString(),
    source: input.source,
    message: normalizeText(input.message) ?? 'Unexpected technical error.',
    errorName: normalizeText(input.errorName),
    route: toSafeDiagnosticPath(input.route) ?? currentRoute(),
    correlationId: normalizeText(input.correlationId),
    requestId: normalizeText(input.requestId),
    http,
  });

  emitReport(report);
  return report;
}

export function installGlobalTechnicalErrorReporting(): () => void {
  if (globalCleanup) {
    return globalCleanup;
  }

  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const handleWindowError = (event: ErrorEvent) => {
    reportTechnicalError({
      source: 'window',
      message: 'Unhandled browser error.',
      errorName: event.error instanceof Error ? event.error.name : undefined,
    });
  };

  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    reportTechnicalError({
      source: 'unhandled-rejection',
      message: 'Unhandled promise rejection.',
      errorName: event.reason instanceof Error ? event.reason.name : undefined,
    });
  };

  window.addEventListener('error', handleWindowError);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);

  const cleanup = () => {
    window.removeEventListener('error', handleWindowError);
    window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    if (globalCleanup === cleanup) {
      globalCleanup = undefined;
    }
  };

  globalCleanup = cleanup;
  return cleanup;
}
