import { CssBaseline, ThemeProvider } from '@mui/material';
import type { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

import { hidraTheme } from '@/design-system/theme/theme';

// Keep one MUI theme per writing direction, without re-creating themes on every render.
const rtlTheme = { ...hidraTheme, direction: 'rtl' as const };

export function LocaleThemeProvider({ children }: PropsWithChildren) {
  const { i18n } = useTranslation();
  return (
    <ThemeProvider theme={i18n.dir() === 'rtl' ? rtlTheme : hidraTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
