import { Chip, Tooltip } from '@mui/material';
import { useQuery } from '@tanstack/react-query';

import { fetchWorkbenchRecord, workbenchQueryKeys } from '@/features/workbench/api/workbenchApi';

export type ActorReferenceSource = 'identity-user' | 'employee';

export interface ActorReferenceProps {
  source: ActorReferenceSource;
  id: string;
  label?: string;
}

function actorLocation(source: ActorReferenceSource): { module: string; resource: string } {
  return source === 'identity-user'
    ? { module: 'identity', resource: 'users' }
    : { module: 'organization', resource: 'employees' };
}

function resolvedLabel(source: ActorReferenceSource, attributes: Record<string, unknown>, fallback: string): string {
  const candidates = source === 'identity-user'
    ? [attributes.displayName, attributes.username]
    : [attributes.displayNameLt, attributes.displayNameAr, attributes.employeeNumber];
  const match = candidates.find((value) => typeof value === 'string' && value.trim().length > 0);
  return typeof match === 'string' ? match : fallback;
}

export function ActorReference({ source, id, label }: ActorReferenceProps) {
  const location = actorLocation(source);
  const query = useQuery({
    queryKey: workbenchQueryKeys.detail(location.module, location.resource, id),
    queryFn: () => fetchWorkbenchRecord(location.module, location.resource, id),
    enabled: Boolean(id),
    retry: false,
  });
  const text = label ?? (query.data ? resolvedLabel(source, query.data.attributes ?? {}, id) : id);
  const title = `${source}: ${id}`;

  return (
    <Tooltip title={title}>
      <Chip
        aria-label={title}
        label={text}
        size="small"
        variant={query.error ? 'outlined' : 'filled'}
      />
    </Tooltip>
  );
}
