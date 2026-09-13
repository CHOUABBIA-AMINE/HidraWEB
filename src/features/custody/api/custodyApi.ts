import { hidraHttpClient } from '@/api/client/hidraHttpClient';
import type {
  CreateCustodyTransferTicketRequest,
  CustodyDiscrepancyResponse,
  CustodyMeasurementPeriodResponse,
  CustodyTransferTicketResponse,
  OpenCustodyDiscrepancyRequest,
  OpenCustodyMeasurementPeriodRequest,
} from '@/api/generated/custody/model';

export const custodyQueryKeys = {
  all: ['hidra', 'custody'] as const,
};

export function openCustodyMeasurementPeriod(
  request: OpenCustodyMeasurementPeriodRequest,
): Promise<CustodyMeasurementPeriodResponse> {
  return hidraHttpClient<CustodyMeasurementPeriodResponse>({
    method: 'POST',
    url: '/api/v1/custody/measurement-periods',
    data: request,
  });
}

export function createCustodyTransferTicket(
  request: CreateCustodyTransferTicketRequest,
): Promise<CustodyTransferTicketResponse> {
  return hidraHttpClient<CustodyTransferTicketResponse>({
    method: 'POST',
    url: '/api/v1/custody/transfer-tickets',
    data: request,
  });
}

export function openCustodyDiscrepancy(
  request: OpenCustodyDiscrepancyRequest,
): Promise<CustodyDiscrepancyResponse> {
  return hidraHttpClient<CustodyDiscrepancyResponse>({
    method: 'POST',
    url: '/api/v1/custody/discrepancies',
    data: request,
  });
}
