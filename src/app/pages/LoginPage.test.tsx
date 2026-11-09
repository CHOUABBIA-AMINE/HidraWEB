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
import { LoginPage } from '@/app/pages/LoginPage';
import { i18n } from '@/shared/i18n/i18n';

describe('HidraWEB multi-provider login selection', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
    authentication.authenticateCredentials.mockReset().mockResolvedValue(undefined);
    authentication.beginOidcSignIn.mockReset().mockResolvedValue(undefined);
  });
  afterEach(() => cleanup());

  it.each([
    ['en', 'Sign in to HyFlo', 'ltr'],
    ['fr', 'Connexion à HyFlo', 'ltr'],
    ['ar', 'تسجيل الدخول إلى HyFlo', 'rtl'],
  ])('shows the supplied HyFlo logo and localized %s branding', async (locale, title, direction) => {
    await i18n.changeLanguage(locale);
    render(<MemoryRouter initialEntries={['/login']}><LoginPage /></MemoryRouter>);

    const logo = screen.getByRole('img', { name: 'HyFlo' });
    expect(logo).toHaveAttribute('src', `${import.meta.env.BASE_URL}brand/hyflo-full.png`);
    expect(logo.closest('[dir]')).toHaveAttribute('dir', direction);
    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    expect(screen.getByText('SONATRACH')).toBeInTheDocument();
  });

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
    await i18n.changeLanguage('ar');
    render(<MemoryRouter initialEntries={['/login']}><LoginPage /></MemoryRouter>);
    const selector = screen.getByRole('combobox', { name: 'طريقة المصادقة' });
    expect(selector.closest('[dir="rtl"]')).toBeInTheDocument();
    expect(screen.getByLabelText(/^(Nom d’utilisateur|Username|اسم المستخدم)(?:\s*\*)?$/).closest('[dir="rtl"]')).toBeInTheDocument();
    expect(screen.getByLabelText(/^(Mot de passe|Password|كلمة المرور)(?:\s*\*)?$/).closest('[dir="rtl"]')).toBeInTheDocument();
    fireEvent.mouseDown(selector);
    expect(screen.getByRole('option', { name: 'الدليل النشط (Active Directory)' })).toHaveAttribute('dir', 'rtl');
    fireEvent.click(screen.getByRole('option', { name: 'دليل LDAP' }));
    fireEvent.change(screen.getByLabelText(/^(Nom d’utilisateur|Username|اسم المستخدم)(?:\s*\*)?$/), { target: { value: 'operator' } });
    fireEvent.change(screen.getByLabelText(/^(Mot de passe|Password|كلمة المرور)(?:\s*\*)?$/), { target: { value: 'ldap-secret' } });
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

  it('offers language selection without triggering an authentication request', async () => {
    render(<MemoryRouter initialEntries={['/login']}><LoginPage /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Français' }));
    expect(await screen.findByRole('heading', { name: 'Connexion à HyFlo' })).toBeInTheDocument();
    expect(authentication.authenticateCredentials).not.toHaveBeenCalled();
    expect(authentication.beginOidcSignIn).not.toHaveBeenCalled();
  });

  it('does not submit an incomplete credentials form', () => {
    render(<MemoryRouter initialEntries={['/login']}><LoginPage /></MemoryRouter>);
    expect(screen.getByLabelText(/^(Nom d’utilisateur|Username|اسم المستخدم)(?:\s*\*)?$/)).toBeRequired();
    expect(screen.getByLabelText(/^(Mot de passe|Password|كلمة المرور)(?:\s*\*)?$/)).toBeRequired();
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
