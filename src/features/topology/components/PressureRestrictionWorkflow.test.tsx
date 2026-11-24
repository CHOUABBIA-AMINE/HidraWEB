import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, expect, test, vi } from 'vitest';

import { HidraApiError } from '@/api/errors/HidraApiError';
import { hidraHttpClient } from '@/api/client/hidraHttpClient';
import { PressureRestrictionWorkflow } from './PressureRestrictionWorkflow';

vi.mock('@/app/auth/useAuth', () => ({ useAuth: () => ({ session: { principal: { userId: 'publisher' } } }) }));
vi.mock('@/features/permissions/usePermissions', () => ({ usePermissions: () => ({ status: 'ready', can: () => true }) }));
vi.mock('@/api/client/hidraHttpClient', () => ({ hidraHttpClient: vi.fn() }));

afterEach(cleanup);

const requestId = 'a021e8b0-2de0-4272-87cb-74357a27ef96';
const decisions = [{ candidateId: 'candidate', taskId: 'task', instanceId: 'instance', actionId: 'action' }];
const root = `/api/v1/topology/operating-constraints/pipelines/pipeline%2Fone/restriction-requests/${requestId}`;

function setup() {
  const published = vi.fn();
  const client = new QueryClient();
  render(<QueryClientProvider client={client}>
    <PressureRestrictionWorkflow companyPartyId="company" pipelineId="pipeline/one" sectionId="section" onPublished={published} />
  </QueryClientProvider>);
  fireEvent.change(screen.getByLabelText('Restriction request ID'), { target: { value: requestId } });
  fireEvent.click(screen.getByRole('button', { name: 'Read publication inputs' }));
  return published;
}

test('publisher uses only exact backend references and verifies persisted receipt', async () => {
  const receipt = { requestId, revisionId: 'revision', streamVersion: 9 };
  vi.mocked(hidraHttpClient).mockReset()
    .mockResolvedValueOnce({ requestId, expectedVersion: 8, decisions })
    .mockResolvedValueOnce({ requestId, expectedVersion: 8, decisions })
    .mockResolvedValueOnce(receipt)
    .mockResolvedValueOnce({ requestId, publication: receipt, decisions: [] });
  const published = setup();
  const publish = await screen.findByRole('button', { name: 'Publish restriction' });
  expect(publish).toBeDisabled();
  fireEvent.click(screen.getByRole('checkbox', { name: 'Confirm publishing this exact restriction request' }));
  fireEvent.click(publish);
  await screen.findByText(`Publication receipt · ${requestId} · version 9 · revision`);
  expect(hidraHttpClient).toHaveBeenNthCalledWith(3, expect.objectContaining({
    url: root + '/publication', method: 'POST',
    data: { companyPartyId: 'company', sectionId: 'section', expectedVersion: 8, decisions },
  }));
  await waitFor(() => expect(published).toHaveBeenCalledOnce());
});

test('a stale publication input leaves the decision unissued', async () => {
  vi.mocked(hidraHttpClient).mockReset()
    .mockResolvedValueOnce({ requestId, expectedVersion: 8, decisions })
    .mockRejectedValueOnce(new HidraApiError('Stale', { status: 409 }));
  const published = setup();
  const publish = await screen.findByRole('button', { name: 'Publish restriction' });
  fireEvent.click(screen.getByRole('checkbox', { name: 'Confirm publishing this exact restriction request' }));
  fireEvent.click(publish);
  expect(await screen.findByRole('alert')).toHaveTextContent('The source changed.');
  expect(vi.mocked(hidraHttpClient).mock.calls.every(([config]) => config.method === 'GET')).toBe(true);
  expect(published).not.toHaveBeenCalled();
});
