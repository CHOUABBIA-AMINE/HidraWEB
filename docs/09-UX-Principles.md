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
