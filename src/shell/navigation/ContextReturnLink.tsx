import { Link as MuiLink } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useLocation } from 'react-router';

import { useAuth } from '@/app/auth/useAuth';
import { useShellUiStore } from '@/shell/model/useShellUiStore';
import { contextScopeFingerprint, validContextReturn } from '@/shell/navigation/contextLinkModel';

/** Route-only return; no protected record IDs or cross-principal navigation are restored. */
export function ContextReturnLink() {
  const location = useLocation();
  const auth = useAuth();
  const scope = useShellUiStore(state => state.operationalContext);
  const principalId = auth.status === 'authenticated' ? auth.session?.principal?.userId : undefined;
  const pathname = validContextReturn(location.state, principalId, contextScopeFingerprint(scope));
  const { t } = useTranslation();
  return pathname ? (
    <MuiLink component={RouterLink} to={pathname} replace underline="hover">
      {t('contextLink.returnToWorkspace')}
    </MuiLink>
  ) : null;
}
