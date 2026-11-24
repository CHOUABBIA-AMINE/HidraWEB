import { Alert, Button, Checkbox, FormControlLabel, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import type { PressureRestrictionPublicationReceipt, PressureRestrictionSubmission } from '@/api/generated/topology/model';
import {
  getPressureRestrictionDecisionEvidence, getPressureRestrictionRequest, publishPressureRestrictionRequest,
  readPressureRestrictionPublicationInputs, readPressureRestrictionStreamVersion, submitPressureRestrictionRequest,
} from '@/api/generated/topology/topology';
import { readPressureRestrictionWorkflowTarget } from '@/api/generated/workflow/workflow';
import { useAuth } from '@/app/auth/useAuth';
import { usePermissions } from '@/features/permissions/usePermissions';
import { createWorkflowTask, discoverWorkflowDefinitions, startWorkflowInstance } from '@/features/workflow/api/workflowApi';
import { classifyOwnerError } from '@/shell/feedback/ownerFeedback';

type Change = 'INITIAL' | 'REPLACEMENT' | 'WITHDRAWAL';
const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const validVersion = (value: number | undefined): value is number =>
  value !== undefined && Number.isSafeInteger(value) && value >= 0;
const utc = (value: string) => value.endsWith('Z') && Number.isFinite(Date.parse(value));

interface Scope {
  pipelineId: string;
  companyPartyId: string;
  sectionId?: string;
  baselineReceiptId?: string;
  baselineReadPending?: boolean;
  onPublished: () => void;
}

export function PressureRestrictionWorkflow(scope: Scope) {
  const { pipelineId, companyPartyId, sectionId, baselineReceiptId, baselineReadPending = false, onPublished } = scope;
  const permissions = usePermissions();
  const { session } = useAuth();
  const actorId = session?.principal?.userId;
  const [condition, setCondition] = useState('');
  const [kind, setKind] = useState<Change>('INITIAL');
  const [pressure, setPressure] = useState('');
  const [unit, setUnit] = useState('');
  const [basis, setBasis] = useState<'GAUGE' | 'ABSOLUTE'>('GAUGE');
  const [effectiveAt, setEffectiveAt] = useState('');
  const [effectiveUntil, setEffectiveUntil] = useState('');
  const [predecessor, setPredecessor] = useState('');
  const [requestId, setRequestId] = useState('');
  const [candidateId, setCandidateId] = useState('');
  const [definitionId, setDefinitionId] = useState('');
  const [reviewer, setReviewer] = useState('');
  const [confirm, setConfirm] = useState(false);
  const path = encodeURIComponent(pipelineId);
  const query = { companyPartyId, sectionId };
  const read = permissions.status === 'ready' && permissions.can('topology:operating-constraints:read');
  const execute = read && permissions.can('topology:operating-constraints:execute');
  const mayAssign = permissions.can('workflow:definitions:read') &&
    permissions.can('workflow:instances:execute') && permissions.can('workflow:tasks:execute');
  const submitted = useMutation({
    retry: false,
    mutationFn: (body: PressureRestrictionSubmission) => submitPressureRestrictionRequest(path, body),
    onSuccess: receipt => { if (receipt.requestId) setRequestId(receipt.requestId); },
  });
  const version = useMutation({
    mutationFn: (code: string) => readPressureRestrictionStreamVersion(path, { ...query, conditionCode: code }),
    retry: false,
  });
  const request = useMutation({
    mutationFn: (id: string) => getPressureRestrictionRequest(path, encodeURIComponent(id), query), retry: false,
  });
  const candidates = (submitted.data?.requestId === requestId ? submitted.data?.candidates : undefined) ??
    (request.data?.requestId === requestId ? request.data?.candidates : undefined) ?? [];
  const discovery = useMutation({
    retry: false,
    mutationFn: async (id: string) => {
      const candidate = candidates.find(item => item.candidateId === id);
      if (!candidate?.workflowLocator) throw new Error('Candidate unavailable.');
      const target = await readPressureRestrictionWorkflowTarget({ targetId: id, targetLocator: candidate.workflowLocator });
      const { targetModule, targetId, targetLocator, targetTypeId, workflowPurposeId } = target;
      if (targetModule !== 'topology' || targetId !== id || targetLocator !== candidate.workflowLocator ||
        !targetTypeId || !workflowPurposeId) throw new Error('Candidate unavailable.');
      const definitions = await discoverWorkflowDefinitions({ targetModule, targetId, targetLocator, targetTypeId, workflowPurposeId });
      return { target: { targetModule, targetId, targetLocator, targetTypeId, workflowPurposeId },
        definitions: definitions.filter(item => item.targetModule === targetModule &&
          item.targetTypeId === targetTypeId && item.workflowPurposeId === workflowPurposeId) };
    },
  });
  const definition = discovery.data?.definitions.find(item => item.id === definitionId);
  const start = useMutation({
    retry: false,
    mutationFn: async () => {
      if (!definition?.id || !definition.version || !definition.firstStepId || !discovery.data || !actorId) {
        throw new Error('Workflow definition unavailable.');
      }
      const { targetLocator, ...target } = discovery.data.target;
      return startWorkflowInstance({ ...target, targetCodeSnapshot: targetLocator,
        definitionId: definition.id, definitionVersion: definition.version, currentStepId: definition.firstStepId,
        startedByActorId: actorId, correlationId: crypto.randomUUID() });
    },
  });
  const independent = Boolean(reviewer && reviewer !== actorId &&
    definition?.assignmentChoices?.some(item => item.actorId === reviewer));
  const assign = useMutation({
    retry: false,
    mutationFn: async () => {
      if (!start.data?.id || !definition?.firstStepId || !independent) throw new Error('Review assignment unavailable.');
      return createWorkflowTask({ instanceId: start.data.id, stepId: definition.firstStepId,
        assignedActorId: reviewer, taskLabelSnapshot: 'Pressure restriction review' });
    },
  });
  const inputs = useMutation({
    mutationFn: (id: string) => readPressureRestrictionPublicationInputs(path, encodeURIComponent(id), query), retry: false,
  });
  const evidence = useMutation({
    mutationFn: (id: string) => getPressureRestrictionDecisionEvidence(path, encodeURIComponent(id), query), retry: false,
  });
  const eligible = inputs.data?.requestId === requestId ? inputs.data : undefined;
  const publish = useMutation({
    retry: false,
    mutationFn: async () => {
      if (!eligible || !validVersion(eligible.expectedVersion) || eligible.publication || !confirm) throw new Error('Publication unavailable.');
      const decisions = (eligible.decisions ?? []).map(({ candidateId, taskId, instanceId, actionId }) => {
        if (!candidateId || !taskId || !instanceId || !actionId) throw new Error('Approval references unavailable.');
        return { candidateId, taskId, instanceId, actionId };
      });
      if (decisions.length < 1 || decisions.length > 2 ||
        new Set(decisions.map(item => item.candidateId)).size !== decisions.length) throw new Error('Approval references unavailable.');
      const latest = await readPressureRestrictionPublicationInputs(path, encodeURIComponent(requestId), query);
      if (latest.requestId !== requestId || latest.publication || latest.expectedVersion !== eligible.expectedVersion ||
        JSON.stringify(latest.decisions) !== JSON.stringify(eligible.decisions)) {
        throw new Error('Publication inputs changed.');
      }
      return publishPressureRestrictionRequest(path, encodeURIComponent(requestId), {
        ...query, expectedVersion: eligible.expectedVersion, decisions,
      });
    },
    onSuccess: async () => {
      setConfirm(false);
      await inputs.mutateAsync(requestId).catch(() => undefined);
      onPublished();
    },
  });

  if (!read) return null;
  const busy = [version, submitted, request, discovery, start, assign, inputs, evidence, publish].some(item => item.isPending);
  // Publication inputs also read the engineering baseline under the owner's
  // protected lock. Wait for the dossier's in-flight baseline read to finish.
  const publicationBusy = busy || baselineReadPending;
  const error = [version, submitted, request, discovery, start, assign, inputs, evidence, publish].find(item => item.isError)?.error;
  const code = condition.trim();
  const currentVersion = version.data?.conditionCode === code && version.data.companyPartyId === companyPartyId &&
    version.data.pipelineId === pipelineId && (version.data.sectionId ?? undefined) === sectionId
    ? version.data.expectedVersion : undefined;
  const receipt: PressureRestrictionPublicationReceipt | undefined = eligible?.publication ??
    (evidence.data?.publication?.requestId === requestId ? evidence.data.publication : undefined);

  function submit() {
    if (!baselineReceiptId || !validVersion(currentVersion) || !utc(effectiveAt)) return;
    const pressureInput = { upperPressure: Number(pressure), unit: unit.trim(), basis, effectiveFrom: effectiveAt,
      effectiveUntil: effectiveUntil || undefined };
    if (kind !== 'WITHDRAWAL' && (!Number.isFinite(pressureInput.upperPressure) ||
      pressureInput.upperPressure <= 0 || !pressureInput.unit ||
      (effectiveUntil && (!utc(effectiveUntil) || Date.parse(effectiveUntil) <= Date.parse(effectiveAt))))) return;
    const change = kind === 'WITHDRAWAL' ? { kind, predecessorId: predecessor, effectiveAt }
      : kind === 'REPLACEMENT' ? { kind, predecessorId: predecessor, pressure: pressureInput }
        : { kind, pressure: pressureInput };
    if (kind !== 'INITIAL' && !uuid.test(predecessor)) return;
    const body = { ...query, baselineReceiptId, conditionCode: code, expectedVersion: currentVersion,
      requestId: crypto.randomUUID(), change };
    setRequestId(body.requestId);
    submitted.mutate(body);
  }

  function resetReview() {
    setCandidateId(''); setDefinitionId(''); setReviewer('');
    discovery.reset(); start.reset(); assign.reset();
  }

  return <Paper variant="outlined" sx={{ p: 2 }}><Stack spacing={2}>
    <Typography component="h4" variant="h6">Pressure restriction requests</Typography>
    {error ? <Alert severity="error">{classifyOwnerError(error).kind === 'conflict'
      ? 'The source changed. Reload the stream or publication inputs and review before retrying.'
      : 'The request or action is unavailable.'}</Alert> : null}
    {execute && baselineReceiptId ? <Stack spacing={1} component="form" onSubmit={event => { event.preventDefault(); submit(); }}>
      <Typography>Source baseline · {baselineReceiptId}</Typography>
      <TextField label="Restriction condition" required value={condition} disabled={busy} onChange={e => {
        setCondition(e.target.value); version.reset();
      }} />
      <Button disabled={busy || !code} onClick={() => { submitted.reset(); version.mutate(code); }}>Read stream version</Button>
      {validVersion(currentVersion) ? <Typography>Stream version {currentVersion}</Typography> : null}
      <TextField select label="Restriction change" value={kind} disabled={busy} onChange={e => setKind(e.target.value as Change)}>
        <MenuItem value="INITIAL">Initial restriction</MenuItem>
        <MenuItem value="REPLACEMENT">Replacement</MenuItem>
        <MenuItem value="WITHDRAWAL">Withdrawal</MenuItem>
      </TextField>
      {kind !== 'INITIAL' ? <TextField label="Predecessor revision ID" required value={predecessor} disabled={busy} onChange={e => setPredecessor(e.target.value.trim())} /> : null}
      <TextField label="Restriction effective at (UTC ISO)" required value={effectiveAt} disabled={busy} onChange={e => setEffectiveAt(e.target.value.trim())} />
      {kind !== 'WITHDRAWAL' ? <>
        <TextField label="Proposed upper pressure" type="number" slotProps={{ htmlInput: { step: 'any' } }} required value={pressure} disabled={busy} onChange={e => setPressure(e.target.value)} />
        <TextField label="Pressure unit" required value={unit} disabled={busy} onChange={e => setUnit(e.target.value)} />
        <TextField select label="Pressure basis" value={basis} disabled={busy} onChange={e => setBasis(e.target.value as typeof basis)}>
          <MenuItem value="GAUGE">Gauge</MenuItem><MenuItem value="ABSOLUTE">Absolute</MenuItem>
        </TextField>
        <TextField label="Restriction effective until (optional UTC ISO)" value={effectiveUntil} disabled={busy} onChange={e => setEffectiveUntil(e.target.value.trim())} />
      </> : null}
      <Button type="submit" disabled={busy || !validVersion(currentVersion) || submitted.status !== 'idle'} variant="contained">Submit restriction proposal</Button>
    </Stack> : null}
    <TextField label="Restriction request ID" value={requestId} disabled={busy} onChange={e => {
      setRequestId(e.target.value.trim()); resetReview(); inputs.reset(); publish.reset(); evidence.reset(); setConfirm(false);
    }} />
    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
      <Button disabled={busy || !uuid.test(requestId)} onClick={() => request.mutate(requestId)}>Read request</Button>
      {execute ? <Button disabled={publicationBusy || !uuid.test(requestId)} onClick={() => {
        setConfirm(false); publish.reset(); inputs.mutate(requestId);
      }}>Read publication inputs</Button> : null}
      <Button disabled={busy || !uuid.test(requestId)} onClick={() => evidence.mutate(requestId)}>Read decision evidence</Button>
    </Stack>
    {mayAssign && candidates.length ? <>
      <TextField select label="Restriction candidate" value={candidates.some(item => item.candidateId === candidateId) ? candidateId : ''} disabled={busy} onChange={e => { resetReview(); setCandidateId(e.target.value); }}>
        {candidates.flatMap(item => item.candidateId ? [<MenuItem key={item.candidateId} value={item.candidateId}>{item.kind} · {item.candidateId}</MenuItem>] : [])}
      </TextField>
      <Button disabled={busy || !candidateId || start.status !== 'idle'} onClick={() => discovery.mutate(candidateId)}>Discover review definitions</Button>
      {discovery.data ? <>
        <TextField select label="Review definition" value={definitionId} disabled={busy || start.status !== 'idle'} onChange={e => { setDefinitionId(e.target.value); setReviewer(''); }}>
          {discovery.data.definitions.flatMap(item => item.id ? [<MenuItem key={item.id} value={item.id}>{item.nameFr ?? item.code ?? item.id}</MenuItem>] : [])}
        </TextField>
        <TextField select label="Independent reviewer" value={reviewer} disabled={busy || assign.status !== 'idle'} onChange={e => setReviewer(e.target.value)}>
          {definition?.assignmentChoices?.flatMap(item => item.actorId && item.actorId !== actorId
            ? [<MenuItem key={item.actorId} value={item.actorId}>{item.displayName ?? item.username ?? item.actorId}</MenuItem>] : [])}
        </TextField>
        <Button disabled={busy || !definition || !actorId || !independent || start.status !== 'idle'} onClick={() => start.mutate()}>Start restriction review</Button>
        {start.data?.id ? <Typography>Workflow instance · {start.data.id}</Typography> : null}
        <Button disabled={busy || !start.data?.id || !independent || assign.status !== 'idle'} onClick={() => assign.mutate()}>Assign restriction review</Button>
        {assign.data?.id ? <Typography>Assigned task · {assign.data.id}</Typography> : null}
      </> : null}
    </> : null}
    {execute && eligible && !eligible.publication && publish.isIdle ? ((eligible.decisions?.length ?? 0) > 0 ? <>
      <Typography>Eligible approvals · {eligible.decisions?.length} · version {eligible.expectedVersion}</Typography>
      <FormControlLabel control={<Checkbox checked={confirm} onChange={event => setConfirm(event.target.checked)} />} label="Confirm publishing this exact restriction request" />
      <Button disabled={publicationBusy || !confirm} variant="contained" onClick={() => publish.mutate()}>Publish restriction</Button>
    </> : <Typography>Awaiting eligible approvals.</Typography>) : null}
    {receipt ? <Typography>Publication receipt · {receipt.requestId} · version {receipt.streamVersion} · {receipt.revisionId ?? receipt.terminationId}</Typography>
      : publish.isSuccess ? <Alert severity="warning">Publication response received. Read the publication inputs to verify persistence.</Alert> : null}
    {evidence.data?.publication?.requestId === requestId ? evidence.data?.decisions?.map(item =>
      <Typography key={item.actionId}>Approval · {item.actionId} · Audit · {item.auditEventId}</Typography>) : null}
  </Stack></Paper>;
}
