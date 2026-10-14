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
    t: (key: string, options?: { defaultValue?: string }) => (
      language.language === 'ar' ? ({
        'auth.multi.title': 'تسجيل الدخول إلى هيدرا',
        'auth.multi.provider': 'طريقة المصادقة',
        'auth.basic.username': 'اسم المستخدم',
        'auth.basic.password': 'كلمة المرور',
        'auth.basic.submit': 'تسجيل الدخول',
        'auth.login.providers.local': 'حساب هيدرا المحلي',
        'auth.login.providers.ldap': 'دليل LDAP',
        'auth.login.providers.activeDirectory': 'الدليل النشط (Active Directory)',
      } as Record<string, string>)[key] : undefined
    ) ?? ({
      'auth.multi.title': 'Sign in to Hidra',
      'auth.multi.description': 'Choose an authentication method',
      'auth.multi.provider': 'Authentication method',
      'auth.multi.or': 'or',
      'auth.basic.username': 'Username',
      'auth.basic.password': 'Password',
      'auth.basic.submit': 'Sign in',
      'auth.login.providers.local': 'Hidra Local',
      'auth.login.providers.ldap': 'LDAP',
      'auth.login.providers.activeDirectory': 'Active Directory',
      'auth.login.showPassword': 'Show entered characters',
      'auth.login.hidePassword': 'Hide entered characters',
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
    language.language = 'en';
    language.resolvedLanguage = 'en';
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

  it('renders Arabic labels from the right and keeps localized provider selection bound to backend codes', async () => {
    language.language = 'ar';
    language.resolvedLanguage = 'ar';
    render(<MemoryRouter initialEntries={['/login']}><LoginPage /></MemoryRouter>);
    const selector = screen.getByRole('combobox', { name: 'طريقة المصادقة' });
    expect(selector.closest('[dir="rtl"]')).toBeInTheDocument();
    expect(screen.getByLabelText(/^اسم المستخدم/).closest('[dir="rtl"]')).toBeInTheDocument();
    expect(screen.getByLabelText(/^كلمة المرور/).closest('[dir="rtl"]')).toBeInTheDocument();
    fireEvent.mouseDown(selector);
    expect(screen.getByRole('option', { name: 'الدليل النشط (Active Directory)' })).toHaveAttribute('dir', 'rtl');
    fireEvent.click(screen.getByRole('option', { name: 'دليل LDAP' }));
    fireEvent.change(screen.getByLabelText(/^اسم المستخدم/), { target: { value: 'operator' } });
    fireEvent.change(screen.getByLabelText(/^كلمة المرور/), { target: { value: 'ldap-secret' } });
    fireEvent.click(screen.getByRole('button', { name: 'تسجيل الدخول' }));
    await waitFor(() => expect(authentication.authenticateCredentials).toHaveBeenCalledWith(
      'LDAP', 'operator', 'ldap-secret',
    ));
  });

  it('supports keyboard-accessible password visibility without changing its value', () => {
    render(<MemoryRouter initialEntries={['/login']}><LoginPage /></MemoryRouter>);
    const password = screen.getByLabelText(/^Password/);
    fireEvent.change(password, { target: { value: 'private-passphrase' } });
    expect(password).toHaveAttribute('type', 'password');
    expect(screen.getByRole('button', { name: 'Show entered characters' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Show entered characters' }));
    expect(password).toHaveAttribute('type', 'text');
    expect(password).toHaveValue('private-passphrase');
    fireEvent.click(screen.getByRole('button', { name: 'Hide entered characters' }));
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
