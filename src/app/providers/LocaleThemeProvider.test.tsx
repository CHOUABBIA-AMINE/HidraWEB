import { act, render, screen } from '@testing-library/react';
import { useTheme } from '@mui/material/styles';
import { afterEach, describe, expect, it } from 'vitest';
import { I18nextProvider } from 'react-i18next';

import { LocaleThemeProvider } from '@/app/providers/LocaleThemeProvider';
import { i18n } from '@/shared/i18n/i18n';

function DirectionProbe() {
  const theme = useTheme();
  return <output aria-label="theme direction">{theme.direction}</output>;
}

afterEach(async () => {
  await act(async () => { await i18n.changeLanguage('fr'); });
});

describe('UXR-04 / direction-aware MUI shell', () => {
  it('updates the theme and document direction for FR, AR and EN', async () => {
    await act(async () => { await i18n.changeLanguage('fr'); });
    render(<I18nextProvider i18n={i18n}><LocaleThemeProvider><DirectionProbe /></LocaleThemeProvider></I18nextProvider>);
    expect(screen.getByLabelText('theme direction')).toHaveTextContent('ltr');
    expect(document.documentElement.dir).toBe('ltr');

    await act(async () => { await i18n.changeLanguage('ar'); });
    expect(screen.getByLabelText('theme direction')).toHaveTextContent('rtl');
    expect(document.documentElement.lang).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');

    await act(async () => { await i18n.changeLanguage('en'); });
    expect(screen.getByLabelText('theme direction')).toHaveTextContent('ltr');
    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
  });
});
