import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';

import { ShellRouteError } from '@/shell/ShellRouteError';
import { i18n } from '@/shared/i18n/i18n';

function renderRouteFailure(status: number) {
  const router = createMemoryRouter([{
    path: '/restricted',
    loader: () => { throw new Response('INTERNAL ASSET REF GZ2-SECRET', { status }); },
    element: <div>Protected workspace content</div>,
    errorElement: <ShellRouteError />,
  }], { initialEntries: ['/restricted'] });

  return render(<I18nextProvider i18n={i18n}><RouterProvider router={router} /></I18nextProvider>);
}

describe('UXR-05 / fail-closed protected route boundary', () => {
  it('shows a generic denial without leaking the protected response or workspace', async () => {
    renderRouteFailure(403);
    expect(await screen.findByRole('heading', { name: 'Accès refusé' })).toBeVisible();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.queryByText(/INTERNAL ASSET REF|GZ2-SECRET|Protected workspace/)).not.toBeInTheDocument();
    expect(screen.getByText('403')).toBeVisible();
  });

  it('shows a generic unavailable screen without disclosing unhandled route errors', async () => {
    renderRouteFailure(500);
    expect(await screen.findByRole('heading', { name: 'Espace de travail indisponible' })).toBeVisible();
    expect(screen.queryByText(/INTERNAL ASSET REF|GZ2-SECRET|Protected workspace/)).not.toBeInTheDocument();
    expect(screen.getByText('503')).toBeVisible();
  });
});
