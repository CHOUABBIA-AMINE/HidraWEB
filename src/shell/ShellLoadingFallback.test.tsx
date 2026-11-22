import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { describe, expect, it } from 'vitest';

import { ShellLoadingFallback } from '@/shell/ShellLoadingFallback';
import { i18n } from '@/shared/i18n/i18n';

describe('UXR-05 / protected shell loading boundary', () => {
  it('announces the loading state without rendering workspace content', () => {
    render(<I18nextProvider i18n={i18n}><ShellLoadingFallback /></I18nextProvider>);
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Chargement de l’espace de travail');
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
});
