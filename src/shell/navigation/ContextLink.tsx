import { Link as MuiLink } from '@mui/material';
import type { ReactNode } from 'react';
import { Link as RouterLink, useLocation } from 'react-router';

import { useAuth } from '@/app/auth/useAuth';
import { useShellUiStore } from '@/shell/model/useShellUiStore';
import {
  contextReturnState, contextScopeFingerprint, contextTargetPath,
  type ContextTarget,
} from '@/shell/navigation/contextLinkModel';

interface ContextLinkProps {
  target: ContextTarget;
  label: ReactNode;
  /** Current owner read/permission decision; never inferred by the shared link. */
  admitted: boolean;
  /** Source must have issued an exact reference, not a locally guessed relationship. */
  ownerIssued: boolean;
  onNavigate?: () => void;
}

/** Only creates a safe in-app route; destination owns all fresh authorization and data reads. */
export function ContextLink({ target, label, admitted, ownerIssued, onNavigate }: ContextLinkProps) {
  const location = useLocation();
  const auth = useAuth();
  const scope = useShellUiStore(state => state.operationalContext);
  const principalId = auth.status === 'authenticated' ? auth.session?.principal?.userId : undefined;
  const destination = contextTargetPath(target);
  if (!admitted || !ownerIssued || !principalId || !destination) return null;

  return <MuiLink component={RouterLink} to={destination} underline="hover"
    state={contextReturnState(location.pathname, principalId, contextScopeFingerprint(scope))}
    onClick={onNavigate}>{label}</MuiLink>;
}
