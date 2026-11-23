import { Alert, Box, Paper, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import type { OrganizationNodeView } from '@/api/generated/identity-organization/model';
import { fetchOrganizationHierarchy } from '@/features/context/api/identityOrganizationApi';
import { usePermissions } from '@/features/permissions/usePermissions';
import { useShellUiStore } from '@/shell/model/useShellUiStore';

function TreeNode({ node, ancestors }: { node: OrganizationNodeView; ancestors: ReadonlySet<string> }) {
  const unit = node.unit;
  if (!unit?.id || ancestors.has(unit.id)) return null;
  const next = new Set(ancestors);
  next.add(unit.id);
  return (
    <Box component="li" sx={{ mb: 1 }}>
      <Typography variant="body2">{unit.code ?? unit.id} · {unit.nameFr ?? unit.nameEn ?? unit.nameAr ?? '—'}</Typography>
      <Typography color="text.secondary" variant="caption">
        {unit.status ?? '—'} · {unit.validFrom ?? '—'} → {unit.validTo ?? '—'}
      </Typography>
      {node.children?.length ? (
        <Box component="ul" sx={{ pl: 3 }}>
          {node.children.map((child, index) => (
            <TreeNode key={child.unit?.id ?? index} node={child} ancestors={next} />
          ))}
        </Box>
      ) : null}
    </Box>
  );
}

/** Hierarchy is owner-issued; route-level permission and fresh success are required. */
export function OrganizationHierarchyPanel() {
  const permissions = usePermissions();
  const companyPartyId = useShellUiStore((state) => state.operationalContext?.companyPartyId ?? '');
  const route = permissions.routes.find((r) =>
    r.route === '/api/v1/organization/hierarchy' && r.methods.includes('GET'));
  const admitted = permissions.status === 'ready' && Boolean(route?.permission && permissions.can(route.permission));
  const query = useQuery({
    queryKey: ['hidra', 'organization-admin', 'hierarchy', companyPartyId],
    queryFn: fetchOrganizationHierarchy,
    enabled: admitted,
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });

  return (
    <Paper component="section" aria-label="Organization hierarchy" variant="outlined" sx={{ p: 2 }}>
      <Typography component="h2" variant="h6">Organization hierarchy</Typography>
      {!admitted ? <Alert severity="warning">Organization hierarchy is unavailable or not authorized.</Alert>
        : query.isError ? <Alert severity="error">Unable to read the authorized hierarchy.</Alert>
        : query.isFetching || !query.isSuccess ? <Typography role="status">Loading hierarchy…</Typography>
        : query.data.length === 0 ? <Alert severity="info">No hierarchy records.</Alert>
        : <Box component="ul" sx={{ pl: 2 }}>
          {query.data.map((node, index) => (
            <TreeNode key={node.unit?.id ?? index} node={node} ancestors={new Set()} />
          ))}
        </Box>}
    </Paper>
  );
}
