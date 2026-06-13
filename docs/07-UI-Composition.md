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
