import { createContext, type ReactNode } from 'react';

export interface ContextDrawerRequest {
  title: string;
  content: ReactNode;
}

export interface ContextDrawerContextValue {
  open: boolean;
  title?: string;
  content?: ReactNode;
  openDrawer: (request: ContextDrawerRequest) => void;
  closeDrawer: () => void;
}

export const ContextDrawerContext = createContext<ContextDrawerContextValue | undefined>(undefined);
