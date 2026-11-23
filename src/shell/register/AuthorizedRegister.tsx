import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material';
import type { ReactNode } from 'react';

import { WorkspaceCanvas, type WorkspaceCanvasState } from '@/shell/workspace/WorkspaceCanvas';
import type { AuthorizedRegisterState } from '@/shell/register/authorizedRegisterState';

export interface AuthorizedRegisterColumn<Row> {
  key: string;
  heading: string;
  value: (row: Row) => ReactNode;
}

export interface AuthorizedRegisterProps<Row> {
  label: string;
  state: AuthorizedRegisterState<Row>;
  columns: readonly AuthorizedRegisterColumn<Row>[];
  rowKey: (row: Row, index: number) => string;
  pageSizes?: readonly number[];
  rowsPerPageLabel: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  /** The caller must be the owner of a currently admitted exact-record GET. */
  select?: {
    label: string;
    permitted: boolean;
    enabled: (row: Row) => boolean;
    onSelect: (row: Row) => void;
  };
  /** Never display or enable export unless the owner provides a qualified handler. */
  exportAction?: { label: string; permitted: boolean; onExport: () => void };
}

/** Pure UI; ready status, counts, rows and action availability come from the owner adapter. */
export function AuthorizedRegister<Row>({
  label, state, columns, rowKey, rowsPerPageLabel, pageSizes = [25, 50, 100, 200],
  onPageChange, onPageSizeChange, select, exportAction,
}: AuthorizedRegisterProps<Row>) {
  const canvasState: WorkspaceCanvasState = state.kind === 'ready'
    ? { kind: 'ready' }
    : state.kind === 'loading' ? { kind: 'loading', message: state.message }
      : state.kind === 'empty' ? { kind: 'empty', message: state.message }
        : state.kind === 'denied' ? { kind: 'unavailable', message: state.message }
          : { kind: 'degraded', message: state.message };
  return (
    <WorkspaceCanvas label={label} variant="register" state={canvasState}>
      {state.kind === 'ready' ? <>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 360px)', minHeight: 180 }}>
          <Table aria-label={label} stickyHeader size="small">
            <TableHead><TableRow>
              {columns.map(column => <TableCell key={column.key}>{column.heading}</TableCell>)}
              {select?.permitted ? <TableCell align="right">{select.label}</TableCell> : null}
            </TableRow></TableHead>
            <TableBody>{state.page.items.map((item, index) => (
              <TableRow hover key={rowKey(item, index)}>
                {columns.map(column => <TableCell key={column.key}>{column.value(item)}</TableCell>)}
                {select?.permitted ? <TableCell align="right">
                  <Button disabled={!select.enabled(item)} onClick={() => select.onSelect(item)} size="small">
                    {select.label}
                  </Button>
                </TableCell> : null}
              </TableRow>
            ))}</TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={state.page.totalElements}
          labelRowsPerPage={rowsPerPageLabel}
          onPageChange={(_, requested) => onPageChange(requested)}
          onRowsPerPageChange={event => onPageSizeChange(Number(event.target.value))}
          page={state.page.page} rowsPerPage={state.page.size}
          rowsPerPageOptions={[...pageSizes]} />
        {exportAction?.permitted ? (
          <Button onClick={exportAction.onExport}>{exportAction.label}</Button>
        ) : null}
      </> : null}
    </WorkspaceCanvas>
  );
}
