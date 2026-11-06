import type { EngineeringGraphDraftUpdateRequest, EngineeringGraphDraftResponse, PipelineAuthoringReferenceRequest, StationConfigurationGraphRevisionRequest, TopologyFoundationInstallation } from '@/api/generated/topology/model';

export function editableGraph(graph?: EngineeringGraphDraftResponse): EngineeringGraphDraftUpdateRequest {
  return { expectedVersion: graph?.version ?? 1, nodes: graph?.nodes?.map(x => ({ ...x })) ?? [], ports: graph?.ports?.map(x => ({ ...x })) ?? [], branches: graph?.branches?.map(x => ({ ...x })) ?? [] };
}
/** UI checks prevent accidental dangling edits; the owner validates every command again. */
export function graphProblems(graph: EngineeringGraphDraftUpdateRequest, references: PipelineAuthoringReferenceRequest[]) {
  const nodes = new Set(graph.nodes?.map(x => x.id)); const ports = new Set(graph.ports?.map(x => x.id));
  return !graph.nodes?.length || !graph.branches?.length ||
    graph.ports?.some(p => !nodes.has(p.nodeId)) ||
    graph.branches.some(b => !ports.has(b.fromPortId) || !ports.has(b.toPortId) || b.fromPortId === b.toPortId || (b.kind === 'PIPE' && !references.some(r => r.branchId === b.id && r.pipelineId))) ||
    new Set(graph.nodes.map(x => x.id)).size !== graph.nodes.length ||
    new Set(graph.ports?.map(x => x.id)).size !== graph.ports?.length ||
    new Set(graph.branches.map(x => x.id)).size !== graph.branches.length;
}
/** Explicit serial template, shown for operator review before authoring/publication. */
export function serialStationGraph(facilityId: string, installations: TopologyFoundationInstallation[], instant: string, evidenceReference: string): StationConfigurationGraphRevisionRequest {
  const revisionId = crypto.randomUUID();
  const units = installations.map((i, n) => ({ equipmentId: i.positionId, facilityId, inletPortId: `unit-${n}-in`, outletPortId: `unit-${n}-out` }));
  const edges = units.map((u, n) => ({ id: `edge-${n}`, fromPortId: n ? units[n - 1].outletPortId : 'suction', toPortId: u.inletPortId }));
  edges.push({ id: `edge-${units.length}`, fromPortId: units.at(-1)?.outletPortId ?? 'suction', toPortId: 'discharge' });
  return { facilityId, revisionId, recordedAt: instant, effectiveFrom: instant, evidenceReference, sourceClassification: 'SYNTHETIC', qualification: 'STRUCTURALLY_QUALIFIED', graph: { facilityId, revisionId, status: 'COMPLETE', headers: [{ id: 'suction-header', kind: 'SUCTION', portId: 'suction' }, { id: 'discharge-header', kind: 'DISCHARGE', portId: 'discharge' }], units, edges } };
}
