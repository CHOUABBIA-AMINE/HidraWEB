import { useContext } from 'react';

import { RealtimeContext, type RealtimeBootstrapStatus } from '@/features/realtime/realtimeContext';

export function useRealtimeStatus(): RealtimeBootstrapStatus {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtimeStatus must be used inside RealtimeProvider.');
  }
  return context;
}
