import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkflowStartPanel } from './WorkflowStartPanel';
const api = vi.hoisted(() => ({ readWorkflowTarget: vi.fn(), discoverWorkflowDefinitions: vi.fn(), startWorkflowInstance: vi.fn(), createWorkflowTask: vi.fn(), fetchInstance: vi.fn() }));
vi.mock('../api/workflowApi', () => ({ ...api, workflowQueryKeys: { instance: (id: string) => ['instance', id] } }));
vi.mock('@/app/auth/useAuth', () => ({ useAuth: () => ({ session: { principal: { userId: 'current-starter' } } }) }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
const handoff = { targetModule: 'topology', targetTypeId: 'owner-type', workflowPurposeId: 'owner-purpose', targetId: 'owner-digest', targetLocator: 'owner-locator', revisionId: 1, digestFormat: 'owner-version' };
const definition = { targetModule: 'topology', targetTypeId: 'owner-type', workflowPurposeId: 'owner-purpose', id: 'process', version: 3, firstStepId: 'review', nameFr: 'Configured process', assignmentChoices: [{ actorId: 'reviewer', displayName: 'Independent human' }, { actorId: 'current-starter', displayName: 'Must not select self' }] };
function mount(initial = '/work/tasks?companyPartyId=c&installedUnitId=u&linkId=l&revisionId=1') {
  const done = vi.fn();
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><MemoryRouter initialEntries={[initial]}><WorkflowStartPanel onTaskCreated={done} /></MemoryRouter></QueryClientProvider>);
  return done;
}
async function choose(label: string, option: string) { fireEvent.mouseDown(await screen.findByRole('combobox', { name: label })); fireEvent.click(await screen.findByRole('option', { name: option })); }
async function prepare() { fireEvent.click(screen.getByRole('button', { name: 'workflow.start.read' })); await choose('workflow.start.process', 'Configured process · 3'); await choose('workflow.start.reviewer', 'Independent human'); }
afterEach(cleanup);
describe('W4 native contract composition (mocked component regression, not native proof)', () => {
  beforeEach(() => { vi.clearAllMocks(); api.readWorkflowTarget.mockResolvedValue(handoff); api.discoverWorkflowDefinitions.mockResolvedValue([definition]); api.startWorkflowInstance.mockResolvedValue({ id: 'persisted' }); api.createWorkflowTask.mockResolvedValue({ id: 'task' }); api.fetchInstance.mockResolvedValue({ id: 'persisted', definitionId: 'process', definitionVersion: 3, targetId: 'owner-digest' }); });
  it('uses server handoff and discovered version, current actor and independent reviewer', async () => {
    const done = mount(); await prepare();
    expect(api.discoverWorkflowDefinitions).toHaveBeenCalledWith({ targetModule: 'topology', targetTypeId: 'owner-type', workflowPurposeId: 'owner-purpose', targetId: 'owner-digest', targetLocator: 'owner-locator' });
    expect(screen.queryByText('Must not select self')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'workflow.start.begin' }));
    await waitFor(() => expect(api.startWorkflowInstance).toHaveBeenCalledWith({ definitionId: 'process', definitionVersion: 3, workflowPurposeId: 'owner-purpose', targetModule: 'topology', targetTypeId: 'owner-type', targetId: 'owner-digest', targetCodeSnapshot: 'owner-locator', currentStepId: 'review', startedByActorId: 'current-starter' }));
    fireEvent.click(await screen.findByRole('button', { name: 'workflow.start.assign' })); await waitFor(() => expect(done).toHaveBeenCalledWith('task'));
    expect(api.createWorkflowTask).toHaveBeenCalledWith({ instanceId: 'persisted', stepId: 'review', assignedActorId: 'reviewer', taskLabelSnapshot: 'Configured process' });
  });
  it('keeps a persisted instance recoverable after assignment fails and never retries commands', async () => {
    api.createWorkflowTask.mockRejectedValue({ response: { status: 409, data: { detail: 'Changed' } } }); mount(); await prepare(); fireEvent.click(screen.getByRole('button', { name: 'workflow.start.begin' })); fireEvent.click(await screen.findByRole('button', { name: 'workflow.start.assign' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'workflow.start.assign' })).toBeDisabled()); expect(api.startWorkflowInstance).toHaveBeenCalledTimes(1); expect(api.createWorkflowTask).toHaveBeenCalledTimes(1); expect(screen.queryByRole('button', { name: 'workflow.start.begin' })).not.toBeInTheDocument();
  });
  it('resumes server-loaded persisted instance after reload without creating a second instance', async () => {
    mount('/work/tasks?companyPartyId=c&installedUnitId=u&linkId=l&revisionId=1&instanceId=persisted'); await prepare(); fireEvent.click(await screen.findByRole('button', { name: 'workflow.start.assign' })); await waitFor(() => expect(api.createWorkflowTask).toHaveBeenCalledTimes(1)); expect(api.startWorkflowInstance).not.toHaveBeenCalled();
  });
  it('denied or incomplete handoff cannot disclose process choices or start', async () => {
    api.readWorkflowTarget.mockResolvedValue({ ...handoff, targetLocator: undefined }); mount(); fireEvent.click(screen.getByRole('button', { name: 'workflow.start.read' })); await screen.findByRole('alert'); expect(api.discoverWorkflowDefinitions).not.toHaveBeenCalled(); expect(api.startWorkflowInstance).not.toHaveBeenCalled();
  });
});
