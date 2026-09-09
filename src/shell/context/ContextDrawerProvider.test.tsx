import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ContextDrawerProvider } from '@/shell/context/ContextDrawerProvider';
import { ContextualDrawer } from '@/shell/context/ContextualDrawer';
import { useContextDrawer } from '@/shell/context/useContextDrawer';

function DrawerHarness() {
  const drawer = useContextDrawer();
  return <button onClick={() => drawer.openDrawer({ title: 'Asset context', content: <p>Inspector content</p> })}>Open context</button>;
}

describe('contextual drawer infrastructure', () => {
  it('opens and closes without reserving a permanent shell column', () => {
    render(
      <ContextDrawerProvider>
        <DrawerHarness />
        <ContextualDrawer />
      </ContextDrawerProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open context' }));
    expect(screen.getByRole('heading', { name: 'Asset context' })).toBeInTheDocument();
    expect(screen.getByText('Inspector content')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Fermer le panneau contextuel' }));
    expect(screen.queryByRole('heading', { name: 'Asset context' })).not.toBeInTheDocument();
  });
});
