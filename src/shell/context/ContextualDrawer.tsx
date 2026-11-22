import { ContextInspector } from '@/shell/context/ContextInspector';
import { useContextDrawer } from '@/shell/context/useContextDrawer';

export function ContextualDrawer() {
  const drawer = useContextDrawer();
  return (
    <ContextInspector open={drawer.open} title={drawer.title} onClose={drawer.closeDrawer}>
      {drawer.content}
    </ContextInspector>
  );
}
