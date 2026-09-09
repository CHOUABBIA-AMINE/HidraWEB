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
  },
});
