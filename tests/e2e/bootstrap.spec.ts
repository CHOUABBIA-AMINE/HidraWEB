import { expect, test } from '@playwright/test';

test('HWEB-001 application starts on the canonical overview route', async ({ page }) => {
  await page.goto('/overview');
  await expect(page.getByRole('heading', { name: 'HidraWeb' })).toBeVisible();
  await expect(page.getByText('HWEB-001', { exact: true })).toBeVisible();
});
