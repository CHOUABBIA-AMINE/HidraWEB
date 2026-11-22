import { getContrastRatio } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';

import { industrialTokens as tokens } from '@/design-system/tokens/industrialTokens';
import { hidraTheme } from '@/design-system/theme/theme';

describe('UXR-03 / industrial design-system foundation', () => {
  it('preserves approved industrial colors and gives semantic status text accessible contrast', () => {
    expect(hidraTheme.palette.primary.main).toBe('#0B5D3B');
    expect(hidraTheme.palette.secondary.main).toBe('#334155');
    expect(hidraTheme.palette.background.default).toBe('#F8FAFC');

    const semanticStatusColors = [
      hidraTheme.palette.error,
      hidraTheme.palette.warning,
      hidraTheme.palette.success,
      hidraTheme.palette.info,
    ];
    for (const color of semanticStatusColors) {
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

  it('defines keyboard focus, reduced-motion support, density and surface elevation', () => {
    expect(tokens.density.control).toBeGreaterThanOrEqual(44);
    expect(tokens.focus.width).toBeGreaterThanOrEqual(3);
    expect(hidraTheme.components?.MuiCssBaseline?.styleOverrides).toBeDefined();
    expect(hidraTheme.components?.MuiButton?.defaultProps?.disableElevation).toBe(true);
    expect(hidraTheme.components?.MuiCard?.styleOverrides?.root).toBeDefined();
    expect(tokens.elevation.card).not.toBe(tokens.elevation.overlay);
  });
});
