# Executive Summary

HidraWeb shall be the operational enterprise frontend for HidraAPI at SONATRACH. It must support administrators, operational engineers, control room operators, field supervisors, workflow validators, department managers and executives.

HidraWeb is not a consumer-style dashboard. It is an operational workbench for hydrocarbon transport network awareness, topology visualization, monitoring, leak detection, integrity/risk/HSE decision support, workflow validation and governance.


## HidraAPI evidence used

- Source folder: `/mnt/data/HidraAPI_corrected`
- Modules discovered: **24** — alarm, analytics, assets, audit, configuration, custody, documents, hse, identity, incident, integration, integrity, leakdetection, monitoring, notification, organization, party, planning, reporting, risk, simulation, telemetry, topology, workflow
- REST/API controllers discovered: **30**
- Exposed endpoint mappings discovered by static source inspection: **183**
- REST request DTO records: **93**
- REST response DTO records: **84**
- JPA entity resources available for operational workbench: **464**
- Topology layers currently exposed: **facilities, pipeline-segments, topology-connections, topology-nodes**
- Realtime package evidence: **7** Java files under `dz.sh.hidra.platform.realtime`
- Security evidence: JWT/basic/disabled modes in configuration, plus permission catalog endpoints.

Where an item is not exposed by the current backend, this package states: **Unable to determine from available evidence.**


## Key architecture decision

HidraAPI is the source of truth. HidraWeb shall consume exposed endpoints, DTOs, permissions and realtime contracts; it shall not require backend changes for frontend convenience.

## Implementation readiness

The current backend is **ready with conditions** for frontend governance and initial implementation. It provides controller endpoints, workbench APIs, JWT security, a permission catalog, topology GeoJSON APIs and realtime STOMP/SSE support. The frontend must still treat permission enforcement, workflow state/action specificity, production notification delivery and explicit pipeline-system GIS grouping as conditional.

## Immediate frontend priorities

1. Build the application shell and authentication integration.
2. Generate the route/menu registry from the permission catalog and this package.
3. Build reusable operational workbench pages backed by generic list/detail/search APIs.
4. Build the topology map using the explicit layers currently exposed by HidraAPI.
5. Integrate SSE/STOMP as optional operational event channels.


---

# 01 — HidraWeb Vision Document

## Why HidraWeb exists

HidraWeb exists to transform HidraAPI capabilities into a clear, reliable and efficient operational user experience for SONATRACH users managing oil and gas transportation networks.

## Business objectives

- Provide one operational interface for topology, monitoring, alarms, leak detection, integrity, risk, HSE, workflow, analytics and reporting.
- Reduce navigation depth and training effort for control-room and field users.
- Provide consistent decision-support patterns across modules.
- Support French and Arabic enterprise usage from the start.
- Keep frontend composition aligned with backend contracts.

## Problems solved

- Fragmented operational views across topology, monitoring, risk and incident data.
- Poor discoverability of backend capabilities by frontend teams.
- Inconsistent forms, tables and action patterns across teams.
- Manual frontend assumptions about permissions, DTOs and workflows.

## Success criteria

- 100% of implemented frontend API calls are present in the API catalog.
- No screen is implemented without a source capability, endpoint, or explicit gap note.
- Dynamic menus are derived from permissions and personas.
- Topology map renders supported backend layers and exposes unavailable layers as gaps.
- All operational errors are normalized through the ProblemDetail error contract.

## Non-goals

- HidraWeb shall not redefine HidraAPI DTOs.
- HidraWeb shall not invent workflows, permissions or entities.
- HidraWeb shall not implement a local authentication provider if JWT is issued by an enterprise IdP.

## Relationship with HidraAPI

HidraAPI owns business truth, security contracts, route metadata, topology geometry, notification/realtime contracts and data models. HidraWeb owns presentation, UX composition, query caching, forms, route guards, menu guards and operational feedback.


---

# 02 — Backend–Frontend Contract


## HidraAPI evidence used

- Source folder: `/mnt/data/HidraAPI_corrected`
- Modules discovered: **24** — alarm, analytics, assets, audit, configuration, custody, documents, hse, identity, incident, integration, integrity, leakdetection, monitoring, notification, organization, party, planning, reporting, risk, simulation, telemetry, topology, workflow
- REST/API controllers discovered: **30**
- Exposed endpoint mappings discovered by static source inspection: **183**
- REST request DTO records: **93**
- REST response DTO records: **84**
- JPA entity resources available for operational workbench: **464**
- Topology layers currently exposed: **facilities, pipeline-segments, topology-connections, topology-nodes**
- Realtime package evidence: **7** Java files under `dz.sh.hidra.platform.realtime`
- Security evidence: JWT/basic/disabled modes in configuration, plus permission catalog endpoints.

Where an item is not exposed by the current backend, this package states: **Unable to determine from available evidence.**


## Authentication contract

Backend evidence indicates JWT resource-server support plus basic and disabled modes. HidraWeb shall use bearer token authentication when `hidra.platform.security.authentication-mode=jwt` is active. HidraWeb must not implement a local username/password login against HidraAPI unless a login endpoint is explicitly added. Current login provider details are **Unable to determine from available evidence**.

## Authorization contract

HidraAPI exposes metadata endpoints:

- `GET /api/v1/security/permissions/catalog`
- `GET /api/v1/security/permissions/routes`

The backend service states the catalog is derived and metadata-only; route-specific `@PreAuthorize` evidence is unavailable. Therefore HidraWeb shall use these permissions for route/menu/action guard UX, while treating backend enforcement as a separate security condition.

## API catalog rule

Every Axios client function shall map to one row in `15-API-Catalog.xlsx`. Unknown DTOs shall be documented as `Unable to determine from available evidence`.

## DTO contract rule

REST DTOs must be generated from backend records under `api/rest/request` and `api/rest/response`. HidraWeb shall validate forms with Zod schemas derived from these DTOs, not hand-written business assumptions.

## Error contract

HidraAPI includes global ProblemDetail error handling. HidraWeb shall normalize error display into:

- field errors for forms when evidence exists;
- toast messages for transient errors;
- blocking dialogs for destructive workflow failures;
- audit-visible error references when correlation/request IDs are present.

## Notification contract

HidraAPI evidence includes async notification push and realtime endpoints. HidraWeb shall separate:

- in-app notification center;
- delivery evidence;
- realtime event stream;
- provider delivery status.

## Versioning strategy

All frontend API clients shall include a base path version segment `/api/v1`. Breaking backend changes must produce a contract review before frontend implementation.

## Representative endpoint evidence

|API|Module|Controller|Request DTO|Response DTO|Permission|Enforcement Status|
|---|---|---|---|---|---|---|
|POST /api/v1/alarm/acknowledge-alarm|alarm|SpringAlarmController|AcknowledgeAlarmRequest; CloseAlarmRequest; RaiseAlarmRequest; package-info|AlarmResponse; package-info|HIDRA_ALARM_ACKNOWLEDGE_ALARM_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/alarm/alarms|alarm|SpringAlarmController|AcknowledgeAlarmRequest; CloseAlarmRequest; RaiseAlarmRequest; package-info|AlarmResponse; package-info|HIDRA_ALARM_ALARMS_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/alarm/alarms/acknowledgements|alarm|SpringAlarmController|AcknowledgeAlarmRequest; CloseAlarmRequest; RaiseAlarmRequest; package-info|AlarmResponse; package-info|HIDRA_ALARM_ALARMS_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/alarm/alarms/closures|alarm|SpringAlarmController|AcknowledgeAlarmRequest; CloseAlarmRequest; RaiseAlarmRequest; package-info|AlarmResponse; package-info|HIDRA_ALARM_ALARMS_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|GET /api/v1/alarm/capabilities|alarm|SpringAlarmController|Unable to determine from static route evidence|AlarmResponse; package-info|HIDRA_ALARM_CAPABILITIES_READ|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/alarm/close-alarm|alarm|SpringAlarmController|AcknowledgeAlarmRequest; CloseAlarmRequest; RaiseAlarmRequest; package-info|AlarmResponse; package-info|HIDRA_ALARM_CLOSE_ALARM_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/alarm/raise-alarm|alarm|SpringAlarmController|AcknowledgeAlarmRequest; CloseAlarmRequest; RaiseAlarmRequest; package-info|AlarmResponse; package-info|HIDRA_ALARM_RAISE_ALARM_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|GET /api/v1/analytics/capabilities|analytics|SpringAnalyticsController|Unable to determine from static route evidence|AnalyticsDatasetResponse; AnalyticsInsightResponse; AnalyticsProjectionRunResponse; MetricEvaluationRunResponse; package-info|HIDRA_ANALYTICS_CAPABILITIES_READ|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/analytics/create-analytics-dataset|analytics|SpringAnalyticsController|CreateAnalyticsDatasetRequest; CreateAnalyticsInsightRequest; RunMetricEvaluationRequest; RunProjectionRequest; package-info|AnalyticsDatasetResponse; AnalyticsInsightResponse; AnalyticsProjectionRunResponse; MetricEvaluationRunResponse; package-info|HIDRA_ANALYTICS_CREATE_ANALYTICS_DATASET_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/analytics/create-analytics-insight|analytics|SpringAnalyticsController|CreateAnalyticsDatasetRequest; CreateAnalyticsInsightRequest; RunMetricEvaluationRequest; RunProjectionRequest; package-info|AnalyticsDatasetResponse; AnalyticsInsightResponse; AnalyticsProjectionRunResponse; MetricEvaluationRunResponse; package-info|HIDRA_ANALYTICS_CREATE_ANALYTICS_INSIGHT_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/analytics/datasets|analytics|SpringAnalyticsController|CreateAnalyticsDatasetRequest; CreateAnalyticsInsightRequest; RunMetricEvaluationRequest; RunProjectionRequest; package-info|AnalyticsDatasetResponse; AnalyticsInsightResponse; AnalyticsProjectionRunResponse; MetricEvaluationRunResponse; package-info|HIDRA_ANALYTICS_DATASETS_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/analytics/insights|analytics|SpringAnalyticsController|CreateAnalyticsDatasetRequest; CreateAnalyticsInsightRequest; RunMetricEvaluationRequest; RunProjectionRequest; package-info|AnalyticsDatasetResponse; AnalyticsInsightResponse; AnalyticsProjectionRunResponse; MetricEvaluationRunResponse; package-info|HIDRA_ANALYTICS_INSIGHTS_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/analytics/metrics/evaluations|analytics|SpringAnalyticsController|CreateAnalyticsDatasetRequest; CreateAnalyticsInsightRequest; RunMetricEvaluationRequest; RunProjectionRequest; package-info|AnalyticsDatasetResponse; AnalyticsInsightResponse; AnalyticsProjectionRunResponse; MetricEvaluationRunResponse; package-info|HIDRA_ANALYTICS_METRICS_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/analytics/projections/runs|analytics|SpringAnalyticsController|CreateAnalyticsDatasetRequest; CreateAnalyticsInsightRequest; RunMetricEvaluationRequest; RunProjectionRequest; package-info|AnalyticsDatasetResponse; AnalyticsInsightResponse; AnalyticsProjectionRunResponse; MetricEvaluationRunResponse; package-info|HIDRA_ANALYTICS_PROJECTIONS_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/analytics/run-metric-evaluation|analytics|SpringAnalyticsController|CreateAnalyticsDatasetRequest; CreateAnalyticsInsightRequest; RunMetricEvaluationRequest; RunProjectionRequest; package-info|AnalyticsDatasetResponse; AnalyticsInsightResponse; AnalyticsProjectionRunResponse; MetricEvaluationRunResponse; package-info|HIDRA_ANALYTICS_RUN_METRIC_EVALUATION_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/analytics/run-projection|analytics|SpringAnalyticsController|CreateAnalyticsDatasetRequest; CreateAnalyticsInsightRequest; RunMetricEvaluationRequest; RunProjectionRequest; package-info|AnalyticsDatasetResponse; AnalyticsInsightResponse; AnalyticsProjectionRunResponse; MetricEvaluationRunResponse; package-info|HIDRA_ANALYTICS_RUN_PROJECTION_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/assets/asset-conditions|assets|SpringAssetsController|CreateMaintenanceWorkOrderRequest; RecordAssetConditionRequest; RegisterMaintainableAssetRequest; package-info|AssetConditionResponse; MaintainableAssetResponse; MaintenanceWorkOrderResponse; package-info|HIDRA_ASSETS_ASSET_CONDITIONS_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|GET /api/v1/assets/capabilities|assets|SpringAssetsController|Unable to determine from static route evidence|AssetConditionResponse; MaintainableAssetResponse; MaintenanceWorkOrderResponse; package-info|HIDRA_ASSETS_CAPABILITIES_READ|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/assets/create-maintenance-work-order|assets|SpringAssetsController|CreateMaintenanceWorkOrderRequest; RecordAssetConditionRequest; RegisterMaintainableAssetRequest; package-info|AssetConditionResponse; MaintainableAssetResponse; MaintenanceWorkOrderResponse; package-info|HIDRA_ASSETS_CREATE_MAINTENANCE_WORK_ORDER_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/assets/maintainable-assets|assets|SpringAssetsController|CreateMaintenanceWorkOrderRequest; RecordAssetConditionRequest; RegisterMaintainableAssetRequest; package-info|AssetConditionResponse; MaintainableAssetResponse; MaintenanceWorkOrderResponse; package-info|HIDRA_ASSETS_MAINTAINABLE_ASSETS_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/assets/maintenance-work-orders|assets|SpringAssetsController|CreateMaintenanceWorkOrderRequest; RecordAssetConditionRequest; RegisterMaintainableAssetRequest; package-info|AssetConditionResponse; MaintainableAssetResponse; MaintenanceWorkOrderResponse; package-info|HIDRA_ASSETS_MAINTENANCE_WORK_ORDERS_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/assets/record-asset-condition|assets|SpringAssetsController|CreateMaintenanceWorkOrderRequest; RecordAssetConditionRequest; RegisterMaintainableAssetRequest; package-info|AssetConditionResponse; MaintainableAssetResponse; MaintenanceWorkOrderResponse; package-info|HIDRA_ASSETS_RECORD_ASSET_CONDITION_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/assets/register-maintainable-asset|assets|SpringAssetsController|CreateMaintenanceWorkOrderRequest; RecordAssetConditionRequest; RegisterMaintainableAssetRequest; package-info|AssetConditionResponse; MaintainableAssetResponse; MaintenanceWorkOrderResponse; package-info|HIDRA_ASSETS_REGISTER_MAINTAINABLE_ASSET_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/audit/access-records|audit|SpringAuditController|RecordAuditAccessRequest; RecordAuditEventRequest; RequestAuditExportRequest; package-info|AuditAccessRecordResponse; AuditEventResponse; AuditExportRequestResponse; package-info|HIDRA_AUDIT_ACCESS_RECORDS_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|GET /api/v1/audit/capabilities|audit|SpringAuditController|Unable to determine from static route evidence|AuditAccessRecordResponse; AuditEventResponse; AuditExportRequestResponse; package-info|HIDRA_AUDIT_CAPABILITIES_READ|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/audit/events|audit|SpringAuditController|RecordAuditAccessRequest; RecordAuditEventRequest; RequestAuditExportRequest; package-info|AuditAccessRecordResponse; AuditEventResponse; AuditExportRequestResponse; package-info|HIDRA_AUDIT_EVENTS_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/audit/exports|audit|SpringAuditController|RecordAuditAccessRequest; RecordAuditEventRequest; RequestAuditExportRequest; package-info|AuditAccessRecordResponse; AuditEventResponse; AuditExportRequestResponse; package-info|HIDRA_AUDIT_EXPORTS_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/audit/record-audit-access|audit|SpringAuditController|RecordAuditAccessRequest; RecordAuditEventRequest; RequestAuditExportRequest; package-info|AuditAccessRecordResponse; AuditEventResponse; AuditExportRequestResponse; package-info|HIDRA_AUDIT_RECORD_AUDIT_ACCESS_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/audit/record-audit-event|audit|SpringAuditController|RecordAuditAccessRequest; RecordAuditEventRequest; RequestAuditExportRequest; package-info|AuditAccessRecordResponse; AuditEventResponse; AuditExportRequestResponse; package-info|HIDRA_AUDIT_RECORD_AUDIT_EVENT_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/audit/request-audit-export|audit|SpringAuditController|RecordAuditAccessRequest; RecordAuditEventRequest; RequestAuditExportRequest; package-info|AuditAccessRecordResponse; AuditEventResponse; AuditExportRequestResponse; package-info|HIDRA_AUDIT_REQUEST_AUDIT_EXPORT_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|GET /api/v1/configuration/capabilities|configuration|SpringConfigurationController|Unable to determine from static route evidence|ConfigurationDefinitionResponse; ConfigurationValueResponse; FeatureFlagResponse; package-info|HIDRA_CONFIGURATION_CAPABILITIES_READ|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/configuration/create-configuration-definition|configuration|SpringConfigurationController|CreateConfigurationDefinitionRequest; CreateFeatureFlagRequest; SetConfigurationValueRequest; package-info|ConfigurationDefinitionResponse; ConfigurationValueResponse; FeatureFlagResponse; package-info|HIDRA_CONFIGURATION_CREATE_CONFIGURATION_DEFINITION_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/configuration/create-feature-flag|configuration|SpringConfigurationController|CreateConfigurationDefinitionRequest; CreateFeatureFlagRequest; SetConfigurationValueRequest; package-info|ConfigurationDefinitionResponse; ConfigurationValueResponse; FeatureFlagResponse; package-info|HIDRA_CONFIGURATION_CREATE_FEATURE_FLAG_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/configuration/definitions|configuration|SpringConfigurationController|CreateConfigurationDefinitionRequest; CreateFeatureFlagRequest; SetConfigurationValueRequest; package-info|ConfigurationDefinitionResponse; ConfigurationValueResponse; FeatureFlagResponse; package-info|HIDRA_CONFIGURATION_DEFINITIONS_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/configuration/feature-flags|configuration|SpringConfigurationController|CreateConfigurationDefinitionRequest; CreateFeatureFlagRequest; SetConfigurationValueRequest; package-info|ConfigurationDefinitionResponse; ConfigurationValueResponse; FeatureFlagResponse; package-info|HIDRA_CONFIGURATION_FEATURE_FLAGS_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/configuration/set-configuration-value|configuration|SpringConfigurationController|CreateConfigurationDefinitionRequest; CreateFeatureFlagRequest; SetConfigurationValueRequest; package-info|ConfigurationDefinitionResponse; ConfigurationValueResponse; FeatureFlagResponse; package-info|HIDRA_CONFIGURATION_SET_CONFIGURATION_VALUE_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/configuration/values|configuration|SpringConfigurationController|CreateConfigurationDefinitionRequest; CreateFeatureFlagRequest; SetConfigurationValueRequest; package-info|ConfigurationDefinitionResponse; ConfigurationValueResponse; FeatureFlagResponse; package-info|HIDRA_CONFIGURATION_VALUES_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|GET /api/v1/custody/capabilities|custody|SpringCustodyController|Unable to determine from static route evidence|CustodyDiscrepancyResponse; CustodyMeasurementPeriodResponse; CustodyTransferTicketResponse; package-info|HIDRA_CUSTODY_CAPABILITIES_READ|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/custody/create-transfer-ticket|custody|SpringCustodyController|CreateCustodyTransferTicketRequest; OpenCustodyDiscrepancyRequest; OpenCustodyMeasurementPeriodRequest; package-info|CustodyDiscrepancyResponse; CustodyMeasurementPeriodResponse; CustodyTransferTicketResponse; package-info|HIDRA_CUSTODY_CREATE_TRANSFER_TICKET_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/custody/discrepancies|custody|SpringCustodyController|CreateCustodyTransferTicketRequest; OpenCustodyDiscrepancyRequest; OpenCustodyMeasurementPeriodRequest; package-info|CustodyDiscrepancyResponse; CustodyMeasurementPeriodResponse; CustodyTransferTicketResponse; package-info|HIDRA_CUSTODY_DISCREPANCIES_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|


---

# 03 — Frontend Macro Architecture

## Application shell

HidraWeb shall use a stable enterprise shell:

- Top bar: environment, organization scope, language switcher, user profile, notification center.
- Left navigation: dynamic menu generated from permission catalog and persona rules.
- Main workspace: dashboard/workbench/map/detail/workflow pages.
- Right panel: contextual actions, active filters, realtime events and help.

## Feature modules

One frontend feature folder shall exist per HidraAPI module:

`alarm`, `analytics`, `assets`, `audit`, `configuration`, `custody`, `documents`, `hse`, `identity`, `incident`, `integration`, `integrity`, `leakdetection`, `monitoring`, `notification`, `organization`, `party`, `planning`, `reporting`, `risk`, `simulation`, `telemetry`, `topology`, `workflow`

Each feature module may contain screens, API clients, query hooks, mappers, Zod schemas, page components and route registrations. Shared components must remain generic and business-free.

## Navigation structure

Use four top-level groups: Foundation, Operations, Decision Support, Governance and Administration. Menu visibility is driven by role/persona and derived permissions.

## Routing strategy

React Router shall own routes. Route objects must include:

- path;
- page component;
- required permissions;
- breadcrumb metadata;
- module owner;
- query prefetch strategy.

## State ownership

- Server state: TanStack Query.
- Session/security state: Auth provider + small context.
- UI state: local state or route/search params.
- Forms: React Hook Form + Zod.
- Realtime state: event adapters feeding query invalidation and notification center.

## Topology capabilities

Topology shall use Leaflet or a compatible enterprise GIS library with layer control, GeoJSON rendering, popups, feature search, filters and realtime overlays.

## Notification architecture

Notifications are consumed from REST workbench data, `/api/v1/realtime/sse`, and STOMP topics when enabled. UI must be resilient when realtime is unavailable.


---

# 04 — Frontend Micro Architecture

## Folder structure

```text
src/
  app/
    App.tsx
    router/
    providers/
    layout/
  features/
    topology/
      api/
      queries/
      pages/
      components/
      forms/
      schemas/
      routes.ts
    monitoring/
    ... one folder per HidraAPI module ...
  shared/
    api/
    auth/
    components/
    errors/
    i18n/
    realtime/
    theme/
    utils/
```

## Naming conventions

- Pages: `TopologyMapPage`, `RiskWorkbenchPage`.
- Components: noun-based, no `Base` dumping ground.
- Hooks: `useTopologyLayersQuery`, `useSearchOperationalResourceMutation`.
- API clients: `topologyApi.getMapLayers`, `workbenchApi.searchResource`.
- Schemas: `CreateLeakCandidateSchema`.

## API service conventions

- Use Axios instance with JWT interceptor.
- No component may call Axios directly.
- Every client method references one API catalog row.
- Server error payloads are normalized to a shared `HidraApiError`.

## Query conventions

- Query keys must include module, resource, filters and organization scope.
- Mutations must invalidate affected resource keys.
- Realtime events may invalidate queries by module/resource.

## Form conventions

- React Hook Form + Zod only.
- Request DTOs drive form models.
- Undefined backend field semantics must remain marked as unknown.

## Error handling conventions

- 401/403: auth/session guard.
- 404: not-found workbench/detail state.
- 409/422: form/workflow decision error.
- 5xx: operational error banner with retry.


---

# 05 — Page Inventory

The complete machine-readable page inventory is available in `spreadsheets/05-Page-Inventory.xlsx`.

## Page catalog excerpt

|route|page|module|purpose|personas|permissions|apis|
|---|---|---|---|---|---|---|
|/login|Login|security|Authenticate through the configured enterprise identity provider or JWT acquisition flow. HidraAPI exposes resource-server JWT validation but no local login endpoint.|All users|External IdP / no HidraAPI login permission evidence|Unable to determine from available evidence. JWT resource-server mode is backend evidence; frontend login is IdP-driven.|
|/dashboard|Operational Command Dashboard|monitoring|Provide operational situation awareness across alarms, monitoring, topology, leaks, risk and notifications.|Control Room Operators; Operational Engineers; Managers; Executives|Derived from module read permissions and authenticated user session|GET /api/v1/workbench/modules; GET /api/v1/realtime/capabilities; GET /api/v1/realtime/sse|
|/security/permissions|Permission Catalog|security|Expose backend-derived route permission metadata for frontend guards and menu visibility.|Administrators|HIDRA_SECURITY_PERMISSIONS_READ|GET /api/v1/security/permissions/catalog; GET /api/v1/security/permissions/routes|
|/realtime|Realtime Monitor|realtime|Monitor SSE/STOMP connectivity and backend realtime capabilities.|Administrators; Control Room Operators|HIDRA_REALTIME_CAPABILITIES_READ|GET /api/v1/realtime/capabilities; GET /api/v1/realtime/sse; WS /api/v1/realtime/ws|
|/topology/map|Topology GIS Map|topology|Visualize topology map layers, GeoJSON features, facilities, nodes, pipeline segments and connections.|Operational Engineers; Control Room Operators; Field Supervisors|HIDRA_TOPOLOGY_MAP_READ|GET /api/v1/topology/map/layers; GET /api/v1/topology/map/geojson; GET /api/v1/topology/map/search|
|/alarm|Alarm Workbench|alarm|Alarm lifecycle, escalation, acknowledgement and closure evidence.|Control Room Operators; Field Supervisors|HIDRA_ALARM_*_READ / HIDRA_ALARM_*_EXECUTE derived from permission catalog|GET /api/v1/alarm/capabilities; GET /api/v1/alarm/workbench/resources; GET /api/v1/alarm/workbench/{resource}; POST /api/v1/alarm/workbench/{resource}/search|
|/analytics|Analytics Workbench|analytics|Operational KPIs, insights, projections and digital twin readiness.|Department Managers; Executives; Operational Engineers|HIDRA_ANALYTICS_*_READ / HIDRA_ANALYTICS_*_EXECUTE derived from permission catalog|GET /api/v1/analytics/capabilities; GET /api/v1/analytics/workbench/resources; GET /api/v1/analytics/workbench/{resource}; POST /api/v1/analytics/workbench/{resource}/search|
|/assets|Assets Workbench|assets|Maintainable asset registry, lifecycle and maintenance context.|Operational Engineers; Field Supervisors|HIDRA_ASSETS_*_READ / HIDRA_ASSETS_*_EXECUTE derived from permission catalog|GET /api/v1/assets/capabilities; GET /api/v1/assets/workbench/resources; GET /api/v1/assets/workbench/{resource}; POST /api/v1/assets/workbench/{resource}/search|
|/audit|Audit Workbench|audit|Audit evidence, access records and event traceability.|Administrators; Department Managers|HIDRA_AUDIT_*_READ / HIDRA_AUDIT_*_EXECUTE derived from permission catalog|GET /api/v1/audit/capabilities; GET /api/v1/audit/workbench/resources; GET /api/v1/audit/workbench/{resource}; POST /api/v1/audit/workbench/{resource}/search|
|/configuration|Configuration Workbench|configuration|Configuration values, change requests, snapshots and deployment.|Administrators|HIDRA_CONFIGURATION_*_READ / HIDRA_CONFIGURATION_*_EXECUTE derived from permission catalog|GET /api/v1/configuration/capabilities; GET /api/v1/configuration/workbench/resources; GET /api/v1/configuration/workbench/{resource}; POST /api/v1/configuration/workbench/{resource}/search|
|/custody|Custody Workbench|custody|Custody periods, tickets, discrepancies and transfer approvals.|Operational Engineers; Department Managers|HIDRA_CUSTODY_*_READ / HIDRA_CUSTODY_*_EXECUTE derived from permission catalog|GET /api/v1/custody/capabilities; GET /api/v1/custody/workbench/resources; GET /api/v1/custody/workbench/{resource}; POST /api/v1/custody/workbench/{resource}/search|
|/documents|Documents Workbench|documents|Document registration, versions, linking and archive support.|Operational Engineers; Workflow Validators|HIDRA_DOCUMENTS_*_READ / HIDRA_DOCUMENTS_*_EXECUTE derived from permission catalog|GET /api/v1/documents/capabilities; GET /api/v1/documents/workbench/resources; GET /api/v1/documents/workbench/{resource}; POST /api/v1/documents/workbench/{resource}/search|
|/hse|Hse Workbench|hse|Health, safety and environmental events, CAPA and compliance visibility.|Field Supervisors; Department Managers; Executives|HIDRA_HSE_*_READ / HIDRA_HSE_*_EXECUTE derived from permission catalog|GET /api/v1/hse/capabilities; GET /api/v1/hse/workbench/resources; GET /api/v1/hse/workbench/{resource}; POST /api/v1/hse/workbench/{resource}/search|
|/identity|Identity Workbench|identity|Users, roles, delegated authorization and permission evaluation.|Administrators|HIDRA_IDENTITY_*_READ / HIDRA_IDENTITY_*_EXECUTE derived from permission catalog|GET /api/v1/identity/capabilities; GET /api/v1/identity/workbench/resources; GET /api/v1/identity/workbench/{resource}; POST /api/v1/identity/workbench/{resource}/search|
|/incident|Incident Workbench|incident|Incident records and response coordination.|Field Supervisors; Workflow Validators; Department Managers|HIDRA_INCIDENT_*_READ / HIDRA_INCIDENT_*_EXECUTE derived from permission catalog|GET /api/v1/incident/capabilities; GET /api/v1/incident/workbench/resources; GET /api/v1/incident/workbench/{resource}; POST /api/v1/incident/workbench/{resource}/search|
|/integration|Integration Workbench|integration|Integration endpoints, external systems and data exchange governance.|Administrators|HIDRA_INTEGRATION_*_READ / HIDRA_INTEGRATION_*_EXECUTE derived from permission catalog|GET /api/v1/integration/capabilities; GET /api/v1/integration/workbench/resources; GET /api/v1/integration/workbench/{resource}; POST /api/v1/integration/workbench/{resource}/search|
|/integrity|Integrity Workbench|integrity|Asset integrity inspections, defects, corrosion and mitigation.|Operational Engineers; Field Supervisors; Department Managers|HIDRA_INTEGRITY_*_READ / HIDRA_INTEGRITY_*_EXECUTE derived from permission catalog|GET /api/v1/integrity/capabilities; GET /api/v1/integrity/workbench/resources; GET /api/v1/integrity/workbench/{resource}; POST /api/v1/integrity/workbench/{resource}/search|
|/leakdetection|Leak Detection Workbench|leakdetection|Leak candidates, leak signals, evaluations and decision support.|Control Room Operators; Operational Engineers; Field Supervisors|HIDRA_LEAKDETECTION_*_READ / HIDRA_LEAKDETECTION_*_EXECUTE derived from permission catalog|GET /api/v1/leakdetection/capabilities; GET /api/v1/leakdetection/workbench/resources; GET /api/v1/leakdetection/workbench/{resource}; POST /api/v1/leakdetection/workbench/{resource}/search|
|/monitoring|Monitoring Workbench|monitoring|Operational monitoring, KPIs, events and status visibility.|Control Room Operators; Operational Engineers; Executives|HIDRA_MONITORING_*_READ / HIDRA_MONITORING_*_EXECUTE derived from permission catalog|GET /api/v1/monitoring/capabilities; GET /api/v1/monitoring/workbench/resources; GET /api/v1/monitoring/workbench/{resource}; POST /api/v1/monitoring/workbench/{resource}/search|
|/notification|Notification Workbench|notification|Notification messages, async push delivery and delivery attempts.|Administrators; Control Room Operators|HIDRA_NOTIFICATION_*_READ / HIDRA_NOTIFICATION_*_EXECUTE derived from permission catalog|GET /api/v1/notification/capabilities; GET /api/v1/notification/workbench/resources; GET /api/v1/notification/workbench/{resource}; POST /api/v1/notification/workbench/{resource}/search|


---

# 06 — Navigation Blueprint

## Navigation rules

- Default landing page: `/dashboard`.
- Maximum depth for daily operations: 2 levels.
- Use module workbench route `/{module}` as the default entry.
- Use detail drawer for record detail where possible; full-page detail only when workflow context is complex.
- Topology map is a primary navigation item, not hidden under admin.
- Breadcrumb format: `Group / Module / Resource / Detail`.

## Menu hierarchy

|Menu|Parent|Permission|Icon|Order|Route|
|---|---|---|---|---|---|
|Foundation|ROOT|Authenticated|folder|10||
|Command Dashboard|Foundation|Authenticated|dashboard|20|/dashboard|
|Topology|Foundation|HIDRA_TOPOLOGY_*_READ|map|21|/topology|
|Monitoring|Foundation|HIDRA_MONITORING_*_READ|monitor_heart|22|/monitoring|
|Alarm|Foundation|HIDRA_ALARM_*_READ|notifications_active|23|/alarm|
|Leak Detection|Foundation|HIDRA_LEAKDETECTION_*_READ|water_drop|24|/leakdetection|
|Operations|ROOT|Authenticated|folder|25||
|Telemetry|Operations|HIDRA_TELEMETRY_*_READ|sensors|35|/telemetry|
|Planning|Operations|HIDRA_PLANNING_*_READ|event_note|36|/planning|
|Assets|Operations|HIDRA_ASSETS_*_READ|precision_manufacturing|37|/assets|
|Integrity|Operations|HIDRA_INTEGRITY_*_READ|verified|38|/integrity|
|Risk|Operations|HIDRA_RISK_*_READ|warning|39|/risk|
|Hse|Operations|HIDRA_HSE_*_READ|health_and_safety|40|/hse|
|Incident|Operations|HIDRA_INCIDENT_*_READ|report_problem|41|/incident|
|Custody|Operations|HIDRA_CUSTODY_*_READ|scale|42|/custody|
|Decision Support|ROOT|Authenticated|folder|43||
|Simulation|Decision Support|HIDRA_SIMULATION_*_READ|science|53|/simulation|
|Analytics|Decision Support|HIDRA_ANALYTICS_*_READ|insights|54|/analytics|
|Reporting|Decision Support|HIDRA_REPORTING_*_READ|summarize|55|/reporting|
|Governance|ROOT|Authenticated|folder|56||
|Workflow|Governance|HIDRA_WORKFLOW_*_READ|account_tree|66|/workflow|
|Documents|Governance|HIDRA_DOCUMENTS_*_READ|description|67|/documents|
|Audit|Governance|HIDRA_AUDIT_*_READ|history|68|/audit|
|Configuration|Governance|HIDRA_CONFIGURATION_*_READ|settings|69|/configuration|
|Notification|Governance|HIDRA_NOTIFICATION_*_READ|notifications|70|/notification|
|Administration|ROOT|Authenticated|folder|71||
|Identity|Administration|HIDRA_IDENTITY_*_READ|admin_panel_settings|81|/identity|
|Organization|Administration|HIDRA_ORGANIZATION_*_READ|corporate_fare|82|/organization|
|Party|Administration|HIDRA_PARTY_*_READ|groups|83|/party|
|Integration|Administration|HIDRA_INTEGRATION_*_READ|hub|84|/integration|
|Permission Catalog|Administration|HIDRA_SECURITY_PERMISSIONS_READ|shield|85|/security/permissions|
|Realtime Monitor|Administration|HIDRA_REALTIME_CAPABILITIES_READ|wifi_tethering|86|/realtime|


---

# 07 — UI Composition Specification

## Dashboard composition

- Operational status strip: alarms, leaks, incidents, HSE, realtime connection.
- KPI tiles: module-specific counts and risk indicators.
- Topology mini-map: key facilities and pipeline segments.
- Work queue: validation tasks and recent events.

## Tables

Use dense enterprise tables with saved filters, column visibility, quick search, server pagination and row-level actions. Data must come from workbench list/search APIs.

## Forms

Use progressive disclosure: mandatory fields first, advanced fields in accordions. Use Zod schemas generated from DTOs.

## Detail screens

Prefer detail drawers for operational speed. Use full-page detail for workflow-heavy records.

## Workflow screens

Workflow screens require state, allowed actions and validation evidence. Current exact workflow state/action contracts are **Unable to determine from available evidence**.

## Topology screens

Use full-screen map, left layer tree, right feature detail, bottom event timeline and quick search. Render current backend layers: facilities, pipeline-segments, topology-connections, topology-nodes.


---

# 08 — Workflow Interaction Specification

## Backend evidence

Workflow module exists and exposes commands through controllers; workflow-related domain files include:

- `src/main/java/dz/sh/hidra/modules/workflow/domain/event/WorkflowActionRecordedEvent.java`
- `src/main/java/dz/sh/hidra/modules/workflow/domain/event/WorkflowDomainEvent.java`
- `src/main/java/dz/sh/hidra/modules/workflow/domain/event/WorkflowInstanceCompletedEvent.java`
- `src/main/java/dz/sh/hidra/modules/workflow/domain/event/WorkflowInstanceStartedEvent.java`
- `src/main/java/dz/sh/hidra/modules/workflow/domain/event/WorkflowTaskCreatedEvent.java`
- `src/main/java/dz/sh/hidra/modules/workflow/domain/event/package-info.java`
- `src/main/java/dz/sh/hidra/modules/workflow/domain/model/WorkflowStateHistory.java`
- `src/main/java/dz/sh/hidra/modules/workflow/domain/value/WorkflowAssignmentStatus.java`
- `src/main/java/dz/sh/hidra/modules/workflow/domain/value/WorkflowAuditOutboxStatus.java`
- `src/main/java/dz/sh/hidra/modules/workflow/domain/value/WorkflowDefinitionStatus.java`
- `src/main/java/dz/sh/hidra/modules/workflow/domain/value/WorkflowDelegationStatus.java`
- `src/main/java/dz/sh/hidra/modules/workflow/domain/value/WorkflowInstanceStatus.java`
- `src/main/java/dz/sh/hidra/modules/workflow/domain/value/WorkflowSlaStatus.java`
- `src/main/java/dz/sh/hidra/modules/workflow/domain/value/WorkflowTaskStatus.java`

## Governance rules

- Do not invent workflow states beyond backend evidence.
- Action buttons shall be generated from explicit workflow APIs or a future workflow metadata endpoint.
- Until the metadata endpoint exists, show module command actions as backend actions, not as full BPM workflow semantics.

## Standard approval pattern

- Draft / submitted / under review / approved / rejected must not be implemented as canonical states unless backend confirms them.
- UI may display generic pending/complete/error states for client-side request execution.

## Escalation behavior

Unable to determine from available evidence. No escalation API metadata was found in the frontend-facing contract beyond module-specific event names and workflow module presence.


---

# 09 — UX Principles Document

## SONATRACH operational UX principles

1. Operational clarity before decoration.
2. Critical status visible in one glance.
3. Maximum two clicks from dashboard to operational detail.
4. French and Arabic localization must be designed, not retrofitted.
5. Use color as redundancy, not as the only signal.
6. Tables must be filterable, exportable and auditable.
7. Maps must show network context, not decorative geography.
8. Actions must explain impact and show backend evidence.

## Benchmark adaptation table

|UX Practice|Benchmark Source|Adaptation for HidraWeb|
|---|---|---|
|Role-based launchpad with task-oriented cards|SAP Fiori|Use dashboard cards for topology, monitoring, alarms, leak detection, risk and workflow tasks.|
|Consistent enterprise component system|IBM Carbon / Material UI|Use Material UI with Hidra design tokens and strict component variants for tables, forms and dialogs.|
|Layered spatial visualization|Esri ArcGIS / Calcite|Topology map uses explicit layer tree, legends, popups, search and GeoJSON styling.|
|Operational event visibility|AVEVA PI Vision / SCADA dashboards|Expose realtime status strip and event feed without overwhelming operators.|
|Service/workflow task queues|ServiceNow / Dynamics 365|Use work queues for validation, incident follow-up and configuration change handling.|
|Asset-centric work management|IBM Maximo|Asset, integrity and maintenance views should preserve asset hierarchy and evidence history.|
|Low training, high consistency interaction patterns|Honeywell/Siemens industrial platforms|Favor status colors, dense tables, alarms, and confirmation patterns familiar to operational users.|


## External benchmark sources used

- SAP Fiori Design Guidelines: https://www.sap.com/design-system/fiori-design-web
- IBM Carbon Design System: https://carbondesignsystem.com/
- Esri Calcite Design System: https://developers.arcgis.com/calcite-design-system/
- Material UI: https://mui.com/material-ui/
- React: https://react.dev/
- React Router: https://reactrouter.com/
- TanStack Query: https://tanstack.com/query/latest
- Leaflet: https://leafletjs.com/


---

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


---

# 11 — Wireframes & High-Fidelity Mockups Brief

Native Figma project generation is unavailable in this environment. This document is the Figma creation brief.

## Required frames

1. Login — IdP/JWT acquisition flow, language selection, SONATRACH/Hidra identity.
2. Dashboard — operational command view with map, KPIs, alarms, notifications.
3. Administration — identity, organization, party, configuration and integration workbenches.
4. CRUD/workbench pages — generated module shell consuming workbench APIs.
5. Workflow pages — validation queue and action panel, with exact states marked as unavailable until backend exposes them.
6. Topology pages — Leaflet map, layer tree, search, legend, popups, realtime overlays.
7. Profile pages — session details, token expiry, language, preferences.

## Figma components to create

- App shell with dynamic menu.
- Operational status strip.
- Workbench data grid.
- Detail drawer.
- Action panel.
- ProblemDetail alert.
- Topology map frame.
- Notification center.


---

# 12 — Authentication Specification

## Backend evidence

HidraAPI security configuration exposes JWT resource-server support, basic mode and disabled mode. Production usage shall prefer JWT.

## Login flow

- HidraWeb redirects to enterprise IdP or uses an approved OAuth/OIDC client.
- HidraAPI does not expose a local login endpoint in available evidence.
- Frontend stores tokens using secure browser strategy approved by SONATRACH security.

## Logout flow

- Clear frontend session.
- Revoke/expire IdP session if supported by the enterprise IdP.
- Redirect to login or IdP logout landing page.

## Token lifecycle

Unable to determine refresh endpoint from available HidraAPI evidence. Refresh strategy must be aligned with the IdP.

## Session timeout

Use token expiry as source of truth. Add idle timeout in frontend according to SONATRACH policy.

## WebSocket authentication

STOMP endpoint is `/api/v1/realtime/ws`. HidraWeb shall pass bearer tokens using the approved STOMP connection header or cookie strategy, depending on Spring Security configuration. Exact backend handshake authorization behavior is **Unable to determine from available evidence**.


---

# 13 — Authorization Matrix

The complete matrix is available in `spreadsheets/13-Authorization-Matrix.xlsx`.

Important: HidraAPI publishes a derived permission catalog. Role-to-permission assignments are frontend governance proposals unless identity module exposes exact assignments.

## Excerpt

|Role|Screen|Route|Action|Permission|Evidence|
|---|---|---|---|---|---|
|Administrator|Login|/login|read|External IdP / no HidraAPI login permission evidence|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Administrator|Permission Catalog|/security/permissions|read|HIDRA_SECURITY_PERMISSIONS_READ|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Administrator|Realtime Monitor|/realtime|read|HIDRA_REALTIME_CAPABILITIES_READ|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Administrator|Audit Workbench|/audit|read|HIDRA_AUDIT_*_READ / HIDRA_AUDIT_*_EXECUTE derived from permission catalog|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Administrator|Configuration Workbench|/configuration|read|HIDRA_CONFIGURATION_*_READ / HIDRA_CONFIGURATION_*_EXECUTE derived from permission catalog|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Administrator|Identity Workbench|/identity|read|HIDRA_IDENTITY_*_READ / HIDRA_IDENTITY_*_EXECUTE derived from permission catalog|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Administrator|Integration Workbench|/integration|read|HIDRA_INTEGRATION_*_READ / HIDRA_INTEGRATION_*_EXECUTE derived from permission catalog|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Administrator|Notification Workbench|/notification|read|HIDRA_NOTIFICATION_*_READ / HIDRA_NOTIFICATION_*_EXECUTE derived from permission catalog|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Administrator|Organization Workbench|/organization|read|HIDRA_ORGANIZATION_*_READ / HIDRA_ORGANIZATION_*_EXECUTE derived from permission catalog|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Administrator|Party Workbench|/party|read|HIDRA_PARTY_*_READ / HIDRA_PARTY_*_EXECUTE derived from permission catalog|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Operational Engineer|Login|/login|read|External IdP / no HidraAPI login permission evidence|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Operational Engineer|Operational Command Dashboard|/dashboard|read|Derived from module read permissions and authenticated user session|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Operational Engineer|Topology GIS Map|/topology/map|read|HIDRA_TOPOLOGY_MAP_READ|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Operational Engineer|Analytics Workbench|/analytics|read|HIDRA_ANALYTICS_*_READ / HIDRA_ANALYTICS_*_EXECUTE derived from permission catalog|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Operational Engineer|Assets Workbench|/assets|read|HIDRA_ASSETS_*_READ / HIDRA_ASSETS_*_EXECUTE derived from permission catalog|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Operational Engineer|Documents Workbench|/documents|read|HIDRA_DOCUMENTS_*_READ / HIDRA_DOCUMENTS_*_EXECUTE derived from permission catalog|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Operational Engineer|Integrity Workbench|/integrity|read|HIDRA_INTEGRITY_*_READ / HIDRA_INTEGRITY_*_EXECUTE derived from permission catalog|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Operational Engineer|Leak Detection Workbench|/leakdetection|read|HIDRA_LEAKDETECTION_*_READ / HIDRA_LEAKDETECTION_*_EXECUTE derived from permission catalog|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Operational Engineer|Monitoring Workbench|/monitoring|read|HIDRA_MONITORING_*_READ / HIDRA_MONITORING_*_EXECUTE derived from permission catalog|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Operational Engineer|Planning Workbench|/planning|read|HIDRA_PLANNING_*_READ / HIDRA_PLANNING_*_EXECUTE derived from permission catalog|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Operational Engineer|Reporting Workbench|/reporting|read|HIDRA_REPORTING_*_READ / HIDRA_REPORTING_*_EXECUTE derived from permission catalog|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Operational Engineer|Risk Workbench|/risk|read|HIDRA_RISK_*_READ / HIDRA_RISK_*_EXECUTE derived from permission catalog|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Operational Engineer|Simulation Workbench|/simulation|read|HIDRA_SIMULATION_*_READ / HIDRA_SIMULATION_*_EXECUTE derived from permission catalog|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Operational Engineer|Telemetry Workbench|/telemetry|read|HIDRA_TELEMETRY_*_READ / HIDRA_TELEMETRY_*_EXECUTE derived from permission catalog|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Operational Engineer|Topology Workbench|/topology|read|HIDRA_TOPOLOGY_*_READ / HIDRA_TOPOLOGY_*_EXECUTE derived from permission catalog|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Control Room Operator|Login|/login|read|External IdP / no HidraAPI login permission evidence|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Control Room Operator|Operational Command Dashboard|/dashboard|read|Derived from module read permissions and authenticated user session|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Control Room Operator|Realtime Monitor|/realtime|read|HIDRA_REALTIME_CAPABILITIES_READ|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Control Room Operator|Topology GIS Map|/topology/map|read|HIDRA_TOPOLOGY_MAP_READ|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Control Room Operator|Alarm Workbench|/alarm|read|HIDRA_ALARM_*_READ / HIDRA_ALARM_*_EXECUTE derived from permission catalog|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Control Room Operator|Leak Detection Workbench|/leakdetection|read|HIDRA_LEAKDETECTION_*_READ / HIDRA_LEAKDETECTION_*_EXECUTE derived from permission catalog|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Control Room Operator|Monitoring Workbench|/monitoring|read|HIDRA_MONITORING_*_READ / HIDRA_MONITORING_*_EXECUTE derived from permission catalog|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Control Room Operator|Notification Workbench|/notification|read|HIDRA_NOTIFICATION_*_READ / HIDRA_NOTIFICATION_*_EXECUTE derived from permission catalog|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Control Room Operator|Telemetry Workbench|/telemetry|read|HIDRA_TELEMETRY_*_READ / HIDRA_TELEMETRY_*_EXECUTE derived from permission catalog|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Control Room Operator|Topology Workbench|/topology|read|HIDRA_TOPOLOGY_*_READ / HIDRA_TOPOLOGY_*_EXECUTE derived from permission catalog|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Field Supervisor|Login|/login|read|External IdP / no HidraAPI login permission evidence|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Field Supervisor|Assets Workbench|/assets|read|HIDRA_ASSETS_*_READ / HIDRA_ASSETS_*_EXECUTE derived from permission catalog|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Field Supervisor|Documents Workbench|/documents|read|HIDRA_DOCUMENTS_*_READ / HIDRA_DOCUMENTS_*_EXECUTE derived from permission catalog|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Field Supervisor|Hse Workbench|/hse|read|HIDRA_HSE_*_READ / HIDRA_HSE_*_EXECUTE derived from permission catalog|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Field Supervisor|Incident Workbench|/incident|read|HIDRA_INCIDENT_*_READ / HIDRA_INCIDENT_*_EXECUTE derived from permission catalog|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Field Supervisor|Integrity Workbench|/integrity|read|HIDRA_INTEGRITY_*_READ / HIDRA_INTEGRITY_*_EXECUTE derived from permission catalog|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Field Supervisor|Leak Detection Workbench|/leakdetection|read|HIDRA_LEAKDETECTION_*_READ / HIDRA_LEAKDETECTION_*_EXECUTE derived from permission catalog|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Field Supervisor|Workflow Workbench|/workflow|read|HIDRA_WORKFLOW_*_READ / HIDRA_WORKFLOW_*_EXECUTE derived from permission catalog|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Workflow Validator|Login|/login|read|External IdP / no HidraAPI login permission evidence|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Workflow Validator|Configuration Workbench|/configuration|read|HIDRA_CONFIGURATION_*_READ / HIDRA_CONFIGURATION_*_EXECUTE derived from permission catalog|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Workflow Validator|Custody Workbench|/custody|read|HIDRA_CUSTODY_*_READ / HIDRA_CUSTODY_*_EXECUTE derived from permission catalog|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Workflow Validator|Documents Workbench|/documents|read|HIDRA_DOCUMENTS_*_READ / HIDRA_DOCUMENTS_*_EXECUTE derived from permission catalog|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Workflow Validator|Incident Workbench|/incident|read|HIDRA_INCIDENT_*_READ / HIDRA_INCIDENT_*_EXECUTE derived from permission catalog|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Workflow Validator|Workflow Workbench|/workflow|read|HIDRA_WORKFLOW_*_READ / HIDRA_WORKFLOW_*_EXECUTE derived from permission catalog|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|
|Department Manager|Login|/login|read|External IdP / no HidraAPI login permission evidence|Role mapping is frontend governance proposal; HidraAPI publishes derived permission catalog but not role-to-permission assignments.|


---

# 14 — Dynamic Menu Specification

## Source of truth

Menu visibility must be computed from:

1. Authenticated user roles/claims.
2. Route permission catalog from `GET /api/v1/security/permissions/catalog`.
3. Frontend menu registry defined by this package.
4. Module availability from `GET /api/v1/workbench/modules`.

## Rules

- Hide modules without read permission.
- Disable actions without execute/update/delete permission.
- Show critical modules first for control room users.
- Keep administration separated from operational navigation.
- Respect French/Arabic labels and RTL layout.

## Menu catalog

|Menu|Parent|Permission|Icon|Order|Route|
|---|---|---|---|---|---|
|Foundation|ROOT|Authenticated|folder|10||
|Command Dashboard|Foundation|Authenticated|dashboard|20|/dashboard|
|Topology|Foundation|HIDRA_TOPOLOGY_*_READ|map|21|/topology|
|Monitoring|Foundation|HIDRA_MONITORING_*_READ|monitor_heart|22|/monitoring|
|Alarm|Foundation|HIDRA_ALARM_*_READ|notifications_active|23|/alarm|
|Leak Detection|Foundation|HIDRA_LEAKDETECTION_*_READ|water_drop|24|/leakdetection|
|Operations|ROOT|Authenticated|folder|25||
|Telemetry|Operations|HIDRA_TELEMETRY_*_READ|sensors|35|/telemetry|
|Planning|Operations|HIDRA_PLANNING_*_READ|event_note|36|/planning|
|Assets|Operations|HIDRA_ASSETS_*_READ|precision_manufacturing|37|/assets|
|Integrity|Operations|HIDRA_INTEGRITY_*_READ|verified|38|/integrity|
|Risk|Operations|HIDRA_RISK_*_READ|warning|39|/risk|
|Hse|Operations|HIDRA_HSE_*_READ|health_and_safety|40|/hse|
|Incident|Operations|HIDRA_INCIDENT_*_READ|report_problem|41|/incident|
|Custody|Operations|HIDRA_CUSTODY_*_READ|scale|42|/custody|
|Decision Support|ROOT|Authenticated|folder|43||
|Simulation|Decision Support|HIDRA_SIMULATION_*_READ|science|53|/simulation|
|Analytics|Decision Support|HIDRA_ANALYTICS_*_READ|insights|54|/analytics|
|Reporting|Decision Support|HIDRA_REPORTING_*_READ|summarize|55|/reporting|
|Governance|ROOT|Authenticated|folder|56||
|Workflow|Governance|HIDRA_WORKFLOW_*_READ|account_tree|66|/workflow|
|Documents|Governance|HIDRA_DOCUMENTS_*_READ|description|67|/documents|
|Audit|Governance|HIDRA_AUDIT_*_READ|history|68|/audit|
|Configuration|Governance|HIDRA_CONFIGURATION_*_READ|settings|69|/configuration|
|Notification|Governance|HIDRA_NOTIFICATION_*_READ|notifications|70|/notification|
|Administration|ROOT|Authenticated|folder|71||
|Identity|Administration|HIDRA_IDENTITY_*_READ|admin_panel_settings|81|/identity|
|Organization|Administration|HIDRA_ORGANIZATION_*_READ|corporate_fare|82|/organization|
|Party|Administration|HIDRA_PARTY_*_READ|groups|83|/party|
|Integration|Administration|HIDRA_INTEGRATION_*_READ|hub|84|/integration|
|Permission Catalog|Administration|HIDRA_SECURITY_PERMISSIONS_READ|shield|85|/security/permissions|
|Realtime Monitor|Administration|HIDRA_REALTIME_CAPABILITIES_READ|wifi_tethering|86|/realtime|


---

# 15 — API Consumption Catalog

The full API catalog is available in `spreadsheets/15-API-Catalog.xlsx` and `catalogs/api_catalog.json`.

## Catalog excerpt

|API|Module|Controller|Request DTO|Response DTO|Permission|Enforcement Status|
|---|---|---|---|---|---|---|
|POST /api/v1/alarm/acknowledge-alarm|alarm|SpringAlarmController|AcknowledgeAlarmRequest; CloseAlarmRequest; RaiseAlarmRequest; package-info|AlarmResponse; package-info|HIDRA_ALARM_ACKNOWLEDGE_ALARM_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/alarm/alarms|alarm|SpringAlarmController|AcknowledgeAlarmRequest; CloseAlarmRequest; RaiseAlarmRequest; package-info|AlarmResponse; package-info|HIDRA_ALARM_ALARMS_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/alarm/alarms/acknowledgements|alarm|SpringAlarmController|AcknowledgeAlarmRequest; CloseAlarmRequest; RaiseAlarmRequest; package-info|AlarmResponse; package-info|HIDRA_ALARM_ALARMS_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/alarm/alarms/closures|alarm|SpringAlarmController|AcknowledgeAlarmRequest; CloseAlarmRequest; RaiseAlarmRequest; package-info|AlarmResponse; package-info|HIDRA_ALARM_ALARMS_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|GET /api/v1/alarm/capabilities|alarm|SpringAlarmController|Unable to determine from static route evidence|AlarmResponse; package-info|HIDRA_ALARM_CAPABILITIES_READ|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/alarm/close-alarm|alarm|SpringAlarmController|AcknowledgeAlarmRequest; CloseAlarmRequest; RaiseAlarmRequest; package-info|AlarmResponse; package-info|HIDRA_ALARM_CLOSE_ALARM_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/alarm/raise-alarm|alarm|SpringAlarmController|AcknowledgeAlarmRequest; CloseAlarmRequest; RaiseAlarmRequest; package-info|AlarmResponse; package-info|HIDRA_ALARM_RAISE_ALARM_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|GET /api/v1/analytics/capabilities|analytics|SpringAnalyticsController|Unable to determine from static route evidence|AnalyticsDatasetResponse; AnalyticsInsightResponse; AnalyticsProjectionRunResponse; MetricEvaluationRunResponse; package-info|HIDRA_ANALYTICS_CAPABILITIES_READ|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/analytics/create-analytics-dataset|analytics|SpringAnalyticsController|CreateAnalyticsDatasetRequest; CreateAnalyticsInsightRequest; RunMetricEvaluationRequest; RunProjectionRequest; package-info|AnalyticsDatasetResponse; AnalyticsInsightResponse; AnalyticsProjectionRunResponse; MetricEvaluationRunResponse; package-info|HIDRA_ANALYTICS_CREATE_ANALYTICS_DATASET_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/analytics/create-analytics-insight|analytics|SpringAnalyticsController|CreateAnalyticsDatasetRequest; CreateAnalyticsInsightRequest; RunMetricEvaluationRequest; RunProjectionRequest; package-info|AnalyticsDatasetResponse; AnalyticsInsightResponse; AnalyticsProjectionRunResponse; MetricEvaluationRunResponse; package-info|HIDRA_ANALYTICS_CREATE_ANALYTICS_INSIGHT_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/analytics/datasets|analytics|SpringAnalyticsController|CreateAnalyticsDatasetRequest; CreateAnalyticsInsightRequest; RunMetricEvaluationRequest; RunProjectionRequest; package-info|AnalyticsDatasetResponse; AnalyticsInsightResponse; AnalyticsProjectionRunResponse; MetricEvaluationRunResponse; package-info|HIDRA_ANALYTICS_DATASETS_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/analytics/insights|analytics|SpringAnalyticsController|CreateAnalyticsDatasetRequest; CreateAnalyticsInsightRequest; RunMetricEvaluationRequest; RunProjectionRequest; package-info|AnalyticsDatasetResponse; AnalyticsInsightResponse; AnalyticsProjectionRunResponse; MetricEvaluationRunResponse; package-info|HIDRA_ANALYTICS_INSIGHTS_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/analytics/metrics/evaluations|analytics|SpringAnalyticsController|CreateAnalyticsDatasetRequest; CreateAnalyticsInsightRequest; RunMetricEvaluationRequest; RunProjectionRequest; package-info|AnalyticsDatasetResponse; AnalyticsInsightResponse; AnalyticsProjectionRunResponse; MetricEvaluationRunResponse; package-info|HIDRA_ANALYTICS_METRICS_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/analytics/projections/runs|analytics|SpringAnalyticsController|CreateAnalyticsDatasetRequest; CreateAnalyticsInsightRequest; RunMetricEvaluationRequest; RunProjectionRequest; package-info|AnalyticsDatasetResponse; AnalyticsInsightResponse; AnalyticsProjectionRunResponse; MetricEvaluationRunResponse; package-info|HIDRA_ANALYTICS_PROJECTIONS_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/analytics/run-metric-evaluation|analytics|SpringAnalyticsController|CreateAnalyticsDatasetRequest; CreateAnalyticsInsightRequest; RunMetricEvaluationRequest; RunProjectionRequest; package-info|AnalyticsDatasetResponse; AnalyticsInsightResponse; AnalyticsProjectionRunResponse; MetricEvaluationRunResponse; package-info|HIDRA_ANALYTICS_RUN_METRIC_EVALUATION_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/analytics/run-projection|analytics|SpringAnalyticsController|CreateAnalyticsDatasetRequest; CreateAnalyticsInsightRequest; RunMetricEvaluationRequest; RunProjectionRequest; package-info|AnalyticsDatasetResponse; AnalyticsInsightResponse; AnalyticsProjectionRunResponse; MetricEvaluationRunResponse; package-info|HIDRA_ANALYTICS_RUN_PROJECTION_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/assets/asset-conditions|assets|SpringAssetsController|CreateMaintenanceWorkOrderRequest; RecordAssetConditionRequest; RegisterMaintainableAssetRequest; package-info|AssetConditionResponse; MaintainableAssetResponse; MaintenanceWorkOrderResponse; package-info|HIDRA_ASSETS_ASSET_CONDITIONS_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|GET /api/v1/assets/capabilities|assets|SpringAssetsController|Unable to determine from static route evidence|AssetConditionResponse; MaintainableAssetResponse; MaintenanceWorkOrderResponse; package-info|HIDRA_ASSETS_CAPABILITIES_READ|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/assets/create-maintenance-work-order|assets|SpringAssetsController|CreateMaintenanceWorkOrderRequest; RecordAssetConditionRequest; RegisterMaintainableAssetRequest; package-info|AssetConditionResponse; MaintainableAssetResponse; MaintenanceWorkOrderResponse; package-info|HIDRA_ASSETS_CREATE_MAINTENANCE_WORK_ORDER_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/assets/maintainable-assets|assets|SpringAssetsController|CreateMaintenanceWorkOrderRequest; RecordAssetConditionRequest; RegisterMaintainableAssetRequest; package-info|AssetConditionResponse; MaintainableAssetResponse; MaintenanceWorkOrderResponse; package-info|HIDRA_ASSETS_MAINTAINABLE_ASSETS_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/assets/maintenance-work-orders|assets|SpringAssetsController|CreateMaintenanceWorkOrderRequest; RecordAssetConditionRequest; RegisterMaintainableAssetRequest; package-info|AssetConditionResponse; MaintainableAssetResponse; MaintenanceWorkOrderResponse; package-info|HIDRA_ASSETS_MAINTENANCE_WORK_ORDERS_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/assets/record-asset-condition|assets|SpringAssetsController|CreateMaintenanceWorkOrderRequest; RecordAssetConditionRequest; RegisterMaintainableAssetRequest; package-info|AssetConditionResponse; MaintainableAssetResponse; MaintenanceWorkOrderResponse; package-info|HIDRA_ASSETS_RECORD_ASSET_CONDITION_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/assets/register-maintainable-asset|assets|SpringAssetsController|CreateMaintenanceWorkOrderRequest; RecordAssetConditionRequest; RegisterMaintainableAssetRequest; package-info|AssetConditionResponse; MaintainableAssetResponse; MaintenanceWorkOrderResponse; package-info|HIDRA_ASSETS_REGISTER_MAINTAINABLE_ASSET_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/audit/access-records|audit|SpringAuditController|RecordAuditAccessRequest; RecordAuditEventRequest; RequestAuditExportRequest; package-info|AuditAccessRecordResponse; AuditEventResponse; AuditExportRequestResponse; package-info|HIDRA_AUDIT_ACCESS_RECORDS_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|GET /api/v1/audit/capabilities|audit|SpringAuditController|Unable to determine from static route evidence|AuditAccessRecordResponse; AuditEventResponse; AuditExportRequestResponse; package-info|HIDRA_AUDIT_CAPABILITIES_READ|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/audit/events|audit|SpringAuditController|RecordAuditAccessRequest; RecordAuditEventRequest; RequestAuditExportRequest; package-info|AuditAccessRecordResponse; AuditEventResponse; AuditExportRequestResponse; package-info|HIDRA_AUDIT_EVENTS_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/audit/exports|audit|SpringAuditController|RecordAuditAccessRequest; RecordAuditEventRequest; RequestAuditExportRequest; package-info|AuditAccessRecordResponse; AuditEventResponse; AuditExportRequestResponse; package-info|HIDRA_AUDIT_EXPORTS_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/audit/record-audit-access|audit|SpringAuditController|RecordAuditAccessRequest; RecordAuditEventRequest; RequestAuditExportRequest; package-info|AuditAccessRecordResponse; AuditEventResponse; AuditExportRequestResponse; package-info|HIDRA_AUDIT_RECORD_AUDIT_ACCESS_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/audit/record-audit-event|audit|SpringAuditController|RecordAuditAccessRequest; RecordAuditEventRequest; RequestAuditExportRequest; package-info|AuditAccessRecordResponse; AuditEventResponse; AuditExportRequestResponse; package-info|HIDRA_AUDIT_RECORD_AUDIT_EVENT_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/audit/request-audit-export|audit|SpringAuditController|RecordAuditAccessRequest; RecordAuditEventRequest; RequestAuditExportRequest; package-info|AuditAccessRecordResponse; AuditEventResponse; AuditExportRequestResponse; package-info|HIDRA_AUDIT_REQUEST_AUDIT_EXPORT_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|GET /api/v1/configuration/capabilities|configuration|SpringConfigurationController|Unable to determine from static route evidence|ConfigurationDefinitionResponse; ConfigurationValueResponse; FeatureFlagResponse; package-info|HIDRA_CONFIGURATION_CAPABILITIES_READ|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/configuration/create-configuration-definition|configuration|SpringConfigurationController|CreateConfigurationDefinitionRequest; CreateFeatureFlagRequest; SetConfigurationValueRequest; package-info|ConfigurationDefinitionResponse; ConfigurationValueResponse; FeatureFlagResponse; package-info|HIDRA_CONFIGURATION_CREATE_CONFIGURATION_DEFINITION_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/configuration/create-feature-flag|configuration|SpringConfigurationController|CreateConfigurationDefinitionRequest; CreateFeatureFlagRequest; SetConfigurationValueRequest; package-info|ConfigurationDefinitionResponse; ConfigurationValueResponse; FeatureFlagResponse; package-info|HIDRA_CONFIGURATION_CREATE_FEATURE_FLAG_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/configuration/definitions|configuration|SpringConfigurationController|CreateConfigurationDefinitionRequest; CreateFeatureFlagRequest; SetConfigurationValueRequest; package-info|ConfigurationDefinitionResponse; ConfigurationValueResponse; FeatureFlagResponse; package-info|HIDRA_CONFIGURATION_DEFINITIONS_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/configuration/feature-flags|configuration|SpringConfigurationController|CreateConfigurationDefinitionRequest; CreateFeatureFlagRequest; SetConfigurationValueRequest; package-info|ConfigurationDefinitionResponse; ConfigurationValueResponse; FeatureFlagResponse; package-info|HIDRA_CONFIGURATION_FEATURE_FLAGS_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/configuration/set-configuration-value|configuration|SpringConfigurationController|CreateConfigurationDefinitionRequest; CreateFeatureFlagRequest; SetConfigurationValueRequest; package-info|ConfigurationDefinitionResponse; ConfigurationValueResponse; FeatureFlagResponse; package-info|HIDRA_CONFIGURATION_SET_CONFIGURATION_VALUE_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/configuration/values|configuration|SpringConfigurationController|CreateConfigurationDefinitionRequest; CreateFeatureFlagRequest; SetConfigurationValueRequest; package-info|ConfigurationDefinitionResponse; ConfigurationValueResponse; FeatureFlagResponse; package-info|HIDRA_CONFIGURATION_VALUES_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|GET /api/v1/custody/capabilities|custody|SpringCustodyController|Unable to determine from static route evidence|CustodyDiscrepancyResponse; CustodyMeasurementPeriodResponse; CustodyTransferTicketResponse; package-info|HIDRA_CUSTODY_CAPABILITIES_READ|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/custody/create-transfer-ticket|custody|SpringCustodyController|CreateCustodyTransferTicketRequest; OpenCustodyDiscrepancyRequest; OpenCustodyMeasurementPeriodRequest; package-info|CustodyDiscrepancyResponse; CustodyMeasurementPeriodResponse; CustodyTransferTicketResponse; package-info|HIDRA_CUSTODY_CREATE_TRANSFER_TICKET_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/custody/discrepancies|custody|SpringCustodyController|CreateCustodyTransferTicketRequest; OpenCustodyDiscrepancyRequest; OpenCustodyMeasurementPeriodRequest; package-info|CustodyDiscrepancyResponse; CustodyMeasurementPeriodResponse; CustodyTransferTicketResponse; package-info|HIDRA_CUSTODY_DISCREPANCIES_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/custody/measurement-periods|custody|SpringCustodyController|CreateCustodyTransferTicketRequest; OpenCustodyDiscrepancyRequest; OpenCustodyMeasurementPeriodRequest; package-info|CustodyDiscrepancyResponse; CustodyMeasurementPeriodResponse; CustodyTransferTicketResponse; package-info|HIDRA_CUSTODY_MEASUREMENT_PERIODS_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/custody/open-discrepancy|custody|SpringCustodyController|CreateCustodyTransferTicketRequest; OpenCustodyDiscrepancyRequest; OpenCustodyMeasurementPeriodRequest; package-info|CustodyDiscrepancyResponse; CustodyMeasurementPeriodResponse; CustodyTransferTicketResponse; package-info|HIDRA_CUSTODY_OPEN_DISCREPANCY_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/custody/open-measurement-period|custody|SpringCustodyController|CreateCustodyTransferTicketRequest; OpenCustodyDiscrepancyRequest; OpenCustodyMeasurementPeriodRequest; package-info|CustodyDiscrepancyResponse; CustodyMeasurementPeriodResponse; CustodyTransferTicketResponse; package-info|HIDRA_CUSTODY_OPEN_MEASUREMENT_PERIOD_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/custody/transfer-tickets|custody|SpringCustodyController|CreateCustodyTransferTicketRequest; OpenCustodyDiscrepancyRequest; OpenCustodyMeasurementPeriodRequest; package-info|CustodyDiscrepancyResponse; CustodyMeasurementPeriodResponse; CustodyTransferTicketResponse; package-info|HIDRA_CUSTODY_TRANSFER_TICKETS_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|GET /api/v1/documents/capabilities|documents|SpringDocumentsController|Unable to determine from static route evidence|DocumentResponse; DocumentTargetLinkResponse; DocumentVersionResponse; package-info|HIDRA_DOCUMENTS_CAPABILITIES_READ|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/documents/document-versions|documents|SpringDocumentsController|LinkDocumentToTargetRequest; RegisterDocumentRequest; UploadDocumentVersionRequest; package-info|DocumentResponse; DocumentTargetLinkResponse; DocumentVersionResponse; package-info|HIDRA_DOCUMENTS_DOCUMENT_VERSIONS_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/documents/documents|documents|SpringDocumentsController|LinkDocumentToTargetRequest; RegisterDocumentRequest; UploadDocumentVersionRequest; package-info|DocumentResponse; DocumentTargetLinkResponse; DocumentVersionResponse; package-info|HIDRA_DOCUMENTS_DOCUMENTS_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/documents/link-document-to-target|documents|SpringDocumentsController|LinkDocumentToTargetRequest; RegisterDocumentRequest; UploadDocumentVersionRequest; package-info|DocumentResponse; DocumentTargetLinkResponse; DocumentVersionResponse; package-info|HIDRA_DOCUMENTS_LINK_DOCUMENT_TO_TARGET_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/documents/register-document|documents|SpringDocumentsController|LinkDocumentToTargetRequest; RegisterDocumentRequest; UploadDocumentVersionRequest; package-info|DocumentResponse; DocumentTargetLinkResponse; DocumentVersionResponse; package-info|HIDRA_DOCUMENTS_REGISTER_DOCUMENT_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/documents/target-links|documents|SpringDocumentsController|LinkDocumentToTargetRequest; RegisterDocumentRequest; UploadDocumentVersionRequest; package-info|DocumentResponse; DocumentTargetLinkResponse; DocumentVersionResponse; package-info|HIDRA_DOCUMENTS_TARGET_LINKS_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/documents/upload-document-version|documents|SpringDocumentsController|LinkDocumentToTargetRequest; RegisterDocumentRequest; UploadDocumentVersionRequest; package-info|DocumentResponse; DocumentTargetLinkResponse; DocumentVersionResponse; package-info|HIDRA_DOCUMENTS_UPLOAD_DOCUMENT_VERSION_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|GET /api/v1/hse/capabilities|hse|SpringHseController|Unable to determine from static route evidence|HseCapaResponse; HseCaseResponse; package-info|HIDRA_HSE_CAPABILITIES_READ|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/hse/capas|hse|SpringHseController|CloseHseCaseRequest; CreateHseCapaRequest; OpenHseCaseRequest; package-info|HseCapaResponse; HseCaseResponse; package-info|HIDRA_HSE_CAPAS_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/hse/cases|hse|SpringHseController|CloseHseCaseRequest; CreateHseCapaRequest; OpenHseCaseRequest; package-info|HseCapaResponse; HseCaseResponse; package-info|HIDRA_HSE_CASES_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/hse/cases/closures|hse|SpringHseController|CloseHseCaseRequest; CreateHseCapaRequest; OpenHseCaseRequest; package-info|HseCapaResponse; HseCaseResponse; package-info|HIDRA_HSE_CASES_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/hse/close-hse-case|hse|SpringHseController|CloseHseCaseRequest; CreateHseCapaRequest; OpenHseCaseRequest; package-info|HseCapaResponse; HseCaseResponse; package-info|HIDRA_HSE_CLOSE_HSE_CASE_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/hse/create-hse-capa|hse|SpringHseController|CloseHseCaseRequest; CreateHseCapaRequest; OpenHseCaseRequest; package-info|HseCapaResponse; HseCaseResponse; package-info|HIDRA_HSE_CREATE_HSE_CAPA_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/hse/open-hse-case|hse|SpringHseController|CloseHseCaseRequest; CreateHseCapaRequest; OpenHseCaseRequest; package-info|HseCapaResponse; HseCaseResponse; package-info|HIDRA_HSE_OPEN_HSE_CASE_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|GET /api/v1/identity/capabilities|identity|SpringIdentityController|Unable to determine from static route evidence|PermissionDecisionResponse; UserResponse; package-info|HIDRA_IDENTITY_CAPABILITIES_READ|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/identity/create-user|identity|SpringIdentityController|CreateUserRequest; EvaluatePermissionRequest; package-info|PermissionDecisionResponse; UserResponse; package-info|HIDRA_IDENTITY_CREATE_USER_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/identity/evaluate|identity|SpringIdentityController|CreateUserRequest; EvaluatePermissionRequest; package-info|PermissionDecisionResponse; UserResponse; package-info|HIDRA_IDENTITY_EVALUATE_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/identity/evaluate-permission|identity|SpringIdentityController|CreateUserRequest; EvaluatePermissionRequest; package-info|PermissionDecisionResponse; UserResponse; package-info|HIDRA_IDENTITY_EVALUATE_PERMISSION_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/identity/permissions/evaluations|identity|SpringIdentityController|CreateUserRequest; EvaluatePermissionRequest; package-info|PermissionDecisionResponse; UserResponse; package-info|HIDRA_IDENTITY_PERMISSIONS_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/identity/users|identity|SpringIdentityController|CreateUserRequest; EvaluatePermissionRequest; package-info|PermissionDecisionResponse; UserResponse; package-info|HIDRA_IDENTITY_USERS_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|GET /api/v1/incident/capabilities|incident|SpringIncidentController|Unable to determine from static route evidence|IncidentResponse; package-info|HIDRA_INCIDENT_CAPABILITIES_READ|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/incident/close-incident|incident|SpringIncidentController|CloseIncidentRequest; OpenIncidentRequest; RecordIncidentResponseActionRequest; package-info|IncidentResponse; package-info|HIDRA_INCIDENT_CLOSE_INCIDENT_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/incident/incidents|incident|SpringIncidentController|CloseIncidentRequest; OpenIncidentRequest; RecordIncidentResponseActionRequest; package-info|IncidentResponse; package-info|HIDRA_INCIDENT_INCIDENTS_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/incident/incidents/closures|incident|SpringIncidentController|CloseIncidentRequest; OpenIncidentRequest; RecordIncidentResponseActionRequest; package-info|IncidentResponse; package-info|HIDRA_INCIDENT_INCIDENTS_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/incident/open-incident|incident|SpringIncidentController|CloseIncidentRequest; OpenIncidentRequest; RecordIncidentResponseActionRequest; package-info|IncidentResponse; package-info|HIDRA_INCIDENT_OPEN_INCIDENT_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|
|POST /api/v1/incident/record-response-action|incident|SpringIncidentController|CloseIncidentRequest; OpenIncidentRequest; RecordIncidentResponseActionRequest; package-info|IncidentResponse; package-info|HIDRA_INCIDENT_RECORD_RESPONSE_ACTION_EXECUTE|Derived metadata; route-specific backend @PreAuthorize evidence unavailable|


---

# 16 — Frontend Coding Standards

## Core rules

- TypeScript strict mode is mandatory.
- No component may call Axios directly.
- Use TanStack Query for server state.
- Use React Hook Form + Zod for forms.
- Use React Router route objects with permission metadata.
- Use module feature folders aligned with HidraAPI module names.
- Do not invent DTO fields.
- Do not hard-code permissions outside the generated permission registry.

## Component rules

- Business pages live under `features/<module>/pages`.
- Reusable business-free components live under `shared/components`.
- Avoid prop drilling across shell boundaries; use composition.

## Hook rules

- Query hooks are named `use<Thing>Query`.
- Mutation hooks are named `use<Action>Mutation`.
- Hooks must not create raw URLs; URLs live in API service files.

## Error rules

- All API errors pass through `normalizeProblemDetail`.
- Fatal operational errors show blocking banners.
- Validation errors bind to form fields when possible.


---

# 17 — State Management Strategy

## Server state

TanStack Query owns all server data: workbench resources, topology layers, permissions, notifications, dashboard metrics and detail records.

## Session state

Auth context owns token/session metadata, active user claims, language and organization scope.

## UI state

Local React state or URL search parameters own drawers, tab selection, filters and density.

## Form state

React Hook Form owns form input state; Zod owns validation.

## Realtime state

SSE/STOMP adapters shall not mutate complex global stores directly. They publish events that trigger notification center updates and TanStack Query invalidation.

## Cache key contract

```text
['workbench', module, resource, filters, page, size, organizationScope]
['topology', 'layers']
['topology', 'geojson', layers, filters]
['security', 'permission-catalog']
['realtime', 'capabilities']
```


---

# 18 — Topology & Map Specification

## Backend evidence

Topology map APIs currently expose:

- `GET /api/v1/topology/map/layers`
- `GET /api/v1/topology/map/layers/{layerId}`
- `GET /api/v1/topology/map/layers/{layerId}/features`
- `GET /api/v1/topology/map/geojson`
- `GET /api/v1/topology/map/search`

Supported layers from current backend evidence: **facilities, pipeline-segments, topology-connections, topology-nodes**.

## Layer interpretation

- `facilities`: stations, terminals and operational facilities.
- `topology-nodes`: network nodes.
- `pipeline-segments`: renderable line sections; pipelines are currently implicit through segment properties.
- `topology-connections`: logical network relationships.

## Important gap

Explicit `pipeline-systems` and `pipelines` GIS layers are not currently present in backend evidence. The frontend must not pretend these are available. It may group by segment properties when provided, but the gap remains.

## Map architecture

- Leaflet map container with layer tree.
- GeoJSON renderer per layer.
- Marker clustering for facilities/nodes.
- Polyline styling for pipeline segments.
- Popup and side panel for feature details.
- Legend synchronized with visible layers.
- Search box calling backend topology search endpoint.
- Filter drawer for layer, status, operating region and text search when backend supports them.
- Realtime overlays from SSE/STOMP only when events include layer/resource identifiers.

## Editing capabilities

Unable to determine from available evidence. Current topology map endpoints are read/search visualization contracts; no geometry editing endpoint evidence was found.


---

# 19 — Frontend Delivery Roadmap

The roadmap workbook is available in `spreadsheets/19-Frontend-Roadmap.xlsx`.

## Phases

1. Foundation.
2. Authentication and shell.
3. Core business modules.
4. Topology and visualization.
5. Workflow optimization.
6. Operational excellence enhancements.


---

# 20 — Definition of Done

## Functionality

- Screen uses only APIs present in the API catalog or documented as a gap.
- All data fetching uses TanStack Query.
- All forms use React Hook Form + Zod.
- All module pages support French labels and Arabic readiness.

## Security

- Route guard implemented.
- Menu guard implemented.
- Action guard implemented.
- Token expiry and 401/403 handling verified.

## UX

- Loading, empty, error and success states implemented.
- Tables support pagination/search/filter as appropriate.
- Critical actions require confirmation.
- Accessibility checks pass for keyboard and contrast.

## Code quality

- TypeScript strict pass.
- Unit tests for services/hooks/components.
- No raw Axios calls in components.
- No hard-coded backend assumptions.

## Operational acceptance

- Control room operator can reach dashboard, topology, monitoring and alarms within two navigation levels.
- Field supervisor can find assigned resources and incidents quickly.
- Validator can locate pending workflow tasks when backend metadata supports it.


---

# 21 — Gap Analysis Report

## Backend–frontend alignment table

|Backend Capability|Frontend Impact|Risk|Recommendation|
|---|---|---|---|
|24 business modules under dz.sh.hidra.modules|Use modular route ownership and feature folders per module.|Teams may duplicate cross-module UI patterns.|Adopt one module shell template and central workbench components.|
|Spring MVC controllers and capabilities endpoints|Can discover operations and expose module actions.|Command routes may lack rich list/detail semantics for some use cases.|Use generic workbench APIs for list/detail/search and command aliases for actions.|
|Generic operational workbench APIs|Enables resource lists/detail/search for all JPA-backed resources.|Generic records may not provide business-friendly display fields.|Create frontend column metadata adapters and request backend display metadata later if needed.|
|Derived permission catalog APIs|Can drive menu/route/action guards from backend route metadata.|Catalog is metadata-only; no route-specific @PreAuthorize evidence.|Treat permissions as display/guard contract, not as proof of backend enforcement.|
|Topology GIS GeoJSON endpoints|Leaflet map can render layers, search and popups.|Pipeline systems and pipelines are not explicit layers unless backend adds them.|Visualize pipeline segments now; request explicit pipeline-systems and pipelines layers for enterprise GIS grouping.|
|JWT resource-server security|Use bearer tokens and role/scope claims.|No local login or refresh endpoint.|Integrate with enterprise IdP; do not invent HidraAPI login API.|
|ProblemDetail global error handling|Standard error contract can support toast/dialog/form mapping.|Field-level error shape may vary.|Central Axios error normalizer around ProblemDetail fields.|
|Async notification push and realtime SSE/STOMP|Can show live notification/event surfaces.|Provider push gateway is local placeholder.|Separate UI notification center from provider delivery semantics.|

## High-priority gaps

1. Route-specific backend authorization enforcement evidence is unavailable.
2. IdP login, refresh and logout endpoints are unavailable from HidraAPI evidence.
3. Exact workflow states and allowed actions are unavailable from frontend-facing metadata.
4. Topology lacks explicit `pipeline-systems` and `pipelines` GIS layers.
5. Notification provider delivery remains local placeholder unless production providers are added.
6. Workbench APIs are generic and may need display metadata for polished UX.

## Final verdict

**READY WITH CONDITIONS**.

HidraAPI now has sufficient frontend-facing contracts to approve HidraWeb governance and begin phased implementation. Conditions remain around security enforcement metadata, explicit GIS hierarchy, production IdP/provider integration and workflow action metadata.
