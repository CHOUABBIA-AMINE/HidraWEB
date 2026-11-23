import { describe, expect, it } from 'vitest';
import { authorizedRegisterState } from '@/shell/register/authorizedRegisterState';

const messages = { loading: 'Loading', empty: 'Empty', denied: 'Denied', failed: 'Failed' };
const page = { page: 0, size: 50, totalElements: 1, totalPages: 1, items: [{ id: 'private' }] };
const ready = { isPending: false, isFetching: false, isError: false, isSuccess: true, data: page };
const requested = { page: 0, size: 50 };

describe('UXR-17 authorized register admission and pagination', () => {
  it('does not reveal data when permission is denied or owner refresh fails', () => {
    expect(authorizedRegisterState(false, ready, requested, messages)).toEqual({ kind: 'denied', message: 'Denied' });
    expect(authorizedRegisterState(true, { ...ready, isFetching: true }, requested, messages).kind).toBe('loading');
    expect(authorizedRegisterState(true, { ...ready, isError: true, isSuccess: false }, requested, messages).kind).toBe('failed');
    expect(authorizedRegisterState(true, { ...ready, isPending: true }, requested, messages).kind).toBe('loading');
  });
  it('rejects stale page, size, invalid counts or impossible pages without inferring totals', () => {
    expect(authorizedRegisterState(true, ready, requested, messages)).toEqual({ kind: 'ready', page });
    for (const invalid of [
      { ...page, page: 1 }, { ...page, size: 25 },
      { ...page, totalElements: -1 }, { ...page, totalElements: Number.NaN },
      { ...page, totalPages: 3 }, { ...page, size: 0 },
      { ...page, totalElements: 0 },
    ]) expect(authorizedRegisterState(true, { ...ready, data: invalid }, requested, messages).kind).toBe('failed');
  });
  it('does not expose totals or rows for source-confirmed empty response', () => {
    const state = authorizedRegisterState(true, { ...ready, data: {
      ...page, items: [], totalElements: 0, totalPages: 0,
    } }, requested, messages);
    expect(state).toEqual({ kind: 'empty', message: 'Empty' });
    expect('page' in state).toBe(false);
  });
});
