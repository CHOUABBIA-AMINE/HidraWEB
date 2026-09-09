import { Alert, Box, Button, Typography } from '@mui/material';
import { Component, type ErrorInfo, type PropsWithChildren, type ReactNode } from 'react';

interface State {
  error?: Error;
}

export class AppErrorBoundary extends Component<PropsWithChildren, State> {
  public state: State = {};

  public static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Unhandled HidraWeb error', error, errorInfo);
  }

  public render(): ReactNode {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          <Typography variant="h6">HidraWeb encountered an unexpected error.</Typography>
          <Typography variant="body2">{this.state.error.message}</Typography>
          <Button sx={{ mt: 2 }} onClick={() => window.location.reload()}>
            Reload application
          </Button>
        </Alert>
      </Box>
    );
  }
}
