import { Alert, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { StationConfigurationGraphRevisionRequest, TopologyFoundationInstallation } from '@/api/generated/topology/model';
import * as api from '../api/foundationTopologyApi';
import { serialStationGraph } from '../model/foundationGraph';
import { CommandState, Failure, useTopologyAction, useOwnerCommand } from './FoundationControls';
import { normalizeHidraApiError } from '@/api/errors/HidraApiError';

export function StationConfigurationPanel({company,facility,reason,installations,complete}:{company:string;facility:string;reason:string;installations:TopologyFoundationInstallation[];complete:boolean}) {
  const can=useTopologyAction();
  const {t}=useTranslation();const [proposal,setProposal]=useState<StationConfigurationGraphRevisionRequest>();const [authored,setAuthored]=useState(false);
  const [historyCursor,setHistoryCursor]=useState<string>(); const [instant,setInstant]=useState(new Date().toISOString());
  const graph=useQuery({queryKey:['hidra','topology','station-graph',company,facility],queryFn:()=>api.readCurrentProtectedStationGraphRevision(facility,{companyPartyId:company}),retry:false});
  const config=useQuery({queryKey:['hidra','topology','station-config',company,facility],queryFn:()=>api.readCurrentInstalledStationConfiguration(facility,{companyPartyId:company}),retry:false});
  const history=useQuery({queryKey:['hidra','topology','station-config-history',company,facility,historyCursor],queryFn:()=>api.listInstalledStationConfigurationHistory(facility,{companyPartyId:company,cursor:historyCursor,limit:20}),retry:false});
  const command=useOwnerCommand<unknown>(()=>{void graph.refetch();void config.refetch();void history.refetch();});
  const refused=[graph.error,config.error,history.error].find(e=>e&&normalizeHidraApiError(e).status!==404);
  const blocked=command.isPending||command.isError||Boolean(refused);
  const current=graph.data?.revision;
  return <Paper variant="outlined" sx={{p:2}}><Stack spacing={2}>
    <Typography variant="h6">{t('topology.editor.configuration')}</Typography><Alert severity="info">{t('topology.editor.serialTemplate')}</Alert>
    <TextField label={t('topology.editor.configurationInstant')} value={instant} onChange={e=>setInstant(e.target.value)}/>
    <Failure error={refused}/>
    <Button disabled={!complete||!installations.length||!reason.trim()||!Number.isFinite(Date.parse(instant))||blocked} onClick={()=>{setProposal({...serialStationGraph(facility,installations,new Date(instant).toISOString(),reason),...(current?.revisionId?{expectedPredecessorRevisionId:current.revisionId}:{})});setAuthored(false);}}>{t('topology.editor.prepareStation')}</Button>
    {proposal&&<Stack><Typography>{t('topology.editor.unsaved')}: {proposal.revisionId}</Typography>{proposal.graph?.edges?.map(e=><Typography key={e.id}>{e.fromPortId} → {e.toPortId}</Typography>)}</Stack>}
    <Button disabled={!can('topology:station-revision:author')||!proposal||authored||blocked} onClick={()=>command.mutate(async()=>{const r=await api.authorProtectedStationGraphRevision(facility,proposal!.revisionId!,{companyPartyId:company,revision:proposal});setAuthored(true);return r;})}>{t('topology.editor.authorStation')}</Button>
    <Button disabled={!can('topology:station-revision:publish')||!proposal||!authored||blocked||graph.isFetching} onClick={()=>command.mutate(async()=>{const r=await api.publishProtectedStationGraphRevision(facility,{companyPartyId:company,revisionId:proposal?.revisionId,expectedEpoch:graph.data?.head?.epoch??0,expectedRevisionId:graph.data?.head?.revisionId});setProposal(undefined);setAuthored(false);return r;})}>{t('topology.editor.publishStation')}</Button>
    <Typography>{t('topology.editor.graphEpoch')}: {graph.data?.head?.epoch??'—'} · {graph.data?.canonicalSha256??'—'}</Typography>
    <Button variant="contained" disabled={!can('topology:installed-configuration:save')||!current||!graph.data?.head?.epoch||!complete||!installations.length||!reason.trim()||blocked||graph.isFetching||config.isFetching||!Number.isFinite(Date.parse(instant))} onClick={()=>command.mutate(()=>api.saveInstalledStationConfiguration(facility,{
      companyPartyId:company,requestId:crypto.randomUUID(),revisionId:crypto.randomUUID(),expectedEpoch:config.data?.snapshot?.selectedEpoch??0,
      graphHeadEpoch:graph.data?.head?.epoch,graphPayloadFormat:graph.data?.payloadFormat,graphSha256:graph.data?.canonicalSha256,pinnedGraph:current,
      effectiveFrom:new Date(instant).toISOString(),sourceReference:reason,activeEdgeIds:current?.graph?.edges?.map(e=>e.id!).filter(Boolean),
      positions:installations.map(i=>({positionId:i.positionId,disposition:'CONNECTED',installedUnitId:i.unitId,installationId:i.installationId,installationRevision:i.revision,installationFrom:i.effectiveFrom,installationUntil:i.effectiveUntil,installationEvidenceReference:reason})),
    }))}>{t('topology.editor.saveConfiguration')}</Button>
    <Button disabled={command.isPending} onClick={()=>{command.reset();setProposal(undefined);setAuthored(false);void graph.refetch();void config.refetch();void history.refetch();}}>{t('topology.editor.reload')}</Button>
    <CommandState pending={command.isPending} error={command.error} reset={()=>{command.reset();setProposal(undefined);setAuthored(false);void graph.refetch();void config.refetch();}}/>
    <Typography role="status">{t('topology.editor.configurationEpoch')}: {config.data?.snapshot?.selectedEpoch??'—'}</Typography>
    <Typography>{t('topology.editor.history')}: {history.data?.history?.length??0}</Typography>{history.data?.history?.map(x=><Typography key={x.revisionId}>{x.selectedEpoch} · {x.revisionId} · {x.recordedAt}</Typography>)}
    <Button disabled={!history.data?.nextCursor} onClick={()=>setHistoryCursor(history.data?.nextCursor)}>{t('topology.editor.more')}</Button>
    <Button disabled={!historyCursor} onClick={()=>setHistoryCursor(undefined)}>{t('topology.editor.first')}</Button>
  </Stack></Paper>;
}
