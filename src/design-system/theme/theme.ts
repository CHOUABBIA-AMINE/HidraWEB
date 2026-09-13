import { createTheme } from '@mui/material/styles';

export const hidraTheme = createTheme({
  typography: {
    fontFamily: 'Arial, Helvetica, sans-serif',
  },
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        '*:focus-visible': {
          outline: '3px solid currentColor',
          outlineOffset: '3px',
        },
      },
    },
  },
});
