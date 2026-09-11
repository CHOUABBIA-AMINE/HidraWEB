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
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import type { OperationalPlanView, PlanningPeriodView } from '@/api/generated/planning/model';
import { usePermissions } from '@/features/permissions/usePermissions';
import {
  fetchOperationalPlan,
  fetchOperationalPlans,
  fetchPlanningPeriod,
  fetchPlanningPeriods,
  planningQueryKeys,
} from '@/features/planning/api/planningApi';

const PAGE_SIZE = 50;
const PERIODS_ROUTE = '/api/v1/planning/periods';
const PERIOD_DETAIL_ROUTE = '/api/v1/planning/periods/{id}';
const PLANS_ROUTE = '/api/v1/planning/operational-plans';
const PLAN_DETAIL_ROUTE = '/api/v1/planning/operational-plans/{id}';

type PlanningTab = 'periods' | 'plans';

function valueOrDash(value?: string | number | null): string {
  return value === undefined || value === null || value === '' ? '—' : String(value);
}

function preferredName(value: { nameFr?: string; nameEn?: string; nameAr?: string; code?: string; id?: string }): string {
  return value.nameFr ?? value.nameEn ?? value.nameAr ?? value.code ?? value.id ?? '—';
}

function permissionForRoute(
  routes: ReturnType<typeof usePermissions>['routes'],
  route: string,
): string | undefined {
  return routes.find((descriptor) => descriptor.route === route && descriptor.methods.includes('GET'))?.permission;
}

function errorMessage(error: unknown, resource: string): string {
  const normalized = normalizeHidraApiError(error);
  return normalized.status === 403
    ? `HidraAPI refused access to ${resource}.`
    : normalized.message || `${resource} could not be loaded.`;
}

function DetailField({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <Box>
      <Typography color="text.secondary" variant="caption">{label}</Typography>
      <Typography>{valueOrDash(value)}</Typography>
    </Box>
  );
}

function PlanningPeriodDetail({ period, onClose }: { period: PlanningPeriodView; onClose: () => void }) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'flex-start' }}>
          <Box>
            <Typography color="text.secondary" variant="overline">Planning period detail</Typography>
            <Typography component="h2" variant="h6">{preferredName(period)}</Typography>
            <Typography color="text.secondary" variant="body2">{period.code ?? period.id ?? '—'}</Typography>
          </Box>
          <Button onClick={onClose} size="small">Close</Button>
        </Box>
        <Divider />
        <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
          <DetailField label="Status" value={period.status} />
          <DetailField label="Period type" value={period.periodTypeId} />
          <DetailField label="Start" value={period.periodStart} />
          <DetailField label="End" value={period.periodEnd} />
          <DetailField label="Time zone" value={period.timeZone} />
          <DetailField label="Created by" value={period.createdByActorId} />
          <DetailField label="Created" value={period.createdAt} />
          <DetailField label="Updated" value={period.updatedAt} />
          <DetailField label="English name" value={period.nameEn} />
          <DetailField label="Arabic name" value={period.nameAr} />
        </Box>
      </Stack>
    </Paper>
  );
}

function OperationalPlanDetail({ plan, onClose }: { plan: OperationalPlanView; onClose: () => void }) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'flex-start' }}>
          <Box>
            <Typography color="text.secondary" variant="overline">Operational plan detail</Typography>
            <Typography component="h2" variant="h6">{preferredName(plan)}</Typography>
            <Typography color="text.secondary" variant="body2">{plan.code ?? plan.id ?? '—'}</Typography>
          </Box>
          <Button onClick={onClose} size="small">Close</Button>
        </Box>
        <Divider />
        <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
          <DetailField label="Status" value={plan.status} />
          <DetailField label="Planning period" value={plan.periodId} />
          <DetailField label="Plan type" value={plan.planTypeId} />
          <DetailField label="Product type" value={plan.productTypeId} />
          <DetailField label="Topology scope type" value={plan.topologyScopeType} />
          <DetailField label="Topology scope" value={plan.topologyScopeNameSnapshot ?? plan.topologyScopeCode ?? plan.topologyScopeId} />
          <DetailField label="Responsible organization" value={plan.responsibleOrganizationUnitId} />
          <DetailField label="Current revision" value={plan.currentRevisionId} />
          <DetailField label="Approved revision" value={plan.approvedRevisionId} />
          <DetailField label="Created by" value={plan.createdByActorId} />
          <DetailField label="Created" value={plan.createdAt} />
          <DetailField label="Updated" value={plan.updatedAt} />
        </Box>
      </Stack>
    </Paper>
  );
}

function PaginationControls({
  page,
  totalPages,
  hasNext,
  onPrevious,
  onNext,
}: {
  page: number;
  totalPages?: number;
  hasNext?: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
      <Button disabled={page === 0} onClick={onPrevious} size="small">Previous</Button>
      <Typography color="text.secondary" variant="body2">
        Page {page + 1}{totalPages ? ` of ${totalPages}` : ''}
      </Typography>
      <Button disabled={hasNext !== true} onClick={onNext} size="small">Next</Button>
    </Stack>
  );
}

export function PlanningWorkspacePage() {
  const { routes, can } = usePermissions();
  const [tab, setTab] = useState<PlanningTab>('periods');
  const [periodPage, setPeriodPage] = useState(0);
  const [planPage, setPlanPage] = useState(0);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>();
  const [selectedPlanId, setSelectedPlanId] = useState<string>();

  const routePermissions = useMemo(() => ({
    periods: permissionForRoute(routes, PERIODS_ROUTE),
    periodDetail: permissionForRoute(routes, PERIOD_DETAIL_ROUTE),
    plans: permissionForRoute(routes, PLANS_ROUTE),
    planDetail: permissionForRoute(routes, PLAN_DETAIL_ROUTE),
  }), [routes]);

  const canReadPeriods = routePermissions.periods ? can(routePermissions.periods) : false;
  const canReadPeriodDetail = routePermissions.periodDetail ? can(routePermissions.periodDetail) : false;
  const canReadPlans = routePermissions.plans ? can(routePermissions.plans) : false;
  const canReadPlanDetail = routePermissions.planDetail ? can(routePermissions.planDetail) : false;

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

  const periods = periodsQuery.data?.content ?? [];
  const plans = plansQuery.data?.content ?? [];

  return (
    <Container maxWidth={false} sx={{ py: 3 }}>
      <Stack spacing={2.5}>
        <Box>
          <Typography component="h1" variant="h4">Planning</Typography>
          <Typography color="text.secondary">
            Read-only planning periods and operational plans from HidraAPI. Planning lifecycle mutations, revision actions,
            workflow approval, and planned-vs-actual comparison remain outside HWEB-010-02.
          </Typography>
        </Box>

        <Alert severity="info">
          HidraAPI owns planning state. This workspace preserves published DTO optionality and uses backend route metadata plus
          principal grants to decide which reads are available.
        </Alert>

        <Tabs
          onChange={(_, value: PlanningTab) => setTab(value)}
          value={tab}
          aria-label="Planning workspace"
        >
          <Tab label="Planning periods" value="periods" />
          <Tab label="Operational plans" value="plans" />
        </Tabs>

        {tab === 'periods' ? (
          <Stack spacing={2}>
            {!routePermissions.periods || !routePermissions.periodDetail ? (
              <Alert severity="warning">Planning period route-permission metadata is unavailable. Access is denied by default.</Alert>
            ) : !canReadPeriods ? (
              <Alert severity="warning">Your current HidraAPI grants do not allow planning-period reads.</Alert>
            ) : periodsQuery.isPending ? (
              <Box sx={{ display: 'grid', minHeight: 160, placeItems: 'center' }}><CircularProgress /></Box>
            ) : periodsQuery.isError ? (
              <Alert severity="error">{errorMessage(periodsQuery.error, 'planning periods')}</Alert>
            ) : (
              <>
                <Paper variant="outlined">
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Code</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Start</TableCell>
                          <TableCell>End</TableCell>
                          <TableCell>Time zone</TableCell>
                          <TableCell align="right">Detail</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {periods.map((period) => (
                          <TableRow hover key={period.id ?? period.code}>
                            <TableCell>{period.code ?? period.id ?? '—'}</TableCell>
                            <TableCell>{preferredName(period)}</TableCell>
                            <TableCell><Chip label={period.status ?? '—'} size="small" variant="outlined" /></TableCell>
                            <TableCell>{valueOrDash(period.periodStart)}</TableCell>
                            <TableCell>{valueOrDash(period.periodEnd)}</TableCell>
                            <TableCell>{valueOrDash(period.timeZone)}</TableCell>
                            <TableCell align="right">
                              <Button
                                disabled={!period.id || !canReadPeriodDetail}
                                onClick={() => setSelectedPeriodId(period.id)}
                                size="small"
                              >
                                Open
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {periods.length === 0 ? (
                          <TableRow><TableCell colSpan={7}>No planning periods returned by HidraAPI.</TableCell></TableRow>
                        ) : null}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
                <PaginationControls
                  hasNext={periodsQuery.data?.hasNext}
                  onNext={() => setPeriodPage((value) => value + 1)}
                  onPrevious={() => setPeriodPage((value) => Math.max(0, value - 1))}
                  page={periodPage}
                  totalPages={periodsQuery.data?.totalPages}
                />
                {periodDetailQuery.isPending && selectedPeriodId ? <CircularProgress size={24} /> : null}
                {periodDetailQuery.isError ? <Alert severity="error">{errorMessage(periodDetailQuery.error, 'planning period detail')}</Alert> : null}
                {periodDetailQuery.data ? (
                  <PlanningPeriodDetail period={periodDetailQuery.data} onClose={() => setSelectedPeriodId(undefined)} />
                ) : null}
              </>
            )}
          </Stack>
        ) : (
          <Stack spacing={2}>
            {!routePermissions.plans || !routePermissions.planDetail ? (
              <Alert severity="warning">Operational-plan route-permission metadata is unavailable. Access is denied by default.</Alert>
            ) : !canReadPlans ? (
              <Alert severity="warning">Your current HidraAPI grants do not allow operational-plan reads.</Alert>
            ) : plansQuery.isPending ? (
              <Box sx={{ display: 'grid', minHeight: 160, placeItems: 'center' }}><CircularProgress /></Box>
            ) : plansQuery.isError ? (
              <Alert severity="error">{errorMessage(plansQuery.error, 'operational plans')}</Alert>
            ) : (
              <>
                <Paper variant="outlined">
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Code</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Planning period</TableCell>
                          <TableCell>Topology scope</TableCell>
                          <TableCell>Updated</TableCell>
                          <TableCell align="right">Detail</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {plans.map((plan) => (
                          <TableRow hover key={plan.id ?? plan.code}>
                            <TableCell>{plan.code ?? plan.id ?? '—'}</TableCell>
                            <TableCell>{preferredName(plan)}</TableCell>
                            <TableCell><Chip label={plan.status ?? '—'} size="small" variant="outlined" /></TableCell>
                            <TableCell>{valueOrDash(plan.periodId)}</TableCell>
                            <TableCell>{plan.topologyScopeNameSnapshot ?? plan.topologyScopeCode ?? plan.topologyScopeId ?? '—'}</TableCell>
                            <TableCell>{valueOrDash(plan.updatedAt)}</TableCell>
                            <TableCell align="right">
                              <Button
                                disabled={!plan.id || !canReadPlanDetail}
                                onClick={() => setSelectedPlanId(plan.id)}
                                size="small"
                              >
                                Open
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {plans.length === 0 ? (
                          <TableRow><TableCell colSpan={7}>No operational plans returned by HidraAPI.</TableCell></TableRow>
                        ) : null}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
                <PaginationControls
                  hasNext={plansQuery.data?.hasNext}
                  onNext={() => setPlanPage((value) => value + 1)}
                  onPrevious={() => setPlanPage((value) => Math.max(0, value - 1))}
                  page={planPage}
                  totalPages={plansQuery.data?.totalPages}
                />
                {planDetailQuery.isPending && selectedPlanId ? <CircularProgress size={24} /> : null}
                {planDetailQuery.isError ? <Alert severity="error">{errorMessage(planDetailQuery.error, 'operational plan detail')}</Alert> : null}
                {planDetailQuery.data ? (
                  <OperationalPlanDetail plan={planDetailQuery.data} onClose={() => setSelectedPlanId(undefined)} />
                ) : null}
              </>
            )}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
