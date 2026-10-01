import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import type {
  CreateSimulationModelRequest,
  CreateSimulationScenarioRequest,
  PublishSimulationRecommendationRequest,
  QueueSimulationRunRequest,
} from '@/api/generated/simulation/model';
import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import { usePermissions } from '@/features/permissions/usePermissions';
import {
  createSimulationModel,
  createSimulationScenario,
  publishSimulationRecommendation,
  queueSimulationRun,
} from '@/features/simulation/api/simulationOrchestrationApi';

const MODEL_ROUTE = '/api/v1/simulation/models';
const SCENARIO_ROUTE = '/api/v1/simulation/scenarios';
const RUN_ROUTE = '/api/v1/simulation/runs';
const RECOMMENDATION_ROUTE = '/api/v1/simulation/recommendations';

function permissionForPost(routes: ReturnType<typeof usePermissions>['routes'], route: string): string | undefined {
  return routes.find((descriptor) => descriptor.route === route && descriptor.methods.includes('POST'))?.permission;
}

function optional(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function mutationError(error: unknown): string {
  const normalized = normalizeHidraApiError(error);
  return normalized.status === 403
    ? 'HidraAPI refused this Simulation operation.'
    : normalized.message || 'The Simulation operation failed.';
}

type ModelForm = Record<'code'|'nameAr'|'nameFr'|'nameEn'|'description'|'modelTypeId'|'topologyScopeType'|'topologyScopeId', string>;
type ScenarioForm = Record<'code'|'nameAr'|'nameFr'|'nameEn'|'scenarioTypeId'|'modelId'|'modelVersionId'|'topologySnapshotId'|'monitoringContextId'|'planningReferenceId'|'createdByActorId'|'createdByDisplayNameSnapshot', string>;
type RunForm = Record<'scenarioId'|'modelVersionId'|'runTypeId'|'inputSnapshotId'|'solverProfileId'|'requestedByActorId'|'requestedByDisplayNameSnapshot'|'correlationId', string>;
type RecommendationForm = Record<'runId'|'candidateId'|'recommendationTypeId'|'title'|'description'|'confidenceLevelId'|'targetModule'|'targetProposalReference'|'publishedByActorId', string>;

const emptyModel: ModelForm = { code:'',nameAr:'',nameFr:'',nameEn:'',description:'',modelTypeId:'',topologyScopeType:'',topologyScopeId:'' };
const emptyScenario: ScenarioForm = { code:'',nameAr:'',nameFr:'',nameEn:'',scenarioTypeId:'',modelId:'',modelVersionId:'',topologySnapshotId:'',monitoringContextId:'',planningReferenceId:'',createdByActorId:'',createdByDisplayNameSnapshot:'' };
const emptyRun: RunForm = { scenarioId:'',modelVersionId:'',runTypeId:'',inputSnapshotId:'',solverProfileId:'',requestedByActorId:'',requestedByDisplayNameSnapshot:'',correlationId:'' };
const emptyRecommendation: RecommendationForm = { runId:'',candidateId:'',recommendationTypeId:'',title:'',description:'',confidenceLevelId:'',targetModule:'',targetProposalReference:'',publishedByActorId:'' };

function Fields<T extends Record<string,string>>({ value, onChange }: { value:T; onChange:(key:keyof T,value:string)=>void }) {
  return <Box sx={{ display:'grid', gap:1.5, gridTemplateColumns:{ xs:'1fr', md:'repeat(2, minmax(0,1fr))' } }}>
    {(Object.keys(value) as Array<keyof T>).map((key) => (
      <TextField key={String(key)} label={String(key)} size="small" value={value[key]} onChange={(event)=>onChange(key,event.target.value)} />
    ))}
  </Box>;
}

export function SimulationOrchestrationPanel() {
  const permissions = usePermissions();
  const queryClient = useQueryClient();
  const [model,setModel] = useState<ModelForm>(emptyModel);
  const [scenario,setScenario] = useState<ScenarioForm>(emptyScenario);
  const [run,setRun] = useState<RunForm>(emptyRun);
  const [recommendation,setRecommendation] = useState<RecommendationForm>(emptyRecommendation);

  const modelPermission = permissionForPost(permissions.routes, MODEL_ROUTE);
  const scenarioPermission = permissionForPost(permissions.routes, SCENARIO_ROUTE);
  const runPermission = permissionForPost(permissions.routes, RUN_ROUTE);
  const recommendationPermission = permissionForPost(permissions.routes, RECOMMENDATION_ROUTE);
  const refresh = () => queryClient.invalidateQueries({ queryKey:['hidra','workbench','simulation'] });

  const modelMutation = useMutation({ mutationFn:createSimulationModel, onSuccess:async()=>{ setModel(emptyModel); await refresh(); } });
  const scenarioMutation = useMutation({ mutationFn:createSimulationScenario, onSuccess:async()=>{ setScenario(emptyScenario); await refresh(); } });
  const runMutation = useMutation({ mutationFn:queueSimulationRun, onSuccess:async()=>{ setRun(emptyRun); await refresh(); } });
  const recommendationMutation = useMutation({ mutationFn:publishSimulationRecommendation, onSuccess:async()=>{ setRecommendation(emptyRecommendation); await refresh(); } });

  const submitModel = () => modelMutation.mutate({
    code:optional(model.code), nameAr:optional(model.nameAr), nameFr:optional(model.nameFr), nameEn:optional(model.nameEn),
    description:optional(model.description), modelTypeId:optional(model.modelTypeId), topologyScopeType:optional(model.topologyScopeType),
    topologyScopeId:optional(model.topologyScopeId),
  } as CreateSimulationModelRequest);

  const submitScenario = () => scenarioMutation.mutate({
    code:optional(scenario.code), nameAr:optional(scenario.nameAr), nameFr:optional(scenario.nameFr), nameEn:optional(scenario.nameEn),
    scenarioTypeId:optional(scenario.scenarioTypeId), modelId:optional(scenario.modelId), modelVersionId:optional(scenario.modelVersionId),
    topologySnapshotId:optional(scenario.topologySnapshotId), monitoringContextId:optional(scenario.monitoringContextId),
    planningReferenceId:optional(scenario.planningReferenceId), createdByActorId:optional(scenario.createdByActorId),
    createdByDisplayNameSnapshot:optional(scenario.createdByDisplayNameSnapshot),
  } as CreateSimulationScenarioRequest);

  const submitRun = () => runMutation.mutate({
    scenarioId:optional(run.scenarioId), modelVersionId:optional(run.modelVersionId), runTypeId:optional(run.runTypeId),
    inputSnapshotId:optional(run.inputSnapshotId), solverProfileId:optional(run.solverProfileId), requestedByActorId:optional(run.requestedByActorId),
    requestedByDisplayNameSnapshot:optional(run.requestedByDisplayNameSnapshot), correlationId:optional(run.correlationId),
  } as QueueSimulationRunRequest);

  const submitRecommendation = () => recommendationMutation.mutate({
    runId:optional(recommendation.runId), candidateId:optional(recommendation.candidateId), recommendationTypeId:optional(recommendation.recommendationTypeId),
    title:optional(recommendation.title), description:optional(recommendation.description), confidenceLevelId:optional(recommendation.confidenceLevelId),
    targetModule:optional(recommendation.targetModule), targetProposalReference:optional(recommendation.targetProposalReference),
    publishedByActorId:optional(recommendation.publishedByActorId),
  } as PublishSimulationRecommendationRequest);

  return <Stack spacing={2}>
    <Alert severity="info">
      Simulation execution remains server-side. HidraWEB orchestrates models, scenarios, runs, and recommendations only; it does not execute hydraulic solvers, CPM/RTTM, LeakDetectionAPI, or Digital Twin computations in the browser.
    </Alert>

    <Paper variant="outlined" sx={{p:2}}><Stack spacing={2}>
      <Typography component="h2" variant="h6">Create simulation model</Typography>
      {!modelPermission ? <Alert severity="warning">HidraAPI did not publish route-permission metadata for simulation-model creation.</Alert> : null}
      <Fields value={model} onChange={(key,value)=>setModel((current)=>({...current,[key]:value}))} />
      {modelMutation.isError ? <Alert severity="error">{mutationError(modelMutation.error)}</Alert> : null}
      <Button variant="contained" disabled={!modelPermission || !permissions.can(modelPermission) || modelMutation.isPending} onClick={submitModel}>Create simulation model</Button>
    </Stack></Paper>

    <Paper variant="outlined" sx={{p:2}}><Stack spacing={2}>
      <Typography component="h2" variant="h6">Create simulation scenario</Typography>
      {!scenarioPermission ? <Alert severity="warning">HidraAPI did not publish route-permission metadata for scenario creation.</Alert> : null}
      <Fields value={scenario} onChange={(key,value)=>setScenario((current)=>({...current,[key]:value}))} />
      {scenarioMutation.isError ? <Alert severity="error">{mutationError(scenarioMutation.error)}</Alert> : null}
      <Button variant="contained" disabled={!scenarioPermission || !permissions.can(scenarioPermission) || scenarioMutation.isPending} onClick={submitScenario}>Create simulation scenario</Button>
    </Stack></Paper>

    <Paper variant="outlined" sx={{p:2}}><Stack spacing={2}>
      <Typography component="h2" variant="h6">Queue simulation run</Typography>
      {!runPermission ? <Alert severity="warning">HidraAPI did not publish route-permission metadata for simulation-run queueing.</Alert> : null}
      <Fields value={run} onChange={(key,value)=>setRun((current)=>({...current,[key]:value}))} />
      {runMutation.isError ? <Alert severity="error">{mutationError(runMutation.error)}</Alert> : null}
      <Button variant="contained" disabled={!runPermission || !permissions.can(runPermission) || runMutation.isPending} onClick={submitRun}>Queue simulation run</Button>
    </Stack></Paper>

    <Paper variant="outlined" sx={{p:2}}><Stack spacing={2}>
      <Typography component="h2" variant="h6">Publish simulation recommendation</Typography>
      {!recommendationPermission ? <Alert severity="warning">HidraAPI did not publish route-permission metadata for recommendation publication.</Alert> : null}
      <Fields value={recommendation} onChange={(key,value)=>setRecommendation((current)=>({...current,[key]:value}))} />
      {recommendationMutation.isError ? <Alert severity="error">{mutationError(recommendationMutation.error)}</Alert> : null}
      <Button variant="contained" disabled={!recommendationPermission || !permissions.can(recommendationPermission) || recommendationMutation.isPending} onClick={submitRecommendation}>Publish simulation recommendation</Button>
    </Stack></Paper>
  </Stack>;
}
