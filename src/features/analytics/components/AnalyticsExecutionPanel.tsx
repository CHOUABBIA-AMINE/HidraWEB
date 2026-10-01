import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import type {
  CreateAnalyticsDatasetRequest,
  CreateAnalyticsInsightRequest,
  RunMetricEvaluationRequest,
  RunProjectionRequest,
} from '@/api/generated/analytics/model';
import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import { usePermissions } from '@/features/permissions/usePermissions';
import {
  createAnalyticsDataset,
  createAnalyticsInsight,
  runMetricEvaluation,
  runProjection,
} from '@/features/analytics/api/analyticsExecutionApi';

const DATASET_ROUTE = '/api/v1/analytics/datasets';
const INSIGHT_ROUTE = '/api/v1/analytics/insights';
const METRIC_ROUTE = '/api/v1/analytics/metrics/evaluations';
const PROJECTION_ROUTE = '/api/v1/analytics/projections/runs';

function permissionForPost(routes: ReturnType<typeof usePermissions>['routes'], route: string): string | undefined {
  return routes.find((descriptor) => descriptor.route === route && descriptor.methods.includes('POST'))?.permission;
}

function optional(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function numberValue(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function instant(value: string): string | undefined {
  return value ? new Date(value).toISOString() : undefined;
}

function mutationError(error: unknown): string {
  const normalized = normalizeHidraApiError(error);
  return normalized.status === 403
    ? 'HidraAPI refused this Analytics operation.'
    : normalized.message || 'The Analytics operation failed.';
}

type StringForm<T extends string> = Record<T, string>;
type DatasetForm = StringForm<'code'|'nameAr'|'nameFr'|'nameEn'|'subjectAreaId'|'datasetType'|'refreshMode'|'schemaVersion'|'createdFrom'>;
type InsightForm = StringForm<'subjectAreaId'|'insightType'|'title'|'summary'|'severityId'|'confidenceScore'|'scopeType'|'scopeId'|'sourceTrendAnalysisId'|'sourceProjectionSnapshotId'|'sourceModelRunId'>;
type MetricForm = StringForm<'metricDefinitionVersionId'|'scopeType'|'scopeId'|'periodStart'|'periodEnd'|'correlationId'>;
type ProjectionForm = StringForm<'projectionDefinitionId'|'runMode'|'periodStart'|'periodEnd'|'correlationId'>;

const emptyDataset: DatasetForm = { code:'',nameAr:'',nameFr:'',nameEn:'',subjectAreaId:'',datasetType:'',refreshMode:'',schemaVersion:'',createdFrom:'' };
const emptyInsight: InsightForm = { subjectAreaId:'',insightType:'',title:'',summary:'',severityId:'',confidenceScore:'',scopeType:'',scopeId:'',sourceTrendAnalysisId:'',sourceProjectionSnapshotId:'',sourceModelRunId:'' };
const emptyMetric: MetricForm = { metricDefinitionVersionId:'',scopeType:'',scopeId:'',periodStart:'',periodEnd:'',correlationId:'' };
const emptyProjection: ProjectionForm = { projectionDefinitionId:'',runMode:'',periodStart:'',periodEnd:'',correlationId:'' };

function Fields<T extends Record<string,string>>({ value, onChange, dateFields=[] }: { value:T; onChange:(key:keyof T,value:string)=>void; dateFields?:Array<keyof T> }) {
  return <Box sx={{ display:'grid', gap:1.5, gridTemplateColumns:{ xs:'1fr', md:'repeat(2, minmax(0,1fr))' } }}>
    {(Object.keys(value) as Array<keyof T>).map((key) => (
      <TextField key={String(key)} label={String(key)} size="small" type={dateFields.includes(key)?'datetime-local':'text'} value={value[key]}
        onChange={(event)=>onChange(key,event.target.value)}
        slotProps={dateFields.includes(key)?{ inputLabel:{ shrink:true } }:undefined} />
    ))}
  </Box>;
}

export function AnalyticsExecutionPanel() {
  const permissions = usePermissions();
  const queryClient = useQueryClient();
  const [dataset,setDataset] = useState<DatasetForm>(emptyDataset);
  const [insight,setInsight] = useState<InsightForm>(emptyInsight);
  const [metric,setMetric] = useState<MetricForm>(emptyMetric);
  const [projection,setProjection] = useState<ProjectionForm>(emptyProjection);

  const datasetPermission = permissionForPost(permissions.routes, DATASET_ROUTE);
  const insightPermission = permissionForPost(permissions.routes, INSIGHT_ROUTE);
  const metricPermission = permissionForPost(permissions.routes, METRIC_ROUTE);
  const projectionPermission = permissionForPost(permissions.routes, PROJECTION_ROUTE);
  const refresh = () => queryClient.invalidateQueries({ queryKey:['hidra','workbench','analytics'] });

  const datasetMutation = useMutation({ mutationFn:createAnalyticsDataset, onSuccess:async()=>{ setDataset(emptyDataset); await refresh(); } });
  const insightMutation = useMutation({ mutationFn:createAnalyticsInsight, onSuccess:async()=>{ setInsight(emptyInsight); await refresh(); } });
  const metricMutation = useMutation({ mutationFn:runMetricEvaluation, onSuccess:async()=>{ setMetric(emptyMetric); await refresh(); } });
  const projectionMutation = useMutation({ mutationFn:runProjection, onSuccess:async()=>{ setProjection(emptyProjection); await refresh(); } });

  const submitDataset = () => datasetMutation.mutate({
    code:optional(dataset.code), nameAr:optional(dataset.nameAr), nameFr:optional(dataset.nameFr), nameEn:optional(dataset.nameEn),
    subjectAreaId:optional(dataset.subjectAreaId), datasetType:optional(dataset.datasetType), refreshMode:optional(dataset.refreshMode),
    schemaVersion:optional(dataset.schemaVersion), createdFrom:optional(dataset.createdFrom),
  } as CreateAnalyticsDatasetRequest);

  const submitInsight = () => insightMutation.mutate({
    subjectAreaId:optional(insight.subjectAreaId), insightType:optional(insight.insightType), title:optional(insight.title),
    summary:optional(insight.summary), severityId:optional(insight.severityId), confidenceScore:numberValue(insight.confidenceScore),
    scopeType:optional(insight.scopeType), scopeId:optional(insight.scopeId), sourceTrendAnalysisId:optional(insight.sourceTrendAnalysisId),
    sourceProjectionSnapshotId:optional(insight.sourceProjectionSnapshotId), sourceModelRunId:optional(insight.sourceModelRunId),
  } as CreateAnalyticsInsightRequest);

  const submitMetric = () => metricMutation.mutate({
    metricDefinitionVersionId:optional(metric.metricDefinitionVersionId), scopeType:optional(metric.scopeType), scopeId:optional(metric.scopeId),
    periodStart:instant(metric.periodStart), periodEnd:instant(metric.periodEnd), correlationId:optional(metric.correlationId),
  } as RunMetricEvaluationRequest);

  const submitProjection = () => projectionMutation.mutate({
    projectionDefinitionId:optional(projection.projectionDefinitionId), runMode:optional(projection.runMode),
    periodStart:instant(projection.periodStart), periodEnd:instant(projection.periodEnd), correlationId:optional(projection.correlationId),
  } as RunProjectionRequest);

  return <Stack spacing={2}>
    <Alert severity="info">Analytics execution is backend-owned. HidraWEB submits typed requests only; metric values, projections, confidence interpretation, run status, and derived insight semantics remain produced by HidraAPI.</Alert>

    <Paper variant="outlined" sx={{p:2}}><Stack spacing={2}>
      <Typography component="h2" variant="h6">Register analytics dataset</Typography>
      {!datasetPermission ? <Alert severity="warning">HidraAPI did not publish route-permission metadata for dataset registration.</Alert> : null}
      <Fields value={dataset} onChange={(key,value)=>setDataset((current)=>({...current,[key]:value}))} />
      {datasetMutation.isError ? <Alert severity="error">{mutationError(datasetMutation.error)}</Alert> : null}
      <Button variant="contained" disabled={!datasetPermission || !permissions.can(datasetPermission) || datasetMutation.isPending} onClick={submitDataset}>Register analytics dataset</Button>
    </Stack></Paper>

    <Paper variant="outlined" sx={{p:2}}><Stack spacing={2}>
      <Typography component="h2" variant="h6">Create analytics insight</Typography>
      {!insightPermission ? <Alert severity="warning">HidraAPI did not publish route-permission metadata for insight creation.</Alert> : null}
      <Fields value={insight} onChange={(key,value)=>setInsight((current)=>({...current,[key]:value}))} />
      {insightMutation.isError ? <Alert severity="error">{mutationError(insightMutation.error)}</Alert> : null}
      <Button variant="contained" disabled={!insightPermission || !permissions.can(insightPermission) || insightMutation.isPending} onClick={submitInsight}>Create analytics insight</Button>
    </Stack></Paper>

    <Paper variant="outlined" sx={{p:2}}><Stack spacing={2}>
      <Typography component="h2" variant="h6">Run metric evaluation</Typography>
      {!metricPermission ? <Alert severity="warning">HidraAPI did not publish route-permission metadata for metric evaluation.</Alert> : null}
      <Fields value={metric} onChange={(key,value)=>setMetric((current)=>({...current,[key]:value}))} dateFields={['periodStart','periodEnd']} />
      {metricMutation.isError ? <Alert severity="error">{mutationError(metricMutation.error)}</Alert> : null}
      <Button variant="contained" disabled={!metricPermission || !permissions.can(metricPermission) || metricMutation.isPending} onClick={submitMetric}>Run metric evaluation</Button>
    </Stack></Paper>

    <Paper variant="outlined" sx={{p:2}}><Stack spacing={2}>
      <Typography component="h2" variant="h6">Run analytics projection</Typography>
      {!projectionPermission ? <Alert severity="warning">HidraAPI did not publish route-permission metadata for projection runs.</Alert> : null}
      <Fields value={projection} onChange={(key,value)=>setProjection((current)=>({...current,[key]:value}))} dateFields={['periodStart','periodEnd']} />
      {projectionMutation.isError ? <Alert severity="error">{mutationError(projectionMutation.error)}</Alert> : null}
      <Button variant="contained" disabled={!projectionPermission || !permissions.can(projectionPermission) || projectionMutation.isPending} onClick={submitProjection}>Run analytics projection</Button>
    </Stack></Paper>
  </Stack>;
}
