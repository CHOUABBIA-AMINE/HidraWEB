# 10 — Design System Specification

## Design system position

HidraWeb shall use Material UI as implementation base, but the product language shall be Hidra/SONATRACH operational enterprise style.

## Color strategy

- Primary: SONATRACH-inspired operational green.
- Secondary: petroleum/industrial blue-gray.
- Critical: red for emergency/alarm.
- Warning: amber for caution and pending validation.
- Success: green for safe/normal/completed.
- Information: blue for telemetry/status.

## Typography

Use a web-safe enterprise font stack. Recommended: Inter or Roboto for Latin/French; Noto Naskh Arabic or Noto Sans Arabic for Arabic. Numeric telemetry must use tabular figures.

## Spacing

Use 4 px base grid. Operational screens favor density while preserving touch targets for tablets.

## Icons

Use MUI icons mapped by module. Every icon must have an accessible label.

## Tables

- Server-side pagination and sorting.
- Sticky header.
- Column density toggle.
- Saved filters.
- Inline status chips.

## Forms

- Group fields by operational purpose.
- Use validation messages in French/Arabic-ready strings.
- Avoid modal forms for long operational records.

## Dialogs

- Confirmation dialogs for destructive or workflow-critical actions.
- Show affected record, action and consequence.

## Notifications

- Toast for transient success/failure.
- Notification center for persistent operational events.
- Alarm-style banners only for safety/operational criticality.

## Accessibility

- WCAG 2.2 AA target.
- Keyboard navigation for all critical actions.
- High contrast mode for control-room displays.
- Do not rely only on red/green.


## UXR-03 — Implemented theme contract (22 November 2026)

The canonical runtime tokens live in `src/design-system/tokens/industrialTokens.ts`, and the MUI adapter is `src/design-system/theme/theme.ts`. `AppProviders` already applies `hidraTheme` and `CssBaseline`; no independent CSS framework or business-domain color rules are introduced. The seven established `docs/figma/10-Design-System.tokens.json` source colors (primary, secondary, critical, warning, success, info, background) are preserved verbatim.

| Concern | Runtime contract |
|---|---|
| Industrial semantic palette | MUI `primary`, `secondary`, `error` (critical), `warning`, `success` and `info` with explicit white contrast text; foreground, surface, divider and accessible focus are separate tokens. |
| Typography | System-first Latin/Arabic fallback stack; heading hierarchy; numeric `tabular-nums` on body/caption and global baseline. Arabic direction, locale strings and time/unit localization remain UXR-04. |
| Grid / density | Four-pixel theme spacing unit; 40px compact row, 44px minimum action control and 48px comfortable row tokens. Existing workspace-specific layout density may vary. |
| Radius / elevation | 8px controls, 12px cards, explicitly ranked card/raised/overlay shadow tokens. MUI Cards receive a bounded card border/elevation; buttons keep disabled elevation. |
| Focus / motion | 3px solid informational-blue keyboard focus outline with 2px offset; forced-colors outline fallback; reduced-motion transition/animation override. A high-contrast *mode* is a future qualified feature, not claimed by these tokens. |
| Breakpoints | MUI standard names/values: xs 0, sm 600, md 900, lg 1200, xl 1536. Responsive shell adaptations are UXR-04 and beyond. |
| Status integrity | Semantic color does not assert an operational alarm state, confidence, pressure limit or telemetry freshness. Always display meaningful text/icon/units from an authorized source; no API capability change. |

The focused `src/design-system/theme/theme.test.ts` checks source colors, contrast of semantic foreground/background pairs, grid, breakpoints, tabular numerals, minimum action size and focus/elevation definitions. These tests are deterministic design-token checks, not a WCAG 2.2 AA audit or device/browser acceptance. The existing full HidraWEB code CI (including Playwright where available) is the required integration gate.

### UXR-03 CI #1053 performance repair — CSS presentation path

The original UXR-03 commit `6c2c1e86cec7d330593e0921897ad47bba0d97ab` passed static code checks, design-system tests, the F18 session and A1 PostgreSQL native jobs, but **failed** the unchanged HWEB-015-07 initial JavaScript size gate: **902.5 KiB vs 900 KiB** (last preceding green Code CI #1052: **899.4 KiB**). The failure was not a TypeScript, auth, data or numerical-solver failure.

To preserve the approved industrial tokens and semantics without weakening the budget, source colors, breakpoints and typed token contracts remain in `industrialTokens.ts`; MUI `theme.ts` now owns the minimal semantic palette, contrast, base typography and spacing; and static density, focus, card elevation, selected-navigation and reduced-motion declarations live in `src/design-system/theme/industrialTheme.css`. `AppProviders.tsx` imports that stylesheet once for normal and signed app rendering. Tests validate that its values match the typed source tokens. CSS is still shipped and subject to visual/accessibility qualification: its exclusion from the *JavaScript-only* startup budget is not permission to omit presentation behavior.

The Code CI gate retains the original **900 KiB** JavaScript threshold, all 21 OpenAPI compatibility inputs, generated-client checks, test shards and native workflows. A following repair commit is **not yet a passed CI run**; acceptance is conditioned on the new exact-SHA CI.
