import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useSearchParams } from 'react-router';

import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import type { AvailableActionView, TaskView } from '@/api/generated/workflow/model';
import { usePermissions } from '@/features/permissions/usePermissions';
import {
  executeWorkflowTransition,
  fetchAvailableActions,
  fetchInstance,
  fetchTask,
  fetchTasks,
  fetchTimeline,
  workflowQueryKeys,
} from '@/features/workflow/api/workflowApi';
import { WorkflowStartPanel } from './components/WorkflowStartPanel';
import { WORKFLOW_PERMISSIONS } from '@/features/workflow/api/workflowPermissions';
import { workflowInstanceEvidence, workflowTimelineEvidence } from '@/features/workflow/model/workflowEvidence';
import { EvidenceTimeline } from '@/shell/evidence/EvidenceTimeline';
import { StatusWithProvenance } from '@/shell/evidence/StatusWithProvenance';
import type { EvidenceEvent, EvidenceState, StatusEvidence } from '@/shell/evidence/evidenceTypes';
import { formatDisplayInstant } from '@/shared/i18n/localePresentation';
import { ContextLink } from '@/shell/navigation/ContextLink';
import { ContextReturnLink } from '@/shell/navigation/ContextReturnLink';
import { WorkspaceHeading } from '@/shell/workspace/WorkspaceHeading';
import { WorkspaceToolbar } from '@/shell/workspace/WorkspaceToolbar';
import { WorkspaceCanvas, type WorkspaceCanvasState } from '@/shell/workspace/WorkspaceCanvas';

const INBOX_SIZE = 50;

export function workflowErrorMessage(error: unknown): string {
  const normalized = normalizeHidraApiError(error);
  if (normalized.status === 403) return 'HidraAPI refused workflow access.';
  if (normalized.status === 409) return 'The task changed. Refresh the task and available actions before retrying.';
  return normalized.message || 'Workflow data could not be loaded.';
}

function TaskSummary({ task, onOpen, onHandoff }: { task: TaskView; onOpen: () => void; onHandoff: () => void }) {
  const { i18n, t } = useTranslation();
  return (
    <TableRow hover>
      <TableCell>{task.taskLabel ?? task.id ?? '—'}</TableCell>
      <TableCell>{task.status ?? '—'}</TableCell>
      <TableCell>{task.priorityId ?? '—'}</TableCell>
      <TableCell>{formatDisplayInstant(task.dueAt, i18n.language, 'UTC')}</TableCell>
      <TableCell>{task.assignedActorDisplayName ?? task.assignedActorUsername ?? task.assignedRoleCode ?? '—'}</TableCell>
      <TableCell>
        <Stack direction="row" useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Button onClick={onOpen} size="small">Open</Button>
          {task.id ? <ContextLink target={{ kind: 'workflow-task', taskId: task.id }}
            admitted ownerIssued onNavigate={onHandoff} label={t('contextLink.openTask')} /> : null}
        </Stack>
      </TableCell>
    </TableRow>
  );
}

export function WorkflowTasksPage() {
  const { t } = useTranslation();
  const permissions = usePermissions();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  // The URL is the selection coordinate, not a privilege or an owner record.
  // Reading it on every navigation makes Back/Forward and hard reload consistent.
  const selectedTaskId = searchParams.get('taskId')?.trim() ?? '';
  const [actionSelection, setActionSelection] = useState<{ taskId: string; historyKey: string; transitionId: string } | null>(null);
  // A URL/history selection must never inherit an earlier task's selected action.
  const selectedTransitionId = actionSelection?.taskId === selectedTaskId && actionSelection.historyKey === location.key
    ? actionSelection.transitionId : '';
  const [reasonId, setReasonId] = useState('');
  const [commentText, setCommentText] = useState('');
  const [decisionNote, setDecisionNote] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const canTasks = permissions.can(WORKFLOW_PERMISSIONS.tasksRead);
  const canInstances = permissions.can(WORKFLOW_PERMISSIONS.instancesRead);
  const inboxParams = { view: 'assigned', page: 0, size: INBOX_SIZE };

  const tasksQuery = useQuery({ queryKey: workflowQueryKeys.tasks(inboxParams), queryFn: () => fetchTasks(inboxParams), enabled: canTasks });
  const taskQuery = useQuery({ queryKey: workflowQueryKeys.task(selectedTaskId), queryFn: () => fetchTask(selectedTaskId), enabled: canTasks && Boolean(selectedTaskId) });
  // Never disclose another task or its actions through an untrusted deep-link ID.
  const taskMatchesSelection = canTasks && taskQuery.isSuccess && !taskQuery.isFetching &&
    taskQuery.data?.id === selectedTaskId;
  const currentTask = taskMatchesSelection ? taskQuery.data : undefined;
  const actionsQuery = useQuery({ queryKey: workflowQueryKeys.actions(selectedTaskId),
    queryFn: () => fetchAvailableActions(selectedTaskId), enabled: taskMatchesSelection && Boolean(selectedTaskId) });
  const linkedInstanceId = searchParams.get('instanceId')?.trim() ?? '';
  const instanceId = selectedTaskId
    ? (taskQuery.isSuccess && taskQuery.data?.id === selectedTaskId ? taskQuery.data.instanceId ?? '' : '')
    : linkedInstanceId;
  const instanceQuery = useQuery({ queryKey: workflowQueryKeys.instance(instanceId), queryFn: () => fetchInstance(instanceId), enabled: canInstances && Boolean(instanceId) });
  const timelineQuery = useQuery({ queryKey: workflowQueryKeys.timeline(instanceId), queryFn: () => fetchTimeline(instanceId), enabled: canInstances && Boolean(instanceId) });

  const transitionMutation = useMutation({
    mutationFn: async (action: AvailableActionView) => {
      if (!currentTask?.updatedAt || !selectedTaskId || !action.transitionId) throw new Error('Current task version is unavailable.');
      return executeWorkflowTransition(selectedTaskId, action.transitionId, {
        expectedTaskUpdatedAt: currentTask.updatedAt,
        reasonId: reasonId.trim() || undefined,
        commentText: commentText.trim() || undefined,
        decisionNote: decisionNote.trim() || undefined,
      });
    },
    onSuccess: async (result) => {
      setSuccessMessage(`${result.decision ?? ''} · ${result.taskStatus ?? ''}`);
      setActionSelection(null);
      setReasonId('');
      setCommentText('');
      setDecisionNote('');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['hidra', 'workflow', 'tasks'] }),
        queryClient.invalidateQueries({ queryKey: workflowQueryKeys.task(selectedTaskId) }),
        queryClient.invalidateQueries({ queryKey: workflowQueryKeys.actions(selectedTaskId) }),
        instanceId ? queryClient.invalidateQueries({ queryKey: workflowQueryKeys.instance(instanceId) }) : Promise.resolve(),
        instanceId ? queryClient.invalidateQueries({ queryKey: workflowQueryKeys.timeline(instanceId) }) : Promise.resolve(),
      ]);
    },
  });

  const tasks = tasksQuery.data?.content ?? [];
  const actions = taskMatchesSelection && actionsQuery.isSuccess && !actionsQuery.isFetching
    ? actionsQuery.data ?? [] : [];
  const timelineState: EvidenceState<readonly EvidenceEvent[]> = !canInstances
    ? { kind: 'denied' }
    : timelineQuery.isError ? { kind: 'failed' }
      : timelineQuery.isFetching || !timelineQuery.isSuccess ? { kind: 'loading' }
        : { kind: 'ready', value: workflowTimelineEvidence(timelineQuery.data ?? []) };
  const instanceEvidenceState: EvidenceState<StatusEvidence> = !canInstances
    ? { kind: 'denied' }
    : instanceQuery.isError ? { kind: 'failed' }
      : instanceQuery.isFetching || !instanceQuery.isSuccess ? { kind: 'loading' }
        : { kind: 'ready', value: workflowInstanceEvidence(instanceQuery.data) };
  // The register canvas presents the inbox request failure; other owner errors remain independent.
  const firstError = taskQuery.error ?? actionsQuery.error ?? instanceQuery.error ?? timelineQuery.error;
  const inboxCanvasState: WorkspaceCanvasState = !canTasks
    ? { kind: 'unavailable', message: t('workflow.unavailable') }
    : tasksQuery.isFetching
      ? { kind: 'loading', message: t('shell.loadingWorkspace') }
      : tasksQuery.isError
        ? { kind: 'degraded', message: workflowErrorMessage(tasksQuery.error) }
        : tasks.length === 0
          ? { kind: 'empty', message: t('workflow.empty') }
          : { kind: 'ready' };

  const resetTaskControls = () => {
    setActionSelection(null);
    setReasonId('');
    setCommentText('');
    setDecisionNote('');
    setSuccessMessage('');
    transitionMutation.reset();
  };
  const selectTask = (id: string, preserveIssuedInstance = false) => {
    resetTaskControls();
    const next = new URLSearchParams(searchParams);
    if (id) {
      next.set('taskId', id);
      // A new task must derive its instance only from the fresh owner task GET.
      if (!preserveIssuedInstance) next.delete('instanceId');
    } else next.delete('taskId');
    setSearchParams(next);
  };
  const closeTask = () => selectTask('');

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack spacing={2}>
        <WorkspaceHeading
          breadcrumbsLabel={t('shell.workspace')}
          breadcrumbs={[{ label: t('nav.overview'), to: '/overview' }, { label: t('nav.tasks') }]}
          eyebrow="HWEB-007"
          title={t('workflow.title')}
          description={t('workflow.subtitle')}
          accessory={<Chip label="BACKEND-AUTHORITATIVE" variant="outlined" />}
          ownerStatus={currentTask?.status
            ? { label: `${t('workflow.status')}: ${currentTask.status}`, source: 'HidraAPI Workflow' }
            : undefined}
        />
        <ContextReturnLink />
        {canTasks ? (
          <WorkspaceToolbar
            label={t('workflow.inbox')}
            refresh={{
              label: t('workflow.refresh'),
              permitted: canTasks,
              disabled: tasksQuery.isFetching || transitionMutation.isPending,
              onRefresh: () => { void tasksQuery.refetch(); },
            }}
          />
        ) : null}

        {!canTasks ? <Alert severity="warning">{t('workflow.unavailable')}</Alert> : null}
        {firstError ? <Alert severity="error">{workflowErrorMessage(firstError)}</Alert> : null}
        {transitionMutation.error ? <Alert severity="error">{workflowErrorMessage(transitionMutation.error)}</Alert> : null}
        {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}
        {canInstances && linkedInstanceId && !selectedTaskId ? (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1}>
              <Typography color="text.secondary" variant="overline">Cross-surface context</Typography>
              <Typography component="h2" variant="h6">Workflow instance {linkedInstanceId}</Typography>
              {instanceQuery.data ? <><Typography>{instanceQuery.data.targetLabel ?? instanceQuery.data.targetCode ?? instanceQuery.data.targetId ?? '—'}</Typography><Typography>{t('workflow.status')}: {instanceQuery.data.status ?? '—'}</Typography><Typography>{t('workflow.step')}: {instanceQuery.data.currentStepId ?? '—'}</Typography></> : null}
              {timelineState.kind === "ready" ? <Typography color="text.secondary" variant="body2">{timelineState.value.length} timeline entries loaded from HidraAPI.</Typography> : null}
            </Stack>
          </Paper>
        ) : null}

        {permissions.can(WORKFLOW_PERMISSIONS.instancesCreate) && permissions.can(WORKFLOW_PERMISSIONS.tasksCreate) && canInstances ? <WorkflowStartPanel onTaskCreated={id => { selectTask(id, true); void tasksQuery.refetch(); }} /> : null}

        {canTasks ? (
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: selectedTaskId ? 'minmax(0, 1fr) minmax(360px, 0.8fr)' : '1fr' } }}>
            <WorkspaceCanvas label={t('workflow.inbox')} title={t('workflow.inbox')} variant="register" state={inboxCanvasState}>
              <Typography color="text.secondary" variant="caption">{t('workflow.loaded', { loaded: tasks.length, total: tasksQuery.data?.totalElements ?? tasks.length })}</Typography>
              <TableContainer sx={{ mt: 1 }}><Table size="small"><TableHead><TableRow><TableCell>{t('workflow.task')}</TableCell><TableCell>{t('workflow.status')}</TableCell><TableCell>{t('workflow.priority')}</TableCell><TableCell>{t('workflow.due')}</TableCell><TableCell>{t('workflow.assignee')}</TableCell><TableCell /></TableRow></TableHead><TableBody>{tasks.map((task, index) => <TaskSummary key={task.id ?? `task-${index}`} task={task} onOpen={() => selectTask(task.id ?? '')} onHandoff={resetTaskControls} />)}</TableBody></Table></TableContainer>
            </WorkspaceCanvas>

            {selectedTaskId ? (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                    <Typography component="h2" variant="h6">{currentTask?.taskLabel ?? selectedTaskId}</Typography>
                    <Button disabled={transitionMutation.isPending} onClick={closeTask} size="small">{t('workflow.close')}</Button>
                  </Box>
                  {currentTask ? <Stack spacing={0.5}><Typography>{t('workflow.status')}: {currentTask.status ?? '—'}</Typography><Typography>{t('workflow.step')}: {currentTask.stepId ?? '—'}</Typography><Typography>{t('workflow.sla')}: {currentTask.slaStatus ?? '—'}</Typography><Typography>{t('workflow.due')}: {currentTask.dueAt ?? '—'}</Typography></Stack> : null}
                  <Button disabled={transitionMutation.isPending} onClick={async () => { const refreshed = await Promise.all([taskQuery.refetch(), actionsQuery.refetch()]); if (refreshed.every(r => r.status === 'success')) { setActionSelection(null); transitionMutation.reset(); } }}>{t('workflow.refresh')}</Button>
                  <Divider />
                  <Box>
                    <Typography component="h3" variant="subtitle1">{t('workflow.availableActions')}</Typography>
                    <Stack spacing={1} sx={{ mt: 1 }}>
                      {actions.length ? actions.map((action, index) => {
                        const permitted = action.permitted === true && Boolean(action.transitionId);
                        const selected = action.transitionId === selectedTransitionId;
                        return (
                          <Paper key={action.transitionId ?? `${action.decision ?? 'action'}-${index}`} variant="outlined" sx={{ p: 1.5 }}>
                            <Stack spacing={1}>
                              <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                                <Chip color={permitted ? 'success' : 'default'} label={action.decision ?? action.transitionId ?? 'Action'} size="small" variant={permitted ? 'filled' : 'outlined'} />
                                <Typography variant="body2">{action.fromStepId ?? '—'} → {action.toStepId ?? '—'}</Typography>
                                {action.reasonRequired ? <Chip label="reasonId" size="small" variant="outlined" /> : null}
                                {action.commentRequired ? <Chip label="comment" size="small" variant="outlined" /> : null}
                              </Stack>
                              {action.requiredPermissionCode ? <Typography color="text.secondary" variant="caption">{action.requiredPermissionCode}</Typography> : null}
                              {permitted ? <Button disabled={transitionMutation.isPending} onClick={() => { setActionSelection({ taskId: selectedTaskId, historyKey: location.key, transitionId: action.transitionId ?? '' }); setReasonId(''); setCommentText(''); setDecisionNote(''); }} size="small" variant={selected ? 'contained' : 'outlined'}>{action.decision ?? t('workflow.action')}</Button> : null}
                              {selected ? (
                                <Stack spacing={1}>
                                  {action.reasonRequired ? <TextField label="reasonId" onChange={(event) => setReasonId(event.target.value)} required size="small" value={reasonId} /> : null}
                                  {action.commentRequired ? <TextField label="comment" multiline onChange={(event) => setCommentText(event.target.value)} required rows={2} size="small" value={commentText} /> : null}
                                  <TextField label={t('workflow.note')} multiline onChange={(event) => setDecisionNote(event.target.value)} rows={2} size="small" value={decisionNote} />
                                  <Button
                                    disabled={transitionMutation.isPending || transitionMutation.isError || taskQuery.isFetching || actionsQuery.isFetching || Boolean(taskQuery.error) || Boolean(actionsQuery.error) || !taskQuery.data?.updatedAt || (action.reasonRequired === true && !reasonId.trim()) || (action.commentRequired === true && !commentText.trim())}
                                    onClick={() => transitionMutation.mutate(action)}
                                    variant="contained"
                                  >{transitionMutation.isPending ? '…' : `${t('workflow.action')}: ${action.decision ?? ''}`}</Button>
                                </Stack>
                              ) : null}
                            </Stack>
                          </Paper>
                        );
                      }) : taskMatchesSelection && !actionsQuery.isLoading && !actionsQuery.error ? <Typography color="text.secondary">{t('workflow.noActions')}</Typography> : null}
                    </Stack>
                  </Box>
                  {canInstances && instanceId ? <>
                    <Divider />
                    {selectedTaskId && currentTask ? (
                      <ContextLink target={{ kind: 'workflow-instance', instanceId }}
                        admitted ownerIssued onNavigate={resetTaskControls} label={t('contextLink.openInstance')} />
                    ) : null}
                    <Box>
                      {instanceQuery.isSuccess && !instanceQuery.isFetching ? <Typography variant="body2">{instanceQuery.data.targetLabel ?? instanceQuery.data.targetCode ?? instanceQuery.data.targetId ?? '—'}</Typography> : null}
                      <StatusWithProvenance label={t('workflow.instance')} state={instanceEvidenceState} />
                    </Box>
                    <EvidenceTimeline label={t('workflow.timeline')} state={timelineState}
                      workflowTasksAdmitted={canTasks} onWorkflowTaskNavigate={resetTaskControls} />
                  </> : null}
                </Stack>
              </Paper>
            ) : null}
          </Box>
        ) : null}
      </Stack>
    </Container>
  );
}
