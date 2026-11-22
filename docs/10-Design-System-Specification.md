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

### UXR-04 — browser acceptance correction after Code CI #1058

On the [UXR-04 repair SHA `5db331399cead2af4ac548a8442865c4973057e7`](https://github.com/CHOUABBIA-AMINE/HidraWEB/commit/5db331399cead2af4ac548a8442865c4973057e7), [Code CI #1058](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45023877248) passed lint, TypeScript, 182 unit tests, 6 performance tests, production build/bundle **726.2 KiB / 900 KiB**, and both native PostgreSQL/browser and LOCAL session jobs. Its full Playwright run reported **77 passed, 6 failed, 15 skipped**: the previous keyboard skip-link test expected the obsolete English label in French locale; existing three narrow-width digital twin/network tests still tried to collapse a mobile sidebar that intentionally starts closed; the new desktop RTL test relied on a MUI internal anchor class absent in that build; and the new mobile test looked up the background navbar button by accessible role while the temporary modal correctly excludes the background from the accessibility tree.

The correction updates only Playwright expectations and selectors, not production shell behavior: assert the actual French keyboard skip-link label and unchanged keyboard-activated focus; assert narrow mobile navigation is closed by default while keeping the network and digital twin keyboard and horizontal-overflow assertions; verify the real MUI drawer paper's **rightmost screen coordinate** in Arabic rather than an undocumented generated class; and inspect the navbar toggle's actual `aria-expanded` DOM attribute while its modal is open. Tests continue to check Arabic labels, right-to-left direction, EN restoration, Escape dismissal, route selection, and scope-filtered navigation. This is a test-to-delivered-contract correction; the next exact-SHA run remains mandatory to prove browser acceptance, and no tests or performance gates are skipped or disabled.

## UXR-05 — semantic authenticated shell and failure boundaries (22 November 2026)

The permanent application frame remains the existing MUI/React shell. This stage does **not** implement UXR-06's six-group nesting/three-level sidebar hierarchy, nor UXR-07's deep-link/tab restoration.

| Contract | Source and behavior |
|---|---|
| Landmarks and skip link | `HidraNavbar.tsx` explicitly renders the single localized `header` landmark; `HidraSidebar.tsx` continues rendering one permission-filtered `nav` landmark; `AppShell.tsx` uses a single named focusable `main` landmark around the authorized workspace outlet. Existing skip-to-main keyboard navigation remains. |
| Authentication boundary | `RequireAuthentication.tsx` displays a localized, accessible `status` in a provisional `main` while checking. Anonymous access still redirects to `/login` before protected child rendering. No identity or resource data is rendered in the checking state. |
| Authorization boundary | `PermissionBootstrapBoundary.tsx` keeps the current effective-permission/route/catalog bootstrap before rendering shell content. Pending state announces loading; 403 and unavailable metadata render a generic main landmark with their existing safe response. They do not render the protected navigation/workspace. Backend remains authoritative. |
| Authenticated route-loading boundary | `ShellLoadingFallback.tsx` is the localized Suspense placeholder under both authorization guards. The app's pre-existing lazy authenticated shell remains split from the initial JS bundle; there is no blank silent loader. |
| Protected route error boundary | `ShellRouteError.tsx` is the guarded router `errorElement`; only normalized 403, 404 or generic 503 presentation is displayed, never exception objects, stack traces, response bodies, internal identifiers or authorization scope. A safe overview action remains. The error element is itself wrapped in the authentication and permission bootstrap guards, preventing error routes from bypassing them. |
| Regression coverage | Unit tests exercise generic 403/500 route failure and the accessible loading fallback. Browser tests verify one banner, one main and one allowed navigation landmark, focusable skip link, keyboard routing and lack of protected navigation on denied permission metadata. |
| Localization | FR, EN and AR headings/status labels added to `resources.ts`; the existing locale, RTL and responsive foundation is unchanged. |

**Backend contract:** No new REST endpoint or DTO is introduced. The shell consumes the existing identity principal/grant and security permission metadata contracts through `AuthProvider` and `PermissionProvider`. Server-side authorizations remain mandatory; the frontend shell does not establish new capability or permission grants. `GET /api/v1/identity/me/operation-capabilities` is a roadmap dependency, **not proof of a new UXR-05 client call**.

**Acceptance limit:** Automated tests can show semantic landmarks and safe loading/denial handling for synthetic fixtures but do not qualify all enterprise page routes, user entitlements, physical device accessibility or operations acceptance. Evidence is the exact-SHA Code CI and Documentation Validation; no production/SITE claims.

## UXR-06 — six-group sidebar and bounded nested submenu (22 November 2026)

| Concern | Behavior, source and evidence boundary |
|---|---|
| Registered process hierarchy | `src/shell/navigation/navigationRegistry.ts` retains all six sections: Overview, Operations, Engineering, Intelligence, Work and Administration. New `authorizedNavigationSections` filters entries and optional descendants using the current effective-grant/published-route module intersection. `navigationSectionForPath` identifies only exact registered authorized routes. |
| Accordion behavior | `src/shell/sidebar/HidraSidebar.tsx` displays one expanded group at a time through accessible labelled, keyboard-operable MUI controls with `aria-expanded` and `aria-controls`. No new role-name authorization logic. The collapsed state may leave no group open, but never multiple open. |
| One depth-three example | Under Engineering's existing Integrity & Maintenance, optional text-only `Assets` links to already-present `/engineering/assets`, visible only if `assets` capability is present. It has an independent expand/collapse control and no additional child icon. The owner for subsequent full Assets workflow is UXR-25. No new page or ownership is invented. |
| Width/layout invariants | Desktop `272px` expanded / `72px` collapsed and the prior 44px touch/focus minimum stay in place. UXR-04 mobile temporary drawer and explicit RTL anchors stay unchanged. |
| Acceptance | Unit tests check six sections, no deeper-than-three registry nesting, exact authorized path ancestry and negative assets visibility. Browser tests check one-open-group behavior, keyboard submenu, text-only descendant and collapsed 72px state. Existing Bootstrap, Workflow and authorized native organization browser tests now expand the necessary product group before clicking its visible destination, rather than relying on all five groups permanently open. |

This is a frontend navigation-presentation improvement, **not** evidence that any hidden business endpoint became backend-ready. UI labels and group structure do not disclose protected resource counts or override HidraAPI permission checks. UXR-07 remains the separate stage for back/forward, route/ancestor, tab and scoped-context restoration, and G2 remains open.


## UXR-07 — navigation-history and local view-state contract (22 November 2026)

| UI element | Registered UXR-07 behavior |
|---|---|
| Mobile primary drawer | Existing MUI temporary overlay, toolbar offset and LTR/RTL side. Menu button `aria-expanded` follows open state; Escape/overlay dismissal closes it. Drawer cannot reopen from an old browser history entry because the navigation frame is keyed to the route/principal/scope/grants identity. |
| Desktop accordion | Existing six groups, one open group and no more than three levels. Manual expansion applies to one authorized history entry; a route change/Back/Forward derives the exact current parent and nested submenu only when its module is present in the effective backend grant+published-route set. |
| Page context | Contextual inspector and protected workspace are keyed to the same navigation identity and discard local record selection on route, principal, grant or scope changes; no hidden inspector data is restored automatically. |
| Local view tabs | Alarm `active`/`history`; Analytics `datasets`, `insights`, `metric-definitions`, `metric-evaluations`. Only allowlisted `?tab=` values are recognized, unknowns fall back to the default, and unrelated query coordinates remain intact. Tab state is not treated as authorization. |
| Deep links/fallbacks | Existing guarded login return destination, index redirect to `/overview`, generic 404 and safe return action. Existing backend/page authorization guards continue to decide whether a protected target can reveal data. |
| Invariants | No new REST endpoint, backend readiness claims, sensitive browser persistence, 900 KiB limit changes, altered test retries/skips or unapproved site acceptance. |
