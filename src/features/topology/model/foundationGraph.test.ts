import { describe, expect, it } from 'vitest';
import { editableGraph, graphProblems, serialStationGraph } from './foundationGraph';

describe('foundation persisted graph editing',()=>{
  it('retains exact owner version and does not mutate the loaded graph',()=>{
    const loaded={version:7,nodes:[{id:'a',kind:'JUNCTION'}],ports:[],branches:[]};const draft=editableGraph(loaded);draft.nodes![0].kind='STATION';expect(loaded.nodes[0].kind).toBe('JUNCTION');expect(draft.expectedVersion).toBe(7);
  });
  it('rejects dangling ports, duplicate identities and PIPE without association',()=>{
    const graph={nodes:[{id:'a'},{id:'b'}],ports:[{id:'out',nodeId:'a'},{id:'in',nodeId:'b'}],branches:[{id:'pipe',kind:'PIPE',fromPortId:'out',toPortId:'in'}]};
    expect(graphProblems(graph,[])).toBeTruthy();expect(graphProblems(graph,[{branchId:'pipe',pipelineId:'canonical'}])).toBeFalsy();
    expect(graphProblems({...graph,ports:graph.ports.slice(1)},[{branchId:'pipe',pipelineId:'canonical'}])).toBeTruthy();
    expect(graphProblems({...graph,nodes:[{id:'a'},{id:'a'}]},[{branchId:'pipe',pipelineId:'canonical'}])).toBeTruthy();
  });
  it('pins explicit serial positions without pretending to have surveyed geometry',()=>{
    const graph=serialStationGraph('station',[{positionId:'p1'},{positionId:'p2'}],'2026-11-06T12:00:00Z','synthetic:operator');
    expect(graph.graph?.units?.map(x=>x.equipmentId)).toEqual(['p1','p2']);expect(graph.graph?.edges).toHaveLength(3);expect(graph.sourceClassification).toBe('SYNTHETIC');expect(graph.evidenceReference).toBe('synthetic:operator');expect(graph).not.toHaveProperty('geometry');
  });
});
