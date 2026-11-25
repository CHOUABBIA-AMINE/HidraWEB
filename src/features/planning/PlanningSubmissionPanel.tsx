import { Alert, Button, Checkbox, FormControlLabel, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { OperationalPlanView, PlanRevisionView, PlanTargetView } from '@/api/generated/planning/model';
import type { Definition } from '@/api/generated/workflow/model';
import { useAuth } from '@/app/auth/useAuth';
import { usePermissions } from '@/features/permissions/usePermissions';
import { fetchOperationalPlan, fetchPlanRevision, fetchPlanningPeriod, fetchPlanTargets, fetchPlanningApproval, submitPlanningRevision } from '@/features/planning/api/planningApi';
import { discoverWorkflowDefinitions } from '@/features/workflow/api/workflowApi';

const TARGET_PAGE_SIZE = 50;
const readRoutes = [
  '/api/v1/planning/operational-plans/{id}', '/api/v1/planning/revisions/{id}',
  '/api/v1/planning/periods/{id}', '/api/v1/planning/targets',
  '/api/v1/planning/revisions/{revisionId}/approval', '/api/v1/workflow/definitions',
] as const;
const SUBMIT = '/api/v1/planning/revisions/{revisionId}/submit';

export async function readRevisionTargets(revisionId: string, signal?: AbortSignal): Promise<PlanTargetView[]> {
  const rows: PlanTargetView[] = [];
  const ids = new Set<string>();
  let expected: number | undefined;
  for (let page = 0; ; page++) {
    const result = await fetchPlanTargets({ revisionId, page, size: TARGET_PAGE_SIZE }, signal);
    if (result.page !== page || result.size !== TARGET_PAGE_SIZE || !Array.isArray(result.content)
      || typeof result.totalElements !== 'number' || !Number.isSafeInteger(result.totalElements)
      || result.totalElements < 0 || (expected !== undefined && result.totalElements !== expected)
      || typeof result.hasNext !== 'boolean' || result.content.length > TARGET_PAGE_SIZE) throw new Error('Owner read unavailable');
    expected = result.totalElements;
    for (const target of result.content) {
      if (!target.id || target.revisionId !== revisionId || ids.has(target.id)) throw new Error('Owner read unavailable');
      ids.add(target.id);
      rows.push(target);
    }
    if (!result.hasNext) {
      if (rows.length !== expected) throw new Error('Owner read unavailable');
      return rows;
    }
    if (rows.length >= expected || result.content.length === 0) throw new Error('Owner read unavailable');
  }
}

interface Props {
  plan: OperationalPlanView;
  revision: PlanRevisionView;
  onRetire: () => void;
  onVerified?: () => void;
  onUnavailable?: () => void;
}

export function PlanningSubmissionPanel({ plan, revision, onRetire, onVerified, onUnavailable }: Props) {
  const { t } = useTranslation();
  const { session } = useAuth();
  const permissions = usePermissions();
  const actor = session?.principal?.userId;
  const [typeId, setTypeId] = useState('');
  const [purposeId, setPurposeId] = useState('');
  const [definitionKey, setDefinitionKey] = useState('');
  const [reviewerId, setReviewerId] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [retired, setRetired] = useState(false);
  const [notice, setNotice] = useState('');
  const [discovery, setDiscovery] = useState<{ definitions: Definition[]; planToken: string; revisionToken: string; targets: PlanTargetView[] }>();
  const inFlight = useRef(false);
  const generation = useRef(0);
  const active = useRef(false);
  const reads = useRef<AbortController | undefined>(undefined);
  useEffect(() => { active.current = true; return () => { active.current = false; reads.current?.abort(); generation.current++; }; }, []);
  const allowed = (route: string, method: 'GET' | 'POST') => {
    const grant = permissions.routes.find(r => r.route === route && r.methods.includes(method))?.permission;
    return Boolean(grant && permissions.can(grant));
  };
  const authorized = readRoutes.every(route => allowed(route, 'GET')) && allowed(SUBMIT, 'POST');
  const currentDraft = Boolean(actor && plan.id && revision.id && revision.planId === plan.id &&
    plan.currentRevisionId === revision.id && ['DRAFT', 'ACTIVE', 'APPROVED'].includes(plan.status ?? '') && revision.status === 'DRAFT' &&
    plan.updatedAt && revision.updatedAt && !revision.workflowInstanceId && !revision.submittedAt);
  const selected = discovery?.definitions.find(d => JSON.stringify([d.id, d.version]) === definitionKey);
  const reviewers = (selected?.assignmentChoices ?? []).filter(a => a.actorId && a.actorId !== actor);
  const reviewer = reviewers.find(a => a.actorId === reviewerId);
  function reset() {
    generation.current++; reads.current?.abort();
    setDiscovery(undefined); setDefinitionKey(''); setReviewerId(''); setConfirmed(false); setNotice('');
  }
  async function discover() {
    if (inFlight.current || retired || !authorized || !currentDraft || !plan.id || !revision.id ||
      !typeId.trim() || !purposeId.trim()) return;
    reset(); const epoch = generation.current; const controller = new AbortController(); reads.current = controller;
    inFlight.current = true; setBusy(true);
    try {
      const currentPlan = await fetchOperationalPlan(plan.id, controller.signal);
      const currentRevision = await fetchPlanRevision(revision.id, controller.signal);
      if (currentPlan.id !== plan.id || currentPlan.currentRevisionId !== revision.id ||
        currentPlan.updatedAt !== plan.updatedAt || !['DRAFT', 'ACTIVE', 'APPROVED'].includes(currentPlan.status ?? '') ||
        currentRevision.id !== revision.id || currentRevision.planId !== plan.id || currentRevision.status !== 'DRAFT' ||
        currentRevision.updatedAt !== revision.updatedAt || currentRevision.workflowInstanceId || currentRevision.submittedAt ||
        !currentPlan.periodId || !currentPlan.updatedAt || !currentRevision.updatedAt) throw new Error('Owner read unavailable');
      const period = await fetchPlanningPeriod(currentPlan.periodId, controller.signal);
      if (period.id !== currentPlan.periodId || period.status !== 'OPEN') throw new Error('Owner read unavailable');
      const targets = await readRevisionTargets(revision.id, controller.signal);
      if (!targets.length || targets.some(target => target.status !== 'DRAFT' || !target.targetTypeId ||
        !target.validFrom || !target.validTo || (target.targetValue == null && !target.targetTextValue?.trim()))) throw new Error('Incomplete draft');
      if (!active.current || controller.signal.aborted) return;
      const result = await discoverWorkflowDefinitions({ targetModule: 'planning', targetTypeId: typeId.trim(), workflowPurposeId: purposeId.trim(), targetId: revision.id, targetLocator: '' });
      const definitions = result.filter(d => d.id && Number.isSafeInteger(d.version) && (d.version ?? 0) > 0 &&
        d.targetModule === 'planning' && d.targetTypeId === typeId.trim() && d.workflowPurposeId === purposeId.trim() &&
        d.firstStepId && d.assignmentChoices?.some(a => a.actorId && a.actorId !== actor));
      if (active.current && epoch === generation.current) setDiscovery({ definitions, targets, planToken: currentPlan.updatedAt, revisionToken: currentRevision.updatedAt });
    } catch {
      if (active.current && epoch === generation.current) { setNotice(t('ownerFeedback.denied')); setRetired(true); onUnavailable?.(); }
    } finally { inFlight.current = false; if (active.current) setBusy(false); }
  }
  async function submit() {
    if (inFlight.current || retired || !authorized || !currentDraft || !confirmed || !plan.id || !revision.id ||
      !discovery || discovery.planToken !== plan.updatedAt || discovery.revisionToken !== revision.updatedAt ||
      !selected?.id || !selected.version || !reviewer?.actorId) return;
    const controller = new AbortController(); reads.current = controller;
    inFlight.current = true; setBusy(true); setRetired(true); setNotice('');
    let sent = false;
    try {
      if (!active.current) return;
      sent = true;
      const receipt = await submitPlanningRevision(revision.id, {
        expectedPlanUpdatedAt: discovery.planToken, expectedRevisionUpdatedAt: discovery.revisionToken,
        definitionId: selected.id, definitionVersion: selected.version, targetTypeId: typeId.trim(),
        workflowPurposeId: purposeId.trim(), reviewerActorId: reviewer.actorId,
      });
      if (!active.current) return;
      const persistedPlan = await fetchOperationalPlan(plan.id, controller.signal);
      const persistedRevision = await fetchPlanRevision(revision.id, controller.signal);
      const targets = await readRevisionTargets(revision.id, controller.signal);
      const approval = await fetchPlanningApproval(revision.id, controller.signal);
      if (receipt.revisionId !== revision.id || receipt.revisionStatus !== 'SUBMITTED' || !receipt.workflowInstanceId ||
        !receipt.workflowTaskId || !receipt.workflowTaskUpdatedAt || !receipt.planUpdatedAt || !receipt.revisionUpdatedAt ||
        persistedPlan.id !== plan.id || persistedPlan.currentRevisionId !== revision.id || persistedPlan.status !== 'SUBMITTED' ||
        persistedPlan.updatedAt !== receipt.planUpdatedAt || persistedRevision.id !== revision.id ||
        persistedRevision.planId !== plan.id || persistedRevision.status !== 'SUBMITTED' ||
        persistedRevision.submittedByActorId !== actor || persistedRevision.updatedAt !== receipt.revisionUpdatedAt ||
        persistedRevision.workflowInstanceId !== receipt.workflowInstanceId || approval.revisionId !== revision.id ||
        approval.revisionStatus !== 'SUBMITTED' || approval.workflowInstanceId !== receipt.workflowInstanceId ||
        approval.currentTaskId !== receipt.workflowTaskId || approval.currentTaskUpdatedAt !== receipt.workflowTaskUpdatedAt ||
        targets.length !== discovery.targets.length || targets.some(target => {
          const before = discovery.targets.find(row => row.id === target.id);
          return !before || target.status !== 'DRAFT' || target.updatedAt !== before.updatedAt;
        })) throw new Error('Readback unavailable');
      if (!active.current) return;
      setNotice(t('uxr29.submitVerified'));
      onVerified?.();
    } catch {
      if (active.current) { setNotice(t(sent ? 'uxr29.submitUnconfirmed' : 'ownerFeedback.denied')); onUnavailable?.(); }
    } finally { inFlight.current = false; if (active.current) { setBusy(false); setDiscovery(undefined); setConfirmed(false); } }
  }

  if (!currentDraft) return null;
  return <Paper variant="outlined" sx={{ p: 2 }}><Stack spacing={2}>
    <Typography component="h3" variant="h6">{t('uxr29.submitTitle')}</Typography>
    {!authorized ? <Alert severity="warning">{t('ownerFeedback.denied')}</Alert> : <>
      {notice ? <Alert severity="info">{notice}</Alert> : null}
      {retired ? <Button disabled={busy} onClick={onRetire}>{t('ownerFeedback.review')}</Button> : <>
        <TextField label={t('uxr29.targetTypeId')} value={typeId} disabled={busy} onChange={e => { reset(); setTypeId(e.target.value); }} />
        <TextField label={t('uxr29.purposeId')} value={purposeId} disabled={busy} onChange={e => { reset(); setPurposeId(e.target.value); }} />
        <Button disabled={busy || !typeId.trim() || !purposeId.trim()} onClick={() => void discover()}>{t('uxr29.discover')}</Button>
        {discovery ? <>
          <Typography>{t('uxr29.fields.version')}: {discovery.planToken} / {discovery.revisionToken}</Typography>
          {discovery.definitions.length === 0 ? <Alert severity="info">{t('workflow.start.empty')}</Alert> : <>
            <TextField select label={t('workflow.start.process')} value={definitionKey} disabled={busy}
              onChange={e => { setDefinitionKey(e.target.value); setReviewerId(''); setConfirmed(false); }}>
              <MenuItem value="">—</MenuItem>
              {discovery.definitions.map(d => <MenuItem key={JSON.stringify([d.id, d.version])} value={JSON.stringify([d.id, d.version])}>{d.nameFr ?? d.code ?? d.id} · {d.version}</MenuItem>)}
            </TextField>
            <TextField select label={t('workflow.start.reviewer')} value={reviewerId} disabled={busy || !selected}
              onChange={e => { setReviewerId(e.target.value); setConfirmed(false); }}>
              <MenuItem value="">—</MenuItem>
              {reviewers.map(a => <MenuItem key={a.actorId} value={a.actorId}>{a.displayName ?? a.username ?? a.actorId}</MenuItem>)}
            </TextField>
            <FormControlLabel control={<Checkbox checked={confirmed} disabled={busy || !reviewer} onChange={e => setConfirmed(e.target.checked)} />} label={t('uxr29.confirmSubmit')} />
            <Button variant="contained" disabled={busy || !confirmed || !selected || !reviewer} onClick={() => void submit()}>{t('uxr29.submit')}</Button>
          </>}
        </> : null}
      </>}
    </>}
  </Stack></Paper>;
}
