import type { PropsWithChildren } from 'react';

import { RealtimeContext } from '@/features/realtime/realtimeContext';

export function RealtimeProvider({ children }: PropsWithChildren) {
  return <RealtimeContext.Provider value="not-connected">{children}</RealtimeContext.Provider>;
}
