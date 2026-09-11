import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { describe, expect, it } from 'vitest';

import { HidraApiError } from '@/api/errors/HidraApiError';
import { i18n } from '@/shared/i18n/i18n';
import { WorkbenchEmptyState, WorkbenchErrorState, WorkbenchLoadingState } from '@/features/workbench/components/WorkbenchState';

function renderWithI18n(node: React.ReactNode) {
  return render(<I18nextProvider i18n={i18n}>{node}</I18nextProvider>);
}

describe('workbench states', () => {
  it.each([
    [400, 'Requête invalide'],
    [403, 'Accès refusé'],
    [404, 'Ressource introuvable'],
    [500, 'Erreur serveur HidraAPI'],
  ])('renders the %i API state', (status, expectedTitle) => {
    renderWithI18n(<WorkbenchErrorState error={new HidraApiError('failure', { status })} />);
    expect(screen.getByText(expectedTitle)).toBeInTheDocument();
  });

  it('renders loading and empty states explicitly', () => {
    const { rerender } = renderWithI18n(<WorkbenchLoadingState label="Chargement test" />);
    expect(screen.getByRole('status')).toHaveTextContent('Chargement test');
    rerender(<I18nextProvider i18n={i18n}><WorkbenchEmptyState message="Aucun résultat test" /></I18nextProvider>);
    expect(screen.getByRole('status')).toHaveTextContent('Aucun résultat test');
  });
});
