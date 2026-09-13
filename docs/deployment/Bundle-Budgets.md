# HidraWEB Bundle Analysis and Route-Level Lazy Loading

Status: HWEB-015-07 production-hardening contract

## Scope

HWEB-015-07 reduces startup JavaScript by moving implemented application pages behind React Router lazy route modules and adds deterministic production-build budgets. It does not begin HWEB-015-08 large-grid/map/chart runtime performance testing and does not change HidraAPI contracts, permissions, business state, or route availability.

## Accepted baseline

The accepted HWEB-015-06 main build emitted approximately:

```text
index JavaScript        1,198.17 kB minified / 338.84 kB gzip
MapLibre adapter        1,019.02 kB minified / 274.60 kB gzip
MapLibre CSS               82.86 kB minified /  10.71 kB gzip
```

Vite reported chunks above 500 kB and recommended dynamic imports/code splitting. The router at that baseline eagerly imported all implemented feature pages, so route-specific code contributed to startup loading even when an operator never opened those routes.

## Route loading policy

The authenticated shell, authentication guard, permission bootstrap boundary, and router remain part of the startup application boundary. Implemented pages are loaded only when their route is matched through React Router `lazy` route modules.

This includes topology, telemetry/monitoring, alarms, incidents/events, planning, engineering, custody, intelligence, workflow, notification, workbench, administration, login/callback, overview, and not-found page modules.

Route splitting is a delivery optimization only. It must not:

- bypass `RequireAuthentication`;
- bypass `PermissionBootstrapBoundary`;
- change backend-published route descriptors or effective permissions;
- pre-authorize a route before its lazy module is loaded;
- manufacture backend state or business semantics.

## Production bundle manifest

Vite production builds emit `dist/.vite/manifest.json`. The repository uses this deterministic manifest to identify the application entry, its static import graph, and lazy route entries.

The manifest is a build artifact and is not a runtime source of authorization or business truth.

## Enforced budgets

`npm run build` now runs `npm run bundle:check` after the Vite build. The check fails the build when any of these constraints are violated:

```text
initial static JavaScript      <= 900 KiB
individual lazy route chunk    <= 700 KiB
any JavaScript chunk           <= 1100 KiB
lazy route entries             >= 20
```

The initial-static budget is calculated from the manifest entry and its synchronous import graph only. Dynamically imported route code is excluded from that startup budget.

The 900 KiB startup ceiling is calibrated from the HWEB-015-07 split output (869.6 KiB synchronous graph) and remains materially below the pre-split eager bundle. It leaves limited headroom while preventing the route code removed by this milestone from silently returning to startup.

The route-entry count acts as a regression guard: a future refactor that silently restores eager page imports must fail the production build rather than merely emit a warning.

The 1100 KiB absolute chunk ceiling acknowledges the existing MapLibre/ECharts dependency weight while still preventing unconstrained growth. Further runtime stress and large-map/chart behavior remain HWEB-015-08 scope.

## CI and regression rule

The normal CI production-build step executes the budget check, so product-head, roadmap-inclusive, pull-request, and exact-main CI all enforce the same constraints.

A future change is not HWEB-015-07-safe if it makes a page eagerly part of the startup graph without explicit architectural justification, raises a budget merely to make CI green without evidence, disables the manifest/budget check, or merges route splitting with invented backend behavior.
