import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { afterEach, describe, expect, it } from 'vitest';

import { i18n } from '@/shared/i18n/i18n';
import { ContextDrawerProvider } from '@/shell/context/ContextDrawerProvider';
import { ContextualDrawer } from '@/shell/context/ContextualDrawer';
import { useContextDrawer } from '@/shell/context/useContextDrawer';

afterEach(cleanup);

function InspectActions() {
  const drawer = useContextDrawer();
  return (
    <>
      <button onClick={() => drawer.openDrawer({
        title: 'Feature A',
        content: (
          <>
            <span>Owner A detail</span>
            <button onClick={() => drawer.openDrawer({
              title: 'Feature B',
              content: <span>Owner B detail</span>,
            })}>Inspect next feature</button>
          </>
        ),
      })}>Inspect selected feature</button>
      <button onClick={drawer.closeDrawer}>Close external selection</button>
    </>
  );
}

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <ContextDrawerProvider>
        <InspectActions />
        <ContextualDrawer />
      </ContextDrawerProvider>
    </I18nextProvider>
  );
}

describe('UXR-14 owner-controlled context inspector', () => {
  it('labels the modal inspector, atomically replaces the selected record and discards the prior content', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Inspect selected feature' }));

    const initial = screen.getByRole('dialog', { name: 'Feature A' });
    expect(within(initial).getByText('Owner A detail')).toBeInTheDocument();
    expect(within(initial).getByRole('button', { name: 'Fermer le panneau contextuel' })).toBeInTheDocument();

    fireEvent.click(within(initial).getByRole('button', { name: 'Inspect next feature' }));
    expect(screen.getByRole('dialog', { name: 'Feature B' })).toHaveTextContent('Owner B detail');
    expect(screen.queryByText('Owner A detail')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Fermer le panneau contextuel' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Feature B' })).not.toBeInTheDocument());
    expect(screen.queryByText('Owner B detail')).not.toBeInTheDocument();
  });

  it('has no visible inspector content until a current record is selected', () => {
    render(<App />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText('Owner A detail')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Inspect selected feature' }));
    expect(screen.getByText('Owner A detail')).toBeInTheDocument();
  });
});
