import { Alert, Box, CircularProgress, Paper, Typography } from '@mui/material';
import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { useAuth } from '@/app/auth/useAuth';

export function OidcCallbackPage() {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void auth.completeOidcSignIn(location.search)
      .then((returnTo) => navigate(returnTo, { replace: true }))
      .catch(() => undefined);
  }, [auth, location.search, navigate]);

  return (
    <Box sx={{ bgcolor: 'grey.50', display: 'grid', minHeight: '100vh', placeItems: 'center', p: 3 }}>
      <Paper component="main" elevation={1} sx={{ width: 'min(100%, 520px)', p: { xs: 3, md: 5 } }}>
        <Typography color="primary" sx={{ fontWeight: 700 }} variant="overline">HIDRA</Typography>
        <Typography component="h1" sx={{ mt: 1 }} variant="h4">Enterprise sign-in</Typography>
        {auth.error ? (
          <Alert severity="error" sx={{ mt: 3 }}>{auth.error}</Alert>
        ) : (
          <Box sx={{ alignItems: 'center', display: 'flex', gap: 2, mt: 3 }}>
            <CircularProgress size={24} />
            <Typography color="text.secondary">Validating the OIDC callback and establishing the in-memory session…</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
