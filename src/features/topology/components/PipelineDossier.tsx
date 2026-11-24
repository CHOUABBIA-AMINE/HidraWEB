import { Alert, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

import type { QuantityView, SourceView } from '@/api/generated/topology/model';
import {
  baseline, connections, equipment, pipeline, pipeline1 as readPipelineLimit,
  section, section1 as readSectionLimit, sections,
} from '@/api/generated/topology/topology';
import { usePermissions } from '@/features/permissions/usePermissions';
import { PressureRestrictionWorkflow } from './PressureRestrictionWorkflow';
import { qualifiedPressure, readSectionDetail } from '@/features/topology/model/pipelineDossier';

const dossierRoute = '/api/v1/topology/pipeline-dossiers/{pipelineId}';
const pressureRoute = '/api/v1/topology/operating-constraints/pipelines/{pipelineId}';
const reads = { sections, connections, equipment };

type DossierPage = keyof typeof reads;

interface PipelineDossierProps {
  companyPartyId: string;
  pipelineId: string;
  contextKey: string;
}

function sourceText(source: SourceView | undefined) {
  return [source?.sourceKind, source?.ownerEntityId, source?.revision, source?.recordedAt].filter(Boolean).join(' · ');
}

function quantityText(quantity: QuantityView | undefined) {
  if (quantity?.availability !== 'AVAILABLE' || !Number.isFinite(quantity.value) || !quantity.unit) {
    return 'UNAVAILABLE';
  }
  return [`${quantity.value} ${quantity.unit}`, quantity.basis, sourceText(quantity.source)].filter(Boolean).join(' · ');
}

export function PipelineDossier({ companyPartyId, pipelineId, contextKey }: PipelineDossierProps) {
  const { t, i18n } = useTranslation();
  const { status, routes, can } = usePermissions();
  const [view, setView] = useState<DossierPage>('sections');
  const [page, setPage] = useState(0);
  const [sectionId, setSectionId] = useState('');
  const [conditionCode, setConditionCode] = useState('');
  const [effectiveAt, setEffectiveAt] = useState(() => new Date().toISOString());
  const [evaluation, setEvaluation] = useState<{ conditionCode: string; effectiveAt: string }>();

  const admitted = (route: string, permission = 'topology:pipeline-dossiers:read') =>
    status === 'ready' && can(permission) && can('topology:regional-resource:read') &&
    routes.some(item => item.route === route && item.module === 'topology' &&
      item.methods.includes('GET') && item.permission === permission);
  const options = (name: string, enabled: boolean, ...coordinates: (string | number)[]) => ({
    queryKey: ['hidra', 'topology', 'dossier', contextKey, companyPartyId, pipelineId, name, ...coordinates],
    enabled, retry: false, staleTime: 0, gcTime: 0,
    refetchOnMount: 'always' as const, refetchOnWindowFocus: true,
  });

  const dossierAllowed = admitted(dossierRoute);
  const facts = useQuery({
    ...options('facts', dossierAllowed),
    queryFn: ({ signal }) => pipeline(pipelineId, { companyPartyId }, signal),
  });
  const pipelineFacts = dossierAllowed && !facts.isFetching && facts.isSuccess &&
    facts.data?.id === pipelineId ? facts.data : undefined;
  const listAllowed = Boolean(pipelineFacts) && admitted(`${dossierRoute}/${view}`);
  const list = useQuery({
    ...options(view, listAllowed, page),
    queryFn: ({ signal }) => reads[view](pipelineId, { companyPartyId, page, size: 25 }, signal),
  });
  const receiptAllowed = Boolean(pipelineFacts) && admitted(`${dossierRoute}/baseline`);
  const receipt = useQuery({
    ...options('baseline', receiptAllowed),
    queryFn: ({ signal }) => baseline(pipelineId, { companyPartyId }, signal),
  });
  const sectionAllowed = Boolean(pipelineFacts && sectionId) && admitted(`${dossierRoute}/sections/{sectionId}`);
  const sectionQuery = useQuery({
    ...options('section', sectionAllowed, sectionId),
    queryFn: async ({ signal }) => readSectionDetail(await section(pipelineId, sectionId, { companyPartyId }, signal), sectionId),
  });
  const sectionFacts = sectionAllowed && !sectionQuery.isFetching && sectionQuery.isSuccess ? sectionQuery.data : undefined;
  const pressureAllowed = Boolean(pipelineFacts) && admitted(pressureRoute, 'topology:operating-constraints:read');
  const sectionPressureAllowed = Boolean(sectionFacts) &&
    admitted(`${pressureRoute}/sections/{sectionId}`, 'topology:operating-constraints:read');
  const pressure = useQuery({
    ...options('pressure', pressureAllowed && Boolean(evaluation), evaluation?.conditionCode ?? '', evaluation?.effectiveAt ?? ''),
    queryFn: ({ signal }) => evaluation
      ? readPipelineLimit(pipelineId, { companyPartyId, ...evaluation }, signal)
      : Promise.reject(new Error('Missing pressure evaluation')),
  });
  const sectionPressure = useQuery({
    ...options('section-pressure', sectionPressureAllowed && Boolean(evaluation), sectionId, evaluation?.conditionCode ?? '', evaluation?.effectiveAt ?? ''),
    queryFn: ({ signal }) => evaluation
      ? readSectionLimit(pipelineId, sectionId, { companyPartyId, ...evaluation }, signal)
      : Promise.reject(new Error('Missing pressure evaluation')),
  });

  function evaluate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const instant = Date.parse(effectiveAt);
    if (!conditionCode.trim() || !effectiveAt.endsWith('Z') || !Number.isFinite(instant)) return;
    setEvaluation({ conditionCode: conditionCode.trim(), effectiveAt });
  }

  if (!dossierAllowed) return null;
  const receiptData = receiptAllowed && !receipt.isFetching && receipt.isSuccess ? receipt.data : undefined;
  const listData = listAllowed && !list.isFetching && list.isSuccess ? list.data : undefined;
  const name = i18n.language.startsWith('ar') ? pipelineFacts?.nameAr : i18n.language.startsWith('fr')
    ? pipelineFacts?.nameFr : pipelineFacts?.nameEn;
  const constraint = (label: string, allowed: boolean, loading: boolean, value: unknown, targetSection?: string) => (
    <Typography>
      {label}{' · '}{loading ? t('topology.dossier.loading') : qualifiedPressure(
        allowed ? value : undefined, pipelineId, targetSection, evaluation?.conditionCode ?? '',
      )}
    </Typography>
  );

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography component="h3" variant="h6">{t('topology.dossier.title')}</Typography>
        {pipelineFacts ? <>
          <Typography>{[pipelineFacts.code, name, pipelineFacts.typeCode, pipelineFacts.status].filter(Boolean).join(' · ')}</Typography>
          <Typography>{t('topology.dossier.design')} · {quantityText(pipelineFacts.designPressure)}</Typography>
          <Typography>{t('topology.dossier.dimensions')} · {quantityText(pipelineFacts.nominalDiameter)} / {quantityText(pipelineFacts.declaredLength)}</Typography>
          <Typography>{t('topology.dossier.baseline')} · {receiptData?.availability === 'AVAILABLE' &&
            pipelineFacts.pipelineSystemId && receiptData.pipelineSystemId === pipelineFacts.pipelineSystemId && receiptData.receiptId
            ? [receiptData.receiptId, receiptData.epoch, receiptData.manifestDigest, receiptData.publishedAt].filter(value => value != null).join(' · ')
            : 'UNAVAILABLE'}</Typography>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
            {(Object.keys(reads) as DossierPage[]).filter(key => admitted(`${dossierRoute}/${key}`)).map(key => (
              <Button key={key} aria-pressed={view === key} onClick={() => { setView(key); setPage(0); setSectionId(''); }}>
                {t(`topology.dossier.${key}`)}
              </Button>
            ))}
          </Stack>
          {listData ? <>
            {listData.items?.length ? <ul>
              {listData.items.map(item => item.id ? <li key={item.id}>
                {view === 'sections' && /^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(item.id) && admitted(`${dossierRoute}/sections/{sectionId}`)
                  ? <Button onClick={() => setSectionId(item.id ?? '')}>{item.code || item.id}</Button>
                  : [item.code || item.id, 'name' in item ? item.name : undefined,
                      'fromNodeId' in item ? item.fromNodeId : undefined,
                      'toNodeId' in item ? item.toNodeId : undefined,
                      'facilityId' in item ? item.facilityId : undefined].filter(Boolean).join(' · ')}
              </li> : null)}
            </ul> : <Typography>{t('topology.dossier.empty')}</Typography>}
            <Stack direction="row" spacing={1}>
              <Button disabled={page === 0} onClick={() => { setSectionId(''); setPage(page - 1); }}>{t('topology.regional.previous')}</Button>
              <Button disabled={listData.hasNext !== true} onClick={() => { setSectionId(''); setPage(page + 1); }}>{t('topology.regional.next')}</Button>
            </Stack>
          </> : listAllowed ? <Typography>{list.isFetching ? t('topology.dossier.loading') : 'UNAVAILABLE'}</Typography> : null}
          {sectionAllowed ? <Typography>
            {t('topology.dossier.section')} · {sectionFacts
              ? [sectionFacts.code, sectionFacts.type, sectionFacts.flowDirection,
                  quantityText(sectionFacts.startKilometerPoint), quantityText(sectionFacts.endKilometerPoint),
                  quantityText(sectionFacts.length), sourceText(sectionFacts.source)].filter(Boolean).join(' · ')
              : sectionQuery.isFetching ? t('topology.dossier.loading') : 'UNAVAILABLE'}
          </Typography> : null}
          {pressureAllowed || sectionPressureAllowed ? <>
            <Stack component="form" onSubmit={evaluate} direction={{ xs: 'column', md: 'row' }} spacing={1}>
              <TextField required label={t('topology.dossier.condition')} value={conditionCode} onChange={event => setConditionCode(event.target.value)} />
              <TextField required label={t('topology.dossier.instant')} value={effectiveAt} onChange={event => setEffectiveAt(event.target.value)} />
              <Button type="submit">{t('topology.dossier.evaluate')}</Button>
            </Stack>
            {evaluation ? <>
              <Typography>{evaluation.conditionCode} · {evaluation.effectiveAt}</Typography>
              {pressureAllowed ? constraint(t('topology.dossier.pipelineLimit'), pressureAllowed,
                pressure.isFetching, pressure.isSuccess ? pressure.data : undefined) : null}
              {sectionPressureAllowed ? constraint(t('topology.dossier.sectionLimit'), sectionPressureAllowed,
                sectionPressure.isFetching, sectionPressure.isSuccess ? sectionPressure.data : undefined, sectionId) : null}
            </> : null}
          </> : null}
          {!sectionId || sectionFacts ? <PressureRestrictionWorkflow
            key={JSON.stringify([contextKey, companyPartyId, pipelineId, sectionFacts?.id])}
            companyPartyId={companyPartyId} pipelineId={pipelineId} sectionId={sectionFacts?.id}
            baselineReceiptId={receiptData?.availability === 'AVAILABLE' && receiptData.pipelineSystemId === pipelineFacts.pipelineSystemId
              ? receiptData.receiptId : undefined}
            onPublished={() => {
              if (evaluation && pressureAllowed) void pressure.refetch();
              if (evaluation && sectionPressureAllowed) void sectionPressure.refetch();
            }}
          /> : null}
        </> : <Alert severity="info">{facts.isFetching ? t('topology.dossier.loading') : 'UNAVAILABLE'}</Alert>}
      </Stack>
    </Paper>
  );
}
