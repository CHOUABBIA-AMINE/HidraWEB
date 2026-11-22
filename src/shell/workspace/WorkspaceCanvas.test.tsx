import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { WorkspaceCanvas, type WorkspaceCanvasVariant } from '@/shell/workspace/WorkspaceCanvas';

afterEach(cleanup);

describe('UXR-13 owned workspace canvas layouts', () => {
  it('exposes all six explicit responsive canvas variants without manufacturing owner data', () => {
    const variants: WorkspaceCanvasVariant[] = [
      'map', 'synoptic', 'summary', 'register', 'trend-detail', 'editor',
    ];
    for (const variant of variants) {
      const view = render(
        <WorkspaceCanvas label="Source-owned view" variant={variant} state={{ kind: 'ready' }}>
          <span>Only source-issued content</span>
        </WorkspaceCanvas>,
      );
      const region = screen.getByRole('region', { name: 'Source-owned view' });
      expect(region).toHaveAttribute('data-canvas-variant', variant);
      expect(within(region).getByText('Only source-issued content')).toBeInTheDocument();
      view.unmount();
    }
  });

  it('shows the provided trend evidence alongside a separately-labelled detail', () => {
    render(
      <WorkspaceCanvas label="Trend detail" variant="trend-detail" state={{ kind: 'ready' }}
        title="Owner trend" asideLabel="Supporting details" aside={<span>Backend detail</span>}>
        <span>Backend measurements</span>
      </WorkspaceCanvas>,
    );
    const region = screen.getByRole('region', { name: 'Trend detail' });
    expect(within(region).getByRole('heading', { name: 'Owner trend', level: 2 })).toBeInTheDocument();
    expect(within(region).getByText('Backend measurements')).toBeInTheDocument();
    expect(within(region).getByRole('complementary', { name: 'Supporting details' })).toHaveTextContent('Backend detail');
  });

  it('does not leak previously visible content through loading, empty, degraded or unavailable states', () => {
    const retry = vi.fn();
    const view = render(
      <WorkspaceCanvas label="Protected register" variant="register" state={{ kind: 'ready' }}>
        <span>Company confidential row</span>
      </WorkspaceCanvas>,
    );
    const region = screen.getByRole('region', { name: 'Protected register' });
    expect(region).toHaveTextContent('Company confidential row');

    view.rerender(<WorkspaceCanvas label="Protected register" variant="register" state={{ kind: 'loading', message: 'Loading owner data' }}>
      <span>Company confidential row</span>
    </WorkspaceCanvas>);
    expect(within(region).getByRole('status')).toHaveTextContent('Loading owner data');
    expect(screen.queryByText('Company confidential row')).not.toBeInTheDocument();

    view.rerender(<WorkspaceCanvas label="Protected register" variant="register" state={{ kind: 'empty', message: 'No authorized records' }}>
      <span>Company confidential row</span>
    </WorkspaceCanvas>);
    expect(within(region).getByRole('status')).toHaveTextContent('No authorized records');
    expect(screen.queryByText('Company confidential row')).not.toBeInTheDocument();

    view.rerender(<WorkspaceCanvas label="Protected register" variant="register" state={{
      kind: 'degraded', message: 'Evidence request failed',
      retry: { label: 'Retry read', permitted: false, onRetry: retry },
    }}>
      <span>Company confidential row</span>
    </WorkspaceCanvas>);
    expect(within(region).getByRole('alert')).toHaveTextContent('Evidence request failed');
    expect(screen.queryByText('Company confidential row')).not.toBeInTheDocument();
    expect(within(region).queryByRole('button', { name: 'Retry read' })).not.toBeInTheDocument();
    expect(retry).not.toHaveBeenCalled();

    view.rerender(<WorkspaceCanvas label="Protected register" variant="register" state={{
      kind: 'degraded', message: 'Try again',
      retry: { label: 'Retry read', permitted: true, onRetry: retry },
    }} />);
    fireEvent.click(within(region).getByRole('button', { name: 'Retry read' }));
    expect(retry).toHaveBeenCalledOnce();

    view.rerender(<WorkspaceCanvas label="Protected register" variant="register"
      state={{ kind: 'unavailable', message: 'No current authority' }}>
      <span>Company confidential row</span>
    </WorkspaceCanvas>);
    expect(within(region).getByRole('alert')).toHaveTextContent('No current authority');
    expect(screen.queryByText('Company confidential row')).not.toBeInTheDocument();
    expect(within(region).queryByRole('button')).not.toBeInTheDocument();
  });

  it('suppresses a protected detail panel when a trend is not ready', () => {
    render(<WorkspaceCanvas label="Trend" variant="trend-detail"
      state={{ kind: 'unavailable', message: 'Unavailable' }}
      asideLabel="Detail" aside={<span>Protected detail</span>}>
      <span>Protected trend</span>
    </WorkspaceCanvas>);
    expect(screen.queryByText('Protected detail')).not.toBeInTheDocument();
    expect(screen.queryByText('Protected trend')).not.toBeInTheDocument();
  });
});
