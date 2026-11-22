import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { WorkspaceHeading } from '@/shell/workspace/WorkspaceHeading';

// Vitest does not enable RTL auto-cleanup in this repository's non-global setup.
afterEach(cleanup);

describe('UXR-12 shared workspace heading', () => {
  it('renders one accessible heading and only explicitly permitted actions', () => {
    const allowed = vi.fn();
    const denied = vi.fn();
    render(
      <MemoryRouter>
        <WorkspaceHeading
          breadcrumbsLabel="Workspace breadcrumbs"
          breadcrumbs={[{ label: 'Overview', to: '/overview' }, { label: 'My Tasks' }]}
          description="Owner-supplied inbox"
          eyebrow="WORKFLOW"
          title="My Tasks"
          ownerStatus={{ label: 'OPEN', source: 'HidraAPI Workflow' }}
          actions={[
            { id: 'open', label: 'Open', permitted: true, onClick: allowed },
            { id: 'deny', label: 'Protected action', permitted: false, onClick: denied },
          ]}
        />
      </MemoryRouter>,
    );
    expect(screen.getAllByRole('heading', { name: 'My Tasks', level: 1 })).toHaveLength(1);
    const breadcrumbs = screen.getByRole('navigation', { name: 'Workspace breadcrumbs' });
    expect(within(breadcrumbs).getByRole('link', { name: 'Overview' })).toHaveAttribute('href', '/overview');
    expect(screen.getByRole('status')).toHaveTextContent('OPEN');
    expect(screen.getByRole('status')).toHaveTextContent('HidraAPI Workflow');
    expect(screen.queryByRole('button', { name: 'Protected action' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(allowed).toHaveBeenCalledOnce();
    expect(denied).not.toHaveBeenCalled();
  });

  it('does not invent a status or render inaccessible actions when not supplied', () => {
    render(
      <MemoryRouter>
        <WorkspaceHeading title="Overview" breadcrumbsLabel="Workspace breadcrumbs"
          breadcrumbs={[{ label: 'Overview' }]}
          actions={[{ id: 'disabled', label: 'Not allowed', permitted: false, onClick: vi.fn() }]} />
      </MemoryRouter>,
    );
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Not allowed' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Overview', level: 1 })).toBeInTheDocument();
  });
});
