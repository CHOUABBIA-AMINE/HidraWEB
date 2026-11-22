import { getContrastRatio } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';

import themeCss from '@/design-system/theme/industrialTheme.css?raw';
import { industrialTokens as tokens } from '@/design-system/tokens/industrialTokens';
import { hidraTheme } from '@/design-system/theme/theme';

describe('UXR-03 / industrial design-system foundation', () => {
  it('preserves approved industrial colors and gives semantic status text accessible contrast', () => {
    expect(hidraTheme.palette.primary.main).toBe('#0B5D3B');
    expect(hidraTheme.palette.secondary.main).toBe('#334155');
    expect(hidraTheme.palette.background.default).toBe('#F8FAFC');

    for (const color of [
      hidraTheme.palette.error,
      hidraTheme.palette.warning,
      hidraTheme.palette.success,
      hidraTheme.palette.info,
    ]) {
      expect(getContrastRatio(color.main, color.contrastText)).toBeGreaterThanOrEqual(4.5);
    }
    expect(getContrastRatio(hidraTheme.palette.text.primary, hidraTheme.palette.background.default))
      .toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(hidraTheme.palette.text.secondary, hidraTheme.palette.background.default))
      .toBeGreaterThanOrEqual(4.5);
  });

  it('applies the four-pixel grid, explicit breakpoints, readable typography and tabular numerals', () => {
    expect(hidraTheme.spacing(1)).toBe('4px');
    expect(hidraTheme.spacing(3)).toBe('12px');
    expect(hidraTheme.breakpoints.values).toEqual(tokens.breakpoints);
    expect(hidraTheme.typography.fontFamily).toContain('Noto Sans Arabic');
    expect(hidraTheme.typography.body1.fontVariantNumeric).toBe('tabular-nums');
    expect(hidraTheme.typography.body2.fontVariantNumeric).toBe('tabular-nums');
  });

  it('applies lightweight CSS for focus, reduced motion, control density and card elevation', () => {
    expect(tokens.density.control).toBeGreaterThanOrEqual(44);
    expect(tokens.focus.width).toBeGreaterThanOrEqual(3);
    expect(hidraTheme.components?.MuiButton?.defaultProps?.disableElevation).toBe(true);

    expect(themeCss).toContain(`--hidra-control-min: ${tokens.density.control}px`);
    expect(themeCss).toContain(`--hidra-focus-color: ${tokens.color.focus}`);
    expect(themeCss).toContain(`--hidra-focus-width: ${tokens.focus.width}px`);
    expect(themeCss).toContain(`--hidra-focus-offset: ${tokens.focus.offset}px`);
    expect(themeCss).toContain(`--hidra-card-radius: ${tokens.radius.card}px`);
    expect(themeCss).toContain(`--hidra-card-shadow: ${tokens.elevation.card}`);
    expect(themeCss).toContain('@media (forced-colors: active)');
    expect(themeCss).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
