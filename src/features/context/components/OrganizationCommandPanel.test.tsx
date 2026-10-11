import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const createUnit = vi.hoisted(() => vi.fn());

vi.mock('@/features/context/api/identityOrganizationApi', () => ({
  createOrganizationUnit: createUnit,
  registerEmployee: vi.fn(),
  assignEmployee: vi.fn(),
}));
vi.mock('@/features/permissions/usePermissions', () => ({
  usePermissions: () => ({ can: () => true }),
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { OrganizationCommandPanel } from '@/features/context/components/OrganizationCommandPanel';

describe('HWEB-F01 organization unit creation guard', () => {
  beforeEach(() => createUnit.mockReset().mockResolvedValue({ id: 'ou-1' }));

  it('does not submit an absent effective date and sends only a supplied instant', async () => {
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <OrganizationCommandPanel />
      </QueryClientProvider>,
    );

    const submit = screen.getByRole('button', { name: 'context.organization.createUnit' });
    expect(submit).toBeDisabled();
    fireEvent.click(submit);
    expect(createUnit).not.toHaveBeenCalled();

    const validFrom = screen.getAllByLabelText(/context.fields.validFrom/)[0];
    fireEvent.change(validFrom, { target: { value: '2026-10-11T14:30' } });
    expect(submit).toBeEnabled();

    fireEvent.click(submit);
    await waitFor(() => expect(createUnit).toHaveBeenCalledTimes(1));
    expect(createUnit).toHaveBeenCalledWith(expect.objectContaining({
      validFrom: new Date('2026-10-11T14:30').toISOString(),
    }));
  });
});
