# HyFlo network workspace preview

HWEB-F19 demonstrates read-only network navigation using fictional geometry and
versioned synthetic evidence. The demo roles model view filtering. Anyone with
the preview files can inspect the bundled fixtures.

## Run and verify

From the HidraWEB repository root with Node 24 and the repository dependencies:

```bash
npm ci
npx --no-install vite build --config preview/network/vite.config.ts
npx --no-install vite preview --config preview/network/vite.config.ts
```

Open [the standalone preview](http://127.0.0.1:4174/). The build is in
`preview/network/node_modules/.cache/network-preview/`. The workspace uses its own static entry and local
schematic. It requires no sign-in, HidraAPI instance or map service.

Stop the manual server before running the browser tests. From the repository root:

```bash
npx --no-install eslint 'preview/network/*.{ts,tsx}'
npx --no-install tsc -p preview/network/tsconfig.json
npx --no-install playwright install chromium
npx --no-install playwright test --config preview/network/playwright.config.ts
```

The browser suite starts the preview server from the built output. The standard
HidraWEB build and release package use the root `dist/` directory independently.
The F19 workflow records the source SHA, fixture version, build digest and browser
results. To reproduce its digest on Linux from the repository root:

```bash
find preview/network/node_modules/.cache/network-preview -type f -print0 | sort -z | xargs -0 sha256sum | sha256sum
```

## Client walkthrough

1. Start as the scoped operator in GZ2 Reference. Select another station, then
   return to Atlas Compression via the map, the tree and the linked alarm.
   Confirm that the fixture asset, UTC window, technical revision, pressure and
   alarm match for all three paths.
2. Switch to the later UTC window. Atlas pressure shows stale evidence and its
   alarm source is unavailable. West Intake has an empty alarm record for this
   window. Switch to Orion Gas Link and verify the prior station clears before
   selecting Cedar Entry.
3. Try both in-scope roles and then the two denied demo roles. Compare what the
   tree, map, system choices and evidence disclose. Return to an allowed role
   and verify the cleared selection. Reset to restore the initial fixture.
4. Repeat station selection with the keyboard at a narrow viewport.

Record the WEB SHA, build digest, fixture version, review date, reviewer,
observed results and any findings. Client walkthrough acceptance is a separate
decision from passing the browser suite.
