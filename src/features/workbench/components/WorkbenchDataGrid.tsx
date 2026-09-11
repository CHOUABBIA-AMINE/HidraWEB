import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from '@mui/material';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { OperationalPageResponse, OperationalRecordResponse, OperationalResourceDescriptor } from '@/api/generated/workbench/model';

interface WorkbenchDataGridProps {
  descriptor: OperationalResourceDescriptor;
  page: OperationalPageResponse;
  detailEnabled: boolean;
  onInspect: (record: OperationalRecordResponse) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

function renderValue(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function WorkbenchDataGrid({
  descriptor,
  page,
  detailEnabled,
  onInspect,
  onPageChange,
  onPageSizeChange,
}: WorkbenchDataGridProps) {
  const { t } = useTranslation();
  const columns = useMemo(() => {
    const keys = new Set<string>();
    keys.add(descriptor.idField);
    descriptor.searchableFields.forEach((field) => keys.add(field));
    page.items.forEach((item) => Object.keys(item.attributes ?? {}).forEach((field) => keys.add(field)));
    return Array.from(keys).slice(0, 10);
  }, [descriptor, page.items]);

  return (
    <Paper variant="outlined">
      <TableContainer sx={{ maxHeight: 'calc(100vh - 360px)', minHeight: 280 }}>
        <Table aria-label={`${descriptor.module}/${descriptor.resource}`} stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => <TableCell key={column}>{column}</TableCell>)}
              <TableCell align="right">{t('workbench.inspect')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {page.items.map((item, index) => (
              <TableRow hover key={`${String(item.id ?? 'row')}-${index}`}>
                {columns.map((column) => <TableCell key={column}>{renderValue(item.attributes?.[column])}</TableCell>)}
                <TableCell align="right">
                  <Button
                    disabled={!detailEnabled || item.id === null || item.id === undefined}
                    onClick={() => onInspect(item)}
                    size="small"
                  >
                    {t('workbench.inspect')}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={page.totalElements}
        labelRowsPerPage={t('workbench.rowsPerPage')}
        onPageChange={(_, nextPage) => onPageChange(nextPage)}
        onRowsPerPageChange={(event) => onPageSizeChange(Number(event.target.value))}
        page={page.page}
        rowsPerPage={page.size}
        rowsPerPageOptions={[25, 50, 100, 200]}
      />
    </Paper>
  );
}
