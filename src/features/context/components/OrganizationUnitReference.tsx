import { Chip, Tooltip } from '@mui/material';
import { useQuery } from '@tanstack/react-query';

import { fetchWorkbenchRecord, workbenchQueryKeys } from '@/features/workbench/api/workbenchApi';

export interface OrganizationUnitReferenceProps {
  id: string;
  label?: string;
}

function resolvedLabel(attributes: Record<string, unknown>, fallback: string): string {
  const candidates = [attributes.nameFr, attributes.nameEn, attributes.nameAr, attributes.code];
  const match = candidates.find((value) => typeof value === 'string' && value.trim().length > 0);
  return typeof match === 'string' ? match : fallback;
}

export function OrganizationUnitReference({ id, label }: OrganizationUnitReferenceProps) {
  const query = useQuery({
    queryKey: workbenchQueryKeys.detail('organization', 'organization-units', id),
    queryFn: () => fetchWorkbenchRecord('organization', 'organization-units', id),
    enabled: Boolean(id),
    retry: false,
  });
  const text = label ?? (query.data ? resolvedLabel(query.data.attributes ?? {}, id) : id);

  return (
    <Tooltip title={`organization-unit: ${id}`}>
      <Chip
        aria-label={`organization-unit: ${id}`}
        label={text}
        size="small"
        variant={query.error ? 'outlined' : 'filled'}
      />
    </Tooltip>
  );
}
