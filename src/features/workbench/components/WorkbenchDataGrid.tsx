import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { WorkbenchRecord, WorkbenchResourceDescriptor } from '@/features/workbench/api/workbenchApi';
import { AuthorizedRegister, type AuthorizedRegisterColumn } from '@/shell/register/AuthorizedRegister';
import type { AuthorizedRegisterState } from '@/shell/register/authorizedRegisterState';

interface WorkbenchDataGridProps {
  descriptor: WorkbenchResourceDescriptor;
  state: AuthorizedRegisterState<WorkbenchRecord>;
  detailEnabled: boolean;
  onInspect: (record: WorkbenchRecord) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

function renderValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  try { return JSON.stringify(value); } catch { return '—'; }
}

/** The owner adapter supplies only the admitted page; the shared table owns no searches or data access. */
export function WorkbenchDataGrid({
  descriptor, state, detailEnabled, onInspect, onPageChange, onPageSizeChange,
}: WorkbenchDataGridProps) {
  const { t } = useTranslation();
  const columns = useMemo((): AuthorizedRegisterColumn<WorkbenchRecord>[] => {
    const keys = new Set<string>();
    if (descriptor.idField) keys.add(descriptor.idField);
    descriptor.searchableFields.forEach(field => keys.add(field));
    // Display fields from the currently admitted owner page, never stale/cross-owner records.
    if (state.kind === 'ready') state.page.items.forEach(item =>
      Object.keys(item.attributes).forEach(field => keys.add(field)));
    return [...keys].slice(0, 10).map(key => ({
      key, heading: key, value: (item: WorkbenchRecord) => renderValue(item.attributes[key]),
    }));
  }, [descriptor, state]);

  return <AuthorizedRegister<WorkbenchRecord>
    label={`${descriptor.module}/${descriptor.resource}`}
    state={state} columns={columns}
    rowKey={(record, index) => `${String(record.id ?? 'row')}-${index}`}
    rowsPerPageLabel={t('workbench.rowsPerPage')}
    onPageChange={onPageChange} onPageSizeChange={onPageSizeChange}
    select={{
      label: t('workbench.inspect'),
      permitted: detailEnabled,
      enabled: record => record.id !== undefined && record.id !== null &&
        record.module === descriptor.module && record.resource === descriptor.resource,
      onSelect: onInspect,
    }}
  />;
}
