import { createContext, useContext, type PropsWithChildren } from 'react';

import { runtimeConfig, type HidraAuthMode } from '@/app/bootstrap/runtimeConfig';

export type AuthBootstrapStatus = 'not-configured';

export interface AuthContextValue {
  mode: HidraAuthMode;
  status: AuthBootstrapStatus;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  return (
    <AuthContext.Provider value={{ mode: runtimeConfig.authMode, status: 'not-configured' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }
  return context;
}
