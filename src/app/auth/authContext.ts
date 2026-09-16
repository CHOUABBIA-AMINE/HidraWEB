import { createContext } from 'react';

import type { HidraPrincipalView, ProviderType } from '@/app/auth/authenticationGateway';
import type { HidraAuthMode, HidraCredentialProvider } from '@/app/bootstrap/runtimeConfig';

export type AuthStatus = 'anonymous' | 'checking' | 'authenticated';
export type AuthSessionSource = 'basic' | 'jwt' | 'disabled';

export interface AuthSession {
  principalLabel: string;
  source: AuthSessionSource;
  sessionId?: string;
  expiresAt?: number;
  authenticationType?: ProviderType;
  identityProviderId?: string;
  principal?: HidraPrincipalView;
}

export interface AuthContextValue {
  mode: HidraAuthMode;
  credentialProvider: HidraCredentialProvider;
  status: AuthStatus;
  session?: AuthSession;
  error?: string;
  authenticateCredentials: (
    provider: HidraCredentialProvider,
    principal: string,
    credentials: string,
  ) => Promise<void>;
  beginOidcSignIn: (returnTo?: string) => Promise<void>;
  completeOidcSignIn: (search: string) => Promise<string>;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
