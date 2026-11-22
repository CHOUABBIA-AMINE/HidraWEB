import { createTheme } from '@mui/material/styles';

import { industrialTokens as tokens } from '@/design-system/tokens/industrialTokens';

const keyboardFocus = `${tokens.focus.width}px solid ${tokens.color.focus}`;

export const hidraTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: tokens.color.primary, contrastText: tokens.color.surface },
    secondary: { main: tokens.color.secondary, contrastText: tokens.color.surface },
    error: { main: tokens.color.critical, contrastText: tokens.color.surface },
    warning: { main: tokens.color.warning, contrastText: tokens.color.surface },
    success: { main: tokens.color.success, contrastText: tokens.color.surface },
    info: { main: tokens.color.information, contrastText: tokens.color.surface },
    background: { default: tokens.color.canvas, paper: tokens.color.surface },
    text: { primary: tokens.color.text, secondary: tokens.color.mutedText },
    divider: tokens.color.divider,
  },
  spacing: tokens.spacing.unit,
  breakpoints: { values: { ...tokens.breakpoints } },
  shape: { borderRadius: tokens.radius.control },
  typography: {
    fontFamily: tokens.typography.fontFamily,
    htmlFontSize: 16,
    fontSize: 14,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.2 },
    h2: { fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.25 },
    h3: { fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.3 },
    h4: { fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.35 },
    h5: { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.4 },
    h6: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.4 },
    body1: { fontSize: '0.9375rem', lineHeight: 1.5, fontVariantNumeric: tokens.typography.numeric },
    body2: { fontSize: '0.875rem', lineHeight: 1.5, fontVariantNumeric: tokens.typography.numeric },
    caption: { fontVariantNumeric: tokens.typography.numeric },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  components: {
    MuiAppBar: {
      defaultProps: { elevation: 0 },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          minHeight: tokens.density.control,
          textTransform: 'none',
          '&:focus-visible': { outline: keyboardFocus, outlineOffset: tokens.focus.offset },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          minHeight: tokens.density.control,
          minWidth: tokens.density.control,
          '&:focus-visible': { outline: keyboardFocus, outlineOffset: tokens.focus.offset },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          minHeight: tokens.density.control,
          '&.Mui-selected': {
            backgroundColor: tokens.color.selection,
            borderInlineStart: `${tokens.focus.width}px solid ${tokens.color.primary}`,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${tokens.color.divider}`,
          borderRadius: tokens.radius.card,
          boxShadow: tokens.elevation.card,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: tokens.color.divider, padding: '8px 12px' },
        head: { fontWeight: 700 },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
    MuiCssBaseline: {
      styleOverrides: {
        'html': { fontVariantNumeric: tokens.typography.numeric },
        '*:focus-visible': { outline: keyboardFocus, outlineOffset: tokens.focus.offset },
        '@media (forced-colors: active)': {
          '*:focus-visible': { outlineColor: 'Highlight' },
        },
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            scrollBehavior: 'auto !important',
            transitionDuration: '0.01ms !important',
          },
        },
      },
    },
  },
});
