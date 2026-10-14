import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const authentication = vi.hoisted(() => ({
  authenticateCredentials: vi.fn(),
  beginOidcSignIn: vi.fn(),
}));
vi.mock('@/app/auth/useAuth', () => ({
  useAuth: () => ({
    mode: 'multi',
    credentialProvider: 'LOCAL',
    enabledAuthProviders: ['LOCAL', 'LDAP', 'ACTIVE_DIRECTORY', 'OIDC'],
    status: 'anonymous',
    error: undefined,
    ...authentication,
  }),
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string }) => ({
      'auth.multi.title': 'Sign in to Hidra',
      'auth.multi.description': 'Choose an authentication method',
      'auth.multi.provider': 'Authentication method',
      'auth.multi.or': 'or',
      'auth.basic.username': 'Username',
      'auth.basic.password': 'Password',
      'auth.basic.submit': 'Sign in',
    } as Record<string, string>)[key] ?? options?.defaultValue ?? key,
  }),
}));

import { LoginPage } from '@/app/pages/LoginPage';

describe('HidraWEB multi-provider login selection', () => {
  beforeEach(() => {
    authentication.authenticateCredentials.mockReset().mockResolvedValue(undefined);
    authentication.beginOidcSignIn.mockReset().mockResolvedValue(undefined);
  });
  afterEach(() => cleanup());

  it('dispatches only the explicitly selected directory provider and clears old passwords', async () => {
    render(<MemoryRouter initialEntries={['/login']}><LoginPage /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText(/^Username/), { target: { value: 'operator' } });
    fireEvent.change(screen.getByLabelText(/^Password/), { target: { value: 'old-secret' } });
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Authentication method' }));
    fireEvent.click(screen.getByRole('option', { name: 'LDAP' }));
    expect(screen.getByLabelText(/^Password/)).toHaveValue('');
    fireEvent.change(screen.getByLabelText(/^Password/), { target: { value: 'ldap-secret' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() => expect(authentication.authenticateCredentials).toHaveBeenCalledWith(
      'LDAP', 'operator', 'ldap-secret',
    ));
    expect(authentication.authenticateCredentials).toHaveBeenCalledTimes(1);
  });

  it('starts OIDC enterprise SSO without passing entered credentials', async () => {
    render(<MemoryRouter initialEntries={['/login']}><LoginPage /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Sign in with enterprise identity' }));
    await waitFor(() => expect(authentication.beginOidcSignIn).toHaveBeenCalledWith('/overview'));
    expect(authentication.authenticateCredentials).not.toHaveBeenCalled();
  });
});
