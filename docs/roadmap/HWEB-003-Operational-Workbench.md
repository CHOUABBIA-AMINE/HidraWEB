# HWEB-003 — Generic Operational Workbench

```text
Status                 : IN PROGRESS
Frontend branch        : hweb-003-operational-workbench
Frontend base          : HidraWEB main @ 0e75e3443f5170c776c0c4f4fa2fb58c60e36c29
Backend source         : HidraAPI main @ f8853fb17b17ff08baf16c4abdfdc810fcbaf01d
Backend controller     : dz.sh.hidra.platform.workbench.HidraOperationalWorkbenchController
Primary UX rule        : secondary resource inspection only; never replaces specialized process workspaces
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

HidraAPI exposes runtime OpenAPI at `/v3/api-docs`, but the repository does not currently publish a checked-in stable OpenAPI artifact consumable by HidraWEB CI. HWEB-003 therefore adds a narrowly scoped, source-derived OpenAPI snapshot for the verified workbench controller at backend commit `f8853fb...` and feeds that snapshot to Orval. No business entity DTO is handwritten: generic record attributes remain open key/value data exactly as the backend contract defines them.

A future cross-repository OpenAPI artifact pipeline remains a production-hardening concern (HWEB-015-10). The existing full `orval.config.ts` remains pointed at runtime `/v3/api-docs` for complete regeneration when HidraAPI is running.

## Grid implementation decision

The architecture baseline has not frozen MUI X Data Grid versus AG Grid. HWEB-003 therefore implements `WorkbenchDataGrid` behind HidraWeb-owned primitives using MUI Core table/pagination components. This avoids prematurely locking the product to a commercial/grid engine while still providing reusable toolbar, filtering and pagination semantics. A future grid engine can replace the adapter without changing workbench API/state ownership.

## Completion checklist

- [ ] HWEB-003-01 generate/update OpenAPI clients from current HidraAPI.
- [ ] HWEB-003-02 module discovery.
- [ ] HWEB-003-03 resource discovery.
- [ ] HWEB-003-04 paged list/query.
- [ ] HWEB-003-05 detail retrieval.
- [ ] HWEB-003-06 advanced search POST.
- [ ] HWEB-003-07 reusable `OperationalWorkbenchPage`.
- [ ] HWEB-003-08 reusable grid toolbar/filter/pagination primitives.
- [ ] HWEB-003-09 generic detail drawer.
- [ ] HWEB-003-10 secondary-resource UX guardrail.
- [ ] HWEB-003-11 400/403/404/5xx plus empty/loading tests.

## Mandatory completion record

```text
Backend source commit / branch : f8853fb17b17ff08baf16c4abdfdc810fcbaf01d / main
Endpoints and DTOs used         : canonical workbench endpoints + 4 platform records listed above
Permissions used                : 5 derived workbench metadata permissions listed above
Frontend routes created/changed : /workbench (secondary route; no primary sidebar entry)
State ownership                 : TanStack Query = server state; React local state = selectors/search/paging UI; ContextDrawer = inspection surface
Error states                    : 400 / 403 / 404 / 5xx / generic + empty + loading
Tests added                     : pending verification
OpenAPI regeneration status     : source-derived workbench snapshot + Orval generation; full runtime artifact remains HWEB-015-10 gap
Known backend gaps              : no stable checked-in OpenAPI artifact; permission catalog remains metadata-only
CI result                       : pending
```
