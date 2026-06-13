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
