import { Alert, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';

import { readPressureDecisionEvidence } from '../api/auditApi';
import { evidenceError, exactId, uuid } from '../model/auditEvidence';

export function PressureDecisionEvidencePanel() {
  const [company, setCompany] = useState('');
  const [pipeline, setPipeline] = useState('');
  const [section, setSection] = useState('');
  const [requestId, setRequestId] = useState('');
  const evidence = useMutation({
    retry: false,
    mutationFn: () => readPressureDecisionEvidence(company, pipeline, requestId, section || undefined),
  });
  const valid = exactId(company, 80) && exactId(pipeline, 80) &&
    (!section || exactId(section, 80)) && uuid.test(requestId);
  function submit(e: FormEvent) {
    e.preventDefault();
    if (valid && !evidence.isPending) evidence.mutate();
  }

  return <Paper variant="outlined" sx={{ p: 2 }}>
    <Stack component="form" spacing={2} onSubmit={submit}>
      <Typography component="h2" variant="h6">Pressure decision trace</Typography>
      <Typography variant="body2" color="text.secondary">
        Read an exact Topology-owned publication and its recorded Workflow and Audit witnesses.
        This does not grant generic Audit access or verify a universal seal.
      </Typography>
      <TextField required label="Evidence company ID" value={company} disabled={evidence.isPending}
        onChange={e => { setCompany(e.target.value.trim()); evidence.reset(); }} />
      <TextField required label="Evidence pipeline ID" value={pipeline} disabled={evidence.isPending}
        onChange={e => { setPipeline(e.target.value.trim()); evidence.reset(); }} />
      <TextField label="Evidence section ID (optional)" value={section} disabled={evidence.isPending}
        onChange={e => { setSection(e.target.value.trim()); evidence.reset(); }} />
      <TextField required label="Evidence restriction request ID" value={requestId} disabled={evidence.isPending}
        onChange={e => { setRequestId(e.target.value.trim()); evidence.reset(); }} />
      <Button type="submit" variant="contained" disabled={!valid || evidence.isPending}>Read pressure decision trace</Button>
      {evidence.isError ? <Alert severity="error">{evidenceError(evidence.error)}</Alert> : null}
      {evidence.isSuccess ? <Stack spacing={1} aria-label="Pressure decision witnesses" role="group">
        <Typography>Publication receipt · {evidence.data.receipt.requestId} · version {evidence.data.receipt.streamVersion}</Typography>
        <Typography>Revision / termination · {evidence.data.receipt.revisionId ?? evidence.data.receipt.terminationId}</Typography>
        {evidence.data.decisions.map(item => <Paper key={item.auditEventId} variant="outlined" sx={{ p: 1, overflowWrap: 'anywhere' }}>
          <Typography>Audit witness · {item.auditEventId}</Typography>
          <Typography variant="body2">Candidate · {item.candidateId}</Typography>
          <Typography variant="body2">Workflow instance · {item.instanceId}</Typography>
          <Typography variant="body2">Task · {item.taskId}</Typography>
          <Typography variant="body2">Action · {item.actionId}</Typography>
          <Typography variant="body2">Reviewer · {item.reviewerId} · {item.decidedAt}</Typography>
        </Paper>)}
      </Stack> : null}
    </Stack>
  </Paper>;
}
