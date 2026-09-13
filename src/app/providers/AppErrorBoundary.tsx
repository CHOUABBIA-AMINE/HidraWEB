import { Alert, Box, Button, Typography } from '@mui/material';
import { Component, type PropsWithChildren, type ReactNode } from 'react';

import { reportTechnicalError } from '@/app/observability/technicalErrorReporter';

interface State {
  error?: Error;
  eventId?: string;
}

export class AppErrorBoundary extends Component<PropsWithChildren, State> {
  public state: State = {};

  public static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  public componentDidCatch(error: Error): void {
    const report = reportTechnicalError({
      source: 'react',
      message: 'Unhandled React render error.',
      errorName: error.name,
    });
    this.setState({ eventId: report.eventId });
  }

  public render(): ReactNode {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          <Typography variant="h6">HidraWeb encountered an unexpected error.</Typography>
          <Typography variant="body2">The application could not render this view safely.</Typography>
          {this.state.eventId ? (
            <Typography component="div" variant="caption" sx={{ mt: 1 }}>
              Support reference: {this.state.eventId}
            </Typography>
          ) : null}
          <Button sx={{ mt: 2 }} onClick={() => window.location.reload()}>
            Reload application
          </Button>
        </Alert>
      </Box>
    );
  }
}
