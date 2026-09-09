import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from '@/app/App';
import { AppProviders } from '@/app/providers/AppProviders';

describe('HidraWeb bootstrap', () => {
  it('renders the HWEB-001 overview route', async () => {
    render(
      <AppProviders>
        <App />
      </AppProviders>,
    );

    expect(await screen.findByRole('heading', { name: 'HidraWeb' })).toBeInTheDocument();
    expect(screen.getByText('HWEB-001')).toBeInTheDocument();
  });
});
