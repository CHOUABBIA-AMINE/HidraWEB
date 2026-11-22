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

### UXR-03 production bundle proof repair (Code CI #1055)

[Code CI #1055](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45021057342) passed 178 unit tests, 6 performance tests, lint/typecheck, A1 native PostgreSQL browser and F18 native session jobs; the build failed at the unchanged HWEB-015-07 **900 KiB initial static JS cap**, with **900.2 KiB** measured. This is distinct from the earlier stylesheet test harness error, which is resolved.

To remove redundant startup JavaScript rather than relax a safety/performance gate, the runtime MUI adapter now relies on *verified MUI built-in default breakpoints* (same xs/sm/md/lg/xl numeric values as the typed tokens), *MUI-generated contrast foregrounds* (rechecked at 4.5:1 in theme tests), and the existing `industrialTheme.css` inherited tabular-figure rule (also asserted by tests). The explicitly configured industrial main colors, paper/canvas defaults, readable primary/secondary text, 4px spacing, 8px control radius, Arabic-capable font stack and no-elevation button default remain. The actual CSS remains imported once by `AppProviders`; no unreviewed third-party asset changes.

This is a **source optimization, not yet a successful production build or accessibility audit**. Exact-SHA Code CI must verify the remaining margin and all configured checks. Never widen the 900 KiB limit to declare this gate green.

## UXR-04 — locale, RTL and responsive foundation (22 November 2026)

**Architecture:** The application preserves its React, MUI, i18next and React Router implementation. The existing FR/EN/AR development UI strings and language selector are retained. This implementation is *not* a declaration that all three languages are approved as production locales; their eventual activation remains an owner/product decision per the canonical Technical and Information Architectures.

| Concern | Implementation and boundary |
|---|---|
| Language and reading direction | `src/shared/i18n/i18n.ts` normalizes existing FR/EN/AR locale families, sets `<html lang>` and `<html dir>` on selection. `src/app/providers/LocaleThemeProvider.tsx` selects a direction-aware MUI theme. Existing authorization, context and query providers retain their order. |
| Locale labels | Existing `src/shared/i18n/resources.ts` keys remain authoritative; the main keyboard skip link is now localized in FR, EN and AR. All business enums, ids, permission strings, status codes and API commands remain machine-neutral. |
| Direction-safe shell | `src/shell/AppShell.tsx`, `src/shell/sidebar/HidraSidebar.tsx`, `src/shell/context/ContextualDrawer.tsx` and `src/shell/navbar/HidraNavbar.tsx` use logical spacing and explicit RTL-aware drawer anchors. MUI still supplies focus/accessibility primitives; no unreviewed UI framework is introduced. |
| Responsive navigation | At below `md` (900px), the existing permission-filtered sidebar becomes a temporary overlay drawer controlled by the main navbar toggle; Escape/backdrop, route change and item selection close it. Desktop retains the 272px/72px permanent navigation widths and collapse toggle. Mobile keeps the realtime-offline indicator accessible and reduces less important chrome. |
| Display formatting | `src/shared/i18n/localePresentation.ts` uses `Intl` for FR/EN/AR numeric display and offset-qualified ISO instant display. Workflow task due dates and timeline instants explicitly display in **UTC**, never by inferred local offset. The engineering unit is rendered verbatim and is not converted or relabeled. Display strings must never become API input/decision provenance. This does not claim to localize every existing feature screen. |
| Startup size | The protected `AppShell` is React-lazy behind the existing authenticated router guard with Suspense fallback; authorization is unchanged. This prevents the new shell behavior from silently consuming the already tight **900 KiB initial JS budget**. No bundle budget thresholds or check scripts are changed. |
| Verification | `LocaleThemeProvider.test.tsx`: direction/provider updates; `localePresentation.test.ts`: number/unit/timezone contracts; `tests/e2e/locale-responsive.spec.ts`: existing synthetic permission fixture sign-in, desktop FR/AR/EN, mobile dismissible navigation and RTL side. These tests verify UI behavior, *not* real enterprise locale approval or OT/SITE access. |

**Known limitations and acceptance:** Emotion/MUI third-party component mirroring still needs wider visual/accessibility audit on actual layouts, especially dialogs and forms. Complex business workspaces and all unit/date representations are not exhaustively translated or audited by this foundation stage; business localization needs separate registered work. The production bundle, keyboard, responsive and native integration quality gates are determined by the exact-SHA HidraWEB Code CI outcome.
