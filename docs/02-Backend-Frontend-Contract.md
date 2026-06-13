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
