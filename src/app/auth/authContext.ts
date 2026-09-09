import { createContext } from 'react';

import type { HidraAuthMode } from '@/app/bootstrap/runtimeConfig';

export type AuthStatus = 'anonymous' | 'checking' | 'authenticated';
export type AuthSessionSource = 'basic' | 'jwt' | 'disabled';

export interface AuthSession {
  principalLabel: string;
  source: AuthSessionSource;
}

export interface AuthContextValue {
  mode: HidraAuthMode;
  status: AuthStatus;
  session?: AuthSession;
  error?: string;
  authenticateBasic: (username: string, password: string) => Promise<void>;
  authenticateJwt: (accessToken: string) => Promise<void>;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
