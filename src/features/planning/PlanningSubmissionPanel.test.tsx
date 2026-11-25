import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlanningSubmissionPanel } from './PlanningSubmissionPanel';

const f = vi.hoisted(() => ({
  permitted: true, plan: vi.fn(), revision: vi.fn(), period: vi.fn(), targets: vi.fn(), approval: vi.fn(), discover: vi.fn(), submit: vi.fn(),
}));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/app/auth/useAuth', () => ({ useAuth: () => ({ session: { principal: { userId: 'author' } } }) }));
vi.mock('@/features/permissions/usePermissions', () => ({ usePermissions: () => ({
  routes: ['/api/v1/planning/operational-plans/{id}', '/api/v1/planning/revisions/{id}', '/api/v1/planning/periods/{id}', '/api/v1/planning/targets', '/api/v1/planning/revisions/{revisionId}/approval', '/api/v1/workflow/definitions', '/api/v1/planning/revisions/{revisionId}/submit'].map(route => ({ route, methods: [route.endsWith('/submit') ? 'POST' : 'GET'], permission: 'grant' })),
  can: () => f.permitted,
}) }));
vi.mock('@/features/planning/api/planningApi', () => ({
  fetchOperationalPlan: f.plan, fetchPlanRevision: f.revision, fetchPlanningPeriod: f.period,
  fetchPlanTargets: f.targets, fetchPlanningApproval: f.approval, submitPlanningRevision: f.submit, planningQueryKeys: { all: ['planning'] },
}));
vi.mock('@/features/workflow/api/workflowApi', () => ({ discoverWorkflowDefinitions: f.discover }));
const plan = { id: 'plan', periodId: 'period', currentRevisionId: 'rev', status: 'DRAFT', updatedAt: '2026-11-25T00:00:01Z' };
const revision = { id: 'rev', planId: 'plan', status: 'DRAFT', updatedAt: '2026-11-25T00:00:02Z' };
const target = { id: 'target', revisionId: 'rev', status: 'DRAFT', targetTypeId: 'type', targetValue: 0, validFrom: '2026-11-25T00:00:00Z', validTo: '2026-11-26T00:00:00Z', updatedAt: '2026-11-25T00:00:03Z' };
function mount() {
  const retire = vi.fn();
  render(<QueryClientProvider client={new QueryClient()}><PlanningSubmissionPanel plan={plan} revision={revision} onRetire={retire} /></QueryClientProvider>);
  return retire;
}
async function discover() {
  fireEvent.change(screen.getByLabelText('uxr29.targetTypeId'), { target: { value: 'type' } });
  fireEvent.change(screen.getByLabelText('uxr29.purposeId'), { target: { value: 'purpose' } });
  fireEvent.click(screen.getByRole('button', { name: 'uxr29.discover' }));
  fireEvent.mouseDown(await screen.findByLabelText('workflow.start.process'));
  fireEvent.click(await screen.findByText('Definition · 3'));
  fireEvent.mouseDown(screen.getByLabelText('workflow.start.reviewer'));
  expect(screen.queryByRole('option', { name: 'Author' })).not.toBeInTheDocument();
  fireEvent.click(await screen.findByRole('option', { name: 'Independent reviewer' }));
}
describe('UXR-29 explicit Planning submission', () => {
  beforeEach(() => {
    vi.resetAllMocks(); f.permitted = true;
    f.plan.mockResolvedValue(plan); f.revision.mockResolvedValue(revision);
    f.period.mockResolvedValue({ id: 'period', status: 'OPEN' });
    f.targets.mockResolvedValue({ content: [target], page: 0, size: 50, totalElements: 1, hasNext: false });
    f.discover.mockResolvedValue([{ id: 'def', version: 3, nameFr: 'Definition', firstStepId: 'step', targetModule: 'planning', targetTypeId: 'type', workflowPurposeId: 'purpose', assignmentChoices: [{ actorId: 'author', displayName: 'Author' }, { actorId: 'reviewer', displayName: 'Independent reviewer' }] }]);
  });
  it('requires explicit confirmation and checks all persisted owner records after a single submit', async () => {
    mount(); await discover();
    expect(f.discover).toHaveBeenCalledWith({ targetModule: 'planning', targetId: 'rev', targetTypeId: 'type', workflowPurposeId: 'purpose', targetLocator: '' });
    expect(screen.getByRole('button', { name: 'uxr29.submit' })).toBeDisabled();
    expect(f.submit).not.toHaveBeenCalled();
    f.plan.mockResolvedValue({ ...plan, status: 'SUBMITTED', updatedAt: 'plan-new' });
    f.revision.mockResolvedValue({ ...revision, status: 'SUBMITTED', updatedAt: 'rev-new', submittedByActorId: 'author', workflowInstanceId: 'wf' });
    f.approval.mockResolvedValue({ revisionId: 'rev', revisionStatus: 'SUBMITTED', workflowInstanceId: 'wf', currentTaskId: 'task', currentTaskUpdatedAt: 'task-new' });
    f.submit.mockResolvedValue({ revisionId: 'rev', revisionStatus: 'SUBMITTED', planUpdatedAt: 'plan-new', revisionUpdatedAt: 'rev-new', workflowInstanceId: 'wf', workflowTaskId: 'task', workflowTaskUpdatedAt: 'task-new' });
    fireEvent.click(screen.getByRole('checkbox', { name: 'uxr29.confirmSubmit' }));
    fireEvent.click(screen.getByRole('button', { name: 'uxr29.submit' }));
    expect(await screen.findByText('uxr29.submitVerified')).toBeInTheDocument();
    expect(f.submit).toHaveBeenCalledTimes(1);
    expect(f.submit).toHaveBeenCalledWith('rev', { expectedPlanUpdatedAt: plan.updatedAt, expectedRevisionUpdatedAt: revision.updatedAt, definitionId: 'def', definitionVersion: 3, targetTypeId: 'type', workflowPurposeId: 'purpose', reviewerActorId: 'reviewer' });
  });
  it('retires the form on rejected or unconfirmed submit without replay', async () => {
    const retire = mount(); await discover();
    f.submit.mockRejectedValue(new Error('conflict'));
    fireEvent.click(screen.getByRole('checkbox', { name: 'uxr29.confirmSubmit' }));
    fireEvent.click(screen.getByRole('button', { name: 'uxr29.submit' }));
    expect(await screen.findByText('uxr29.submitUnconfirmed')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'uxr29.submit' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'ownerFeedback.review' }));
    expect(retire).toHaveBeenCalledTimes(1);
    expect(f.submit).toHaveBeenCalledTimes(1);
  });
  it('fails closed without the route grant', async () => {
    f.permitted = false; mount();
    expect(screen.getByText('ownerFeedback.denied')).toBeInTheDocument();
    await waitFor(() => expect(f.discover).not.toHaveBeenCalled());
    expect(f.submit).not.toHaveBeenCalled();
  });
});
