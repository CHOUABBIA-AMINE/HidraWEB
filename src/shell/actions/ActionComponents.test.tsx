import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AuthorizedActionPanel, type AuthorizedActionPanelState } from './AuthorizedActionPanel';
import { TypedForm } from './TypedForm';

type Action = { id: string; permitted: boolean; label: string };
const actions: Action[] = [
  { id: 'accept', permitted: true, label: 'Accept' },
  { id: 'deny', permitted: false, label: 'Deny' },
];

describe('UXR-18 authorized action and typed form components', () => {
  it('hides the selected editor when action admission is lost', () => {
    const props = {
      label: 'Owner actions', selectedId: 'accept', emptyMessage: 'No actions',
      pending: false, getId: (a: Action) => a.id,
      isPermitted: (a: Action) => a.permitted,
      actionLabel: (a: Action) => a.label,
      renderSummary: (a: Action) => <span>{a.id}</span>,
      renderSelected: () => <span>Private editor</span>,
      onSelect: vi.fn(),
    };
    const view = render(<AuthorizedActionPanel {...props} state={{ kind: 'ready', actions }} />);
    expect(screen.getByText('Private editor')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Deny' })).not.toBeInTheDocument();
    const loading: AuthorizedActionPanelState<Action> = { kind: 'loading', message: 'Owner refresh' };
    view.rerender(<AuthorizedActionPanel {...props} state={loading} />);
    expect(screen.queryByText('Private editor')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Accept' })).not.toBeInTheDocument();
  });

  it('submits only a valid confirmed permitted owner request', () => {
    type Request = { expectedTaskUpdatedAt: string; commentText?: string };
    const request: Request = { expectedTaskUpdatedAt: '2026-11-23T00:00:00Z' };
    const onSubmit = vi.fn();
    const onConfirmationChange = vi.fn();
    const props = {
      label: 'Owner command', request, children: <span>Owner fields</span>,
      permitted: true, valid: true, confirmed: false,
      confirmationLabel: 'Confirm decision', submitLabel: 'Execute',
      onSubmit, onConfirmationChange,
    };
    const view = render(<TypedForm<Request> {...props} />);
    expect(screen.getByRole('button', { name: 'Execute' })).toBeDisabled();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Confirm decision' }));
    expect(onConfirmationChange).toHaveBeenCalledWith(true);
    view.rerender(<TypedForm<Request> {...props} confirmed />);
    fireEvent.click(screen.getByRole('button', { name: 'Execute' }));
    expect(onSubmit).toHaveBeenCalledWith(request);
    view.rerender(<TypedForm<Request> {...props} confirmed blocked />);
    expect(screen.getByRole('button', { name: 'Execute' })).toBeDisabled();
    view.rerender(<TypedForm<Request> {...props} confirmed permitted={false} />);
    expect(screen.queryByText('Owner fields')).not.toBeInTheDocument();
  });
});
