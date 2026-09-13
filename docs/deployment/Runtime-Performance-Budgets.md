# HidraWEB Runtime Performance Budgets

Status: HWEB-015-08 production-hardening contract

## Scope

HWEB-015-08 adds deterministic hosted-CI performance regression tests for representative high-volume frontend paths: the maximum supported workbench page, large topology feature collections, and large ECharts series. It does not begin HWEB-015-09 Playwright journey expansion and does not change HidraAPI contracts, authorization, business state, or route availability.

## Execution model

The performance suite runs through `npm run test:performance` using `vitest.performance.config.ts` in a Node environment with a single worker. A single worker reduces hosted-runner scheduling noise and keeps the budgets comparable between CI runs.

The suite intentionally avoids browser wall-clock assertions that depend on GPU/WebGL availability or animation timing. Instead it exercises stable production code paths that dominate the relevant work:

- React server rendering of the actual `WorkbenchDataGrid` component;
- topology coordinate scanning through the same `getFeatureCollectionBounds` helper used by the MapLibre adapter before initial fitting;
- ECharts SVG SSR using the repository's production ECharts version.

These tests are regression guards, not end-user latency SLAs.

## Enforced HWEB-015-08 budgets

`tests/performance/production-hardening-performance.perf.ts` enforces:

```text
workbench grid    actual WorkbenchDataGrid, 200 rows, 10 displayed data columns + action column   < 1500 ms
topology map      bounds scan over 25,000 Point/LineString features                               <  500 ms
ECharts           SVG SSR of a 10,000-point operational line series                              < 2000 ms
```

The workbench fixture uses the current supported page-size maximum of 200 rows and a representative 20,000-record server-side result set. The component still renders only the current backend page; this milestone does not invent client-owned bulk data loading.

The topology benchmark uses the Hidra-owned map-domain types and the production bounds path. MapLibre WebGL rendering itself is not timed in hosted Node CI because GPU/WebGL timing is not deterministic there. The adapter remains responsible for rendering the unchanged feature collection after the bounded preprocessing path.

The chart benchmark doubles the earlier HWEB-013 chart stress case from 5,000 to 10,000 points while retaining the same real ECharts SVG SSR engine.

## Calibration evidence

The first valid hosted-CI execution of the new benchmarks measured approximately:

```text
workbench grid    270 ms
25k map bounds     14 ms
10k ECharts        72 ms
```

The frozen budgets deliberately preserve several-times headroom for hosted-runner variability while still detecting large regressions. A future change must not raise a budget only to make CI green; a threshold change requires measured evidence and an explicit architectural reason.

## Regression rule

A change is not HWEB-015-08-safe if it:

- causes one of the frozen performance budgets to fail without an investigated explanation;
- bypasses or removes `npm run test:performance` from the normal CI lifecycle;
- replaces the production-path benchmark with a synthetic implementation that no longer represents the runtime code;
- loads large server result sets into client state merely to satisfy a benchmark;
- changes map/chart semantics, backend truth, permissions, or business rules as part of a performance-only workaround.

HWEB-015-09 remains the next roadmap task and owns full Playwright regression coverage for critical operational journeys.
