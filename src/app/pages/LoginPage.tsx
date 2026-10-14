import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useLocation } from 'react-router';

import { useAuth } from '@/app/auth/useAuth';
import { runtimeConfig, type HidraCredentialProvider } from '@/app/bootstrap/runtimeConfig';

interface LoginLocationState {
  from?: string;
}

const colors = {
  orange: '#FF8500',
  orangeHover: '#DE7100',
  black: '#171717',
  charcoal: '#252525',
  muted: '#646464',
  warmWhite: '#FAF9F7',
  border: '#E7E3DE',
};

const credentialProviderLabels: Record<HidraCredentialProvider, string> = {
  LOCAL: 'Hidra Local',
  LDAP: 'LDAP',
  ACTIVE_DIRECTORY: 'Active Directory',
};

const languages = [
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'ar', label: 'AR', name: 'العربية' },
] as const;

function isCredentialProvider(value: string): value is HidraCredentialProvider {
  return value === 'LOCAL' || value === 'LDAP' || value === 'ACTIVE_DIRECTORY';
}

export function LoginPage() {
  const { t, i18n } = useTranslation();
  const auth = useAuth();
  const location = useLocation();
  const state = location.state as LoginLocationState | null;
  const destination = state?.from && state.from !== '/login' ? state.from : '/overview';
  const credentialProviders = auth.mode === 'multi'
    ? auth.enabledAuthProviders.filter(isCredentialProvider)
    : auth.mode === 'basic' ? [auth.credentialProvider] : [];
  const oidcEnabled = auth.mode === 'jwt' ||
    (auth.mode === 'multi' && auth.enabledAuthProviders.includes('OIDC'));
  const [selectedProvider, setSelectedProvider] = useState<HidraCredentialProvider>(
    credentialProviders[0] ?? auth.credentialProvider,
  );
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [showPreviousError, setShowPreviousError] = useState(true);
  const effectiveProvider = credentialProviders.includes(selectedProvider)
    ? selectedProvider : credentialProviders[0];
  const checking = auth.status === 'checking';
  const activeLanguage = i18n.resolvedLanguage?.slice(0, 2) ?? i18n.language.slice(0, 2);
  const error = showPreviousError ? auth.error : undefined;

  if (auth.status === 'authenticated' || auth.mode === 'disabled') {
    return <Navigate replace to={destination} />;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!effectiveProvider || !username.trim() || !password || checking) return;
    setShowPreviousError(true);
    void auth.authenticateCredentials(effectiveProvider, username, password).catch(() => undefined);
  };

  const beginEnterpriseSignIn = () => {
    if (checking) return;
    setShowPreviousError(true);
    void auth.beginOidcSignIn(destination).catch(() => undefined);
  };

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        px: { xs: 1.5, sm: 3, lg: 5 },
        py: { xs: 2, sm: 4 },
        background: `radial-gradient(circle at 8% 8%, ${alpha(colors.orange, 0.14)} 0, transparent 38%), linear-gradient(145deg, #F8F5F0, #EDEAE5)`,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: 'min(100%, 1080px)',
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 0.94fr) minmax(0, 1fr)' },
          border: `1px solid ${colors.border}`,
          borderRadius: { xs: 3, sm: 4 },
          overflow: 'hidden',
          boxShadow: '0 24px 65px rgba(26, 25, 23, 0.11)',
        }}
      >
        <Box
          sx={{
            minWidth: 0,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'hidden',
            bgcolor: colors.black,
            color: '#fff',
            p: { xs: 3, sm: 4.5, md: 5 },
            minHeight: { xs: 165, md: 570 },
            gap: 3,
          }}
        >
          <Box
            aria-hidden="true"
            sx={{
              position: 'absolute',
              width: 420,
              height: 420,
              borderRadius: '50%',
              border: `1px solid ${alpha(colors.orange, 0.32)}`,
              top: -178,
              right: -218,
              boxShadow: `0 0 0 65px ${alpha(colors.orange, 0.045)}, 0 0 0 133px ${alpha('#fff', 0.025)}`,
              pointerEvents: 'none',
            }}
          />
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Box
                aria-hidden="true"
                sx={{
                  width: 41,
                  height: 41,
                  borderRadius: 1.5,
                  bgcolor: colors.orange,
                  color: colors.black,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 21,
                  fontWeight: 900,
                  letterSpacing: '-0.08em',
                }}
              >
                H
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 850, fontSize: 18, lineHeight: 1.15, letterSpacing: '0.1em' }}>
                  HIDRA
                </Typography>
                <Typography sx={{ fontSize: 10, color: alpha('#fff', 0.7), letterSpacing: '0.17em', mt: 0.4 }}>
                  SONATRACH
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Box sx={{ position: 'relative', zIndex: 1, display: { xs: 'none', md: 'block' } }}>
            <Box sx={{ width: 48, height: 4, borderRadius: 2, bgcolor: colors.orange, mb: 3 }} />
            <Typography
              component="h2"
              sx={{ fontSize: { md: 36, lg: 41 }, fontWeight: 760, lineHeight: 1.2, letterSpacing: '-0.035em' }}
            >
              {t('auth.login.brandTitle')}
            </Typography>
            <Typography sx={{ mt: 2, lineHeight: 1.8, color: alpha('#fff', 0.73), maxWidth: 350 }}>
              {t('auth.login.brandDescription')}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: colors.orange }} />
            <Typography sx={{ color: alpha('#fff', 0.77), fontSize: 12, letterSpacing: '0.02em' }}>
              {t('auth.login.brandFooter')}
            </Typography>
          </Stack>
        </Box>

        <Box
          sx={{
            minWidth: 0,
            bgcolor: '#fff',
            px: { xs: 3, sm: 5, md: 6 },
            pt: { xs: 3.5, sm: 4.5, md: 5 },
            pb: { xs: 4, sm: 5 },
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end', mb: { xs: 3, md: 5 } }}>
            {languages.map((language) => (
              <Button
                key={language.code}
                size="small"
                disabled={checking}
                aria-label={language.name}
                aria-pressed={activeLanguage === language.code}
                onClick={() => void i18n.changeLanguage(language.code)}
                sx={{
                  minWidth: 40,
                  px: 1,
                  color: activeLanguage === language.code ? colors.black : colors.muted,
                  fontWeight: activeLanguage === language.code ? 800 : 500,
                  bgcolor: activeLanguage === language.code ? alpha(colors.orange, 0.11) : 'transparent',
                  '&:hover': { bgcolor: alpha(colors.orange, 0.12) },
                }}
              >
                {language.label}
              </Button>
            ))}
          </Stack>

          <Box sx={{ width: '100%', maxWidth: 410, mx: 'auto', my: 'auto' }}>
            <Typography
              variant="overline"
              sx={{ color: '#A95400', fontWeight: 800, letterSpacing: '0.11em' }}
            >
              {t('auth.login.eyebrow')}
            </Typography>
            <Typography
              component="h1"
              sx={{
                color: colors.black,
                mt: 0.75,
                fontWeight: 780,
                fontSize: { xs: 29, sm: 34 },
                lineHeight: 1.2,
                letterSpacing: '-0.035em',
              }}
            >
              {auth.mode === 'multi' ? t('auth.multi.title')
                : auth.mode === 'jwt' ? t('auth.jwt.title')
                  : credentialProviderLabels[auth.credentialProvider]}
            </Typography>
            <Typography sx={{ color: colors.muted, mt: 1.4, lineHeight: 1.7, fontSize: 14 }}>
              {auth.mode === 'multi' ? t('auth.multi.description')
                : auth.mode === 'jwt' ? t('auth.login.oidcDescription')
                  : t('auth.login.credentialDescription')}
            </Typography>

            {error ? <Alert severity="error" role="alert" sx={{ mt: 3, borderRadius: 2 }}>{error}</Alert> : null}

            {credentialProviders.length > 0 ? (
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ display: 'grid', gap: 2.25, mt: 3.5 }}
              >
                {auth.mode === 'multi' && credentialProviders.length > 1 ? (
                  <TextField
                    fullWidth
                    label={t('auth.multi.provider')}
                    select
                    size="medium"
                    disabled={checking}
                    value={effectiveProvider}
                    helperText={t('auth.login.providerHint')}
                    onChange={(event) => {
                      const candidate = event.target.value;
                      if (!isCredentialProvider(candidate) || !credentialProviders.includes(candidate)) return;
                      setSelectedProvider(candidate);
                      setPassword('');
                      setPasswordVisible(false);
                      setShowPreviousError(false);
                    }}
                  >
                    {credentialProviders.map((provider) => (
                      <MenuItem key={provider} value={provider}>{credentialProviderLabels[provider]}</MenuItem>
                    ))}
                  </TextField>
                ) : auth.mode === 'multi' && effectiveProvider ? (
                  <Typography sx={{ fontSize: 13, color: colors.muted, fontWeight: 600 }}>
                    {t('auth.multi.provider')}: {credentialProviderLabels[effectiveProvider]}
                  </Typography>
                ) : null}

                <TextField
                  autoComplete="username"
                  autoFocus
                  disabled={checking}
                  fullWidth
                  label={t('auth.basic.username')}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                  value={username}
                />
                <TextField
                  autoComplete="current-password"
                  disabled={checking}
                  fullWidth
                  label={t('auth.basic.password')}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type={passwordVisible ? 'text' : 'password'}
                  value={password}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={t(passwordVisible ? 'auth.login.hidePassword' : 'auth.login.showPassword')}
                            aria-pressed={passwordVisible}
                            disabled={checking}
                            edge="end"
                            onClick={() => setPasswordVisible((visible) => !visible)}
                            size="small"
                          >
                            {passwordVisible ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <Button
                  disabled={checking || !username.trim() || !password}
                  type="submit"
                  variant="contained"
                  size="large"
                  endIcon={!checking ? <ArrowForwardRoundedIcon /> : undefined}
                  sx={{
                    minHeight: 52,
                    mt: 0.5,
                    bgcolor: colors.orange,
                    color: colors.black,
                    fontWeight: 800,
                    borderRadius: 2,
                    textTransform: 'none',
                    '&:hover': { bgcolor: colors.orangeHover, color: '#fff' },
                    '&.Mui-disabled': { bgcolor: '#F0EEE9', color: colors.muted },
                  }}
                >
                  {checking ? <CircularProgress size={22} color="inherit" /> : t('auth.basic.submit')}
                </Button>
              </Box>
            ) : null}

            {oidcEnabled ? (
              <Box sx={{ mt: credentialProviders.length > 0 ? 3 : 4 }}>
                {credentialProviders.length > 0 ? (
                  <Divider sx={{ mb: 2.5, color: colors.muted, fontSize: 12 }}>
                    {t('auth.multi.or')}
                  </Divider>
                ) : null}
                <Button
                  disabled={checking}
                  fullWidth
                  onClick={beginEnterpriseSignIn}
                  variant="outlined"
                  size="large"
                  startIcon={!checking ? <LockOutlinedIcon /> : undefined}
                  sx={{
                    minHeight: 52,
                    borderRadius: 2,
                    borderColor: '#C9C5BF',
                    color: colors.black,
                    fontWeight: 700,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: colors.orange,
                      bgcolor: alpha(colors.orange, 0.06),
                    },
                  }}
                >
                  {checking ? <CircularProgress size={22} color="inherit" /> : t('auth.jwt.submit')}
                </Button>
              </Box>
            ) : null}
          </Box>

          <Box sx={{ mt: { xs: 4, md: 6 }, textAlign: 'center' }}>
            <Typography sx={{ color: colors.muted, fontSize: 12 }}>
              {t('auth.login.environment', { environment: runtimeConfig.environment })}
            </Typography>
            <Typography sx={{ color: '#888', fontSize: 11, mt: 1 }}>
              {t('auth.login.accessNotice')}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
