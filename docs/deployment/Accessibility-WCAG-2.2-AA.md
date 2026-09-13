# WCAG 2.2 AA Accessibility Audit

HWEB-015-06 audits HidraWEB against WCAG 2.2 AA with emphasis on keyboard-only control-room workflows. The audit applies to the accepted production-hardening architecture and does not change HidraAPI authorization or business contracts.

## Audit baseline

- HidraWEB baseline: `2bd0798ba90a35d868c1438e17176f2d3e1d8fdb`.
- HidraAPI evidence refreshed at task start: `725a451ae4880ccb4f2ec508709241f88cd4aea7`.
- Browser target: Chromium through the repository Playwright configuration.
- Automated evidence uses the existing Vitest, React Testing Library, and Playwright stack. No new accessibility scanner dependency is required for this milestone.

## Audited control-room surfaces

The audit reviewed the application shell and primary navigation, authentication entry points, contextual and destructive-action dialogs, generic workbench tables, topology/map workspaces, alarm, incident, planning, workflow, status/error states, loading states, and operator actions exposed by backend permissions.

The following principles are mandatory across these surfaces:

- all implemented actions remain reachable and operable with a keyboard;
- focus order follows the rendered reading and action order;
- focus is visibly distinguishable through the shared `:focus-visible` treatment;
- the shell exposes a bypass link that moves focus directly to the main landmark;
- the active primary-navigation item exposes `aria-current="page"`;
- modal destructive actions retain MUI focus containment/restoration and initially focus the safe Cancel action;
- dialog titles, descriptions, and confirmation instructions are programmatically associated;
- form controls use visible labels and MUI error/helper associations rather than placeholder-only naming;
- backend-driven disabled/unavailable actions remain disabled rather than becoming keyboard-only hidden behavior;
- errors and status messages use semantic MUI Alert/status patterns and do not depend on color alone;
- identifiers and backend business state remain unchanged and opaque.

## Keyboard-only workflow evidence

Playwright verifies the shell path without mouse or touch input:

1. authenticate using keyboard-operable form controls;
2. focus and activate the “Skip to main content” bypass link;
3. verify focus moves to the main landmark;
4. verify the current navigation item exposes `aria-current="page"`;
5. focus another authorized navigation item;
6. activate it with Enter;
7. verify navigation completes and current-page semantics move with the route.

Existing feature tests continue to cover keyboard-operable buttons, forms, dialogs, tables, and workflow actions through semantic role/name queries.

## Map and non-text visualization policy

The MapLibre canvas is not treated as the sole source of operational truth. The topology workspace renders the same backend feature window as a `TopologyFeatureList` containing ordinary keyboard-operable Inspect buttons. Operators can inspect topology features without interacting with the map. The map remains a named complementary region for spatial visualization.

Charts and other non-text visualizations must preserve a textual/tabular representation of the material operational information when they are used for decision-making. A visualization must not introduce an action that is available only through pointer interaction.

## Tables and large workbenches

The generic workbench uses semantic MUI `Table`, `TableHead`, `TableBody`, `TableRow`, and `TableCell` components. Row inspection uses ordinary buttons, and pagination remains keyboard-operable. Backend resource descriptors and opaque identifiers remain authoritative; accessibility changes do not derive or manufacture business semantics.

## Focus and dialogs

The shared application theme applies a three-pixel `:focus-visible` outline with an offset so keyboard focus is not suppressed by individual components. The application shell main landmark is programmatically focusable for bypass navigation without adding it to normal sequential tab order.

Destructive confirmation dialogs explicitly associate title, description, and confirmation instructions. Initial focus is placed on Cancel, while MUI Dialog continues to provide modal focus containment and restoration.

## WCAG 2.2 AA audit checklist

The milestone specifically checks the applicable AA requirements for keyboard access and traps, bypass blocks and landmarks, focus order and visibility, accessible names/roles/states, form labels and errors, status/error communication, non-color-only meaning, text alternatives for operational visualizations, pointer-independent actions, and target usability.

WCAG 2.2 success criteria that depend on authored content outside HidraWEB (for example third-party enterprise IdP pages) remain owned by those systems. HidraWEB does not claim compliance for external IdP user interfaces that are outside this repository and origin.

## Regression rule

A future HidraWEB change is not accessibility-safe if it removes the main-content bypass, suppresses visible keyboard focus, introduces pointer-only business actions, removes textual access to map/chart information, breaks dialog focus containment/restoration, or obscures the active route from assistive technology.
