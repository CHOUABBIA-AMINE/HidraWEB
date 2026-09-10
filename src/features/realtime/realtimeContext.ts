import { createContext } from 'react';

export type RealtimeBootstrapStatus = 'not-connected';

export const RealtimeContext = createContext<RealtimeBootstrapStatus | undefined>(undefined);
