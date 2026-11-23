import { Alert, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';

import { useAuth } from '@/app/auth/useAuth';
import { fetchIntegrityMaintenanceReceipt } from '@/features/integrity/api/integrityApi';
import { usePermissions } from '@/features/permissions/usePermissions';
import { useShellUiStore } from '@/shell/model/useShellUiStore';

const route = '/api/v1/integrity/findings/{findingId}/maintenance-handoffs/{approvalId}';

export function IntegrityMaintenanceReceipt({ findingId }: { findingId: string }) {
  const auth = useAuth();
  const permissions = usePermissions();
  const scope = useShellUiStore(state => state.operationalContext);
  const principal = auth.status === 'authenticated' ? auth.session?.principal?.userId : undefined;
  const granted = permissions.status === 'ready' && permissions.routes.some(item => item.route === route &&
    item.module === 'integrity' && item.methods.includes('GET') && permissions.can(item.permission));
  if (!principal || !granted) return null;
  const context = JSON.stringify([principal, scope?.companyPartyId, scope?.scopeId, scope?.targetId, findingId]);
  return <ReceiptLookup key={context} findingId={findingId} context={context} />;
}

function ReceiptLookup({ findingId, context }: { findingId: string; context: string }) {
  const [input, setInput] = useState('');
  const [approvalId, setApprovalId] = useState('');
  const receipt = useQuery({
    queryKey: ['hidra', 'integrity', 'maintenance-receipt', context, approvalId],
    queryFn: ({ signal }) => fetchIntegrityMaintenanceReceipt(findingId, approvalId, signal),
    enabled: Boolean(approvalId),
    retry: false,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
  const data = receipt.isSuccess && !receipt.isFetching ? receipt.data : undefined;
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!input.trim()) return;
    if (input.trim() === approvalId) void receipt.refetch();
    else setApprovalId(input.trim());
  };
  return <Paper component="section" aria-label="Integrity maintenance receipt" sx={{ p: 2 }}>
    <Stack spacing={1}>
      <Typography component="h3" variant="h6">Integrity maintenance receipt</Typography>
      <Stack component="form" onSubmit={submit} direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <TextField size="small" label="Approval ID" value={input} slotProps={{ htmlInput: { maxLength: 80 } }}
          onChange={event => { setInput(event.target.value); setApprovalId(''); }} />
        <Button type="submit" disabled={!input.trim() || receipt.isFetching}>Read approval receipt</Button>
      </Stack>
      {receipt.isFetching && <Typography role="status">Loading approval receipt…</Typography>}
      {receipt.isError && <Alert severity="warning">Approval receipt unavailable.</Alert>}
      {data && <Stack spacing={0.5}>
        <Typography>Approval {data.approvalId}</Typography>
        {data.recommendationId && <Typography>Recommendation {data.recommendationId}</Typography>}
        {data.approvedAt && <Typography>Approved at {data.approvedAt}</Typography>}
        {data.approverId && <Typography>Approved by {data.approverId}</Typography>}
        {data.reason && <Typography>{data.reason}</Typography>}
        {data.workOrderId && <Typography>Work order {data.workOrderId}</Typography>}
        {data.verificationStatus && <Typography>Verification {data.verificationStatus}</Typography>}
      </Stack>}
    </Stack>
  </Paper>;
}
