import { Alert, Box, Button, Chip, Container, Divider, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import type { AvailableActionView, TaskView, TimelineEntry } from '@/api/generated/workflow/model';
import { usePermissions } from '@/features/permissions/usePermissions';
import { fetchAvailableActions, fetchInstance, fetchTask, fetchTasks, fetchTimeline, workflowQueryKeys } from '@/features/workflow/api/workflowApi';
import { WORKFLOW_PERMISSIONS } from '@/features/workflow/api/workflowPermissions';

const INBOX_SIZE = 50;

function displayError(error: unknown): string {
  const normalized = normalizeHidraApiError(error);
  return normalized.status === 403 ? 'HidraAPI refused workflow access.' : normalized.message || 'Workflow data could not be loaded.';
}

function TaskSummary({ task, onOpen }: { task: TaskView; onOpen: () => void }) {
  return (
    <TableRow hover>
      <TableCell>{task.taskLabel ?? task.id ?? '—'}</TableCell>
      <TableCell>{task.status ?? '—'}</TableCell>
      <TableCell>{task.priorityId ?? '—'}</TableCell>
      <TableCell>{task.dueAt ?? '—'}</TableCell>
      <TableCell>{task.assignedActorDisplayName ?? task.assignedActorUsername ?? task.assignedRoleCode ?? '—'}</TableCell>
      <TableCell><Button onClick={onOpen} size="small">Open</Button></TableCell>
    </TableRow>
  );
}

function AvailableAction({ action }: { action: AvailableActionView }) {
  const permitted = action.permitted === true;
  return (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
        <Chip color={permitted ? 'success' : 'default'} label={action.decision ?? action.transitionId ?? 'Action'} size="small" variant={permitted ? 'filled' : 'outlined'} />
        <Typography variant="body2">{action.fromStepId ?? '—'} → {action.toStepId ?? '—'}</Typography>
        {action.reasonRequired ? <Chip label="reason required" size="small" variant="outlined" /> : null}
        {action.commentRequired ? <Chip label="comment required" size="small" variant="outlined" /> : null}
      </Stack>
      {action.requiredPermissionCode ? <Typography color="text.secondary" variant="caption">{action.requiredPermissionCode}</Typography> : null}
    </Paper>
  );
}

function TimelineRow({ entry }: { entry: TimelineEntry }) {
  return (
    <TableRow>
      <TableCell>{entry.sequence ?? '—'}</TableCell>
      <TableCell>{entry.occurredAt ?? '—'}</TableCell>
      <TableCell>{entry.actionType ?? entry.decision ?? '—'}</TableCell>
      <TableCell>{entry.actorDisplayName ?? entry.actorId ?? '—'}</TableCell>
      <TableCell>{entry.commentText ?? entry.decisionNote ?? '—'}</TableCell>
    </TableRow>
  );
}

export function WorkflowTasksPage() {
  const { t } = useTranslation();
  const permissions = usePermissions();
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const canTasks = permissions.can(WORKFLOW_PERMISSIONS.tasksRead);
  const canInstances = permissions.can(WORKFLOW_PERMISSIONS.instancesRead);
  const inboxParams = { view: 'assigned', page: 0, size: INBOX_SIZE };

  const tasksQuery = useQuery({ queryKey: workflowQueryKeys.tasks(inboxParams), queryFn: () => fetchTasks(inboxParams), enabled: canTasks });
  const taskQuery = useQuery({ queryKey: workflowQueryKeys.task(selectedTaskId), queryFn: () => fetchTask(selectedTaskId), enabled: canTasks && Boolean(selectedTaskId) });
  const actionsQuery = useQuery({ queryKey: workflowQueryKeys.actions(selectedTaskId), queryFn: () => fetchAvailableActions(selectedTaskId), enabled: canTasks && Boolean(selectedTaskId) });
  const instanceId = taskQuery.data?.instanceId ?? '';
  const instanceQuery = useQuery({ queryKey: workflowQueryKeys.instance(instanceId), queryFn: () => fetchInstance(instanceId), enabled: canInstances && Boolean(instanceId) });
  const timelineQuery = useQuery({ queryKey: workflowQueryKeys.timeline(instanceId), queryFn: () => fetchTimeline(instanceId), enabled: canInstances && Boolean(instanceId) });

  const tasks = tasksQuery.data?.content ?? [];
  const actions = actionsQuery.data ?? [];
  const timeline = timelineQuery.data ?? [];
  const firstError = tasksQuery.error ?? taskQuery.error ?? actionsQuery.error ?? instanceQuery.error ?? timelineQuery.error;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: { xs: 'flex-start', md: 'center' }, flexDirection: { xs: 'column', md: 'row' } }}>
          <Box>
            <Typography color="text.secondary" variant="overline">HWEB-007</Typography>
            <Typography component="h1" variant="h4">{t('workflow.title')}</Typography>
            <Typography color="text.secondary">{t('workflow.subtitle')}</Typography>
          </Box>
          <Chip label="BACKEND-AUTHORITATIVE" variant="outlined" />
        </Box>

        <Alert severity="info">{t('workflow.executionNotice')}</Alert>
        {!canTasks ? <Alert severity="warning">{t('workflow.unavailable')}</Alert> : null}
        {firstError ? <Alert severity="error">{displayError(firstError)}</Alert> : null}

        {canTasks ? (
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: selectedTaskId ? 'minmax(0, 1fr) minmax(360px, 0.8fr)' : '1fr' } }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'center' }}>
                <Box>
                  <Typography component="h2" variant="h6">{t('workflow.inbox')}</Typography>
                  <Typography color="text.secondary" variant="caption">{t('workflow.loaded', { loaded: tasks.length, total: tasksQuery.data?.totalElements ?? tasks.length })}</Typography>
                </Box>
                <Button onClick={() => void tasksQuery.refetch()}>{t('workflow.refresh')}</Button>
              </Box>
              {tasks.length ? (
                <TableContainer sx={{ mt: 1 }}><Table size="small"><TableHead><TableRow><TableCell>{t('workflow.task')}</TableCell><TableCell>{t('workflow.status')}</TableCell><TableCell>{t('workflow.priority')}</TableCell><TableCell>{t('workflow.due')}</TableCell><TableCell>{t('workflow.assignee')}</TableCell><TableCell /></TableRow></TableHead><TableBody>{tasks.map((task, index) => <TaskSummary key={task.id ?? `task-${index}`} task={task} onOpen={() => setSelectedTaskId(task.id ?? '')} />)}</TableBody></Table></TableContainer>
              ) : !tasksQuery.isLoading && !tasksQuery.error ? <Alert severity="info" sx={{ mt: 2 }}>{t('workflow.empty')}</Alert> : null}
            </Paper>

            {selectedTaskId ? (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                    <Typography component="h2" variant="h6">{taskQuery.data?.taskLabel ?? selectedTaskId}</Typography>
                    <Button onClick={() => setSelectedTaskId('')} size="small">{t('workflow.close')}</Button>
                  </Box>
                  {taskQuery.data ? <Stack spacing={0.5}><Typography>{t('workflow.status')}: {taskQuery.data.status ?? '—'}</Typography><Typography>{t('workflow.step')}: {taskQuery.data.stepId ?? '—'}</Typography><Typography>{t('workflow.sla')}: {taskQuery.data.slaStatus ?? '—'}</Typography><Typography>{t('workflow.due')}: {taskQuery.data.dueAt ?? '—'}</Typography></Stack> : null}
                  <Divider />
                  <Box><Typography component="h3" variant="subtitle1">{t('workflow.availableActions')}</Typography><Stack spacing={1} sx={{ mt: 1 }}>{actions.length ? actions.map((action, index) => <AvailableAction action={action} key={action.transitionId ?? `${action.decision ?? 'action'}-${index}`} />) : !actionsQuery.isLoading && !actionsQuery.error ? <Typography color="text.secondary">{t('workflow.noActions')}</Typography> : null}</Stack></Box>
                  {canInstances && instanceId ? <><Divider /><Box><Typography component="h3" variant="subtitle1">{t('workflow.instance')}</Typography>{instanceQuery.data ? <Stack spacing={0.5} sx={{ mt: 1 }}><Typography>{instanceQuery.data.targetLabel ?? instanceQuery.data.targetCode ?? instanceQuery.data.targetId ?? '—'}</Typography><Typography>{t('workflow.status')}: {instanceQuery.data.status ?? '—'}</Typography><Typography>{t('workflow.step')}: {instanceQuery.data.currentStepId ?? '—'}</Typography></Stack> : null}</Box><Box><Typography component="h3" variant="subtitle1">{t('workflow.timeline')}</Typography>{timeline.length ? <TableContainer sx={{ mt: 1 }}><Table size="small"><TableHead><TableRow><TableCell>#</TableCell><TableCell>{t('workflow.when')}</TableCell><TableCell>{t('workflow.action')}</TableCell><TableCell>{t('workflow.actor')}</TableCell><TableCell>{t('workflow.note')}</TableCell></TableRow></TableHead><TableBody>{timeline.map((entry, index) => <TimelineRow entry={entry} key={entry.id ?? `timeline-${index}`} />)}</TableBody></Table></TableContainer> : !timelineQuery.isLoading && !timelineQuery.error ? <Typography color="text.secondary" sx={{ mt: 1 }}>{t('workflow.noTimeline')}</Typography> : null}</Box></> : null}
                </Stack>
              </Paper>
            ) : null}
          </Box>
        ) : null}
      </Stack>
    </Container>
  );
}
