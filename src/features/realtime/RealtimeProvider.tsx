import { createContext, type PropsWithChildren } from 'react';

export type RealtimeBootstrapStatus = 'not-connected';

const RealtimeContext = createContext<RealtimeBootstrapStatus | undefined>(undefined);

export function RealtimeProvider({ children }: PropsWithChildren) {
  return <RealtimeContext.Provider value="not-connected">{children}</RealtimeContext.Provider>;
}
