import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthorizedRegister } from '@/shell/register/AuthorizedRegister';

afterEach(cleanup);
const page = { page: 0, size: 50, totalElements: 1, totalPages: 1, items: [{ id: 'secret', name: 'Private row' }] };
const columns = [{ key: 'name', heading: 'Name', value: (r: { id: string; name: string }) => r.name }];
const common = {
  label: 'Qualified source register', columns,
  rowKey: (r: { id: string }) => r.id, rowsPerPageLabel: 'Rows',
  onPageChange: vi.fn(), onPageSizeChange: vi.fn(),
};
describe('UXR-17 authorized register', () => {
  it('renders owner totals and owner selected-row action only when ready and permitted', () => {
    const inspect = vi.fn();
    render(<AuthorizedRegister {...common} state={{ kind: 'ready', page }}
      select={{ label: 'Inspect', permitted: true, enabled: row => row.id === 'secret', onSelect: inspect }} />);
    const region = screen.getByRole('region', { name: common.label });
    expect(within(region).getByRole('table', { name: common.label })).toHaveTextContent('Private row');
    expect(within(region).getByText(/1–1 of 1/)).toBeInTheDocument();
    fireEvent.click(within(region).getByRole('button', { name: 'Inspect' }));
    expect(inspect).toHaveBeenCalledWith(page.items[0]);
  });
  it('removes rows, total, selection and export when denied, pending or failed', () => {
    const select = { label: 'Inspect', permitted: true, enabled: () => true, onSelect: vi.fn() };
    const exportAction = { label: 'Export protected data', permitted: true, onExport: vi.fn() };
    const view = render(<AuthorizedRegister {...common} state={{ kind: 'ready', page }} select={select} exportAction={exportAction} />);
    expect(screen.getByText('Private row')).toBeInTheDocument();
    for (const kind of ['loading', 'denied', 'failed', 'empty'] as const) {
      view.rerender(<AuthorizedRegister {...common} state={{ kind, message: kind }} select={select} exportAction={exportAction} />);
      expect(screen.queryByText('Private row')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Export protected data' })).not.toBeInTheDocument();
      expect(screen.queryByRole('table', { name: common.label })).not.toBeInTheDocument();
      expect(screen.queryByText(/1–1 of 1/)).not.toBeInTheDocument();
    }
  });
  it('does not offer inspect/export without explicit owner action admission', () => {
    render(<AuthorizedRegister {...common} state={{ kind: 'ready', page }}
      select={{ label: 'Inspect', permitted: false, enabled: () => true, onSelect: vi.fn() }}
      exportAction={{ label: 'Export', permitted: false, onExport: vi.fn() }} />);
    expect(screen.queryByRole('button', { name: 'Inspect' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Export' })).not.toBeInTheDocument();
    expect(screen.getByText('Private row')).toBeInTheDocument();
  });
});
