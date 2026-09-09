import { CssBaseline, ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import type { PropsWithChildren } from 'react';

import { AuthProvider } from '@/app/auth/AuthProvider';
import { AppErrorBoundary } from '@/app/providers/AppErrorBoundary';
import { hidraTheme } from '@/design-system/theme/theme';
import { PermissionProvider } from '@/features/permissions/PermissionProvider';
import { RealtimeProvider } from '@/features/realtime/RealtimeProvider';
import { i18n } from '@/shared/i18n/i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={hidraTheme}>
          <CssBaseline />
          <I18nextProvider i18n={i18n}>
            <AuthProvider>
              <PermissionProvider>
                <RealtimeProvider>{children}</RealtimeProvider>
              </PermissionProvider>
            </AuthProvider>
          </I18nextProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}
