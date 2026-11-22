/**
 * UXR-03 industrial presentation tokens.
 * The seven approved color primitives mirror docs/figma/10-Design-System.tokens.json.
 * Operational meaning must be conveyed in text/icons as well as colors.
 */
export const industrialPalette = {
  primary: '#0B5D3B',
  secondary: '#334155',
  critical: '#B42318',
  warning: '#B54708',
  success: '#067647',
  information: '#175CD3',
  canvas: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#1D2939',
  mutedText: '#475467',
  divider: '#D0D5DD',
  focus: '#175CD3',
  selection: '#E7F3EC',
} as const;

export const industrialTypography = {
  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, "Noto Sans Arabic", sans-serif',
  numeric: 'tabular-nums',
} as const;

export const industrialBreakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
} as const;

export const industrialTokens = {
  color: industrialPalette,
  typography: industrialTypography,
  spacing: { unit: 4 },
  density: { compactRow: 40, control: 44, comfortableRow: 48 },
  radius: { control: 8, card: 12 },
  elevation: {
    card: '0 1px 3px rgba(16, 24, 40, 0.12)',
    raised: '0 4px 12px rgba(16, 24, 40, 0.16)',
    overlay: '0 12px 32px rgba(16, 24, 40, 0.2)',
  },
  focus: { width: 3, offset: 2 },
  breakpoints: industrialBreakpoints,
} as const;
