# HidraWEB

Hydrocarbon Intelligence for Data, Risk, and Analytics — Web Application.

HidraWEB is the operational enterprise frontend for HidraAPI. The repository is currently in the **architecture/documentation baseline** phase; React source scaffolding shall start only after the approved architecture and API contract are treated as implementation constraints.

## Canonical architecture

The following documents are authoritative:

1. [`docs/architecture/HidraWeb-Information-Architecture.md`](docs/architecture/HidraWeb-Information-Architecture.md)  
   Defines user processes, navigation, workspace hierarchy and frontend routing intent.

2. [`docs/architecture/Hidra-API-Web-Contract-v1.md`](docs/architecture/Hidra-API-Web-Contract-v1.md)  
   Defines the normative HidraAPI–HidraWeb interface, contract status rules, permissions, OpenAPI usage, errors, topology, workflow and realtime integration.

3. [`docs/architecture/HidraWeb-Technical-Architecture.md`](docs/architecture/HidraWeb-Technical-Architecture.md)  
   Defines React/TypeScript technology, source structure, dependency rules, API generation, MapLibre integration, testing, CI and deployment architecture.

If another document conflicts with one of these three canonical documents, the canonical document wins.

## Aligned implementation guides

These existing documents have been aligned with the canonical baseline:

- [`docs/03-Frontend-Macro-Architecture.md`](docs/03-Frontend-Macro-Architecture.md)
- [`docs/04-Frontend-Micro-Architecture.md`](docs/04-Frontend-Micro-Architecture.md)
- [`docs/06-Navigation-Blueprint.md`](docs/06-Navigation-Blueprint.md)
- [`docs/11-Wireframes-Figma-Brief.md`](docs/11-Wireframes-Figma-Brief.md)
- [`docs/18-Topology-Specification.md`](docs/18-Topology-Specification.md)

## Supporting evidence and catalogs

Existing endpoint inventories, page inventories, spreadsheets, gap analyses and generated/all-in-one governance packages remain useful as **supporting evidence and historical analysis**.

They do not override the canonical architecture above.

In particular, historical references to module-first navigation or Leaflet are superseded by the current canonical decisions:

```text
Primary navigation  = process-oriented
Frontend structure  = modules + processes + features
Map engine           = MapLibre GL JS behind HidraMap abstraction
API contract         = HidraAPI/OpenAPI -> generated TypeScript, with catalogs retained for governance
Architecture style   = modular frontend monolith; no micro-frontends
```

## Backend ownership rule

HidraAPI remains the source of business truth and final authorization enforcement.

HidraWEB owns presentation, interaction composition, client-side caching, route/action guards and operational feedback. It must not invent unsupported backend entities, workflows, permissions or business rules.
