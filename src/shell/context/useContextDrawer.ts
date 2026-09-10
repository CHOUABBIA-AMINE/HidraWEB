import { useContext } from 'react';

import { ContextDrawerContext, type ContextDrawerContextValue } from '@/shell/context/contextDrawerContext';

export function useContextDrawer(): ContextDrawerContextValue {
  const context = useContext(ContextDrawerContext);
  if (!context) {
    throw new Error('useContextDrawer must be used inside ContextDrawerProvider.');
  }
  return context;
}
