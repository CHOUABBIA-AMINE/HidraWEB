import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router';
import { useTranslation } from 'react-i18next';

import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import type { Action as PlanningApprovalAction } from '@/api/generated/planning/model';
import { usePermissions } from '@/features/permissions/usePermissions';
import { useAuth } from '@/app/auth/useAuth';
import { useShellUiStore } from '@/shell/model/useShellUiStore';
import { PlanningSubmissionPanel, readRevisionTargets } from '@/features/planning/PlanningSubmissionPanel';
import { PlannedVsActualPanel } from '@/features/planning/PlannedVsActualPanel';
import {
  executePlanningApprovalAction,
  fetchOperationalPlan,
  fetchOperationalPlans,
  fetchPlanRevision,
  fetchPlanRevisions,
  fetchPlanningApproval,
  fetchPlanningPeriod,
  fetchPlanningPeriods,
  planningQueryKeys,
} from '@/features/planning/api/planningApi';

const PAGE_SIZE = 50;
const policy = { retry: false, refetchOnMount: 'always', gcTime: 0 } as const;
function fresh<T>(query: { isSuccess: boolean; isFetching: boolean; isFetchedAfterMount: boolean; data?: T }): T | undefined {
  return query.isSuccess && !query.isFetching && query.isFetchedAfterMount ? query.data : undefined;
}
const PERIODS_ROUTE = '/api/v1/planning/periods';
const PERIOD_DETAIL_ROUTE = '/api/v1/planning/periods/{id}';
const PLANS_ROUTE = '/api/v1/planning/operational-plans';
const PLAN_DETAIL_ROUTE = '/api/v1/planning/operational-plans/{id}';
const REVISIONS_ROUTE = '/api/v1/planning/revisions';
const REVISION_DETAIL_ROUTE = '/api/v1/planning/revisions/{id}';
const APPROVAL_ROUTE = '/api/v1/planning/revisions/{revisionId}/approval';
const APPROVAL_EXECUTE_ROUTE = '/api/v1/planning/revisions/{revisionId}/approval/actions/{transitionId}/execute';

type PlanningTab = 'periods' | 'plans';
type RouteMethod = 'GET' | 'POST';

function valueOrDash(value?: string | number | null): string {
  return value === undefined || value === null || value === '' ? '—' : String(value);
}

function optional(value: string): string | undefined {
  const normalized = value.trim();
  return normalized ? normalized : undefined;
}

function preferredName(value: { nameFr?: string; nameEn?: string; nameAr?: string; code?: string; id?: string }): string {
  return value.nameFr ?? value.nameEn ?? value.nameAr ?? value.code ?? value.id ?? '—';
}

function permissionForRoute(routes: ReturnType<typeof usePermissions>['routes'], route: string, method: RouteMethod): string | undefined {
  return routes.find((descriptor) => descriptor.route === route && descriptor.methods.includes(method))?.permission;
}

function errorMessage(error: unknown, resource: string): string {
  const normalized = normalizeHidraApiError(error);
  if (normalized.status === 403) return `HidraAPI refused access to ${resource}.`;
  if (normalized.status === 409) return `The authoritative ${resource} changed. Refresh before retrying.`;
  return `${resource} is unavailable.`;
}

function PaginationControls({ page, totalPages, hasNext, onPrevious, onNext }: {
  page: number;
  totalPages?: number;
  hasNext?: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
      <Button disabled={page === 0} onClick={onPrevious} size="small">Previous</Button>
      <Typography color="text.secondary" variant="body2">Page {page + 1}{totalPages ? ` of ${totalPages}` : ''}</Typography>
      <Button disabled={hasNext !== true} onClick={onNext} size="small">Next</Button>
    </Stack>
  );
}

export function PlanningWorkspacePage() {
  const auth = useAuth();
  const context = useShellUiStore(s => s.operationalContext);
  const permissions = usePermissions();
  const [tab, setTab] = useState<PlanningTab>('periods');
  const scope = JSON.stringify([auth.status, auth.session?.sessionId, auth.session?.principal?.userId, context,
    tab, permissions.status, [...permissions.permissions].sort(), permissions.routes.map(r => [r.route, r.methods, r.permission])]);
  return <CurrentPlanningWorkspace key={scope} scope={scope} tab={tab} setTab={setTab} />;
}

function CurrentPlanningWorkspace({ scope, tab, setTab }: { scope: string; tab: PlanningTab; setTab: (value: PlanningTab) => void }) {
  const { routes, can } = usePermissions();
  const { t } = useTranslation();
  const { session } = useAuth();
  const [selectionEpoch, setSelectionEpoch] = useState(0);
  const [revisionEpoch, setRevisionEpoch] = useState(0);
  const [refreshEpoch, setRefreshEpoch] = useState(0);
  const [retired, setRetired] = useState(false);
  const actionLock = useRef(false);
  const active = useRef(false);
  const readback = useRef<AbortController | undefined>(undefined);
  useEffect(() => { active.current = true; return () => { active.current = false; readback.current?.abort(); }; }, []);
  const [periodPage, setPeriodPage] = useState(0);
  const [planPage, setPlanPage] = useState(0);
  const [revisionPage, setRevisionPage] = useState(0);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>();
  const [selectedPlanId, setSelectedPlanId] = useState<string>();
  const [selectedRevisionId, setSelectedRevisionId] = useState<string>();
  const [selectedTransitionId, setSelectedTransitionId] = useState('');
  const [selectedTaskToken, setSelectedTaskToken] = useState('');
  const [approvalRetired, setApprovalRetired] = useState(false);
  const [reasonId, setReasonId] = useState('');
  const [commentText, setCommentText] = useState('');
  const [decisionNote, setDecisionNote] = useState('');
  const [correlationId, setCorrelationId] = useState('');
  const [approvalSuccess, setApprovalSuccess] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [commandUnconfirmed, setCommandUnconfirmed] = useState(false);

  const routePermissions = useMemo(() => ({
    periods: permissionForRoute(routes, PERIODS_ROUTE, 'GET'),
    periodDetail: permissionForRoute(routes, PERIOD_DETAIL_ROUTE, 'GET'),
    plans: permissionForRoute(routes, PLANS_ROUTE, 'GET'),
    planDetail: permissionForRoute(routes, PLAN_DETAIL_ROUTE, 'GET'),
    revisions: permissionForRoute(routes, REVISIONS_ROUTE, 'GET'),
    revisionDetail: permissionForRoute(routes, REVISION_DETAIL_ROUTE, 'GET'),
    approvalRead: permissionForRoute(routes, APPROVAL_ROUTE, 'GET'),
    approvalExecute: permissionForRoute(routes, APPROVAL_EXECUTE_ROUTE, 'POST'),
  }), [routes]);

  const canReadPeriods = Boolean(routePermissions.periods && can(routePermissions.periods));
  const canReadPeriodDetail = Boolean(routePermissions.periodDetail && can(routePermissions.periodDetail));
  const canReadPlans = Boolean(routePermissions.plans && can(routePermissions.plans));
  const canReadPlanDetail = Boolean(routePermissions.planDetail && can(routePermissions.planDetail));
  const canReadRevisions = Boolean(routePermissions.revisions && can(routePermissions.revisions));
  const canReadRevisionDetail = Boolean(routePermissions.revisionDetail && can(routePermissions.revisionDetail));
  const canReadApproval = Boolean(routePermissions.approvalRead && can(routePermissions.approvalRead));
  const canExecuteApproval = Boolean(routePermissions.approvalExecute && can(routePermissions.approvalExecute));

  const periodsQuery = useQuery({
    queryKey: [...planningQueryKeys.periods({ page: periodPage, size: PAGE_SIZE }), scope, refreshEpoch],
    queryFn: ({ signal }) => fetchPlanningPeriods({ page: periodPage, size: PAGE_SIZE }, signal),
    enabled: !retired && tab === 'periods' && canReadPeriods, ...policy,
  });
  const periodsPage = !retired && canReadPeriods ? fresh(periodsQuery) : undefined;
  const periodDetailQuery = useQuery({
    queryKey: [...planningQueryKeys.period(selectedPeriodId ?? ''), scope, refreshEpoch, selectionEpoch],
    queryFn: ({ signal }) => fetchPlanningPeriod(selectedPeriodId ?? '', signal),
    enabled: Boolean(periodsPage?.content?.some(p => p.id === selectedPeriodId) && selectedPeriodId) && canReadPeriodDetail, ...policy,
  });
  const periodDetail = canReadPeriodDetail && periodsPage && fresh(periodDetailQuery)?.id === selectedPeriodId ? fresh(periodDetailQuery) : undefined;
  const plansQuery = useQuery({
    queryKey: [...planningQueryKeys.plans({ page: planPage, size: PAGE_SIZE }), scope, refreshEpoch],
    queryFn: ({ signal }) => fetchOperationalPlans({ page: planPage, size: PAGE_SIZE }, signal),
    enabled: !retired && tab === 'plans' && canReadPlans, ...policy,
  });
  const plansPage = !retired && canReadPlans ? fresh(plansQuery) : undefined;
  const planDetailQuery = useQuery({
    queryKey: [...planningQueryKeys.plan(selectedPlanId ?? ''), scope, refreshEpoch, selectionEpoch],
    queryFn: ({ signal }) => fetchOperationalPlan(selectedPlanId ?? '', signal),
    enabled: Boolean(plansPage?.content?.some(p => p.id === selectedPlanId) && selectedPlanId) && canReadPlanDetail, ...policy,
  });
  const planDetail = canReadPlanDetail && plansPage && fresh(planDetailQuery)?.id === selectedPlanId ? fresh(planDetailQuery) : undefined;
  const revisionsQuery = useQuery({
    queryKey: [...planningQueryKeys.revisions({ planId: selectedPlanId ?? '', page: revisionPage, size: PAGE_SIZE }), scope, refreshEpoch, selectionEpoch],
    queryFn: ({ signal }) => fetchPlanRevisions({ planId: selectedPlanId ?? '', page: revisionPage, size: PAGE_SIZE }, signal),
    enabled: Boolean(planDetail) && canReadRevisions, ...policy,
  });
  const rawRevisions = planDetail && canReadRevisions ? fresh(revisionsQuery) : undefined;
  const revisionsPage = rawRevisions?.content?.every(r => r.planId === selectedPlanId) ? rawRevisions : undefined;
  const revisionDetailQuery = useQuery({
    queryKey: [...planningQueryKeys.revision(selectedRevisionId ?? ''), scope, refreshEpoch, selectionEpoch, revisionEpoch],
    queryFn: ({ signal }) => fetchPlanRevision(selectedRevisionId ?? '', signal),
    enabled: Boolean(planDetail && revisionsPage?.content?.some(r => r.id === selectedRevisionId) && selectedRevisionId) && canReadRevisionDetail, ...policy,
  });
  const rawRevision = fresh(revisionDetailQuery);
  const revisionDetail = canReadRevisionDetail && planDetail && revisionsPage && rawRevision?.id === selectedRevisionId && rawRevision?.planId === selectedPlanId ? rawRevision : undefined;
  const approvalQuery = useQuery({
    queryKey: [...planningQueryKeys.approval(selectedRevisionId ?? ''), scope, refreshEpoch, selectionEpoch, revisionEpoch],
    queryFn: ({ signal }) => fetchPlanningApproval(selectedRevisionId ?? '', signal),
    enabled: Boolean(revisionDetail?.workflowInstanceId) && canReadApproval, ...policy,
  });
  const rawApproval = fresh(approvalQuery);
  const approval = revisionDetail && canReadApproval && rawApproval?.revisionId === selectedRevisionId &&
    rawApproval?.workflowInstanceId === revisionDetail.workflowInstanceId && rawApproval?.revisionStatus === revisionDetail.status ? rawApproval : undefined;
  const targetGrant = permissionForRoute(routes, '/api/v1/planning/targets', 'GET');
  const actor = session?.principal?.userId;
  const eligibleReview = Boolean(actor && planDetail && revisionDetail && revisionDetail.submittedByActorId && revisionDetail.submittedByActorId !== actor &&
    planDetail.currentRevisionId === revisionDetail.id && planDetail.status === 'SUBMITTED' && revisionDetail.status === 'SUBMITTED' &&
    approval?.currentTaskId && approval.currentTaskUpdatedAt && targetGrant && can(targetGrant) && canExecuteApproval && !approvalRetired);

  const approvalMutation = useMutation({
    retry: false,
    mutationFn: async (action: PlanningApprovalAction) => {
      const controller = new AbortController(); readback.current = controller;
      const signal = controller.signal;
      if (!eligibleReview || !selectedPlanId || !selectedRevisionId || !action.transitionId ||
        !approval?.currentTaskUpdatedAt || selectedTaskToken !== approval.currentTaskUpdatedAt ||
        !approval.actions?.some(a => a.transitionId === action.transitionId && a.permitted === true) ||
        (action.reasonRequired && !reasonId.trim()) || (action.commentRequired && !commentText.trim())) throw new Error('Approval unavailable');
      const currentPlan = await fetchOperationalPlan(selectedPlanId, signal);
      const currentRevision = await fetchPlanRevision(selectedRevisionId, signal);
      const currentApproval = await fetchPlanningApproval(selectedRevisionId, signal);
      if (currentPlan.id !== selectedPlanId || currentPlan.currentRevisionId !== selectedRevisionId ||
        currentPlan.status !== 'SUBMITTED' || currentRevision.id !== selectedRevisionId ||
        currentRevision.planId !== selectedPlanId || currentRevision.status !== 'SUBMITTED' ||
        currentRevision.submittedByActorId === actor || currentRevision.workflowInstanceId !== approval.workflowInstanceId ||
        currentApproval.revisionId !== selectedRevisionId || currentApproval.revisionStatus !== 'SUBMITTED' ||
        currentApproval.workflowInstanceId !== approval.workflowInstanceId ||
        currentApproval.currentTaskId !== approval.currentTaskId || currentApproval.currentTaskUpdatedAt !== selectedTaskToken ||
        !currentApproval.actions?.some(candidate => candidate.transitionId === action.transitionId && candidate.permitted === true)) throw new Error('Approval unavailable');
      const beforeTargets = await readRevisionTargets(selectedRevisionId, signal);
      if (!beforeTargets.length || beforeTargets.some(row => row.status !== 'DRAFT')) throw new Error('Approval unavailable');
      if (!active.current || signal.aborted) throw new Error('Selection retired');
      const result = await executePlanningApprovalAction(selectedRevisionId, action.transitionId, {
        expectedTaskUpdatedAt: selectedTaskToken, reasonId: optional(reasonId), commentText: optional(commentText),
        decisionNote: optional(decisionNote), correlationId: optional(correlationId),
      });
      if (!active.current || signal.aborted) throw new Error('Selection retired');
      const plan = await fetchOperationalPlan(selectedPlanId, signal);
      const revision = await fetchPlanRevision(selectedRevisionId, signal);
      const targets = await readRevisionTargets(selectedRevisionId, signal);
      const projection = await fetchPlanningApproval(selectedRevisionId, signal);
      const terminal = result.workflowInstanceStatus === 'COMPLETED';
      const approved = terminal && result.decision === 'APPROVE';
      const rejected = terminal && result.decision === 'REJECT';
      if (result.revisionId !== selectedRevisionId || result.transitionId !== action.transitionId ||
        result.workflowInstanceId !== approval.workflowInstanceId || plan.id !== selectedPlanId ||
        plan.currentRevisionId !== selectedRevisionId || revision.id !== selectedRevisionId ||
        revision.planId !== selectedPlanId || revision.workflowInstanceId !== result.workflowInstanceId ||
        revision.status !== result.revisionStatus || projection.revisionId !== selectedRevisionId ||
        projection.revisionStatus !== revision.status || projection.workflowInstanceId !== result.workflowInstanceId ||
        projection.workflowInstanceStatus !== result.workflowInstanceStatus ||
        (terminal && (projection.currentTaskId || projection.actions?.some(a => a.permitted))) ||
        (!terminal && result.nextTaskId && projection.currentTaskId !== result.nextTaskId) ||
        (approved && (revision.status !== 'APPROVED' || revision.approvedByActorId !== actor || plan.approvedRevisionId !== selectedRevisionId || plan.status !== 'ACTIVE')) ||
        (rejected && (revision.status !== 'REJECTED' || revision.approvedByActorId || plan.status !== 'DRAFT')) ||
        targets.length !== beforeTargets.length || targets.some(row => !beforeTargets.some(before => before.id === row.id && (approved || before.updatedAt === row.updatedAt)) || row.status !== (approved ? 'ACTIVE' : 'DRAFT'))) throw new Error('Approval readback unavailable');
      return result;
    },
    onSuccess: result => {
      if (!active.current) return;
      setSelectedPlanId(undefined); setSelectedRevisionId(undefined);
      setApprovalSuccess(`${result.decision ?? 'Action'} · revision ${result.revisionStatus ?? 'updated'}`);
      setCommandUnconfirmed(false); setRefreshEpoch(e => e + 1);
    },
    onError: () => {
      if (!active.current) return;
      setSelectedPlanId(undefined); setSelectedRevisionId(undefined);
      setApprovalSuccess(''); setApprovalRetired(true); setCommandUnconfirmed(true); setRetired(true);
    },
    onSettled: () => {
      actionLock.current = false; if (!active.current) return; setSelectedTransitionId(''); setSelectedTaskToken(''); setReasonId('');
      setCommentText(''); setDecisionNote(''); setCorrelationId('');
    },
  });

  const selectionFailed = Boolean((selectedPeriodId && (periodsQuery.isError || periodDetailQuery.isError || (fresh(periodDetailQuery) && !periodDetail && periodsPage))) ||
    (selectedPlanId && (plansQuery.isError || planDetailQuery.isError || (fresh(planDetailQuery) && !planDetail && plansPage) || revisionsQuery.isError || (rawRevisions && !revisionsPage))) ||
    (selectedRevisionId && (revisionDetailQuery.isError || (rawRevision && !revisionDetail && revisionsPage) || approvalQuery.isError || (rawApproval && !approval && revisionDetail))));
  if (selectionFailed) {
    setSelectedPeriodId(undefined); setSelectedPlanId(undefined); setSelectedRevisionId(undefined);
    setSelectedTransitionId(''); setSelectedTaskToken(''); setReasonId(''); setCommentText('');
    setDecisionNote(''); setCorrelationId(''); setApprovalSuccess(''); setSubmissionSuccess(false); setRetired(true);
  }
  if ((approvalSuccess || submissionSuccess) && plansQuery.isError) {
    setApprovalSuccess(''); setSubmissionSuccess(false); setRetired(true);
  }
  const periods = periodsPage?.content ?? [];
  const plans = plansPage?.content ?? [];
  const revisions = revisionsPage?.content ?? [];
  const approvalActions = approval?.actions ?? [];

  const resetApprovalForm = () => {
    setSelectedTransitionId('');
    setReasonId('');
    setCommentText('');
    setDecisionNote('');
    setCorrelationId('');
    setApprovalSuccess(''); setSubmissionSuccess(false); setCommandUnconfirmed(false);
    setSelectedTaskToken('');
    setApprovalRetired(false);
    approvalMutation.reset();
  };

  const openPlan = (id?: string) => {
    if (!id || actionLock.current) return;
    setSelectionEpoch(e => e + 1); setRetired(false);
    setSelectedPlanId(id);
    setSelectedRevisionId(undefined);
    setRevisionPage(0);
    resetApprovalForm();
  };

  const openRevision = (id?: string) => {
    if (!id) return;
    if (actionLock.current) return;
    setRevisionEpoch(e => e + 1); setSelectedRevisionId(id); setRetired(false);
    resetApprovalForm();
  };

  return (
    <Container maxWidth={false} sx={{ py: 3 }}>
      <Stack spacing={2.5}>
        <Box>
          <Typography component="h1" variant="h4">Planning</Typography>
          <Typography color="text.secondary">Planning periods, operational plans, revision history, workflow approval, and monitoring-owned planned-vs-actual comparison.</Typography>
        </Box>
        <Alert severity="info">HidraAPI owns lifecycle, approval, and planned-vs-actual semantics. HidraWEB only selects authoritative resources and renders backend-published values.</Alert>
        {retired ? <Alert severity="warning">{t('uxr29.ownerUnavailable')}</Alert> : null}
        {commandUnconfirmed ? <Alert severity="warning">{t('uxr29.commandUnconfirmed')}</Alert> : null}
        {approvalSuccess ? <Alert severity="success">{approvalSuccess}</Alert> : null}
        {submissionSuccess ? <Alert severity="success">{t('uxr29.submitVerified')}</Alert> : null}
        <Button disabled={approvalMutation.isPending} onClick={() => {
          setSelectedPeriodId(undefined); setSelectedPlanId(undefined); setSelectedRevisionId(undefined);
          resetApprovalForm(); setRetired(false); setRefreshEpoch(e => e + 1);
        }}>Refresh</Button>
        <Tabs onChange={(_, value: PlanningTab) => { if (!actionLock.current) setTab(value); }} value={tab} aria-label="Planning workspace">
          <Tab label="Planning periods" value="periods" />
          <Tab label="Operational plans" value="plans" />
        </Tabs>

        {tab === 'periods' ? (
          !routePermissions.periods || !routePermissions.periodDetail ? (
            <Alert severity="warning">Planning period route-permission metadata is unavailable. Access is denied by default.</Alert>
          ) : !canReadPeriods ? (
            <Alert severity="warning">Your current HidraAPI grants do not allow planning-period reads.</Alert>
          ) : periodsQuery.isPending ? <CircularProgress /> : periodsQuery.isError ? (
            <Alert severity="error">{errorMessage(periodsQuery.error, 'planning periods')}</Alert>
          ) : (
            <Stack spacing={2}>
              <Paper variant="outlined"><TableContainer><Table size="small"><TableHead><TableRow><TableCell>Code</TableCell><TableCell>Name</TableCell><TableCell>Status</TableCell><TableCell>Start</TableCell><TableCell>End</TableCell><TableCell align="right">Detail</TableCell></TableRow></TableHead><TableBody>
                {periods.map((period) => <TableRow key={period.id ?? period.code}><TableCell>{period.code ?? period.id ?? '—'}</TableCell><TableCell>{preferredName(period)}</TableCell><TableCell><Chip label={period.status ?? '—'} size="small" variant="outlined" /></TableCell><TableCell>{valueOrDash(period.periodStart)}</TableCell><TableCell>{valueOrDash(period.periodEnd)}</TableCell><TableCell align="right"><Button disabled={!period.id || !canReadPeriodDetail} onClick={() => { setSelectionEpoch(e => e + 1); setSelectedPeriodId(period.id); }} size="small">Open</Button></TableCell></TableRow>)}
                {periods.length === 0 ? <TableRow><TableCell colSpan={6}>No planning periods returned by HidraAPI.</TableCell></TableRow> : null}
              </TableBody></Table></TableContainer></Paper>
              <PaginationControls page={periodPage} totalPages={periodsPage?.totalPages} hasNext={periodsPage?.hasNext} onPrevious={() => { setSelectedPeriodId(undefined); setPeriodPage((value) => Math.max(0, value - 1)); }} onNext={() => { setSelectedPeriodId(undefined); setPeriodPage((value) => value + 1); }} />
              {periodDetailQuery.isPending && selectedPeriodId ? <CircularProgress size={24} /> : null}
              {periodDetailQuery.isError ? <Alert severity="error">{errorMessage(periodDetailQuery.error, 'planning period detail')}</Alert> : null}
              {periodDetail ? <Paper variant="outlined" sx={{ p: 2 }}><Stack spacing={1}><Typography component="h2" variant="h6">{preferredName(periodDetail)}</Typography><Typography>Status: {valueOrDash(periodDetail.status)}</Typography><Typography>Time zone: {valueOrDash(periodDetail.timeZone)}</Typography><Button onClick={() => setSelectedPeriodId(undefined)} size="small">Close</Button></Stack></Paper> : null}
            </Stack>
          )
        ) : (
          !routePermissions.plans || !routePermissions.planDetail ? (
            <Alert severity="warning">Operational-plan route-permission metadata is unavailable. Access is denied by default.</Alert>
          ) : !canReadPlans ? (
            <Alert severity="warning">Your current HidraAPI grants do not allow operational-plan reads.</Alert>
          ) : plansQuery.isPending ? <CircularProgress /> : plansQuery.isError ? (
            <Alert severity="error">{errorMessage(plansQuery.error, 'operational plans')}</Alert>
          ) : (
            <Stack spacing={2}>
              <Paper variant="outlined"><TableContainer><Table size="small"><TableHead><TableRow><TableCell>Code</TableCell><TableCell>Name</TableCell><TableCell>Status</TableCell><TableCell>Planning period</TableCell><TableCell>Topology scope</TableCell><TableCell align="right">Detail</TableCell></TableRow></TableHead><TableBody>
                {plans.map((plan) => <TableRow key={plan.id ?? plan.code}><TableCell>{plan.code ?? plan.id ?? '—'}</TableCell><TableCell>{preferredName(plan)}</TableCell><TableCell><Chip label={plan.status ?? '—'} size="small" variant="outlined" /></TableCell><TableCell>{valueOrDash(plan.periodId)}</TableCell><TableCell>{plan.topologyScopeNameSnapshot ?? plan.topologyScopeCode ?? plan.topologyScopeId ?? '—'}</TableCell><TableCell align="right"><Button disabled={approvalMutation.isPending || !plan.id || !canReadPlanDetail} onClick={() => openPlan(plan.id)} size="small">Open</Button></TableCell></TableRow>)}
                {plans.length === 0 ? <TableRow><TableCell colSpan={6}>No operational plans returned by HidraAPI.</TableCell></TableRow> : null}
              </TableBody></Table></TableContainer></Paper>
              <PaginationControls page={planPage} totalPages={plansPage?.totalPages} hasNext={plansPage?.hasNext} onPrevious={() => { setSelectedPlanId(undefined); setSelectedRevisionId(undefined); resetApprovalForm(); setPlanPage((value) => Math.max(0, value - 1)); }} onNext={() => { setSelectedPlanId(undefined); setSelectedRevisionId(undefined); resetApprovalForm(); setPlanPage((value) => value + 1); }} />

              {planDetail ? <Paper variant="outlined" sx={{ p: 2 }}><Stack spacing={1}><Typography component="h2" variant="h6">{preferredName(planDetail)}</Typography><Typography>Status: {valueOrDash(planDetail.status)}</Typography><Typography>Current revision: {valueOrDash(planDetail.currentRevisionId)}</Typography>{planDetail.topologyScopeCode || planDetail.topologyScopeId ? <Button component={RouterLink} to={`/network?query=${encodeURIComponent(planDetail.topologyScopeCode ?? planDetail.topologyScopeId ?? '')}`} size="small" variant="outlined">Open topology context</Button> : null}</Stack></Paper> : null}

              {planDetail ? (
                <Stack spacing={1.5}>
                  <Typography component="h2" variant="h6">Revision history</Typography>
                  {!routePermissions.revisions || !routePermissions.revisionDetail ? <Alert severity="warning">Revision route-permission metadata is unavailable. Revision access is denied by default.</Alert> : !canReadRevisions ? <Alert severity="warning">Your current HidraAPI grants do not allow revision reads.</Alert> : revisionsQuery.isPending ? <CircularProgress size={24} /> : revisionsQuery.isError ? <Alert severity="error">{errorMessage(revisionsQuery.error, 'plan revisions')}</Alert> : (
                    <>
                      <Paper variant="outlined"><TableContainer><Table size="small"><TableHead><TableRow><TableCell>Revision</TableCell><TableCell>Status</TableCell><TableCell>Base revision</TableCell><TableCell>Change reason</TableCell><TableCell align="right">Detail</TableCell></TableRow></TableHead><TableBody>
                        {revisions.map((revision) => <TableRow key={revision.id ?? revision.revisionCode}><TableCell>{revision.revisionCode ?? valueOrDash(revision.revisionNumber)}</TableCell><TableCell><Chip label={revision.status ?? '—'} size="small" variant="outlined" /></TableCell><TableCell>{valueOrDash(revision.baseRevisionId)}</TableCell><TableCell>{revision.changeReasonText ?? revision.changeReasonCodeId ?? '—'}</TableCell><TableCell align="right"><Button disabled={approvalMutation.isPending || !revision.id || !canReadRevisionDetail} onClick={() => openRevision(revision.id)} size="small">Open revision</Button></TableCell></TableRow>)}
                        {revisions.length === 0 ? <TableRow><TableCell colSpan={5}>No revisions returned by HidraAPI for this plan.</TableCell></TableRow> : null}
                      </TableBody></Table></TableContainer></Paper>
                      <PaginationControls page={revisionPage} totalPages={revisionsPage?.totalPages} hasNext={revisionsPage?.hasNext} onPrevious={() => { setSelectedRevisionId(undefined); resetApprovalForm(); setRevisionPage((value) => Math.max(0, value - 1)); }} onNext={() => { setSelectedRevisionId(undefined); resetApprovalForm(); setRevisionPage((value) => value + 1); }} />
                    </>
                  )}

                  {revisionDetailQuery.isPending && selectedRevisionId ? <CircularProgress size={24} /> : null}
                  {revisionDetailQuery.isError ? <Alert severity="error">{errorMessage(revisionDetailQuery.error, 'revision detail')}</Alert> : null}
                  {revisionDetail ? (
                    <Stack spacing={2}>
                      <Paper variant="outlined" sx={{ p: 2 }}><Stack spacing={1}><Typography component="h3" variant="h6">{revisionDetail.revisionCode ?? `Revision ${valueOrDash(revisionDetail.revisionNumber)}`}</Typography><Typography>Status: {valueOrDash(revisionDetail.status)}</Typography><Typography>Workflow instance: {valueOrDash(revisionDetail.workflowInstanceId)}</Typography>{revisionDetail.workflowInstanceId ? <Button component={RouterLink} to={`/work/tasks?instanceId=${encodeURIComponent(revisionDetail.workflowInstanceId)}`} size="small" variant="outlined">Open workflow context</Button> : null}<Button disabled={approvalMutation.isPending} onClick={() => { setSelectedRevisionId(undefined); resetApprovalForm(); }} size="small">Close</Button></Stack></Paper>

                      {planDetail ? <PlanningSubmissionPanel key={JSON.stringify([scope, planDetail.id, planDetail.updatedAt, revisionDetail.id, revisionDetail.updatedAt])}
                        plan={planDetail} revision={revisionDetail}
                        onVerified={() => {
                          setSelectedPlanId(undefined); setSelectedRevisionId(undefined); resetApprovalForm();
                          setSubmissionSuccess(true); setRefreshEpoch(e => e + 1);
                        }} onUnavailable={() => {
                          setSelectedPlanId(undefined); setSelectedRevisionId(undefined); resetApprovalForm();
                          setRetired(true); setCommandUnconfirmed(true);
                        }} onRetire={() => {
                          setSelectedRevisionId(undefined); resetApprovalForm(); setRefreshEpoch(e => e + 1);
                        }} /> : null}
                      <PlannedVsActualPanel key={JSON.stringify([scope, selectedRevisionId, refreshEpoch, revisionEpoch])} revisionId={selectedRevisionId ?? ''} scope={JSON.stringify([scope, selectionEpoch, refreshEpoch, revisionEpoch])} revisionKey={[...planningQueryKeys.revision(selectedRevisionId ?? ''), scope, refreshEpoch, selectionEpoch, revisionEpoch]} onUnavailable={() => { setSelectedPlanId(undefined); setSelectedRevisionId(undefined); resetApprovalForm(); setRetired(true); setCommandUnconfirmed(true); }} />

                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Stack spacing={2}>
                          <Box><Typography color="text.secondary" variant="overline">Backend-authoritative workflow approval</Typography><Typography component="h3" variant="h6">Revision approval</Typography></Box>
                          {!revisionDetail.workflowInstanceId ? <Alert severity="info">HidraAPI publishes no workflow approval instance for this revision.</Alert> : !routePermissions.approvalRead ? <Alert severity="warning">Planning approval route-permission metadata is unavailable. Approval access is denied by default.</Alert> : !canReadApproval ? <Alert severity="warning">Your current HidraAPI grants do not allow planning approval reads.</Alert> : approvalQuery.isPending ? <CircularProgress size={24} /> : approvalQuery.isError ? <Alert severity="error">{errorMessage(approvalQuery.error, 'planning approval')}</Alert> : approval ? (
                            <>
                              <Typography>Current task: {valueOrDash(approval.currentTaskId)}</Typography>
                              <Typography>Task version: {valueOrDash(approval.currentTaskUpdatedAt)}</Typography>
                              <Divider />
                              {approvalMutation.error ? <Alert severity="error">{errorMessage(approvalMutation.error, 'planning approval task')} Refresh before another action; the command will not be replayed.</Alert> : null}
                              {!routePermissions.approvalExecute ? <Alert severity="warning">Planning approval execution metadata is unavailable. Actions are disabled by default.</Alert> : null}
                              {routePermissions.approvalExecute && !canExecuteApproval ? <Alert severity="warning">Your current HidraAPI grants do not allow planning approval execution.</Alert> : null}
                              {approvalActions.length ? approvalActions.map((action, index) => {
                                const permitted = action.permitted === true && Boolean(action.transitionId);
                                const executable = permitted && eligibleReview && Boolean(approval?.currentTaskUpdatedAt);
                                const selected = executable && action.transitionId === selectedTransitionId && selectedTaskToken === approval?.currentTaskUpdatedAt;
                                return <Paper key={action.transitionId ?? index} variant="outlined" sx={{ p: 1.5 }}><Stack spacing={1}><Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}><Chip label={action.decision ?? action.transitionId ?? 'Action'} size="small" /><>{action.reasonRequired ? <Chip label="reason required" size="small" variant="outlined" /> : null}</><>{action.commentRequired ? <Chip label="comment required" size="small" variant="outlined" /> : null}</></Stack>{action.requiredPermissionCode ? <Typography color="text.secondary" variant="caption">{action.requiredPermissionCode}</Typography> : null}{executable ? <Button size="small" variant={selected ? 'contained' : 'outlined'} onClick={() => { setSelectedTransitionId(action.transitionId ?? ''); setSelectedTaskToken(approval?.currentTaskUpdatedAt ?? ''); setReasonId(''); setCommentText(''); setDecisionNote(''); setCorrelationId(''); setApprovalSuccess(''); }}>{action.decision ?? 'Select action'}</Button> : null}{selected ? <Stack spacing={1}>{action.reasonRequired ? <TextField label="Reason ID" required size="small" value={reasonId} onChange={(event) => setReasonId(event.target.value)} /> : null}{action.commentRequired ? <TextField label="Comment" required multiline rows={2} size="small" value={commentText} onChange={(event) => setCommentText(event.target.value)} /> : null}<TextField label="Decision note" multiline rows={2} size="small" value={decisionNote} onChange={(event) => setDecisionNote(event.target.value)} /><TextField label="Correlation ID" size="small" value={correlationId} onChange={(event) => setCorrelationId(event.target.value)} /><Button variant="contained" disabled={approvalMutation.isPending || (action.reasonRequired === true && !reasonId.trim()) || (action.commentRequired === true && !commentText.trim())} onClick={() => { if (actionLock.current) return; actionLock.current = true; approvalMutation.mutate(action); }}>{approvalMutation.isPending ? '…' : `Execute ${action.decision ?? 'action'}`}</Button></Stack> : null}</Stack></Paper>;
                              }) : <Typography color="text.secondary">No executable approval actions were returned by HidraAPI.</Typography>}
                            </>
                          ) : null}
                        </Stack>
                      </Paper>
                    </Stack>
                  ) : null}
                </Stack>
              ) : null}
            </Stack>
          )
        )}
      </Stack>
    </Container>
  );
}
