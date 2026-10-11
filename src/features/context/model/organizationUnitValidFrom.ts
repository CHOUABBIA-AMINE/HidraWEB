/**
 * Converts an explicitly supplied local effective time into the instant required
 * by HidraAPI's CreateOrganizationUnitRequest. Never invents a date.
 */
export function parseOrganizationUnitValidFrom(value: string): string | null {
  const normalized = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/.test(normalized)) return null;

  const parsed = new Date(normalized);
  if (!Number.isFinite(parsed.getTime())) return null;

  const [year, month, day] = normalized.slice(0, 10).split('-').map(Number);
  const hours = Number(normalized.slice(11, 13));
  const minutes = Number(normalized.slice(14, 16));
  const seconds = normalized.length === 19 ? Number(normalized.slice(17, 19)) : 0;

  // Reject normalized invalid dates and nonexistent local times.
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() + 1 !== month ||
    parsed.getDate() !== day ||
    parsed.getHours() !== hours ||
    parsed.getMinutes() !== minutes ||
    parsed.getSeconds() !== seconds
  ) return null;

  return parsed.toISOString();
}
