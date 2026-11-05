import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const transport = vi.hoisted(() => vi.fn());
vi.mock('@/api/client/hidraHttpClient', () => ({ hidraHttpClient: transport }));
vi.mock('@/features/permissions/usePermissions', () => ({
  usePermissions: () => ({ can: () => true, modules: new Set(['identity', 'organization', 'party']) }),
}));

import { AuthProvider } from '@/app/auth/AuthProvider';
import { RequireAuthentication } from '@/app/auth/RequireAuthentication';
import { authenticationGateway } from '@/app/auth/authenticationGateway';
import { registerAuthorizationHeaderFactory, resolveAuthorizationHeader } from '@/app/auth/authorizationHeaderRegistry';
import { useAuth } from '@/app/auth/useAuth';
import { LoginPage } from '@/app/pages/LoginPage';
import { OrganizationCommandPanel } from '@/features/context/components/OrganizationCommandPanel';
import { PartyAdministrationPage } from '@/features/party/PartyAdministrationPage';
import { i18n } from '@/shared/i18n/i18n';
import { HidraSidebar } from '@/shell/sidebar/HidraSidebar';

function ProtectedShell() {
  const auth = useAuth();
  return <RequireAuthentication>
    <output aria-label="Current synthetic principal">{auth.session?.principal?.username}</output>
    <HidraSidebar collapsed={false} />
    <Outlet />
  </RequireAuthentication>;
}

beforeEach(() => {
  vi.mocked(authenticationGateway.loginLocal).mockClear();
  transport.mockReset().mockImplementation(async ({ url }: { url: string }) => {
    if (url === '/api/v1/identity/me') return { username: 'synthetic-admin', authenticationType: 'LOCAL' };
    if (url === '/api/v1/identity/me/permissions') return ['*'];
    if (url === '/api/v1/party/parties') return { items: [], total: 0 };
    if (url === '/api/v1/party/reference/party-types') return [{ id: 'synthetic-type', code: 'SYNTHETIC' }];
    if (url === '/api/v1/party/reference/party-roles') return [];
    if (url.startsWith('/api/v1/security/permissions/')) return [];
    if (url === '/api/v1/organization/reference/unit-types' || url === '/api/v1/organization/reference/positions') return [];
    if (url === '/api/v1/organization/units' || url === '/api/v1/organization/employees' || url === '/api/v1/identity/users') return { content: [] };
    throw new Error(`Unexpected component fixture route: ${url}`);
  });
});

afterEach(() => {
  cleanup();
  registerAuthorizationHeaderFactory(() => undefined);
});

describe('W1 native journey navigation and localized form selectors', () => {
  it.each(['fr', 'en', 'ar'])('preserves the transient session through sidebar navigation in %s', async locale => {
    await i18n.changeLanguage(locale);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    render(<I18nextProvider i18n={i18n}><QueryClientProvider client={client}><MemoryRouter initialEntries={['/administration/users']}>
      <AuthProvider><Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedShell />}>
          <Route path="/administration/users" element={<h1>{i18n.t('context.identity.title')}</h1>} />
          <Route path="/administration/parties" element={<PartyAdministrationPage />} />
          <Route path="/administration/organization" element={<><h1>{i18n.t('context.organization.title')}</h1><OrganizationCommandPanel /></>} />
        </Route>
      </Routes></AuthProvider>
    </MemoryRouter></QueryClientProvider></I18nextProvider>);

    fireEvent.change(await screen.findByLabelText(/^(Nom d’utilisateur|Username|اسم المستخدم)(?:\s*\*)?$/), { target: { value: 'synthetic-admin' } });
    fireEvent.change(screen.getByLabelText(/^(Mot de passe|Password|كلمة المرور)(?:\s*\*)?$/), { target: { value: 'component-only-secret' } });
    fireEvent.click(screen.getByRole('button', { name: /^(Se connecter|Sign in|تسجيل الدخول)$/ }));
    await screen.findByRole('heading', { level: 1, name: /Identité & accès|Identity & Access|الهوية والوصول/ });
    const header = resolveAuthorizationHeader();
    expect(header).toBe('Bearer hidra-unit-test-jwt');

    fireEvent.click(screen.getByRole('button', { name: /^(Partenaires|Parties|الجهات)$/ }));
    await screen.findByRole('heading', { level: 1, name: /Administration des partenaires|Party administration|إدارة الجهات/ });
    expect(screen.getByRole('button', { name: /^(Partenaires|Parties|الجهات)$/ })).toHaveAttribute('aria-current', 'page');
    const code = screen.getByLabelText(/^(Code|الرمز)(?:\s*\*)?$/);
    expect(code).toBeRequired();
    fireEvent.change(code, { target: { value: 'SYNTHETIC-W1' } });
    expect(code).toHaveValue('SYNTHETIC-W1');
    expect(screen.getByLabelText(/^(Raison sociale|Legal name|الاسم القانوني)/)).toBeRequired();
    expect(screen.getByRole('combobox', { name: /^(Type de partenaire|Party type|نوع الجهة)/ })).toBeInTheDocument();
    // Code and Country code are distinct associated labels, even in French.
    expect(screen.getByLabelText(/^(Code pays|Country code|رمز الدولة)/)).toHaveValue('');
    expect(screen.getByLabelText('Current synthetic principal')).toHaveTextContent('synthetic-admin');
    expect(resolveAuthorizationHeader()).toBe(header);

    fireEvent.click(screen.getByRole('button', { name: /^(Organisation|Organization|التنظيم)$/ }));
    await screen.findByRole('heading', { level: 1, name: /^(Organisation|Organization|التنظيم)$/ });
    expect(screen.getByRole('button', { name: /^(Organisation|Organization|التنظيم)$/ })).toHaveAttribute('aria-current', 'page');
    fireEvent.change(screen.getByLabelText(/^(Matricule|Employee number|رقم الموظف)$/), { target: { value: 'SYNTHETIC-EMP' } });
    fireEvent.change(screen.getByLabelText(/^(Prénom latin|Latin first name|الاسم اللاتيني)$/), { target: { value: 'Synthetic' } });
    fireEvent.change(screen.getByLabelText(/^(Nom latin|Latin last name|اللقب اللاتيني)$/), { target: { value: 'Employee' } });
    expect(screen.getByRole('button', { name: /^(Enregistrer un employé|Register employee|تسجيل موظف)$/ })).toBeEnabled();
    expect(screen.getByLabelText('Current synthetic principal')).toHaveTextContent('synthetic-admin');
    expect(resolveAuthorizationHeader()).toBe(header);
    await waitFor(() => expect(authenticationGateway.loginLocal).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole('button', { name: /^(Se connecter|Sign in|تسجيل الدخول)$/ })).not.toBeInTheDocument();
    client.clear();
  });
});
