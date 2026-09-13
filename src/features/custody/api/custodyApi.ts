import { hidraHttpClient } from '@/api/client/hidraHttpClient';
import type {
  CustodyMeasurementPeriodResponse,
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
