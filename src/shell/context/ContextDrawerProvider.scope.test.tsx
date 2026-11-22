import { fireEvent, render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { describe, expect, it } from 'vitest';

import { i18n } from '@/shared/i18n/i18n';
import { ContextDrawerProvider } from '@/shell/context/ContextDrawerProvider';
import { ContextualDrawer } from '@/shell/context/ContextualDrawer';
import { useContextDrawer } from '@/shell/context/useContextDrawer';

function OpenContext() {
  const drawer = useContextDrawer();
  return <button onClick={() => drawer.openDrawer({ title: 'Scoped asset context', content: <p>Protected asset reference</p> })}>Inspect asset</button>;
}

function ShellContext({ viewKey }: { viewKey: string }) {
  // The production shell keys this boundary to route, grants, principal and scope.
  return (
    <I18nextProvider i18n={i18n}>
      <ContextDrawerProvider key={viewKey}>
        <OpenContext />
        <ContextualDrawer />
      </ContextDrawerProvider>
    </I18nextProvider>
  );
}

describe('UXR-07 scoped contextual drawer', () => {
  it('never restores a prior route/scope inspector on Back or authorization context changes', () => {
    const app = render(<ShellContext viewKey="route-a:scope-1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Inspect asset' }));
    expect(screen.getByText('Protected asset reference')).toBeInTheDocument();

    app.rerender(<ShellContext viewKey="route-b:scope-1" />);
    expect(screen.queryByText('Protected asset reference')).not.toBeInTheDocument();
    app.rerender(<ShellContext viewKey="route-a:scope-1" />);
    expect(screen.queryByText('Protected asset reference')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Inspect asset' }));
    expect(screen.getByText('Protected asset reference')).toBeInTheDocument();
    app.rerender(<ShellContext viewKey="route-a:scope-2" />);
    expect(screen.queryByText('Protected asset reference')).not.toBeInTheDocument();
  });
});
