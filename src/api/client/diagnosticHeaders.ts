export const HIDRA_CORRELATION_ID_HEADER = 'X-Correlation-Id';
export const HIDRA_REQUEST_ID_HEADER = 'X-Request-Id';

function normalizeHeaderValue(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : undefined;
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      const normalized = normalizeHeaderValue(entry);
      if (normalized) {
        return normalized;
      }
    }
  }

  return undefined;
}

export function readDiagnosticHeader(headers: unknown, headerName: string): string | undefined {
  if (!headers || typeof headers !== 'object') {
    return undefined;
  }

  const getter = (headers as { get?: (name: string) => unknown }).get;
  if (typeof getter === 'function') {
    const value = normalizeHeaderValue(getter.call(headers, headerName));
    if (value) {
      return value;
    }
  }

  const expectedName = headerName.toLowerCase();
  for (const [name, value] of Object.entries(headers as Record<string, unknown>)) {
    if (name.toLowerCase() === expectedName) {
      return normalizeHeaderValue(value);
    }
  }

  return undefined;
}
