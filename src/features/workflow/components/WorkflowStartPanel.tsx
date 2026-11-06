import { Alert, Button, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/app/auth/useAuth';
import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import { createWorkflowTask, discoverWorkflowDefinitions, fetchInstance, readWorkflowTarget, startWorkflowInstance, workflowQueryKeys } from '../api/workflowApi';

export function WorkflowStartPanel({ onTaskCreated }: { onTaskCreated: (id: string) => void }) {
  const { t } = useTranslation();
  const { session } = useAuth();
  const [params, setParams] = useSearchParams();
  const [company, setCompany] = useState(params.get('companyPartyId') ?? '');
  const [unit, setUnit] = useState(params.get('installedUnitId') ?? '');
  const [link, setLink] = useState(params.get('linkId') ?? '');
  const [revision, setRevision] = useState(params.get('revisionId') ?? '1');
  const [definitionId, setDefinitionId] = useState('');
  const [reviewerId, setReviewerId] = useState('');
  const instanceId = params.get('instanceId') ?? '';
  const assignedTaskId = params.get('taskId') ?? '';
  const persisted = useQuery({ queryKey: workflowQueryKeys.instance(instanceId), queryFn: () => fetchInstance(instanceId), enabled: Boolean(instanceId) });
  const metadata = useMutation({
    retry: false,
    mutationFn: async () => {
      if (!company.trim() || !unit.trim() || !link.trim() || !/^[1-9]\d*$/.test(revision) || !Number.isSafeInteger(Number(revision))) throw new Error(t('workflow.start.invalid'));
      const handoff = await readWorkflowTarget({ companyPartyId: company.trim(), installedUnitId: unit.trim(), linkId: link.trim(), revisionId: Number(revision) });
      if (!handoff.targetId || !handoff.targetLocator || !handoff.targetTypeId || !handoff.workflowPurposeId || handoff.targetModule !== 'topology' || handoff.revisionId !== Number(revision) || !handoff.digestFormat) throw new Error(t('workflow.start.unavailable'));
      const definitions = await discoverWorkflowDefinitions({ targetModule: handoff.targetModule, targetTypeId: handoff.targetTypeId, workflowPurposeId: handoff.workflowPurposeId, targetId: handoff.targetId, targetLocator: handoff.targetLocator });
      return { handoff, definitions: definitions.filter(d => d.targetModule === handoff.targetModule && d.targetTypeId === handoff.targetTypeId && d.workflowPurposeId === handoff.workflowPurposeId) };
    },
    onSuccess: () => { setDefinitionId(''); setReviewerId(''); },
  });
  const choices = (metadata.data?.definitions ?? []).filter(d => !instanceId || (persisted.data?.definitionId === d.id && persisted.data?.definitionVersion === d.version && persisted.data?.targetId === metadata.data?.handoff.targetId));
  const definition = choices.find(d => d.id === definitionId);
  const reviewer = definition?.assignmentChoices?.find(a => a.actorId === reviewerId);
  const start = useMutation({
    retry: false,
    mutationFn: async () => {
      const h = metadata.data?.handoff;
      const actor = session?.principal?.userId;
      if (instanceId || !actor || !h || !definition?.id || !definition.version || !definition.firstStepId) throw new Error(t('workflow.start.unavailable'));
      return startWorkflowInstance({ definitionId: definition.id, definitionVersion: definition.version, workflowPurposeId: h.workflowPurposeId, targetModule: h.targetModule, targetTypeId: h.targetTypeId, targetId: h.targetId, targetCodeSnapshot: h.targetLocator, currentStepId: definition.firstStepId, startedByActorId: actor });
    },
    onSuccess: result => {
      if (result.id) { const next = new URLSearchParams(params); next.set('instanceId', result.id); next.set('companyPartyId', company.trim()); next.set('installedUnitId', unit.trim()); next.set('linkId', link.trim()); next.set('revisionId', revision); setParams(next); }
    },
  });
  const assignment = useMutation({
    retry: false,
    mutationFn: async () => {
      if (assignedTaskId || !instanceId || !definition?.firstStepId || !reviewer?.actorId || reviewer.actorId === session?.principal?.userId) throw new Error(t('workflow.start.unavailable'));
      return createWorkflowTask({ instanceId, stepId: definition.firstStepId, assignedActorId: reviewer.actorId, taskLabelSnapshot: definition.nameFr ?? definition.code });
    },
    onSuccess: task => { if (task.id) { const next = new URLSearchParams(params); next.set('taskId', task.id); setParams(next); onTaskCreated(task.id); } },
  });
  const busy = metadata.isPending || start.isPending || assignment.isPending;
  const error = metadata.error ?? start.error ?? assignment.error ?? persisted.error;
  const edit = (set: (v: string) => void, value: string) => { set(value); metadata.reset(); setDefinitionId(''); setReviewerId(''); start.reset(); assignment.reset(); };
  return <Paper variant="outlined" sx={{ p: 2 }}><Stack spacing={2}>
    <Typography component="h2" variant="h6">{t('workflow.start.title')}</Typography>
    <Typography color="text.secondary">{t('workflow.start.description')}</Typography>
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
      <TextField label={t('workflow.start.company')} value={company} disabled={busy || Boolean(instanceId)} onChange={e => edit(setCompany, e.target.value)} size="small" />
      <TextField label={t('workflow.start.unit')} value={unit} disabled={busy || Boolean(instanceId)} onChange={e => edit(setUnit, e.target.value)} size="small" />
      <TextField label={t('workflow.start.link')} value={link} disabled={busy || Boolean(instanceId)} onChange={e => edit(setLink, e.target.value)} size="small" />
      <TextField label={t('workflow.start.revision')} value={revision} disabled={busy || Boolean(instanceId)} onChange={e => edit(setRevision, e.target.value)} size="small" />
    </Stack>
    <Button disabled={busy || Boolean(assignment.data) || Boolean(assignedTaskId)} onClick={() => { start.reset(); assignment.reset(); metadata.mutate(); }}>{t('workflow.start.read')}</Button>
    {error ? <Alert severity="error">{normalizeHidraApiError(error).status === 404 ? t('workflow.start.unavailable') : normalizeHidraApiError(error).message}</Alert> : null}
    {metadata.data ? <>
      <Typography>{t('workflow.start.verified', { revision: metadata.data.handoff.revisionId })}</Typography>
      {!choices.length ? <Alert severity="info">{t('workflow.start.empty')}</Alert> : <>
        <TextField select label={t('workflow.start.process')} value={definitionId} disabled={busy || Boolean(assignment.data) || Boolean(assignedTaskId)} onChange={e => { setDefinitionId(e.target.value); setReviewerId(''); }}>
          {choices.map(d => <MenuItem key={d.id} value={d.id}>{d.nameFr ?? d.code} · {d.version}</MenuItem>)}
        </TextField>
        <TextField select label={t('workflow.start.reviewer')} value={reviewerId} disabled={busy || Boolean(assignment.data) || Boolean(assignedTaskId)} onChange={e => setReviewerId(e.target.value)}>
          {(definition?.assignmentChoices ?? []).filter(a => a.actorId !== session?.principal?.userId).map(a => <MenuItem key={a.actorId} value={a.actorId}>{a.displayName ?? a.username}</MenuItem>)}
        </TextField>
        {!instanceId ? <Button variant="contained" disabled={busy || !definition || !reviewer || start.isError || !session?.principal?.userId} onClick={() => start.mutate()}>{t('workflow.start.begin')}</Button> : <>
          <Typography>{t('workflow.start.persisted', { id: instanceId })}</Typography>
          <Button variant="contained" disabled={busy || !reviewer || assignment.isError || Boolean(assignment.data) || Boolean(assignedTaskId) || persisted.isError} onClick={() => assignment.mutate()}>{t('workflow.start.assign')}</Button>
        </>}
      </>}
    </> : null}
    {(start.isError || assignment.isError) ? <Alert severity="warning">{t('workflow.start.review')}</Alert> : null}
    {assignment.data || assignedTaskId ? <Alert severity="success">{t('workflow.start.assigned')}</Alert> : null}
  </Stack></Paper>;
}
