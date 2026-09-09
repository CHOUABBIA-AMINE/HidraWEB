export const HIDRA_AUTH_UNAUTHORIZED_EVENT = 'hidra:auth-unauthorized';

export function dispatchUnauthorizedEvent(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(HIDRA_AUTH_UNAUTHORIZED_EVENT));
  }
}
