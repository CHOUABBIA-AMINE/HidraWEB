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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import type { Action as PlanningApprovalAction } from '@/api/generated/planning/model';
import { usePermissions } from '@/features/permissions/usePermissions';
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
  return normalized.message || `${resource} could not be loaded.`;
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
  const { routes, can } = usePermissions();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<PlanningTab>('periods');
  const [periodPage, setPeriodPage] = useState(0);
  const [planPage, setPlanPage] = useState(0);
  const [revisionPage, setRevisionPage] = useState(0);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>();
  const [selectedPlanId, setSelectedPlanId] = useState<string>();
  const [selectedRevisionId, setSelectedRevisionId] = useState<string>();
  const [selectedTransitionId, setSelectedTransitionId] = useState('');
  const [reasonId, setReasonId] = useState('');
  const [commentText, setCommentText] = useState('');
  const [decisionNote, setDecisionNote] = useState('');
  const [correlationId, setCorrelationId] = useState('');
  const [approvalSuccess, setApprovalSuccess] = useState('');

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
    queryKey: planningQueryKeys.periods({ page: periodPage, size: PAGE_SIZE }),
    queryFn: () => fetchPlanningPeriods({ page: periodPage, size: PAGE_SIZE }),
    enabled: canReadPeriods,
  });
  const periodDetailQuery = useQuery({
    queryKey: planningQueryKeys.period(selectedPeriodId ?? ''),
    queryFn: () => fetchPlanningPeriod(selectedPeriodId ?? ''),
    enabled: Boolean(selectedPeriodId) && canReadPeriodDetail,
  });
  const plansQuery = useQuery({
    queryKey: planningQueryKeys.plans({ page: planPage, size: PAGE_SIZE }),
    queryFn: () => fetchOperationalPlans({ page: planPage, size: PAGE_SIZE }),
    enabled: canReadPlans,
  });
  const planDetailQuery = useQuery({
    queryKey: planningQueryKeys.plan(selectedPlanId ?? ''),
    queryFn: () => fetchOperationalPlan(selectedPlanId ?? ''),
    enabled: Boolean(selectedPlanId) && canReadPlanDetail,
  });
  const revisionsQuery = useQuery({
    queryKey: planningQueryKeys.revisions({ planId: selectedPlanId ?? '', page: revisionPage, size: PAGE_SIZE }),
    queryFn: () => fetchPlanRevisions({ planId: selectedPlanId ?? '', page: revisionPage, size: PAGE_SIZE }),
    enabled: Boolean(selectedPlanId) && canReadRevisions,
  });
  const revisionDetailQuery = useQuery({
    queryKey: planningQueryKeys.revision(selectedRevisionId ?? ''),
    queryFn: () => fetchPlanRevision(selectedRevisionId ?? ''),
    enabled: Boolean(selectedRevisionId) && canReadRevisionDetail,
  });
  const approvalQuery = useQuery({
    queryKey: planningQueryKeys.approval(selectedRevisionId ?? ''),
    queryFn: () => fetchPlanningApproval(selectedRevisionId ?? ''),
    enabled: Boolean(selectedRevisionId && revisionDetailQuery.data?.workflowInstanceId) && canReadApproval,
  });

  const approvalMutation = useMutation({
    mutationFn: async (action: PlanningApprovalAction) => {
      if (!selectedRevisionId || !action.transitionId || !approvalQuery.data?.currentTaskUpdatedAt) {
        throw new Error('The authoritative approval task version is unavailable.');
      }
      return executePlanningApprovalAction(selectedRevisionId, action.transitionId, {
        expectedTaskUpdatedAt: approvalQuery.data.currentTaskUpdatedAt,
        reasonId: optional(reasonId),
        commentText: optional(commentText),
        decisionNote: optional(decisionNote),
        correlationId: optional(correlationId),
      });
    },
    onSuccess: async (result) => {
      setApprovalSuccess(`${result.decision ?? 'Action'} · revision ${result.revisionStatus ?? 'updated'}`);
      setSelectedTransitionId('');
      setReasonId('');
      setCommentText('');
      setDecisionNote('');
      setCorrelationId('');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: planningQueryKeys.approval(selectedRevisionId ?? '') }),
        queryClient.invalidateQueries({ queryKey: planningQueryKeys.revision(selectedRevisionId ?? '') }),
        queryClient.invalidateQueries({ queryKey: ['hidra', 'planning', 'revisions'] }),
      ]);
    },
  });

  const periods = periodsQuery.data?.content ?? [];
  const plans = plansQuery.data?.content ?? [];
  const revisions = revisionsQuery.data?.content ?? [];
  const approvalActions = approvalQuery.data?.actions ?? [];

  const resetApprovalForm = () => {
    setSelectedTransitionId('');
    setReasonId('');
    setCommentText('');
    setDecisionNote('');
    setCorrelationId('');
    setApprovalSuccess('');
    approvalMutation.reset();
  };

  const openPlan = (id?: string) => {
    if (!id) return;
    setSelectedPlanId(id);
    setSelectedRevisionId(undefined);
    setRevisionPage(0);
    resetApprovalForm();
  };

  const openRevision = (id?: string) => {
    if (!id) return;
    setSelectedRevisionId(id);
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
        <Tabs onChange={(_, value: PlanningTab) => setTab(value)} value={tab} aria-label="Planning workspace">
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
                {periods.map((period) => <TableRow key={period.id ?? period.code}><TableCell>{period.code ?? period.id ?? '—'}</TableCell><TableCell>{preferredName(period)}</TableCell><TableCell><Chip label={period.status ?? '—'} size="small" variant="outlined" /></TableCell><TableCell>{valueOrDash(period.periodStart)}</TableCell><TableCell>{valueOrDash(period.periodEnd)}</TableCell><TableCell align="right"><Button disabled={!period.id || !canReadPeriodDetail} onClick={() => setSelectedPeriodId(period.id)} size="small">Open</Button></TableCell></TableRow>)}
                {periods.length === 0 ? <TableRow><TableCell colSpan={6}>No planning periods returned by HidraAPI.</TableCell></TableRow> : null}
              </TableBody></Table></TableContainer></Paper>
              <PaginationControls page={periodPage} totalPages={periodsQuery.data?.totalPages} hasNext={periodsQuery.data?.hasNext} onPrevious={() => setPeriodPage((value) => Math.max(0, value - 1))} onNext={() => setPeriodPage((value) => value + 1)} />
              {periodDetailQuery.isPending && selectedPeriodId ? <CircularProgress size={24} /> : null}
              {periodDetailQuery.isError ? <Alert severity="error">{errorMessage(periodDetailQuery.error, 'planning period detail')}</Alert> : null}
              {periodDetailQuery.data ? <Paper variant="outlined" sx={{ p: 2 }}><Stack spacing={1}><Typography component="h2" variant="h6">{preferredName(periodDetailQuery.data)}</Typography><Typography>Status: {valueOrDash(periodDetailQuery.data.status)}</Typography><Typography>Time zone: {valueOrDash(periodDetailQuery.data.timeZone)}</Typography><Button onClick={() => setSelectedPeriodId(undefined)} size="small">Close</Button></Stack></Paper> : null}
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
                {plans.map((plan) => <TableRow key={plan.id ?? plan.code}><TableCell>{plan.code ?? plan.id ?? '—'}</TableCell><TableCell>{preferredName(plan)}</TableCell><TableCell><Chip label={plan.status ?? '—'} size="small" variant="outlined" /></TableCell><TableCell>{valueOrDash(plan.periodId)}</TableCell><TableCell>{plan.topologyScopeNameSnapshot ?? plan.topologyScopeCode ?? plan.topologyScopeId ?? '—'}</TableCell><TableCell align="right"><Button disabled={!plan.id || !canReadPlanDetail} onClick={() => openPlan(plan.id)} size="small">Open</Button></TableCell></TableRow>)}
                {plans.length === 0 ? <TableRow><TableCell colSpan={6}>No operational plans returned by HidraAPI.</TableCell></TableRow> : null}
              </TableBody></Table></TableContainer></Paper>
              <PaginationControls page={planPage} totalPages={plansQuery.data?.totalPages} hasNext={plansQuery.data?.hasNext} onPrevious={() => setPlanPage((value) => Math.max(0, value - 1))} onNext={() => setPlanPage((value) => value + 1)} />

              {planDetailQuery.data ? <Paper variant="outlined" sx={{ p: 2 }}><Stack spacing={1}><Typography component="h2" variant="h6">{preferredName(planDetailQuery.data)}</Typography><Typography>Status: {valueOrDash(planDetailQuery.data.status)}</Typography><Typography>Current revision: {valueOrDash(planDetailQuery.data.currentRevisionId)}</Typography></Stack></Paper> : null}

              {selectedPlanId ? (
                <Stack spacing={1.5}>
                  <Typography component="h2" variant="h6">Revision history</Typography>
                  {!routePermissions.revisions || !routePermissions.revisionDetail ? <Alert severity="warning">Revision route-permission metadata is unavailable. Revision access is denied by default.</Alert> : !canReadRevisions ? <Alert severity="warning">Your current HidraAPI grants do not allow revision reads.</Alert> : revisionsQuery.isPending ? <CircularProgress size={24} /> : revisionsQuery.isError ? <Alert severity="error">{errorMessage(revisionsQuery.error, 'plan revisions')}</Alert> : (
                    <>
                      <Paper variant="outlined"><TableContainer><Table size="small"><TableHead><TableRow><TableCell>Revision</TableCell><TableCell>Status</TableCell><TableCell>Base revision</TableCell><TableCell>Change reason</TableCell><TableCell align="right">Detail</TableCell></TableRow></TableHead><TableBody>
                        {revisions.map((revision) => <TableRow key={revision.id ?? revision.revisionCode}><TableCell>{revision.revisionCode ?? valueOrDash(revision.revisionNumber)}</TableCell><TableCell><Chip label={revision.status ?? '—'} size="small" variant="outlined" /></TableCell><TableCell>{valueOrDash(revision.baseRevisionId)}</TableCell><TableCell>{revision.changeReasonText ?? revision.changeReasonCodeId ?? '—'}</TableCell><TableCell align="right"><Button disabled={!revision.id || !canReadRevisionDetail} onClick={() => openRevision(revision.id)} size="small">Open revision</Button></TableCell></TableRow>)}
                        {revisions.length === 0 ? <TableRow><TableCell colSpan={5}>No revisions returned by HidraAPI for this plan.</TableCell></TableRow> : null}
                      </TableBody></Table></TableContainer></Paper>
                      <PaginationControls page={revisionPage} totalPages={revisionsQuery.data?.totalPages} hasNext={revisionsQuery.data?.hasNext} onPrevious={() => setRevisionPage((value) => Math.max(0, value - 1))} onNext={() => setRevisionPage((value) => value + 1)} />
                    </>
                  )}

                  {revisionDetailQuery.isPending && selectedRevisionId ? <CircularProgress size={24} /> : null}
                  {revisionDetailQuery.isError ? <Alert severity="error">{errorMessage(revisionDetailQuery.error, 'revision detail')}</Alert> : null}
                  {revisionDetailQuery.data ? (
                    <Stack spacing={2}>
                      <Paper variant="outlined" sx={{ p: 2 }}><Stack spacing={1}><Typography component="h3" variant="h6">{revisionDetailQuery.data.revisionCode ?? `Revision ${valueOrDash(revisionDetailQuery.data.revisionNumber)}`}</Typography><Typography>Status: {valueOrDash(revisionDetailQuery.data.status)}</Typography><Typography>Workflow instance: {valueOrDash(revisionDetailQuery.data.workflowInstanceId)}</Typography><Button onClick={() => { setSelectedRevisionId(undefined); resetApprovalForm(); }} size="small">Close</Button></Stack></Paper>

                      <PlannedVsActualPanel revisionId={selectedRevisionId ?? ''} />

                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Stack spacing={2}>
                          <Box><Typography color="text.secondary" variant="overline">Backend-authoritative workflow approval</Typography><Typography component="h3" variant="h6">Revision approval</Typography></Box>
                          {!revisionDetailQuery.data.workflowInstanceId ? <Alert severity="info">HidraAPI publishes no workflow approval instance for this revision.</Alert> : !routePermissions.approvalRead ? <Alert severity="warning">Planning approval route-permission metadata is unavailable. Approval access is denied by default.</Alert> : !canReadApproval ? <Alert severity="warning">Your current HidraAPI grants do not allow planning approval reads.</Alert> : approvalQuery.isPending ? <CircularProgress size={24} /> : approvalQuery.isError ? <Alert severity="error">{errorMessage(approvalQuery.error, 'planning approval')}</Alert> : approvalQuery.data ? (
                            <>
                              <Typography>Current task: {valueOrDash(approvalQuery.data.currentTaskId)}</Typography>
                              <Typography>Task version: {valueOrDash(approvalQuery.data.currentTaskUpdatedAt)}</Typography>
                              <Divider />
                              {approvalMutation.error ? <Alert severity="error">{errorMessage(approvalMutation.error, 'planning approval task')}</Alert> : null}
                              {approvalSuccess ? <Alert severity="success">{approvalSuccess}</Alert> : null}
                              {!routePermissions.approvalExecute ? <Alert severity="warning">Planning approval execution metadata is unavailable. Actions are disabled by default.</Alert> : null}
                              {routePermissions.approvalExecute && !canExecuteApproval ? <Alert severity="warning">Your current HidraAPI grants do not allow planning approval execution.</Alert> : null}
                              {approvalActions.length ? approvalActions.map((action, index) => {
                                const permitted = action.permitted === true && Boolean(action.transitionId);
                                const executable = permitted && canExecuteApproval && Boolean(approvalQuery.data?.currentTaskUpdatedAt);
                                const selected = action.transitionId === selectedTransitionId;
                                return <Paper key={action.transitionId ?? index} variant="outlined" sx={{ p: 1.5 }}><Stack spacing={1}><Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}><Chip label={action.decision ?? action.transitionId ?? 'Action'} size="small" /><>{action.reasonRequired ? <Chip label="reason required" size="small" variant="outlined" /> : null}</><>{action.commentRequired ? <Chip label="comment required" size="small" variant="outlined" /> : null}</></Stack>{action.requiredPermissionCode ? <Typography color="text.secondary" variant="caption">{action.requiredPermissionCode}</Typography> : null}{executable ? <Button size="small" variant={selected ? 'contained' : 'outlined'} onClick={() => { setSelectedTransitionId(action.transitionId ?? ''); setReasonId(''); setCommentText(''); setDecisionNote(''); setCorrelationId(''); setApprovalSuccess(''); }}>{action.decision ?? 'Select action'}</Button> : null}{selected ? <Stack spacing={1}>{action.reasonRequired ? <TextField label="Reason ID" required size="small" value={reasonId} onChange={(event) => setReasonId(event.target.value)} /> : null}{action.commentRequired ? <TextField label="Comment" required multiline rows={2} size="small" value={commentText} onChange={(event) => setCommentText(event.target.value)} /> : null}<TextField label="Decision note" multiline rows={2} size="small" value={decisionNote} onChange={(event) => setDecisionNote(event.target.value)} /><TextField label="Correlation ID" size="small" value={correlationId} onChange={(event) => setCorrelationId(event.target.value)} /><Button variant="contained" disabled={approvalMutation.isPending || (action.reasonRequired === true && !reasonId.trim()) || (action.commentRequired === true && !commentText.trim())} onClick={() => approvalMutation.mutate(action)}>{approvalMutation.isPending ? '…' : `Execute ${action.decision ?? 'action'}`}</Button></Stack> : null}</Stack></Paper>;
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
