import { useCallback, useMemo, useState, type PropsWithChildren } from 'react';

import { ContextDrawerContext, type ContextDrawerRequest } from '@/shell/context/contextDrawerContext';

/**
 * One atomic selection: title and protected content always change together.
 * AppShell keys this provider to current path, principal, grants and scope.
 */
export function ContextDrawerProvider({ children }: PropsWithChildren) {
  const [selection, setSelection] = useState<ContextDrawerRequest | null>(null);

  const openDrawer = useCallback((request: ContextDrawerRequest) => {
    setSelection(request);
  }, []);
  const closeDrawer = useCallback(() => setSelection(null), []);

  const value = useMemo(() => ({
    open: selection !== null,
    title: selection?.title,
    content: selection?.content,
    openDrawer,
    closeDrawer,
  }), [closeDrawer, openDrawer, selection]);

  return <ContextDrawerContext.Provider value={value}>{children}</ContextDrawerContext.Provider>;
}
