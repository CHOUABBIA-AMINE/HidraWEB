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
