import { Alert, Box, Button, Checkbox, FormControlLabel, Paper, Stack, TextField, Typography } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import type {
  GenerateReportArtifactRequest,
  QueueReportRunRequest,
} from '@/api/generated/reporting/model';
import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import { usePermissions } from '@/features/permissions/usePermissions';
import {
  createReportDefinition,
  generateReportArtifact,
  queueReportRun,
  requestReport,
} from '@/features/reporting/api/reportingLifecycleApi';

const DEFINITION_ROUTE = '/api/v1/reporting/definitions';
const REQUEST_ROUTE = '/api/v1/reporting/requests';
const RUN_ROUTE = '/api/v1/reporting/runs';
const ARTIFACT_ROUTE = '/api/v1/reporting/artifacts';

function permissionForPost(routes: ReturnType<typeof usePermissions>['routes'], route: string): string | undefined {
  return routes.find((descriptor) => descriptor.route === route && descriptor.methods.includes('POST'))?.permission;
}

function optional(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function instant(value: string): string | undefined {
  return value ? new Date(value).toISOString() : undefined;
}

function integer(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function mutationError(error: unknown): string {
  const normalized = normalizeHidraApiError(error);
  return normalized.status === 403
    ? 'HidraAPI refused this Reporting lifecycle operation.'
    : normalized.message || 'The Reporting lifecycle operation failed.';
}

type DefinitionForm = {
  code: string;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  description: string;
  reportCategoryId: string;
  ownerModule: string;
  requiresApproval: boolean;
  restricted: boolean;
};

type RequestForm = Record<
  'reportDefinitionId' | 'requestedByActorId' | 'requestedByUsernameSnapshot' | 'requestedByDisplayNameSnapshot'
  | 'requestedByRoleCodeSnapshot' | 'organizationUnitId' | 'organizationUnitNameSnapshot' | 'purpose'
  | 'correlationId' | 'workflowReferenceId',
  string
>;

type RunForm = Record<
  'reportRequestId' | 'reportDefinitionId' | 'runMode' | 'templateVersionId' | 'correlationId',
  string
>;

type ArtifactForm = Record<
  'reportRunId' | 'artifactType' | 'format' | 'fileName' | 'mimeType' | 'sizeBytes' | 'checksum'
  | 'storageObjectReferenceId' | 'documentReferenceId' | 'expiresAt',
  string
>;

const emptyDefinition: DefinitionForm = {
  code: '', nameAr: '', nameFr: '', nameEn: '', description: '', reportCategoryId: '', ownerModule: '',
  requiresApproval: false, restricted: false,
};
const emptyRequest: RequestForm = {
  reportDefinitionId: '', requestedByActorId: '', requestedByUsernameSnapshot: '', requestedByDisplayNameSnapshot: '',
  requestedByRoleCodeSnapshot: '', organizationUnitId: '', organizationUnitNameSnapshot: '', purpose: '',
  correlationId: '', workflowReferenceId: '',
};
const emptyRun: RunForm = {
  reportRequestId: '', reportDefinitionId: '', runMode: '', templateVersionId: '', correlationId: '',
};
const emptyArtifact: ArtifactForm = {
  reportRunId: '', artifactType: '', format: '', fileName: '', mimeType: '', sizeBytes: '', checksum: '',
  storageObjectReferenceId: '', documentReferenceId: '', expiresAt: '',
};

function TextFields<T extends Record<string, string>>({
  value,
  onChange,
  dateFields = [],
}: {
  value: T;
  onChange: (key: keyof T, value: string) => void;
  dateFields?: Array<keyof T>;
}) {
  return (
    <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' } }}>
      {(Object.keys(value) as Array<keyof T>).map((key) => (
        <TextField
          key={String(key)}
          label={String(key)}
          size="small"
          type={dateFields.includes(key) ? 'datetime-local' : 'text'}
          value={value[key]}
          onChange={(event) => onChange(key, event.target.value)}
          slotProps={dateFields.includes(key) ? { inputLabel: { shrink: true } } : undefined}
        />
      ))}
    </Box>
  );
}

export function ReportingLifecyclePanel() {
  const permissions = usePermissions();
  const queryClient = useQueryClient();
  const [definition, setDefinition] = useState<DefinitionForm>(emptyDefinition);
  const [request, setRequest] = useState<RequestForm>(emptyRequest);
  const [run, setRun] = useState<RunForm>(emptyRun);
  const [artifact, setArtifact] = useState<ArtifactForm>(emptyArtifact);

  const definitionPermission = permissionForPost(permissions.routes, DEFINITION_ROUTE);
  const requestPermission = permissionForPost(permissions.routes, REQUEST_ROUTE);
  const runPermission = permissionForPost(permissions.routes, RUN_ROUTE);
  const artifactPermission = permissionForPost(permissions.routes, ARTIFACT_ROUTE);

  const refreshReportingReads = () => queryClient.invalidateQueries({ queryKey: ['hidra', 'workbench', 'reporting'] });

  const definitionMutation = useMutation({
    mutationFn: createReportDefinition,
    onSuccess: async () => { setDefinition(emptyDefinition); await refreshReportingReads(); },
  });
  const requestMutation = useMutation({
    mutationFn: requestReport,
    onSuccess: async () => { setRequest(emptyRequest); await refreshReportingReads(); },
  });
  const runMutation = useMutation({
    mutationFn: queueReportRun,
    onSuccess: async () => { setRun(emptyRun); await refreshReportingReads(); },
  });
  const artifactMutation = useMutation({
    mutationFn: generateReportArtifact,
    onSuccess: async () => { setArtifact(emptyArtifact); await refreshReportingReads(); },
  });

  const canCreateDefinition = Boolean(definitionPermission && permissions.can(definitionPermission));
  const canRequestReport = Boolean(requestPermission && permissions.can(requestPermission));
  const canQueueRun = Boolean(runPermission && permissions.can(runPermission));
  const canGenerateArtifact = Boolean(artifactPermission && permissions.can(artifactPermission));

  const submitDefinition = () => {
    definitionMutation.mutate({
      code: optional(definition.code),
      nameAr: optional(definition.nameAr),
      nameFr: optional(definition.nameFr),
      nameEn: optional(definition.nameEn),
      description: optional(definition.description),
      reportCategoryId: optional(definition.reportCategoryId),
      ownerModule: optional(definition.ownerModule),
      requiresApproval: definition.requiresApproval,
      restricted: definition.restricted,
    });
  };

  const submitRequest = () => {
    requestMutation.mutate({
      reportDefinitionId: optional(request.reportDefinitionId),
      requestedByActorId: optional(request.requestedByActorId),
      requestedByUsernameSnapshot: optional(request.requestedByUsernameSnapshot),
      requestedByDisplayNameSnapshot: optional(request.requestedByDisplayNameSnapshot),
      requestedByRoleCodeSnapshot: optional(request.requestedByRoleCodeSnapshot),
      organizationUnitId: optional(request.organizationUnitId),
      organizationUnitNameSnapshot: optional(request.organizationUnitNameSnapshot),
      purpose: optional(request.purpose),
      correlationId: optional(request.correlationId),
      workflowReferenceId: optional(request.workflowReferenceId),
    });
  };

  const submitRun = () => {
    runMutation.mutate({
      reportRequestId: optional(run.reportRequestId),
      reportDefinitionId: optional(run.reportDefinitionId),
      runMode: optional(run.runMode),
      templateVersionId: optional(run.templateVersionId),
      correlationId: optional(run.correlationId),
    } as QueueReportRunRequest);
  };

  const submitArtifact = () => {
    artifactMutation.mutate({
      reportRunId: optional(artifact.reportRunId),
      artifactType: optional(artifact.artifactType),
      format: optional(artifact.format),
      fileName: optional(artifact.fileName),
      mimeType: optional(artifact.mimeType),
      sizeBytes: integer(artifact.sizeBytes),
      checksum: optional(artifact.checksum),
      storageObjectReferenceId: optional(artifact.storageObjectReferenceId),
      documentReferenceId: optional(artifact.documentReferenceId),
      expiresAt: instant(artifact.expiresAt),
    } as GenerateReportArtifactRequest);
  };

  return (
    <Stack spacing={2}>
      <Alert severity="info">
        Reporting lifecycle actions only submit HidraAPI-owned records. HidraWEB does not fabricate run completion, artifact existence, storage objects, schedules, exports, or downloadable files.
      </Alert>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Typography component="h2" variant="h6">Create report definition</Typography>
          {!definitionPermission ? <Alert severity="warning">HidraAPI did not publish route-permission metadata for report-definition creation.</Alert> : null}
          <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' } }}>
            {(['code','nameAr','nameFr','nameEn','description','reportCategoryId','ownerModule'] as const).map((key) => (
              <TextField key={key} label={key} size="small" value={definition[key]} onChange={(event) => setDefinition((current) => ({ ...current, [key]: event.target.value }))} />
            ))}
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControlLabel control={<Checkbox checked={definition.requiresApproval} onChange={(event) => setDefinition((current) => ({ ...current, requiresApproval: event.target.checked }))} />} label="requiresApproval" />
            <FormControlLabel control={<Checkbox checked={definition.restricted} onChange={(event) => setDefinition((current) => ({ ...current, restricted: event.target.checked }))} />} label="restricted" />
          </Stack>
          {definitionMutation.isError ? <Alert severity="error">{mutationError(definitionMutation.error)}</Alert> : null}
          {definitionMutation.isSuccess ? <Alert severity="success">Report definition created by HidraAPI.</Alert> : null}
          <Button variant="contained" disabled={!canCreateDefinition || definitionMutation.isPending} onClick={submitDefinition}>Create report definition</Button>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Typography component="h2" variant="h6">Request report</Typography>
          {!requestPermission ? <Alert severity="warning">HidraAPI did not publish route-permission metadata for report requests.</Alert> : null}
          <TextFields value={request} onChange={(key, value) => setRequest((current) => ({ ...current, [key]: value }))} />
          {requestMutation.isError ? <Alert severity="error">{mutationError(requestMutation.error)}</Alert> : null}
          {requestMutation.isSuccess ? <Alert severity="success">Report request created by HidraAPI.</Alert> : null}
          <Button variant="contained" disabled={!canRequestReport || requestMutation.isPending} onClick={submitRequest}>Request report</Button>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Typography component="h2" variant="h6">Queue report run</Typography>
          {!runPermission ? <Alert severity="warning">HidraAPI did not publish route-permission metadata for report-run queueing.</Alert> : null}
          <TextFields value={run} onChange={(key, value) => setRun((current) => ({ ...current, [key]: value }))} />
          {runMutation.isError ? <Alert severity="error">{mutationError(runMutation.error)}</Alert> : null}
          {runMutation.isSuccess ? <Alert severity="success">Report run queued by HidraAPI.</Alert> : null}
          <Button variant="contained" disabled={!canQueueRun || runMutation.isPending} onClick={submitRun}>Queue report run</Button>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Typography component="h2" variant="h6">Generate report artifact record</Typography>
          {!artifactPermission ? <Alert severity="warning">HidraAPI did not publish route-permission metadata for report-artifact generation.</Alert> : null}
          <TextFields value={artifact} onChange={(key, value) => setArtifact((current) => ({ ...current, [key]: value }))} dateFields={['expiresAt']} />
          {artifactMutation.isError ? <Alert severity="error">{mutationError(artifactMutation.error)}</Alert> : null}
          {artifactMutation.isSuccess ? <Alert severity="success">Report artifact record generated by HidraAPI.</Alert> : null}
          <Button variant="contained" disabled={!canGenerateArtifact || artifactMutation.isPending} onClick={submitArtifact}>Generate report artifact</Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
