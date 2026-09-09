import { createContext, useContext, type PropsWithChildren } from 'react';

export type RealtimeBootstrapStatus = 'not-connected';

const RealtimeContext = createContext<RealtimeBootstrapStatus | undefined>(undefined);

export function RealtimeProvider({ children }: PropsWithChildren) {
  return <RealtimeContext.Provider value="not-connected">{children}</RealtimeContext.Provider>;
}

export function useRealtimeStatus(): RealtimeBootstrapStatus {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtimeStatus must be used inside RealtimeProvider.');
  }
  return context;
}
