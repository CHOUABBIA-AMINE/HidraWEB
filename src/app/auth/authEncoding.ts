function utf8Base64(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

export function basicAuthorizationHeader(username: string, password: string): string {
  return `Basic ${utf8Base64(`${username}:${password}`)}`;
}

export function bearerAuthorizationHeader(accessToken: string): string {
  return `Bearer ${accessToken.trim()}`;
}

export function jwtPrincipalLabel(accessToken: string): string {
  try {
    const payloadPart = accessToken.split('.')[1];
    if (!payloadPart) {
      return 'Enterprise identity';
    }
    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const payload = JSON.parse(atob(padded)) as Record<string, unknown>;
    return typeof payload.sub === 'string' && payload.sub.trim() ? payload.sub : 'Enterprise identity';
  } catch {
    return 'Enterprise identity';
  }
}
