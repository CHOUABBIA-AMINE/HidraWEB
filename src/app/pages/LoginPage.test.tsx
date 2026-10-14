import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const authentication = vi.hoisted(() => ({
  authenticateCredentials: vi.fn(),
  beginOidcSignIn: vi.fn(),
}));
const language = vi.hoisted(() => ({
  language: 'en',
  resolvedLanguage: 'en',
  changeLanguage: vi.fn(),
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
    i18n: language,
    t: (key: string, options?: { defaultValue?: string }) => ({
      'auth.multi.title': 'Sign in to Hidra',
      'auth.multi.description': 'Choose an authentication method',
      'auth.multi.provider': 'Authentication method',
      'auth.multi.or': 'or',
      'auth.basic.username': 'Username',
      'auth.basic.password': 'Password',
      'auth.basic.submit': 'Sign in',
      'auth.login.showPassword': 'Show password',
      'auth.login.hidePassword': 'Hide password',
      'auth.login.brandTitle': 'Operational intelligence for hydrocarbon transportation.',
      'auth.login.brandDescription': 'One workspace for Hidra.',
      'auth.login.brandFooter': 'Transportation · Operations · Engineering',
      'auth.login.eyebrow': 'SECURE ACCESS',
      'auth.login.providerHint': 'Choose your account',
      'auth.login.environment': 'Environment: dev',
      'auth.login.accessNotice': 'Authorized users only',
    } as Record<string, string>)[key] ?? options?.defaultValue ?? key,
  }),
}));

import { LoginPage } from '@/app/pages/LoginPage';

describe('HidraWEB multi-provider login selection', () => {
  beforeEach(() => {
    authentication.authenticateCredentials.mockReset().mockResolvedValue(undefined);
    authentication.beginOidcSignIn.mockReset().mockResolvedValue(undefined);
    language.changeLanguage.mockReset().mockResolvedValue(undefined);
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

  it('supports keyboard-accessible password visibility without changing its value', () => {
    render(<MemoryRouter initialEntries={['/login']}><LoginPage /></MemoryRouter>);
    const password = screen.getByLabelText(/^Password/);
    fireEvent.change(password, { target: { value: 'private-passphrase' } });
    expect(password).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
    expect(password).toHaveAttribute('type', 'text');
    expect(password).toHaveValue('private-passphrase');
    fireEvent.click(screen.getByRole('button', { name: 'Hide password' }));
    expect(password).toHaveAttribute('type', 'password');
  });

  it('offers language selection without triggering an authentication request', () => {
    render(<MemoryRouter initialEntries={['/login']}><LoginPage /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Français' }));
    expect(language.changeLanguage).toHaveBeenCalledWith('fr');
    expect(authentication.authenticateCredentials).not.toHaveBeenCalled();
    expect(authentication.beginOidcSignIn).not.toHaveBeenCalled();
  });

  it('does not submit an incomplete credentials form', () => {
    render(<MemoryRouter initialEntries={['/login']}><LoginPage /></MemoryRouter>);
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeDisabled();
    expect(authentication.authenticateCredentials).not.toHaveBeenCalled();
  });

  it('starts OIDC enterprise SSO without passing entered credentials', async () => {
    render(<MemoryRouter initialEntries={['/login']}><LoginPage /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Sign in with enterprise identity' }));
    await waitFor(() => expect(authentication.beginOidcSignIn).toHaveBeenCalledWith('/overview'));
    expect(authentication.authenticateCredentials).not.toHaveBeenCalled();
  });
});
