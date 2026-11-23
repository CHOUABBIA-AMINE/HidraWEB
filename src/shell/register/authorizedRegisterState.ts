/** Owner-issued page coordinates. No client-inferred totals, resource joins or cursor synthesis. */
export interface OwnerPage<Row> {
  readonly page: number;
  readonly size: number;
  readonly totalElements: number;
  readonly totalPages: number;
  readonly items: readonly Row[];
}

export type AuthorizedRegisterState<Row> =
  | { kind: 'ready'; page: OwnerPage<Row> }
  | { kind: 'loading' | 'empty' | 'denied' | 'failed'; message: string };

interface OwnerQuery<Row> {
  isPending: boolean;
  isFetching: boolean;
  isError: boolean;
  isSuccess: boolean;
  data?: OwnerPage<Row>;
}

/** A withheld/refreshing/failed read must never expose cached rows or counts. */
export function authorizedRegisterState<Row>(
  admitted: boolean,
  query: OwnerQuery<Row>,
  requested: { page: number; size: number },
  messages: { loading: string; empty: string; denied: string; failed: string },
): AuthorizedRegisterState<Row> {
  if (!admitted) return { kind: 'denied', message: messages.denied };
  if (query.isFetching || query.isPending) return { kind: 'loading', message: messages.loading };
  if (query.isError || !query.isSuccess || !query.data) return { kind: 'failed', message: messages.failed };
  const source = query.data;
  const valid = [source.page, source.size, source.totalElements, source.totalPages].every(
    value => Number.isSafeInteger(value) && value >= 0,
  ) && source.page === requested.page && source.size === requested.size && source.size > 0 &&
    source.totalPages === Math.ceil(source.totalElements / source.size) &&
    Array.isArray(source.items) && source.items.length <= source.size &&
    (source.items.length === 0 || source.totalElements > 0);
  if (!valid) return { kind: 'failed', message: messages.failed };
  if (source.items.length === 0) return { kind: 'empty', message: messages.empty };
  return { kind: 'ready', page: source };
}
