# HWEB-003 — Generic Operational Workbench

```text
Status                 : COMPLETE — READY FOR REVIEW
Verified on            : 2026-09-11
Frontend branch        : hweb-003-operational-workbench
Frontend base          : HidraWEB main @ 0e75e3443f5170c776c0c4f4fa2fb58c60e36c29
Verified frontend code : e8fecc1c18512bb24c7935cb194882b928b9591e
Backend source         : HidraAPI main @ f8853fb17b17ff08baf16c4abdfdc810fcbaf01d
Backend controller     : dz.sh.hidra.platform.workbench.HidraOperationalWorkbenchController
Primary UX rule        : secondary resource inspection only; never replaces specialized process workspaces
Verified CI run        : 34546156665
```

## Verified backend contract

Canonical routes used by HidraWeb:

- `GET /api/v1/workbench/modules`
- `GET /api/v1/workbench/{module}/resources`
- `GET /api/v1/workbench/{module}/{resource}?page=&size=&q=`
- `GET /api/v1/workbench/{module}/{resource}/{id}`
- `POST /api/v1/workbench/{module}/{resource}/search`

The backend also exposes module-prefixed aliases. HidraWeb intentionally uses only the canonical `/api/v1/workbench/...` shape.

Exact platform records:

- `OperationalResourceDescriptor`
- `OperationalPageResponse`
- `OperationalRecordResponse`
- `OperationalSearchRequest`

Backend paging semantics verified from `HidraOperationalWorkbenchService`:

- default page: `0`
- default size: `50`
- maximum size: `200`
- negative pages normalize to `0`
- unknown exact filter fields are ignored by the current backend
- unknown sort fields are ignored by the current backend
- query text searches the backend-published string fields

## Derived route metadata permissions

These names come from the current `HidraRoutePermissionCatalogService` algorithm, not from frontend invention:

- `HIDRA_MODULES_RESOURCES_READ`
- `HIDRA_DYNAMIC_MODULE_RESOURCES_READ`
- `HIDRA_DYNAMIC_MODULE_DYNAMIC_RESOURCE_READ`
- `HIDRA_DYNAMIC_MODULE_DYNAMIC_RESOURCE_DETAIL`
- `HIDRA_DYNAMIC_MODULE_DYNAMIC_RESOURCE_SEARCH`

The current HidraAPI permission catalog remains metadata-only. HidraWeb uses these as capability hints; HidraAPI remains the final authorization boundary.

## OpenAPI status

HidraAPI exposes runtime OpenAPI at `/v3/api-docs`, but the repository does not currently publish a checked-in stable OpenAPI artifact consumable by HidraWEB CI. HWEB-003 therefore adds a narrowly scoped, source-derived OpenAPI snapshot for the verified workbench controller at backend commit `f8853fb17b17ff08baf16c4abdfdc810fcbaf01d` and feeds that snapshot to Orval. No business entity DTO is handwritten: generic record attributes remain open key/value data exactly as the backend contract defines them.

CI runs `npm run api:generate:workbench` before lint/typecheck/tests/build, proving the HWEB-003 generated client is reproducible from that pinned contract snapshot. The existing full `orval.config.ts` remains pointed at runtime `/v3/api-docs` for complete regeneration when HidraAPI is running.

A future cross-repository OpenAPI artifact pipeline remains a production-hardening concern (HWEB-015-10).

## Grid implementation decision

The architecture baseline has not frozen MUI X Data Grid versus AG Grid. HWEB-003 therefore implements `WorkbenchDataGrid` behind HidraWeb-owned primitives using MUI Core table/pagination components. This avoids prematurely locking the product to a commercial/grid engine while still providing reusable toolbar, filtering and pagination semantics. A future grid engine can replace the adapter without changing workbench API/state ownership.

## UX and security verification notes

- `/workbench` is a secondary authenticated route and is intentionally absent from the primary process sidebar.
- The Overview page exposes the workbench only when HidraAPI publishes the module-discovery capability metadata.
- Development Basic credentials remain memory-only; browser tests enter `/workbench` through SPA navigation rather than a hard reload so the test respects the HWEB-002 security model.
- The contextual drawer is constrained below the fixed 64px application navbar so its header/close control remains interactive.
- Workbench text inputs expose their accessible names on the actual HTML input element through MUI `slotProps.htmlInput`.
- Frontend capability checks are UX hints only. HidraAPI remains authoritative for request authorization and error responses.

## Completion checklist

- [x] HWEB-003-01 generate/update OpenAPI clients from current HidraAPI.
- [x] HWEB-003-02 module discovery.
- [x] HWEB-003-03 resource discovery.
- [x] HWEB-003-04 paged list/query.
- [x] HWEB-003-05 detail retrieval.
- [x] HWEB-003-06 advanced search POST.
- [x] HWEB-003-07 reusable `OperationalWorkbenchPage`.
- [x] HWEB-003-08 reusable grid toolbar/filter/pagination primitives.
- [x] HWEB-003-09 generic detail drawer.
- [x] HWEB-003-10 secondary-resource UX guardrail.
- [x] HWEB-003-11 400/403/404/5xx plus empty/loading tests.

## Verification evidence

Verified CI run `34546156665` on frontend code commit `e8fecc1c18512bb24c7935cb194882b928b9591e`:

```text
npm ci                                  PASS
npm run api:generate:workbench          PASS
npm run lint                            PASS
npm run typecheck                       PASS
npm run test                            PASS — 5 files / 9 tests
npm run build                           PASS
Playwright Chromium install             PASS
npm run test:e2e                        PASS — 6 browser tests
```

The Vite production build still reports the existing non-blocking chunk-size warning (>500 kB). Route-level code splitting/performance budgets remain later hardening work and are not an HWEB-003 exit condition.

## Mandatory completion record

```text
Backend source commit / branch : f8853fb17b17ff08baf16c4abdfdc810fcbaf01d / main
Endpoints and DTOs used         : 5 canonical /api/v1/workbench endpoints + OperationalResourceDescriptor, OperationalPageResponse, OperationalRecordResponse, OperationalSearchRequest
Permissions used                : HIDRA_MODULES_RESOURCES_READ; HIDRA_DYNAMIC_MODULE_RESOURCES_READ; HIDRA_DYNAMIC_MODULE_DYNAMIC_RESOURCE_READ; HIDRA_DYNAMIC_MODULE_DYNAMIC_RESOURCE_DETAIL; HIDRA_DYNAMIC_MODULE_DYNAMIC_RESOURCE_SEARCH
Frontend routes created/changed : /workbench (secondary route; no primary sidebar entry); /overview adds capability-gated secondary entry
State ownership                 : TanStack Query = server state; React local state = module/resource/search/paging UI; ContextDrawer = inspection surface
Error states                    : 400 / 403 / 404 / 5xx / generic + empty + loading
Tests added                     : workbench API POST contract; 400/403/404/500/loading/empty component states; generic page discovery/list/detail component test; Chromium discovery/list/detail/search/403 flows
OpenAPI regeneration status     : PASS — source-derived workbench snapshot pinned to HidraAPI f8853fb... and regenerated by Orval in CI; full runtime artifact pipeline remains HWEB-015-10 gap
Known backend gaps              : no stable checked-in full OpenAPI artifact consumable cross-repository; permission catalog remains metadata-only rather than user-specific entitlement enforcement
CI result                       : PASS — HidraWEB CI run 34546156665 on e8fecc1c18512bb24c7935cb194882b928b9591e
```

## HWEB-003 exit decision

The generic workbench can now discover backend modules/resources, page/query/search generic records, and inspect record details without handwritten business-entity DTO assumptions. HWEB-003 is complete and ready for review. HWEB-004 has not been started.
