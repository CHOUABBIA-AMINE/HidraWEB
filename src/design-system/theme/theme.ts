import { createTheme } from '@mui/material/styles';

import {
  industrialPalette as color,
  industrialTypography,
} from '@/design-system/tokens/industrialTokens';

// MUI's default xs–xl breakpoints already match industrialTokens.
// MUI derives readable foregrounds for these dark semantic colors.
// Static tabular-numeral, focus, density and motion rules live in industrialTheme.css.
export const hidraTheme = createTheme({
  palette: {
    primary: { main: color.primary },
    secondary: { main: color.secondary },
    error: { main: color.critical },
    warning: { main: color.warning },
    success: { main: color.success },
    info: { main: color.information },
    background: { default: color.canvas },
    text: { primary: color.text, secondary: color.mutedText },
    divider: color.divider,
  },
  spacing: 4,
  shape: { borderRadius: 8 },
  typography: { fontFamily: industrialTypography.fontFamily },
  components: { MuiButton: { defaultProps: { disableElevation: true } } },
});
