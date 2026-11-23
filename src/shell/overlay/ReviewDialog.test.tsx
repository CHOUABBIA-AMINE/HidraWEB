import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { describe, expect, it, vi } from 'vitest';
import { i18n } from '@/shared/i18n/i18n';
import { ReviewDialog } from './ReviewDialog';

const props = {
  open: true, title: 'Delete record', description: 'Review exact owner state.',
  confirmationPhrase: 'DELETE record-1', confirmLabel: 'Delete',
  onCancel: vi.fn(), onConfirm: vi.fn(),
};

// Keep standalone tests aligned with actual EN/FR/AR UI translations.
const withI18n = (children: ReactNode) => <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;

describe('UXR-19 modal confirmation boundary', () => {
  it('requires exact input, accessible description and inline validation', () => {
    const onConfirm = vi.fn();
    const view = render(withI18n(<ReviewDialog {...props} onConfirm={onConfirm} />));
    expect(screen.getByRole('dialog', { name: 'Delete record' })).toHaveAccessibleDescription('Review exact owner state.');
    const confirm = screen.getByRole('button', { name: 'Delete' });
    expect(confirm).toBeDisabled();
    fireEvent.change(screen.getByRole('textbox', { name: 'Confirmation phrase' }), { target: { value: 'DELETE' } });
    expect(confirm).toBeDisabled();
    expect(screen.getByText(/La confirmation ne correspond pas|Confirmation does not match|عبارة التأكيد غير مطابقة/)).toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox', { name: 'Confirmation phrase' }), { target: { value: 'DELETE record-1' } });
    expect(confirm).toBeEnabled();
    fireEvent.click(confirm);
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(confirm).toBeDisabled();
    view.unmount();
  });

  it('removes private review data on denied admission and closing', () => {
    const view = render(withI18n(<ReviewDialog {...props} />));
    fireEvent.change(screen.getByRole('textbox', { name: 'Confirmation phrase' }), { target: { value: 'DELETE record-1' } });
    view.rerender(withI18n(<ReviewDialog {...props} permitted={false} />));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    view.rerender(withI18n(<ReviewDialog {...props} />));
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
    view.rerender(withI18n(<ReviewDialog {...props} open={false} />));
    expect(screen.queryByRole('textbox', { name: 'Confirmation phrase' })).not.toBeInTheDocument();
    view.unmount();
  });

  it('disables both actions while an owner command is pending', () => {
    const onCancel = vi.fn();
    const view = render(withI18n(<ReviewDialog {...props} pending onCancel={onCancel} />));
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /cancel|annuler|إلغاء/i })).toBeDisabled();
    expect(onCancel).not.toHaveBeenCalled();
    view.unmount();
  });
});
