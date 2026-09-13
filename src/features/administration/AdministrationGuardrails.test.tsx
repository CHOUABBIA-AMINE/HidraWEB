import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { AdministrationGovernanceNotice, DestructiveActionConfirmationDialog } from '@/features/administration';

describe('HWEB-014-06 administration guardrails', () => {
  it('links administration users to backend-owned audit evidence without synthesizing references', () => {
    render(
      <MemoryRouter>
        <AdministrationGovernanceNotice />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Destructive administration actions require explicit confirmation/)).toBeInTheDocument();
    expect(screen.getByText(/does not synthesize audit identifiers/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open audit evidence' })).toHaveAttribute('href', '/administration/audit');
  });

  it('requires the exact confirmation phrase before a destructive action can execute', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <DestructiveActionConfirmationDialog
        open
        title="Delete record"
        description="Delete backend record record-1."
        confirmationPhrase="DELETE record-1"
        confirmLabel="Delete"
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    );

    const confirmButton = screen.getByRole('button', { name: 'Delete' });
    expect(confirmButton).toBeDisabled();
    expect(screen.getByText('No backend audit reference was supplied for this action.')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Confirmation phrase'), { target: { value: 'DELETE' } });
    expect(confirmButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Confirmation phrase'), { target: { value: 'DELETE record-1' } });
    expect(confirmButton).toBeEnabled();
    fireEvent.click(confirmButton);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('shows an audit reference only when the backend supplies one', () => {
    render(
      <DestructiveActionConfirmationDialog
        open
        title="Archive record"
        description="Archive backend record record-2."
        confirmationPhrase="ARCHIVE record-2"
        confirmLabel="Archive"
        onCancel={() => undefined}
        onConfirm={() => undefined}
        auditReference="audit-123"
      />,
    );

    expect(screen.getByTestId('audit-reference')).toHaveTextContent('Audit reference: audit-123');
  });
});
