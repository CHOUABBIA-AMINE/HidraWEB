import { useCallback, useMemo, useState, type PropsWithChildren, type ReactNode } from 'react';

import { ContextDrawerContext, type ContextDrawerRequest } from '@/shell/context/contextDrawerContext';

export function ContextDrawerProvider({ children }: PropsWithChildren) {
  const [title, setTitle] = useState<string>();
  const [content, setContent] = useState<ReactNode>();
  const [open, setOpen] = useState(false);

  const openDrawer = useCallback((request: ContextDrawerRequest) => {
    setTitle(request.title);
    setContent(request.content);
    setOpen(true);
  }, []);

  const closeDrawer = useCallback(() => setOpen(false), []);

  const value = useMemo(() => ({ open, title, content, openDrawer, closeDrawer }), [closeDrawer, content, open, openDrawer, title]);

  return <ContextDrawerContext.Provider value={value}>{children}</ContextDrawerContext.Provider>;
}
