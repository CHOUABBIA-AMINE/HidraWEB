/** Browser-history tab coordinates are UI-only and never encode protected resource IDs. */
export function readLocalTab<T extends string>(
  value: string | null,
  allowed: readonly T[],
  fallback: T,
): T {
  return allowed.find((candidate) => candidate === value) ?? fallback;
}

/** Preserve unrelated query coordinates, but reject unknown/forged tab names. */
export function writeLocalTab<T extends string>(
  previous: URLSearchParams,
  requested: string,
  allowed: readonly T[],
  fallback: T,
): URLSearchParams {
  const next = new URLSearchParams(previous);
  const tab = readLocalTab(requested, allowed, fallback);
  if (tab === fallback) next.delete('tab');
  else next.set('tab', tab);
  return next;
}
