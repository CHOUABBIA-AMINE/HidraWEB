import { beforeEach, describe, expect, it, vi } from 'vitest';

const httpClient = vi.hoisted(() => vi.fn());

vi.mock('@/api/client/hidraHttpClient', () => ({ hidraHttpClient: httpClient }));

import {
  createCustodyTransferTicket,
  openCustodyDiscrepancy,
  openCustodyMeasurementPeriod,
} from '@/features/custody/api/custodyApi';

describe('custody API adapter', () => {
  beforeEach(() => httpClient.mockReset());

  it('opens measurement periods through the canonical typed custody command', async () => {
    httpClient.mockResolvedValueOnce({
      id: 'period-1',
      periodCode: '2026-Q4',
      status: 'OPEN',
    });

    const request = {
      periodCode: '2026-Q4',
      agreementId: 'agreement-1',
      transferPointId: 'tp-1',
      periodStart: '2026-10-01T00:00:00Z',
      periodEnd: '2026-12-31T23:59:59Z',
    };

    await openCustodyMeasurementPeriod(request);

    expect(httpClient).toHaveBeenCalledWith({
      method: 'POST',
      url: '/api/v1/custody/measurement-periods',
      data: request,
    });
  });

  it('creates transfer tickets without inventing alternate fiscal-metering endpoints', async () => {
    httpClient.mockResolvedValueOnce({
      id: 'ticket-1',
      ticketNumber: 'CT-001',
      status: 'DRAFT',
    });

    const request = {
      ticketNumber: 'CT-001',
      measurementPeriodId: 'period-1',
      agreementId: 'agreement-1',
      transferPointId: 'tp-1',
      batchId: 'batch-1',
      quantityCalculationId: 'calc-1',
      ticketDate: '2026-10-01T08:00:00Z',
      issuedByActorId: 'actor-1',
      workflowInstanceId: 'wf-1',
    };

    await createCustodyTransferTicket(request);

    expect(httpClient).toHaveBeenCalledWith({
      method: 'POST',
      url: '/api/v1/custody/transfer-tickets',
      data: request,
    });
  });

  it('opens discrepancies through the current custody reconciliation contract', async () => {
    httpClient.mockResolvedValueOnce({
      id: 'disc-1',
      discrepancyNumber: 'DISC-001',
      status: 'OPEN',
    });

    const request = {
      discrepancyNumber: 'DISC-001',
      reconciliationId: 'recon-1',
      discrepancyTypeId: 'QUANTITY',
      differenceQuantity: 12.5,
      quantityUnitId: 'M3',
      description: 'Metering reconciliation delta',
      assignedActorId: 'actor-2',
      openedAt: '2026-10-01T09:00:00Z',
    };

    await openCustodyDiscrepancy(request);

    expect(httpClient).toHaveBeenCalledWith({
      method: 'POST',
      url: '/api/v1/custody/discrepancies',
      data: request,
    });
  });
});
