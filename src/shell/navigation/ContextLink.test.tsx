import { fireEvent, render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { i18n } from '@/shared/i18n/i18n';
import { ContextLink } from '@/shell/navigation/ContextLink';
import { ContextReturnLink } from '@/shell/navigation/ContextReturnLink';
import { contextReturnState, contextScopeFingerprint } from '@/shell/navigation/contextLinkModel';

const fixture = vi.hoisted(() => ({
  principalId: 'actor-1',
  scope: { scopeId: 7, companyPartyId: 'company-1', principalId: 'actor-1', type: 'PIPELINE_SYSTEM', targetId: 'gz2' },
}));
vi.mock('@/app/auth/useAuth', () => ({
  useAuth: () => ({ status: 'authenticated', session: { principal: { userId: fixture.principalId } } }),
}));
vi.mock('@/shell/model/useShellUiStore', () => ({
  useShellUiStore: (selector: (value: { operationalContext: typeof fixture.scope }) => unknown) =>
    selector({ operationalContext: fixture.scope }),
}));

function Location() {
  const location = useLocation();
  return <output aria-label="location">{location.pathname}{location.search}</output>;
}
function mount(admitted: boolean, ownerIssued: boolean, target: Parameters<typeof ContextLink>[0]['target']) {
  return render(<I18nextProvider i18n={i18n}>
    <MemoryRouter initialEntries={['/network']}>
      <Routes>
        <Route path="/network" element={<>
          <ContextLink target={target} label="Inspect source-issued record" admitted={admitted} ownerIssued={ownerIssued} />
          <Location />
          <ContextReturnLink />
        </>} />
        <Route path="/work/tasks" element={<><Location /><ContextReturnLink /></>} />
      </Routes>
    </MemoryRouter>
  </I18nextProvider>);
}

describe('UXR-16 ContextLink same-principal safe handoff', () => {
  it('only exposes a destination after an explicit owner-issued, admitted link', () => {
    const target = { kind: 'workflow-task' as const, taskId: 'task-1' };
    const view = mount(false, true, target);
    expect(screen.queryByRole('link', { name: 'Inspect source-issued record' })).not.toBeInTheDocument();
    view.unmount();
    const unissued = mount(true, false, target);
    expect(screen.queryByRole('link', { name: 'Inspect source-issued record' })).not.toBeInTheDocument();
    unissued.unmount();
    const valid = mount(true, true, target);
    const link = screen.getByRole('link', { name: 'Inspect source-issued record' });
    expect(link).toHaveAttribute('href', '/work/tasks?taskId=task-1');
    fireEvent.click(link);
    expect(screen.getByRole('status', { name: 'location' })).toHaveTextContent('/work/tasks?taskId=task-1');
    expect(screen.getByRole('link', { name: i18n.t('contextLink.returnToWorkspace') })).toHaveAttribute('href', '/network');
    valid.unmount();
  });

  it('does not render malformed or untrusted target identifiers', () => {
    const view = mount(true, true, { kind: 'regional-feature', layer: 'pipelines', entityId: 'pipelines:foreign' });
    expect(screen.queryByRole('link', { name: 'Inspect source-issued record' })).not.toBeInTheDocument();
    view.unmount();
  });

  it('does not restore an unknown, foreign-principal or foreign-scope return', () => {
    const good = contextReturnState('/network', 'actor-1', contextScopeFingerprint(fixture.scope));
    const bad = { contextReturn: { pathname: '/administration/audit', principalId: 'actor-1',
      scopeFingerprint: contextScopeFingerprint(fixture.scope) } };
    const renderReturn = (state: unknown) => render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={[{ pathname: '/work/tasks', state }]}>
          <ContextReturnLink />
        </MemoryRouter>
      </I18nextProvider>,
    );
    const invalid = renderReturn(bad);
    expect(screen.queryByRole('link', { name: i18n.t('contextLink.returnToWorkspace') })).not.toBeInTheDocument();
    invalid.unmount();
    const granted = renderReturn(good);
    expect(screen.getByRole('link', { name: i18n.t('contextLink.returnToWorkspace') })).toBeInTheDocument();
    granted.unmount();
    const former = fixture.principalId;
    fixture.principalId = 'different-actor';
    const foreign = renderReturn(good);
    expect(screen.queryByRole('link', { name: i18n.t('contextLink.returnToWorkspace') })).not.toBeInTheDocument();
    foreign.unmount();
    fixture.principalId = former;
  });
});
