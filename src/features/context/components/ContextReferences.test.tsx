import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ActorReference } from '@/features/context/components/ActorReference';
import { OrganizationUnitReference } from '@/features/context/components/OrganizationUnitReference';

const httpMock = vi.hoisted(() => vi.fn());

vi.mock('@/api/client/hidraHttpClient', () => ({
  hidraHttpClient: httpMock,
}));

function QueryHarness({ children }: PropsWithChildren) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('HWEB-004 responsible context references', () => {
  it('resolves identity and employee actors only from the caller-declared source', async () => {
    httpMock.mockImplementation(async (config: { url?: string }) => {
      if (config.url === '/api/v1/workbench/identity/users/actor-1') {
        return { module: 'identity', resource: 'users', id: 'actor-1', attributes: { id: 'actor-1', displayName: 'Identity Operator', username: 'operator' } };
      }
      if (config.url === '/api/v1/workbench/organization/employees/actor-2') {
        return { module: 'organization', resource: 'employees', id: 'actor-2', attributes: { id: 'actor-2', displayNameLt: 'Employee Operator', employeeNumber: 'E-42' } };
      }
      throw new Error(`Unexpected URL ${config.url}`);
    });

    render(
      <QueryHarness>
        <ActorReference id="actor-1" source="identity-user" />
        <ActorReference id="actor-2" source="employee" />
      </QueryHarness>,
    );

    expect(await screen.findByText('Identity Operator')).toBeInTheDocument();
    expect(await screen.findByText('Employee Operator')).toBeInTheDocument();
    expect(httpMock).toHaveBeenCalledWith(expect.objectContaining({ url: '/api/v1/workbench/identity/users/actor-1' }));
    expect(httpMock).toHaveBeenCalledWith(expect.objectContaining({ url: '/api/v1/workbench/organization/employees/actor-2' }));
  });

  it('resolves organization-unit context and falls back to the opaque id when lookup is refused', async () => {
    httpMock.mockImplementation(async (config: { url?: string }) => {
      if (config.url === '/api/v1/workbench/organization/organization-units/ou-1') {
        return { module: 'organization', resource: 'organization-units', id: 'ou-1', attributes: { id: 'ou-1', nameFr: 'Direction Transport', code: 'TRC' } };
      }
      if (config.url === '/api/v1/workbench/organization/organization-units/ou-denied') {
        throw new Error('Forbidden');
      }
      throw new Error(`Unexpected URL ${config.url}`);
    });

    render(
      <QueryHarness>
        <OrganizationUnitReference id="ou-1" />
        <OrganizationUnitReference id="ou-denied" />
      </QueryHarness>,
    );

    expect(await screen.findByText('Direction Transport')).toBeInTheDocument();
    expect(screen.getByText('ou-denied')).toBeInTheDocument();
  });
});
