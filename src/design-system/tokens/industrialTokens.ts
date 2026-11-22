/**
 * UXR-03: front-end presentation tokens only.
 * The source of industrial color values is docs/figma/10-Design-System.tokens.json.
 * Never use semantic colors as the only indication of operational state.
 */
export const industrialTokens = {
  color: {
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
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, "Noto Sans Arabic", sans-serif',
    numeric: 'tabular-nums',
  },
  spacing: {
    unit: 4,
  },
  density: {
    compactRow: 40,
    control: 44,
    comfortableRow: 48,
  },
  radius: {
    control: 8,
    card: 12,
  },
  elevation: {
    card: '0 1px 3px rgba(16, 24, 40, 0.12)',
    raised: '0 4px 12px rgba(16, 24, 40, 0.16)',
    overlay: '0 12px 32px rgba(16, 24, 40, 0.2)',
  },
  focus: {
    width: 3,
    offset: 2,
  },
  breakpoints: {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536,
  },
} as const;
