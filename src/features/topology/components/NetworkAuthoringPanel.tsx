import { Alert, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import { PartySelector } from '@/features/party/components/PartySelector';
import { usePermissions } from '@/features/permissions/usePermissions';
import * as api from '../api/foundationTopologyApi';
import type { TopologyFoundationItem } from '@/api/generated/topology/model';
import { ChoiceField, Failure, useTopologyAction, useOwnerCommand, CommandState } from './FoundationControls';
import { PipelineEditor } from './PipelineEditor';
import { InstalledUnitPanel } from './InstalledUnitPanel';

export function NetworkAuthoringPanel() {
  const { t } = useTranslation(); const [params] = useSearchParams();
  const [company, setCompany] = useState(params.get('company') ?? '');
  const permission = usePermissions();
  if (!permission.can('*') && !permission.can('topology:foundation:read')) return <Alert severity="info">{t('topology.editor.denied')}</Alert>;
  return <Paper variant="outlined" sx={{ p: 2 }}><Stack spacing={2}>
    <Typography variant="h5" component="h1">{t('topology.editor.title')}</Typography>
    <Alert severity="info">{t('topology.editor.scope')}</Alert>
    <PartySelector value={company} onChange={setCompany} />
    {company && <CompanyEditor key={company} company={company} />}
  </Stack></Paper>;
}
function CompanyEditor({ company }: { company: string }) {
  const can=useTopologyAction();
  const { t } = useTranslation(); const [params, setParams] = useSearchParams();
  const [system, setSystem] = useState(params.get('company') === company ? params.get('system') ?? '' : '');
  const [draftId, setDraft] = useState(params.get('company') === company ? params.get('draft') ?? '' : '');
  const [facility, setFacility] = useState(''); const [code, setCode] = useState(''); const [reason, setReason] = useState('');
  const [type, setType] = useState(''); const [facilityType, setFacilityType] = useState('');
  const [cursor, setCursor] = useState<string>(); const [catalog, setCatalog] = useState<'SYSTEMS' | 'SYSTEM_TYPES' | 'FACILITY_TYPES' | 'FACILITIES'>('SYSTEMS');
  const choices = useQuery({ queryKey: ['hidra', 'topology', 'setup', company, catalog, cursor], queryFn: () => api.discoverTopologyFoundationChoices(catalog, { companyPartyId: company, cursor, limit: 50 }), retry: false });
  const [systems, setSystems] = useState<TopologyFoundationItem[]>([]); const [facilities, setFacilities] = useState<TopologyFoundationItem[]>([]);
  const command = useOwnerCommand<unknown>(() => { void choices.refetch(); });
  const selectCatalog = (v: typeof catalog) => { setCatalog(v); setCursor(undefined); };
  const available = choices.data?.items ?? [];
  const saveLink = (id: string, systemId = system) => { setDraft(id); setParams({ company, system: systemId, draft: id }); };
  return <Stack spacing={2}>
    <TextField label={t('topology.editor.code')} value={code} onChange={e => setCode(e.target.value)} />
    <TextField label={t('topology.editor.reason')} value={reason} onChange={e => setReason(e.target.value)} />
    <Stack direction="row" sx={{flexWrap:"wrap",gap:1}}>{(['SYSTEMS','SYSTEM_TYPES','FACILITY_TYPES','FACILITIES'] as const).map(c => <Button key={c} onClick={() => selectCatalog(c)}>{t(`topology.editor.${c}`)}</Button>)}</Stack>
    <Failure error={choices.error} />
    {choices.isFetching && <Alert severity="info">{t('topology.editor.loading')}</Alert>}
    {catalog === 'SYSTEM_TYPES' && <ChoiceField label={t('topology.editor.systemType')} value={type} items={available} onChange={setType} />}
    {catalog === 'FACILITY_TYPES' && <ChoiceField label={t('topology.editor.facilityType')} value={facilityType} items={available} onChange={setFacilityType} />}
    {catalog === 'SYSTEMS' && <ChoiceField label={t('topology.editor.system')} value={system} items={[...systems, ...available.filter(x => !systems.some(s => s.id === x.id))]} onChange={id => { setSystem(id); setDraft(''); setFacility(''); setParams({ company, system: id }); }} />}
    {catalog === 'FACILITIES' && <ChoiceField label={t('topology.editor.facility')} value={facility} items={[...facilities, ...available.filter(x => !facilities.some(s => s.id === x.id))]} onChange={setFacility} />}
    <Stack direction="row"><Button onClick={() => setCursor(undefined)} disabled={!cursor}>{t('topology.editor.first')}</Button><Button disabled={!choices.data?.nextCursor || choices.isFetching} onClick={() => setCursor(choices.data?.nextCursor)}>{t('topology.editor.more')}</Button></Stack>
    <Stack direction="row" sx={{flexWrap:"wrap",gap:1}}>
      <Button disabled={!can('topology:foundation:write') || !code.trim() || !type || !reason.trim() || command.isPending || command.isError} onClick={() => command.mutate(async () => { const r = await api.registerFoundationPipelineSystem({ companyPartyId: company, id: crypto.randomUUID(), requestId: crypto.randomUUID(), code, name: code, systemTypeId: type, reason }); const item = r.items?.[0]; if (item?.id) { setSystem(item.id); setSystems(x => [...x, item]); setParams({ company, system: item.id }); } return r; })}>{t('topology.editor.createSystem')}</Button>
      <Button disabled={!can('topology:foundation:write') || !code.trim() || !facilityType || !reason.trim() || command.isPending || command.isError} onClick={() => command.mutate(async () => { const chosen = available.find(x => x.id === facilityType); const r = await api.registerFoundationFacility({ companyPartyId: company, id: crypto.randomUUID(), requestId: crypto.randomUUID(), code, name: code, facilityTypeId: facilityType, facilityKind: chosen?.kind, reason }); const item = r.items?.[0]; if (item?.id) { setFacility(item.id); setFacilities(x => [...x, item]); } return r; })}>{t('topology.editor.createFacility')}</Button>
      <Button disabled={!can('topology:foundation:write') || !facility || [...facilities,...available].find(x => x.id === facility)?.status !== 'PLANNED' || !reason.trim() || command.isPending || command.isError || ![...facilities,...available].find(x => x.id === facility)?.updatedAt} onClick={() => command.mutate(() => api.activateFoundationFacility(facility, { companyPartyId: company, requestId: crypto.randomUUID(), expectedUpdatedAt: [...facilities,...available].find(x => x.id === facility)?.updatedAt, reason }).then(r => { setFacilities(x => [...x.filter(i => i.id !== facility), ...(r.items ?? [])]); return r; }))}>{t('topology.editor.activate')}</Button>
      <Button disabled={!can('topology:engineering-draft:create') || !system || !code.trim() || Boolean(draftId) || command.isPending || command.isError} onClick={() => command.mutate(async () => { const r = await api.createEngineeringNetworkDraft({ companyPartyId: company, pipelineSystemId: system, creationRequestId: crypto.randomUUID(), title: code, evidenceReference: reason }); if (r.draftId) saveLink(r.draftId); return r; })}>{t('topology.editor.createDraft')}</Button>
    </Stack>
    <CommandState pending={command.isPending} error={command.error} reset={() => { command.reset(); void choices.refetch(); }} />
    {facility && [...facilities, ...available].find(x => x.id === facility)?.status === 'ACTIVE' && <InstalledUnitPanel key={`${company}:${facility}`} company={company} facility={facility} reason={reason} system={system} draftId={draftId} />}
    {draftId && system && <PipelineEditor key={`${company}:${system}:${draftId}`} company={company} system={system} draftId={draftId} />}
  </Stack>;
}
