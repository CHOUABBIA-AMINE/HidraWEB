import { Alert, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as api from '../api/foundationTopologyApi';
import { ChoiceField, CommandState, Failure, useTopologyAction, useOwnerCommand } from './FoundationControls';
import { StationConfigurationPanel } from './StationConfigurationPanel';

export function InstalledUnitPanel({company,facility,reason,system,draftId}:{company:string;facility:string;reason:string;system:string;draftId:string}) {
  const can=useTopologyAction();
  const {t}=useTranslation();const [kind,setKind]=useState('');const [position,setPosition]=useState('');const [unit,setUnit]=useState('');const [code,setCode]=useState('');const [instant,setInstant]=useState(new Date().toISOString());
  const [kindCursor,setKindCursor]=useState<string>();const [positionCursor,setPositionCursor]=useState<string>();const [installationCursor,setInstallationCursor]=useState<string>();
  const kinds=useQuery({queryKey:['hidra','topology','kinds',company,kindCursor],queryFn:()=>api.discoverTopologyFoundationChoices('EQUIPMENT_KINDS',{companyPartyId:company,cursor:kindCursor,limit:50}),retry:false});
  const positions=useQuery({queryKey:['hidra','topology','positions',company,facility,positionCursor],queryFn:()=>api.discoverTopologyEquipmentPositions(facility,{companyPartyId:company,cursor:positionCursor,limit:50}),retry:false});
  const installs=useQuery({queryKey:['hidra','topology','installations',company,facility,installationCursor],queryFn:()=>api.discoverTopologyCurrentInstallations(facility,{companyPartyId:company,cursor:installationCursor,limit:50}),retry:false});
  const units=useQuery({queryKey:['hidra','topology','unit-choices',company,system,draftId],queryFn:()=>api.discoverFoundationTopologyChoices(draftId,{companyPartyId:company,pipelineSystemId:system,limit:200}),enabled:Boolean(system&&draftId),retry:false});
  const readUnit=useQuery({queryKey:['hidra','topology','unit',company,unit],queryFn:()=>api.readInstalledUnit(unit,{companyPartyId:company}),enabled:Boolean(unit),retry:false});
  const command=useOwnerCommand<unknown>(()=>{void positions.refetch();void installs.refetch();void readUnit.refetch();});
  const blocked=command.isPending||command.isError;
  return <Paper variant="outlined" sx={{p:2}}><Stack spacing={2}>
    <Typography variant="h6">{t('topology.editor.installations')}</Typography><Typography>{facility}</Typography>
    <Alert severity="info">{t('topology.editor.physical')}</Alert><Failure error={kinds.error??positions.error??installs.error??readUnit.error}/>
    <TextField label={t('topology.editor.positionCode')} value={code} onChange={e=>setCode(e.target.value)}/>
    <ChoiceField label={t('topology.editor.kind')} value={kind} items={kinds.data?.items??[]} onChange={setKind}/>
    <Button disabled={!kinds.data?.nextCursor} onClick={()=>setKindCursor(kinds.data?.nextCursor)}>{t('topology.editor.moreKinds')}</Button>
    <Button disabled={!can('topology:foundation:write')||!code.trim()||!kind||!reason.trim()||blocked} onClick={()=>command.mutate(async()=>{const r=await api.registerTopologyEquipmentPosition(facility,{companyPartyId:company,requestId:crypto.randomUUID(),id:crypto.randomUUID(),code,name:code,equipmentKindId:kind,reason});setPosition(r.items?.[0]?.id??'');return r;})}>{t('topology.editor.registerPosition')}</Button>
    <ChoiceField label={t('topology.editor.position')} value={position} items={positions.data?.items??[]} onChange={setPosition}/>
    <Button disabled={!positions.data?.nextCursor} onClick={()=>setPositionCursor(positions.data?.nextCursor)}>{t('topology.editor.morePositions')}</Button>
    <Button disabled={!can('topology:installed-unit:register')||!kind||blocked} onClick={()=>command.mutate(async()=>{const id=crypto.randomUUID();const r=await api.registerInstalledUnit(id,{companyPartyId:company,requestId:crypto.randomUUID(),equipmentKindId:kind,manufacturerParty:{verification:'UNKNOWN'},manufacturerModel:{verification:'UNKNOWN'},serialNumber:{verification:'UNKNOWN'}});setUnit(r.unit?.id??'');return r;})}>{t('topology.editor.registerUnit')}</Button>
    <ChoiceField label={t('topology.editor.existingUnit')} value={unit} items={[...(units.data?.installedUnits??[]),...((unit&&!units.data?.installedUnits?.some(x=>x.id===unit))?[{id:unit,name:unit}]:[])]} onChange={setUnit}/>
    <Failure error={units.error}/>
    <Typography role="status">{t('topology.editor.unit')}: {unit||'—'} · {readUnit.data?.unit?.equipmentKindId??'—'}</Typography>
    <TextField label={t('topology.editor.instant')} value={instant} onChange={e=>setInstant(e.target.value)}/>
    <Button disabled={!can('topology:installed-unit:record-installation')||!position||!unit||!reason.trim()||!Number.isFinite(Date.parse(instant))||blocked} onClick={()=>command.mutate(()=>api.recordInstalledUnitInstallation(unit,{companyPartyId:company,requestId:crypto.randomUUID(),installationId:crypto.randomUUID(),positionId:position,facilityId:facility,effectiveFrom:new Date(instant).toISOString(),evidenceReference:reason}))}>{t('topology.editor.install')}</Button>
    <Button onClick={()=>{command.reset();void positions.refetch();void installs.refetch();}}>{t('topology.editor.reload')}</Button>
    <CommandState pending={command.isPending} error={command.error} reset={()=>{command.reset();void installs.refetch();}}/>
    {installs.data?.installations?.map(i=><Typography key={i.installationId}>{i.positionId} · {i.unitId} · {i.installationId} · {t('topology.editor.revision')} {i.revision}</Typography>)}
    <Button disabled={!installs.data?.nextCursor} onClick={()=>setInstallationCursor(installs.data?.nextCursor)}>{t('topology.editor.moreInstallations')}</Button>
    <StationConfigurationPanel company={company} facility={facility} reason={reason} installations={installs.data?.installations??[]} complete={!installationCursor&&!installs.data?.nextCursor&&!installs.isFetching&&!installs.error}/>
  </Stack></Paper>;
}
