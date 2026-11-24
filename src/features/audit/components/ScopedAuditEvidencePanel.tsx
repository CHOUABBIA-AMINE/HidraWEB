import { Alert, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';

import { createScopedAuditExport, downloadScopedAudit, readScopedAuditManifest, searchScopedAudit } from '../api/auditApi';
import { evidenceError, exactId, riskEvent, riskPurpose, uuid, validWindow, type scopedAuditAdmission } from '../model/auditEvidence';

export function ScopedAuditEvidencePanel({ admission }: { admission: ReturnType<typeof scopedAuditAdmission> }) {
  const [companyId, setCompanyId] = useState('');
  const [facilityId, setFacilityId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [requestKey, setRequestKey] = useState('');
  const [exportId, setExportId] = useState('');
  const scope = { companyId, facilityId };
  const window = { from, to };
  const search = useMutation({ retry: false, mutationFn: (cursor?: string) => searchScopedAudit(scope, window, cursor) });
  const create = useMutation({ retry: false, mutationFn: () => createScopedAuditExport(scope, window, requestKey),
    onSuccess: data => { setExportId(data.exportId); } });
  const read = useMutation({ retry: false, mutationFn: () => readScopedAuditManifest(scope, exportId) });
  const download = useMutation({ retry: false, mutationFn: async () => {
    if (!read.data) throw new Error('Read the exact manifest before downloading.');
    return downloadScopedAudit(scope, read.data);
  } });
  const busy = search.isPending || create.isPending || read.isPending || download.isPending;
  const scopeValid = exactId(companyId, 96) && exactId(facilityId, 120);
  const criteriaValid = validWindow(scope, window);
  // A response in one lane never admits a different operation. Each request is
  // authorized by its owner; changing any coordinates discards visible evidence.
  function clearResults() {
    search.reset(); create.reset(); read.reset(); download.reset();
  }
  function changeScope(set: (value: string) => void, value: string) {
    set(value.trim()); setExportId(''); setRequestKey(''); clearResults();
  }
  function submitSearch(event: FormEvent) {
    event.preventDefault();
    if (!admission.read || !criteriaValid || busy) return;
    clearResults(); setExportId('');
    search.mutate(undefined);
  }
  function saveFile() {
    if (!admission.download || busy || !read.isSuccess || read.data.exportId !== exportId) return;
    download.mutate(undefined, { onSuccess: ({ blob, filename }) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } });
  }
  const error = [search, create, read, download].find(x => x.isError)?.error;
  return <Paper variant="outlined" sx={{ p: 2 }}>
    <Stack spacing={2}>
      <Typography component="h2" variant="h6">Scoped Risk audit evidence</Typography>
      <Alert severity="info">T28 supports only {riskEvent} in an exact company and facility,
        for {riskPurpose}. This is synthetic assurance evidence, not a universal Audit export.
        HidraAPI rechecks current scope and actor on every request.</Alert>
      <Stack component="form" spacing={1} onSubmit={submitSearch}>
        <TextField required label="Audit company ID" value={companyId} disabled={busy}
          onChange={e => changeScope(setCompanyId, e.target.value)} />
        <TextField required label="Audit facility ID" value={facilityId} disabled={busy}
          onChange={e => changeScope(setFacilityId, e.target.value)} />
        <TextField required label="Audit from (UTC)" value={from} disabled={busy}
          onChange={e => changeScope(setFrom, e.target.value)} helperText="ISO 8601 UTC, up to 31 days" />
        <TextField required label="Audit to (UTC)" value={to} disabled={busy}
          onChange={e => changeScope(setTo, e.target.value)} />
        <Button type="submit" disabled={!admission.read || !criteriaValid || busy}>Search scoped Risk events</Button>
      </Stack>
      {!error && search.isSuccess ? <Stack spacing={1} aria-label="Scoped Risk events" role="group">
        {search.data.items.length === 0 ? <Typography>No events returned in this authorized page.</Typography> : null}
        {search.data.items.map(event => <Paper key={event.eventId} variant="outlined" sx={{ p: 1, overflowWrap: 'anywhere' }}>
          <Typography>Audit event · {event.eventId}</Typography>
          <Typography variant="body2">{event.eventType} · {event.operation} · {event.occurredAt}</Typography>
          <Typography variant="body2">Target · {event.targetId} · Workflow action · {event.workflowActionId}</Typography>
        </Paper>)}
        <Button disabled={busy || !search.data.nextCursor || !admission.read}
          onClick={() => search.mutate(search.data?.nextCursor)}>Next Risk events</Button>
      </Stack> : null}
      {admission.create ? <Stack spacing={1}>
        <TextField label="Export request key" value={requestKey} disabled={busy}
          onChange={e => { setRequestKey(e.target.value.trim()); create.reset(); read.reset(); download.reset(); setExportId(''); }}
          helperText="Reuse the same key only for identical criteria after an ambiguous response." />
        <Button disabled={busy || !criteriaValid || !exactId(requestKey, 80)}
          onClick={() => { search.reset(); read.reset(); download.reset(); setExportId(''); create.mutate(); }}>Create scoped Risk export</Button>
        {!error && create.isSuccess ? <Typography>Export recorded · {create.data.exportId}. Read the manifest before download.</Typography> : null}
      </Stack> : null}
      {admission.manifest ? <Stack spacing={1}>
        <TextField label="Scoped export ID" value={exportId} disabled={busy}
          onChange={e => { setExportId(e.target.value.trim()); create.reset(); read.reset(); download.reset(); }} />
        <Button disabled={busy || !scopeValid || !uuid.test(exportId)}
          onClick={() => { search.reset(); create.reset(); download.reset(); read.mutate(); }}>Read scoped export manifest</Button>
        {!error && read.isSuccess && read.data.exportId === exportId ? <Stack spacing={1}>
          <Typography>Manifest · {read.data.exportId} · {read.data.status}</Typography>
          <Typography>{read.data.eventCount} events · {read.data.byteLength} bytes · {read.data.format}</Typography>
          <Typography>{read.data.from} — {read.data.to} · completed {read.data.completedAt}</Typography>
          <Typography sx={{ overflowWrap: 'anywhere' }}>Owner SHA-256 · {read.data.sha256}</Typography>
          <Typography variant="caption">Downloaded bytes, length and response digest are checked against the owner manifest. This verifies transport integrity only, not a universal audit seal.</Typography>
          {admission.download ? <Button disabled={busy} onClick={saveFile}>Download scoped Risk export</Button> : null}
        </Stack> : null}
      </Stack> : null}
      {error ? <Alert severity="error">{evidenceError(error)}</Alert> : null}
    </Stack>
  </Paper>;
}
