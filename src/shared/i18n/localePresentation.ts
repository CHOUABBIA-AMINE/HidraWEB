/** UXR-04: display-only formatting. Never submit formatted values as API inputs. */
export type DisplayLocale = 'fr' | 'en' | 'ar';

export function resolveDisplayLocale(language: string): DisplayLocale {
  const primary = language.toLowerCase().split(/[-_]/)[0];
  return primary === 'ar' || primary === 'en' ? primary : 'fr';
}

function intlLocale(language: string): string {
  const locale = resolveDisplayLocale(language);
  return locale === 'ar' ? 'ar-DZ' : locale === 'en' ? 'en-US' : 'fr-DZ';
}

export function formatDisplayNumber(value: number, language: string): string {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat(intlLocale(language), { maximumFractionDigits: 3 }).format(value);
}

/** No conversion, inference or re-labeling of engineering units. */
export function formatDisplayQuantity(value: number, unit: string, language: string): string {
  const result = formatDisplayNumber(value, language);
  if (result === '—') return result;
  return unit ? `${result}\u00a0${unit}` : result;
}

/**
 * Require an ISO offset-qualified instant and an explicit display time zone.
 * Rendering does not change the underlying source timestamp.
 */
export function formatDisplayInstant(iso: string | null | undefined, language: string, timeZone: string): string {
  if (!iso || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(iso)) return '—';
  const instant = new Date(iso);
  if (!Number.isFinite(instant.getTime())) return '—';
  try {
    return new Intl.DateTimeFormat(intlLocale(language), {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone,
      timeZoneName: 'short',
      hour12: false,
    }).format(instant);
  } catch {
    return '—';
  }
}
