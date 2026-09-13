# HWEB-013-07 — Performance verification

Status: COMPLETE pending final PR merge and exact merge-SHA main CI acceptance.

## Scope

HWEB-013-07 adds frontend regression budgets only. It does not add routes, backend operations, mutations, authorization assumptions, lifecycle actions, or operational source-of-truth ownership.

The performance suite covers the roadmap-required cases:

- chart rendering through the repository's actual ECharts 6.1.0 SVG SSR path with 5,000 points and a 3,000 ms hosted-CI ceiling;
- aggregation of 100,000 representative analytic result records into 100 metric groups with a 1,500 ms ceiling;
- comparison of 40 representative scenarios with 1,500 values each against a baseline with a 1,500 ms ceiling.

These budgets are synthetic frontend CPU/render regression checks. They are not claims about HidraAPI latency, network throughput, end-user browser frame timing, or production SLAs.

## Deterministic verification

```text
Backend source commit / branch : 0c8643c17b2648e8be85c658854f57ea0faab765 / main
Frontend accepted base          : 0b0de291954adce761f829bc5fdf422b99cba025 / main
Product branch                  : hweb-013-07-intelligence-performance
Performance config              : vitest.performance.config.ts
Performance test                : tests/performance/intelligence-performance.perf.ts
Initial CI                      : 34757403985 — FAILED at typecheck before performance stage
Initial failure                 : npm ci omitted one declared dev dependency; @vitejs/plugin-react was unavailable to TypeScript
Dependency lock change          : none
CI reproducibility correction   : npm ci --include=dev --no-audit --no-fund
Corrected product head          : 77d6738ecb2408318d30fb79c5d95cb85920d01a
Corrected full branch CI        : 34758108382 — SUCCESS
Performance stage               : SUCCESS — 3 tests passed, 682 ms total Vitest duration
Unit/component tests            : SUCCESS — 29 tests
Production build                : SUCCESS
E2E                             : SUCCESS — 46 tests
```

The corrected CI installed all 483 declared packages, including the unchanged `@vitejs/plugin-react@6.1.1` dev dependency. No package-lock or dependency-version change was required.

HWEB-013 is accepted only after this documentation-inclusive branch head passes full CI, the PR head is independently verified, the merge is guarded against head movement, and exact merge-SHA `main` CI succeeds.
