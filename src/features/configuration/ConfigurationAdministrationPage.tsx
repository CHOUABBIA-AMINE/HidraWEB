import { Alert, Button, Checkbox, Container, FormControlLabel, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { usePermissions } from '@/features/permissions/usePermissions';
import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import * as api from './api/configurationApi';

function Choice({label,value,onChange,items}:{label:string;value:string;onChange:(v:string)=>void;items:{id?:string;label?:string}[]}) {
 return <TextField select label={label} value={value} onChange={e=>onChange(e.target.value)}><MenuItem value="">Choose</MenuItem>{items.map(x=><MenuItem key={x.id} value={x.id}>{x.label??x.id}</MenuItem>)}</TextField>;
}
function Field({label,value,set}:{label:string;value:string;set:(v:string)=>void}) {return <TextField label={label} value={value} onChange={e=>set(e.target.value)}/>;}
function Failure({error}:{error:unknown}) {if(!error)return null;const e=normalizeHidraApiError(error);return <Alert severity="error">{e.status===403?'HidraAPI refused this configuration operation.':e.status===409?'Configuration changed. Reload and review before submitting again.':'Configuration operation failed.'}</Alert>;}
export function ConfigurationAdministrationPage(){
 const permissions=usePermissions();
 // B5 is deliberately administrator-only, including counts and choice discovery.
 if(permissions.status!=='ready'||!permissions.can('*'))return <Alert severity="info">Current Configuration administrator authority required.</Alert>;
 return <ConfigurationEditor/>;
}
function ConfigurationEditor(){
 const cache=useQueryClient();
 const [namespace,setNamespace]=useState(''),[selected,setSelected]=useState(''),[flag,setFlag]=useState('');
 const [nsOffset,setNsOffset]=useState(0),[defOffset,setDefOffset]=useState(0),[flagOffset,setFlagOffset]=useState(0),[valueOffset,setValueOffset]=useState(0);
 const [key,setKey]=useState(''),[name,setName]=useState(''),[type,setType]=useState('STRING'),[sensitivity,setSensitivity]=useState('INTERNAL'),[defaultValue,setDefault]=useState('');
 const [environment,setEnvironment]=useState('TEST'),[instant,setInstant]=useState(new Date().toISOString()),[from,setFrom]=useState(new Date().toISOString()),[until,setUntil]=useState(''),[raw,setRaw]=useState(''),[confirmed,setConfirmed]=useState(false);
 const [flagCode,setFlagCode]=useState(''),[flagName,setFlagName]=useState(''),[defaultEnabled,setDefaultEnabled]=useState(false),[enabled,setEnabled]=useState(false);
 const scope=['hidra','configuration'];
 const namespaces=useQuery({queryKey:[...scope,'namespaces',nsOffset],queryFn:()=>api.namespaces({limit:25,offset:nsOffset}),retry:false});
 const definitions=useQuery({queryKey:[...scope,'definitions',namespace,defOffset],queryFn:()=>api.definitions({namespaceId:namespace,limit:25,offset:defOffset}),enabled:!!namespace,retry:false});
 const detail=useQuery({queryKey:[...scope,'definition',selected],queryFn:()=>api.definition(selected),enabled:!!selected,retry:false});
 const flags=useQuery({queryKey:[...scope,'flags',flagOffset],queryFn:()=>api.flags({limit:25,offset:flagOffset}),retry:false});
 const selectedFlag=flags.data?.find(x=>x.id===flag);
 const environmentValid=/^[A-Za-z0-9][A-Za-z0-9_.-]{0,39}$/.test(environment);
 const effective=useQuery({queryKey:[...scope,'effective',selected,environment,instant],queryFn:()=>api.effective({definitionId:selected,environment,instant}),enabled:!!selected&&detail.data?.status==='ACTIVE'&&environmentValid&&Number.isFinite(Date.parse(instant)),retry:false});
 const history=useQuery({queryKey:[...scope,'values',selected,environment,valueOffset],queryFn:()=>api.values({definitionId:selected,environment,limit:25,offset:valueOffset}),enabled:!!selected&&environmentValid,retry:false});
 const state=useQuery({queryKey:[...scope,'flag-state',flag,environment],queryFn:()=>api.flagState(flag,{environment}),enabled:!!flag&&selectedFlag?.status==='ACTIVE'&&environmentValid,retry:false});
 const command=useMutation({mutationFn:(fn:()=>Promise<unknown>)=>fn(),retry:false,onSuccess:async()=>{setRaw('');setConfirmed(false);await cache.invalidateQueries({queryKey:scope});}});
 const blocked=command.isPending||command.isError;
 const current=detail.data;

 const supported=!!current&&!current.redacted&&['PUBLIC','INTERNAL'].includes(current.sensitivity??'')&&['STRING','BOOLEAN','NUMBER'].includes(current.valueType??'');
 const refresh=()=>{command.reset();void cache.invalidateQueries({queryKey:scope});};
 const pager=(offset:number,set:(v:number)=>void,count:number)=><Stack direction="row"><Button disabled={!offset} onClick={()=>set(Math.max(0,offset-25))}>Previous page</Button><Button disabled={count<25} onClick={()=>set(offset+25)}>Next page</Button></Stack>;
 const valueControl=(label:string,value:string,set:(v:string)=>void,valueType:string)=>valueType==='BOOLEAN'?<Choice label={label} value={value} onChange={set} items={['true','false'].map(id=>({id,label:id}))}/>:<Field label={label} value={value} set={set}/>;
 return <Container maxWidth="lg"><Stack spacing={3} sx={{py:3}}>
  <Typography variant="h4" component="h1">Configuration administration</Typography>
  <Alert severity="info">Typed foundation configuration: STRING, NUMBER and BOOLEAN; PUBLIC or INTERNAL; unscoped and without approvals. Only BOOLEAN feature flags are supported. Secrets and confidential values must not be entered.</Alert>
  <Failure error={command.error}/><Button onClick={refresh} disabled={command.isPending}>Reload and review</Button>
  <Paper variant="outlined" sx={{p:2}}><Stack spacing={2}>
   <Typography variant="h6">Definitions</Typography><Failure error={namespaces.error??definitions.error??detail.error}/>
   <Choice label="Namespace" value={namespace} onChange={v=>{setNamespace(v);setSelected('');setDefOffset(0);setValueOffset(0);}} items={namespaces.data?.map(x=>({id:x.id,label:x.label??x.code}))??[]}/>{pager(nsOffset,setNsOffset,namespaces.data?.length??0)}
   <Field label="Key" value={key} set={setKey}/><Field label="Display name" value={name} set={setName}/>
   <Choice label="Value type" value={type} onChange={v=>{setType(v);setDefault('');}} items={['STRING','NUMBER','BOOLEAN'].map(id=>({id,label:id}))}/>
   <Choice label="Sensitivity" value={sensitivity} onChange={setSensitivity} items={['PUBLIC','INTERNAL'].map(id=>({id,label:id}))}/>
   {valueControl('Default value',defaultValue,setDefault,type)}
   <Button disabled={blocked||!namespace||!key.trim()||!name.trim()||namespaces.isFetching||!!namespaces.error} onClick={()=>command.mutate(async()=>{const r=await api.createConfigurationDefinition({namespaceId:namespace,key,displayNameFr:name,valueType:type as 'STRING'|'NUMBER'|'BOOLEAN',sensitivity:sensitivity as 'PUBLIC'|'INTERNAL',scoped:false,requiresApproval:false,...(defaultValue?{defaultValue}:{})});setSelected(r.id??'');return r;})}>Create definition</Button>
   <Choice label="Definition" value={selected} onChange={v=>{setSelected(v);setRaw('');setConfirmed(false);setValueOffset(0);}} items={[...(definitions.data??[]).map(x=>({id:x.id,label:x.key})),...((selected&&!definitions.data?.some(x=>x.id===selected))?[{id:selected,label:'New definition'}]:[])]}/>{pager(defOffset,setDefOffset,definitions.data?.length??0)}
   {current&&<Typography role="status">Definition status: {current.status} · {current.valueType} · {current.sensitivity}</Typography>}
   {current?.redacted&&<Alert severity="info">Confidential definition: metadata only.</Alert>}
   <Button disabled={blocked||!supported||current?.status!=='DRAFT'||!current?.updatedAt||detail.isFetching||!!detail.error} onClick={()=>command.mutate(()=>api.activateDefinition(selected,{expectedUpdatedAt:current!.updatedAt!}))}>Activate definition</Button>
  </Stack></Paper>
  <Paper variant="outlined" sx={{p:2}}><Stack spacing={2}>
   <Typography variant="h6">Environment values</Typography><Field label="Environment" value={environment} set={v=>{setEnvironment(v);setValueOffset(0);setConfirmed(false);}}/>
   <Field label="Effective instant" value={instant} set={setInstant}/><Failure error={effective.error??history.error}/>
   {effective.data&&<Typography role="status">Effective value: {effective.data.redacted?'[redacted]':effective.data.value??'No value'} · Provenance: {effective.data.provenance} · Version: {effective.data.definitionVersionId}</Typography>}
   <Field label="Effective from" value={from} set={setFrom}/><Field label="Effective until (exclusive, optional)" value={until} set={setUntil}/>
   {valueControl('Override value',raw,setRaw,current?.valueType??'STRING')}
   <FormControlLabel control={<Checkbox checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/>} label="I confirm this contains no confidential or secret material"/>
   <Button disabled={blocked||!supported||current?.status!=='ACTIVE'||!current.activeVersionId||!environmentValid||!raw||!confirmed||!Number.isFinite(Date.parse(from))||(!!until&&(!Number.isFinite(Date.parse(until))||Date.parse(until)<=Date.parse(from)))||detail.isFetching||!!detail.error} onClick={()=>command.mutate(()=>api.setConfigurationValue({definitionId:selected,definitionVersionId:current!.activeVersionId,environment,rawValue:raw,effectiveFrom:from,...(until?{effectiveTo:until}:{})}))}>Set configuration value</Button>
   <Typography variant="h6">Configuration values</Typography>{history.data?.map(v=><Typography key={v.id}>{v.environment} · {v.effectiveFrom} → {v.effectiveTo??'open'} · {v.redacted?'[redacted]':v.rawValue} · Actor: {v.actorId}</Typography>)}{pager(valueOffset,setValueOffset,history.data?.length??0)}
  </Stack></Paper>
  <Paper variant="outlined" sx={{p:2}}><Stack spacing={2}>
   <Typography variant="h6">Feature flags</Typography><Failure error={flags.error??state.error}/>
   <Field label="Flag code" value={flagCode} set={setFlagCode}/><Field label="Flag name" value={flagName} set={setFlagName}/>
   <FormControlLabel control={<Checkbox checked={defaultEnabled} onChange={e=>setDefaultEnabled(e.target.checked)}/>} label="Default enabled"/>
   <Button disabled={blocked||!flagCode.trim()||!flagName.trim()} onClick={()=>command.mutate(async()=>{const r=await api.createFeatureFlag({code:flagCode,nameFr:flagName,owningModule:'configuration',evaluationStrategy:'BOOLEAN',defaultEnabled});setFlag(r.id??'');return r;})}>Create feature flag</Button>
   <Choice label="Feature flag" value={flag} onChange={setFlag} items={[...(flags.data??[]).map(x=>({id:x.id,label:x.code})),...((flag&&!flags.data?.some(x=>x.id===flag))?[{id:flag,label:'New feature flag (locate in pages to activate)'}]:[])]}/>{pager(flagOffset,setFlagOffset,flags.data?.length??0)}
   {selectedFlag&&<Typography role="status">Flag status: {selectedFlag.status}</Typography>}
   <Button disabled={blocked||selectedFlag?.status!=='DRAFT'||selectedFlag.strategy!=='BOOLEAN'||!selectedFlag.updatedAt||flags.isFetching||!!flags.error} onClick={()=>command.mutate(()=>api.activateFlag(flag,{expectedUpdatedAt:selectedFlag!.updatedAt!}))}>Activate feature flag</Button>
   {state.data&&<Typography role="status">Flag enabled: {String(state.data.enabled)} · Provenance: {state.data.provenance}</Typography>}
   <FormControlLabel control={<Checkbox checked={enabled} onChange={e=>setEnabled(e.target.checked)}/>} label="Environment flag enabled"/>
   <Button disabled={blocked||selectedFlag?.status!=='ACTIVE'||selectedFlag.strategy!=='BOOLEAN'||!state.data?.updatedAt||!environmentValid||state.isFetching||!!state.error} onClick={()=>command.mutate(()=>api.setFlagState(flag,{environment,enabled,expectedUpdatedAt:state.data!.updatedAt!}))}>Save flag state</Button>
  </Stack></Paper>
 </Stack></Container>;
}
