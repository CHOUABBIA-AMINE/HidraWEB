# HidraWeb Enterprise Frontend Governance Package

This package is the implementation governance baseline for **HidraWeb**, the React/TypeScript frontend for **HidraAPI**.


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


## Package deliverables

- Level 0: Vision and executive summary
- Level 1: Backend–Frontend Contract, Macro Architecture, Micro Architecture
- Level 2: Page Inventory, Navigation Blueprint, UI Composition, Workflow Specification
- Level 3: UX Principles, Design System, Figma/Wireframe handoff brief
- Level 4: Authentication, Authorization Matrix, Dynamic Menu Specification
- Level 5: API Catalog, Coding Standards, State Strategy, Topology Specification
- Level 6: Roadmap and Definition of Done

## Important limitation

A native Figma project cannot be generated directly from this environment. The package includes Figma-ready briefs and design tokens (`figma/`) to create the Figma source manually.

## Final verdict

**READY WITH CONDITIONS**. HidraAPI now exposes enough contracts to start HidraWeb architecture and implementation governance, but several production details remain conditional: route-specific authorization enforcement, explicit pipeline-system/pipeline GIS layers, IdP metadata, production notification provider, and business-specific workflow state/action contracts.
