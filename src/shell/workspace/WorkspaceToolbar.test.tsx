import { fireEvent, render, screen, within } from '@testing-library/react';
import { TextField } from '@mui/material';
import { describe, expect, it, vi } from 'vitest';

import { WorkspaceToolbar } from '@/shell/workspace/WorkspaceToolbar';

describe('UXR-12 shared workspace toolbar', () => {
  it('shows owner-provided filter controls and the permitted refresh action', () => {
    const refresh = vi.fn();
    render(
      <WorkspaceToolbar label="Workflow controls" refresh={{
        label: 'Refresh inbox', permitted: true, onRefresh: refresh,
      }}>
        <TextField label="Task filter" size="small" />
      </WorkspaceToolbar>,
    );
    const controls = screen.getByRole('group', { name: 'Workflow controls' });
    expect(within(controls).getByRole('textbox', { name: 'Task filter' })).toBeInTheDocument();
    fireEvent.click(within(controls).getByRole('button', { name: 'Refresh inbox' }));
    expect(refresh).toHaveBeenCalledOnce();
  });

  it('fails closed without owner authorization and disables a busy refresh', () => {
    const denied = vi.fn();
    const { rerender } = render(
      <WorkspaceToolbar label="Denied" refresh={{ label: 'Refresh', permitted: false, onRefresh: denied }} />,
    );
    expect(screen.queryByRole('group', { name: 'Denied' })).not.toBeInTheDocument();
    expect(denied).not.toHaveBeenCalled();
    rerender(<WorkspaceToolbar label="Busy" refresh={{
      label: 'Refresh', permitted: true, disabled: true, onRefresh: denied,
    }} />);
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeDisabled();
    expect(denied).not.toHaveBeenCalled();
  });
});
