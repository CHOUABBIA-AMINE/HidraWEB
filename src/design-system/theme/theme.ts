import { createTheme } from '@mui/material/styles';

import {
  industrialBreakpoints,
  industrialPalette as color,
  industrialTypography,
} from '@/design-system/tokens/industrialTokens';

/**
 * Runtime MUI palette and typography remain authoritative.
 * Static focus, density, elevation and reduced-motion rules live in
 * industrialTheme.css, loaded once by AppProviders and excluded from the
 * initial JavaScript bundle-size budget.
 */
export const hidraTheme = createTheme({
  palette: {
    primary: { main: color.primary, contrastText: color.surface },
    secondary: { main: color.secondary, contrastText: color.surface },
    error: { main: color.critical, contrastText: color.surface },
    warning: { main: color.warning, contrastText: color.surface },
    success: { main: color.success, contrastText: color.surface },
    info: { main: color.information, contrastText: color.surface },
    background: { default: color.canvas, paper: color.surface },
    text: { primary: color.text, secondary: color.mutedText },
    divider: color.divider,
  },
  spacing: 4,
  breakpoints: { values: industrialBreakpoints },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: industrialTypography.fontFamily,
    body1: { fontVariantNumeric: industrialTypography.numeric },
    body2: { fontVariantNumeric: industrialTypography.numeric },
    caption: { fontVariantNumeric: industrialTypography.numeric },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
  },
});
