import { Alert, Button, Checkbox, FormControlLabel, Paper, Stack, TextField, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AuthoredTopologyView, EngineeringGraphDraftUpdateRequest, PipelineAuthoringReferenceRequest } from '@/api/generated/topology/model';
import * as api from '../api/foundationTopologyApi';
import { editableGraph, graphProblems } from '../model/foundationGraph';
import { ChoiceField, CommandState, Failure, useTopologyAction, useOwnerCommand } from './FoundationControls';

export function PipelineEditor({ company, system, draftId }: { company: string; system: string; draftId: string }) {
  const can=useTopologyAction();
  const { t } = useTranslation(); const scope = { companyPartyId: company, pipelineSystemId: system };
  const [cursor, setCursor] = useState<string>();
  const choices = useQuery({ queryKey: ['hidra','topology','authoring',company,system,draftId,cursor], queryFn: () => api.discoverFoundationTopologyChoices(draftId,{...scope,cursor,limit:50}), retry:false });
  const view = useQuery({ queryKey:['hidra','topology','authored',company,system,draftId], queryFn:() => api.readFoundationAuthoredTopology(draftId,scope),retry:false });
  const [historyVersion, setHistoryVersion] = useState('');
  const history = useQuery({ queryKey:['hidra','topology','authored-history',company,system,draftId,historyVersion], queryFn:() => api.readFoundationAuthoredTopology(draftId,{...scope,version:Number(historyVersion)}),enabled:/^[1-9]\d*$/.test(historyVersion),retry:false });
  const [graph, setGraph] = useState<EngineeringGraphDraftUpdateRequest>(); const [refs,setRefs] = useState<PipelineAuthoringReferenceRequest[]>([]);
  const [pipelineId,setPipeline] = useState(''); const [code,setCode] = useState(''); const [type,setType] = useState(''); const [station,setStation] = useState('');
  const [from,setFrom] = useState(''); const [to,setTo] = useState(''); const [connector,setConnector] = useState(false); const [segment,setSegment] = useState('');
  const command = useOwnerCommand<AuthoredTopologyView>(result => { setGraph(undefined);setRefs([]);void view.refetch(); void choices.refetch();setPipeline(result.bindings?.[0]?.pipeline?.id ?? ''); });
  const current = graph ?? editableGraph(view.data?.graph); const selectedPipeline = choices.data?.pipelines?.find(x => x.id === pipelineId) ?? view.data?.bindings?.find(x => x.pipeline?.id === pipelineId)?.pipeline;
  const editingRefs = graph ? refs : view.data?.bindings?.map(x => ({branchId:x.branchId,pipelineId:x.pipeline?.id,segmentId:x.segmentId})) ?? [];
  const update = (value: EngineeringGraphDraftUpdateRequest) => { if(!graph) setRefs(editingRefs);setGraph(value); };
  const pipeline = pipelineId || 'new-pipeline';
  const addNode = () => { const id=crypto.randomUUID();update({...current,nodes:[...(current.nodes??[]),{id,kind:station?'STATION':'JUNCTION',...(station?{facilityId:station}:{})}],ports:[...(current.ports??[]),{id:`${id}-in`,nodeId:id,direction:'INLET'},{id:`${id}-out`,nodeId:id,direction:'OUTLET'}]}); };
  return <Paper variant="outlined" sx={{p:2}}><Stack spacing={2}>
    <Typography variant="h6">{t('topology.editor.pipeline')}</Typography><Typography>{t('topology.editor.revision')}: {view.data?.graph?.version ?? '—'} · {draftId}</Typography>
    <Alert severity="info">{t('topology.editor.unsaved')} · {t('topology.editor.noGeometry')}</Alert>
    <Failure error={view.error ?? choices.error} />
    <ChoiceField label={t('topology.editor.pipelineChoice')} value={pipelineId} items={choices.data?.pipelines ?? []} onChange={id=>{setPipeline(id);const p=choices.data?.pipelines?.find(x=>x.id===id);setCode(p?.code??'');setType(p?.pipelineTypeId??'');}} />
    <TextField label={t('topology.editor.pipelineCode')} value={code} onChange={e=>setCode(e.target.value)} />
    <ChoiceField label={t('topology.editor.pipelineType')} value={type} items={choices.data?.pipelineTypes??[]} onChange={setType} />
    <ChoiceField label={t('topology.editor.stationNode')} value={station} items={choices.data?.facilities??[]} onChange={setStation} />
    <Button onClick={addNode} disabled={view.isFetching || Boolean(view.error)}>{t(station?'topology.editor.addStation':'topology.editor.addJunction')}</Button>
    {current.nodes?.map(n=><Stack direction="row" key={n.id} sx={{gap:1}}><Typography>{n.kind} · {n.facilityId ?? n.id}</Typography><Button onClick={()=>update({...current,nodes:current.nodes?.filter(x=>x.id!==n.id),ports:current.ports?.filter(x=>x.nodeId!==n.id)})}>{t('topology.editor.remove')}</Button></Stack>)}
    <ChoiceField label={t('topology.editor.from')} value={from} items={current.ports?.map(p=>({id:p.id,code:p.direction,name:`${(current.nodes?.findIndex(n=>n.id===p.nodeId)??-1)+1} · ${current.nodes?.find(n=>n.id===p.nodeId)?.kind??''}`}))??[]} onChange={setFrom} />
    <ChoiceField label={t('topology.editor.to')} value={to} items={current.ports?.map(p=>({id:p.id,code:p.direction,name:`${(current.nodes?.findIndex(n=>n.id===p.nodeId)??-1)+1} · ${current.nodes?.find(n=>n.id===p.nodeId)?.kind??''}`}))??[]} onChange={setTo} />
    <ChoiceField label={t('topology.editor.segment')} value={segment} items={choices.data?.segments??[]} onChange={setSegment} />
    <FormControlLabel control={<Checkbox checked={connector} onChange={e=>setConnector(e.target.checked)} />} label={t('topology.editor.connector')} />
    <Button disabled={!from||!to||from===to} onClick={()=>{const id=crypto.randomUUID();update({...current,branches:[...(current.branches??[]),{id,kind:connector?'CONNECTOR':'PIPE',fromPortId:from,toPortId:to}]});setRefs([...editingRefs,...(connector?[]:[{branchId:id,pipelineId:pipeline,...(segment?{segmentId:segment}:{})}])]);}}>{t('topology.editor.addBranch')}</Button>
    {current.branches?.map(b=><Stack direction="row" sx={{gap:1}} key={b.id}><Typography>{b.kind}: {b.fromPortId} → {b.toPortId}</Typography><Button onClick={()=>{update({...current,branches:current.branches?.filter(x=>x.id!==b.id)});setRefs(editingRefs.filter(x=>x.branchId!==b.id));}}>{t('topology.editor.remove')}</Button></Stack>)}
    <Button variant="contained" disabled={!can('topology:engineering-draft:update') || !graph || Boolean(view.data?.bindings?.length && !pipelineId) || !code.trim() || !type || graphProblems(current,editingRefs) || command.isPending || command.isError || Boolean(view.error || choices.error) || choices.isFetching || view.isFetching} onClick={()=>{
      const id=pipelineId||crypto.randomUUID();
      command.mutate(()=>api.writeFoundationPipelineAndGraph(draftId,{requestId:crypto.randomUUID(),pipeline:{id,code,nameEn:code,pipelineTypeId:type,expectedRevision:selectedPipeline?.revision??0},graph:current,references:editingRefs.map(r=>({...r,pipelineId:r.pipelineId==='new-pipeline'?id:r.pipelineId}))},scope));
    }}>{t('topology.editor.saveGraph')}</Button>
    <Button onClick={()=>{setGraph(undefined);setRefs([]);command.reset();void view.refetch();void choices.refetch();}} disabled={command.isPending}>{t('topology.editor.reload')}</Button>
    <CommandState pending={command.isPending} error={command.error} reset={()=>{setGraph(undefined);command.reset();void view.refetch();}} />
    <Typography component="div" role="status">{t('topology.editor.persisted')}: {view.data?.graph?.version??'—'} · {view.data?.geometryStatus??'—'}</Typography>
    {view.data?.graph?.nodes?.length ? <svg role="img" aria-label={t('topology.editor.persistedSchematic')} viewBox="0 0 640 160" style={{width:'100%',maxHeight:200}}>
      {view.data.graph.branches?.map(b=>{const nodes=view.data!.graph!.nodes!;const ports=view.data!.graph!.ports??[];const from=nodes.findIndex(n=>n.id===ports.find(p=>p.id===b.fromPortId)?.nodeId);const to=nodes.findIndex(n=>n.id===ports.find(p=>p.id===b.toPortId)?.nodeId);if(from<0||to<0)return null;return <line key={b.id} x1={40+from*560/Math.max(1,nodes.length-1)} y1="60" x2={40+to*560/Math.max(1,nodes.length-1)} y2="60" stroke="currentColor" strokeWidth="2"/>;})}
      {view.data.graph.nodes.map((n,i)=><g key={n.id} transform={`translate(${40+i*560/Math.max(1,view.data!.graph!.nodes!.length-1)},60)`}><circle r="12" fill="currentColor"/><text y="35" textAnchor="middle" fill="currentColor" fontSize="12">{i+1} · {n.kind}</text><title>{n.facilityId??n.id}</title></g>)}
    </svg> : null}
    {view.data?.bindings?.map(b=><Typography key={b.branchId}>{b.pipeline?.code} · {b.pipeline?.nameEn} · {b.pipeline?.revision} · {b.segmentId??''}</Typography>)}
    {view.data?.diagnostics?.map((d,i)=><Alert severity="info" key={i}>{d}</Alert>)}
    <TextField type="number" label={t('topology.editor.historyVersion')} value={historyVersion} onChange={e=>setHistoryVersion(e.target.value)} />
    <Failure error={history.error} />{history.data?.bindings?.map(b=><Typography key={b.branchId}>{t('topology.editor.history')}: {b.pipeline?.code} · {b.pipeline?.nameEn} · {b.pipeline?.revision}</Typography>)}
    <Stack direction="row"><Button disabled={!cursor} onClick={()=>setCursor(undefined)}>{t('topology.editor.first')}</Button><Button disabled={!choices.data?.nextCursor} onClick={()=>setCursor(choices.data?.nextCursor)}>{t('topology.editor.more')}</Button></Stack>
  </Stack></Paper>;
}
