import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { HidraApiError } from '@/api/errors/HidraApiError';
import { classifyOwnerError } from './ownerFeedback';
import { OwnerFeedbackBanner } from './OwnerFeedbackBanner';

describe('UXR-19 secure owner feedback', () => {
  it('makes masked 404 and 403 indistinguishable without protected owner detail', () => {
    const secret = 'sensitive-company-record-do-not-disclose';
    for (const status of [403, 404]) {
      const error = new HidraApiError(secret, { status, detail: secret, correlationId: 'hidden-scope-4321' });
      expect(classifyOwnerError(error)).toEqual({ kind: 'denied' });
      const view = render(<OwnerFeedbackBanner kind="error" error={error} />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.queryByText(secret)).not.toBeInTheDocument();
      expect(screen.queryByText(/hidden-scope-4321/)).not.toBeInTheDocument();
      view.unmount();
    }
  });

  it.each([401, 409, 422, 503])('classifies HTTP %i without displaying raw problem detail', (status) => {
    const error = new HidraApiError('internal-storage-id-secret', { status, correlationId: 'corr-123' });
    const result = classifyOwnerError(error);
    const expected = status === 401 ? 'authentication' : status === 409 ? 'conflict'
      : status === 422 ? 'validation' : 'unavailable';
    expect(result.kind).toBe(expected);
    if (status === 401) expect(result.supportReference).toBeUndefined();
    const view = render(<OwnerFeedbackBanner kind="error" error={error} />);
    expect(screen.queryByText(/internal-storage-id-secret/)).not.toBeInTheDocument();
    view.unmount();
  });

  it('never replays an uncertain command and only reports verified success explicitly', () => {
    const review = vi.fn();
    const conflict = new HidraApiError('backend-secret', { status: 409, correlationId: 'corr-123' });
    const view = render(<OwnerFeedbackBanner kind="error" error={conflict} onReview={review} />);
    expect(screen.getByText(/corr-123/)).toBeInTheDocument();
    expect(review).not.toHaveBeenCalled();
    view.rerender(<OwnerFeedbackBanner kind="unverified" message="Persisted outcome is not verified." onReview={review} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Persisted outcome is not verified.');
    expect(review).not.toHaveBeenCalled();
    view.rerender(<OwnerFeedbackBanner kind="success" message="Confirmed owner readback." />);
    expect(screen.getByRole('status')).toHaveTextContent('Confirmed owner readback.');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('rejects unsafe backend diagnostic identifiers', () => {
    const error = new HidraApiError('internal', { status: 500, correlationId: 'token=x private/path' });
    expect(classifyOwnerError(error).supportReference).toBeUndefined();
  });
});
