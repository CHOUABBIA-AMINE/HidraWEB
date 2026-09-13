import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';

import type {
  CreateConfigurationDefinitionRequest,
  CreateFeatureFlagRequest,
  SetConfigurationValueRequest,
} from '@/api/generated/configuration/model';
import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import { usePermissions } from '@/features/permissions/usePermissions';
import {
  fetchWorkbenchRecords,
  fetchWorkbenchResources,
  workbenchQueryKeys,
} from '@/features/workbench/api/workbenchApi';

import {
  createConfigurationDefinition,
  createFeatureFlag,
  setConfigurationValue,
} from './api/configurationApi';

const MODULE = 'configuration';
const PAGE_SIZE = 25;
const WORKBENCH_LIST_ROUTE = '/api/v1/workbench/{module}/{resource}';
const DEFINITION_ROUTE = '/api/v1/configuration/definitions';
const FLAG_ROUTE = '/api/v1/configuration/feature-flags';
const VALUE_ROUTE = '/api/v1/configuration/values';

function permissionForRoute(
  routes: ReturnType<typeof usePermissions>['routes'],
  route: string,
  method: 'GET' | 'POST',
): string | undefined {
  return routes.find((descriptor) => descriptor.route === route && descriptor.methods.includes(method))?.permission;
}

function errorMessage(error: unknown, fallback: string): string {
  const normalized = normalizeHidraApiError(error);
  if (normalized.status === 403) return 'HidraAPI refused this configuration operation.';
  return normalized.message || fallback;
}

function EvidenceList({ title, items }: { title: string; items: Array<{ id?: unknown; attributes: Record<string, unknown> }> }) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1}>
        <Typography component="h2" variant="h6">{title}</Typography>
        {items.length === 0 ? <Typography color="text.secondary">No records returned.</Typography> : null}
        {items.map((item, index) => (
          <Box component="pre" key={String(item.id ?? index)} sx={{ m: 0, p: 1, overflowX: 'auto', bgcolor: 'action.hover', whiteSpace: 'pre-wrap' }}>
            {JSON.stringify({ id: item.id, ...item.attributes }, null, 2)}
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}

export function ConfigurationAdministrationPage() {
  const permissions = usePermissions();

  const [definitionForm, setDefinitionForm] = useState<CreateConfigurationDefinitionRequest>({
    namespaceId: '', key: '', displayNameFr: '', displayNameAr: '', displayNameEn: '',
    valueType: 'STRING', sensitivity: 'INTERNAL', scoped: false, requiresApproval: false,
    defaultValue: '', description: '',
  });
  const [flagForm, setFlagForm] = useState<CreateFeatureFlagRequest>({
    code: '', nameFr: '', nameAr: '', nameEn: '', owningModule: '', evaluationStrategy: 'BOOLEAN',
    defaultEnabled: false, description: '',
  });
  const [valueForm, setValueForm] = useState<SetConfigurationValueRequest>({
    definitionId: '', definitionVersionId: '', environment: '', rawValue: '', jsonValue: '',
    secretReference: '', effectiveFrom: '', effectiveTo: '', createdByActorId: '',
  });

  const listPermission = permissionForRoute(permissions.routes, WORKBENCH_LIST_ROUTE, 'GET');
  const definitionPermission = permissionForRoute(permissions.routes, DEFINITION_ROUTE, 'POST');
  const flagPermission = permissionForRoute(permissions.routes, FLAG_ROUTE, 'POST');
  const valuePermission = permissionForRoute(permissions.routes, VALUE_ROUTE, 'POST');

  const canRead = Boolean(listPermission && permissions.can(listPermission));
  const canCreateDefinition = Boolean(definitionPermission && permissions.can(definitionPermission));
  const canCreateFlag = Boolean(flagPermission && permissions.can(flagPermission));
  const canSetValue = Boolean(valuePermission && permissions.can(valuePermission));

  const resourcesQuery = useQuery({
    queryKey: workbenchQueryKeys.resources(MODULE),
    queryFn: () => fetchWorkbenchResources(MODULE),
    enabled: canRead,
  });

  const resources = useMemo(() => ({
    definitions: resourcesQuery.data?.find((item) => item.javaType.endsWith('ConfigurationDefinitionJpaEntity')),
    flags: resourcesQuery.data?.find((item) => item.javaType.endsWith('FeatureFlagJpaEntity')),
    values: resourcesQuery.data?.find((item) => item.javaType.endsWith('ConfigurationValueJpaEntity')),
  }), [resourcesQuery.data]);

  const definitionsQuery = useQuery({
    queryKey: workbenchQueryKeys.list(MODULE, resources.definitions?.resource ?? '', 0, PAGE_SIZE, ''),
    queryFn: () => fetchWorkbenchRecords({ module: MODULE, resource: resources.definitions?.resource ?? '', page: 0, size: PAGE_SIZE, query: '' }),
    enabled: canRead && Boolean(resources.definitions),
  });
  const flagsQuery = useQuery({
    queryKey: workbenchQueryKeys.list(MODULE, resources.flags?.resource ?? '', 0, PAGE_SIZE, ''),
    queryFn: () => fetchWorkbenchRecords({ module: MODULE, resource: resources.flags?.resource ?? '', page: 0, size: PAGE_SIZE, query: '' }),
    enabled: canRead && Boolean(resources.flags),
  });
  const valuesQuery = useQuery({
    queryKey: workbenchQueryKeys.list(MODULE, resources.values?.resource ?? '', 0, PAGE_SIZE, ''),
    queryFn: () => fetchWorkbenchRecords({ module: MODULE, resource: resources.values?.resource ?? '', page: 0, size: PAGE_SIZE, query: '' }),
    enabled: canRead && Boolean(resources.values),
  });

  const definitionMutation = useMutation({ mutationFn: createConfigurationDefinition });
  const flagMutation = useMutation({ mutationFn: createFeatureFlag });
  const valueMutation = useMutation({ mutationFn: setConfigurationValue });

  function submitDefinition(event: FormEvent) { event.preventDefault(); if (canCreateDefinition) definitionMutation.mutate(definitionForm); }
  function submitFlag(event: FormEvent) { event.preventDefault(); if (canCreateFlag) flagMutation.mutate(flagForm); }
  function submitValue(event: FormEvent) { event.preventDefault(); if (canSetValue) valueMutation.mutate(valueForm); }

  if (permissions.status !== 'ready') {
    return <Container maxWidth="xl"><Alert severity="info">Loading configuration permissions…</Alert></Container>;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Box>
          <Typography component="h1" variant="h4">Configuration administration</Typography>
          <Typography color="text.secondary">HWEB-014-02 exposes only backend-published configuration operations with exact route permissions.</Typography>
        </Box>

        <Alert severity="info">
          HidraAPI publishes create-definition, create-feature-flag, and set-configuration-value operations. It does not publish toggle, update, delete, promotion, rollback, activate/deactivate, or inheritance actions; those controls are intentionally absent.
        </Alert>

        {!listPermission ? <Alert severity="warning">Configuration workbench route-permission metadata is unavailable. Read evidence is denied by default.</Alert> : null}
        {listPermission && !canRead ? <Alert severity="warning">Your current HidraAPI grants do not allow configuration evidence reads.</Alert> : null}
        {canRead && resourcesQuery.isPending ? <CircularProgress size={24} /> : null}
        {resourcesQuery.isError ? <Alert severity="error">{errorMessage(resourcesQuery.error, 'Configuration resources could not be loaded.')}</Alert> : null}

        {canRead && resourcesQuery.data ? (
          <Stack spacing={2}>
            {!resources.definitions ? <Alert severity="warning">No ConfigurationDefinitionJpaEntity runtime resource is published.</Alert> : null}
            {!resources.flags ? <Alert severity="warning">No FeatureFlagJpaEntity runtime resource is published.</Alert> : null}
            {!resources.values ? <Alert severity="warning">No ConfigurationValueJpaEntity runtime resource is published.</Alert> : null}
            {resources.definitions && definitionsQuery.data ? <EvidenceList title="Configuration definitions" items={definitionsQuery.data.items} /> : null}
            {resources.flags && flagsQuery.data ? <EvidenceList title="Feature flags" items={flagsQuery.data.items} /> : null}
            {resources.values && valuesQuery.data ? <EvidenceList title="Configuration values" items={valuesQuery.data.items} /> : null}
            {definitionsQuery.isError || flagsQuery.isError || valuesQuery.isError ? <Alert severity="error">A configuration evidence read failed.</Alert> : null}
          </Stack>
        ) : null}

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack component="form" spacing={2} onSubmit={submitDefinition}>
            <Typography component="h2" variant="h6">Create configuration definition</Typography>
            {!definitionPermission ? <Alert severity="warning">Definition-create route permission metadata is unavailable.</Alert> : null}
            {definitionPermission && !canCreateDefinition ? <Alert severity="warning">Your current grants do not allow configuration definition creation.</Alert> : null}
            <TextField label="Namespace ID" value={definitionForm.namespaceId ?? ''} onChange={(e) => setDefinitionForm((v) => ({ ...v, namespaceId: e.target.value }))} />
            <TextField label="Key" value={definitionForm.key ?? ''} onChange={(e) => setDefinitionForm((v) => ({ ...v, key: e.target.value }))} />
            <TextField label="French display name" value={definitionForm.displayNameFr ?? ''} onChange={(e) => setDefinitionForm((v) => ({ ...v, displayNameFr: e.target.value }))} />
            <TextField label="Arabic display name" value={definitionForm.displayNameAr ?? ''} onChange={(e) => setDefinitionForm((v) => ({ ...v, displayNameAr: e.target.value }))} />
            <TextField label="English display name" value={definitionForm.displayNameEn ?? ''} onChange={(e) => setDefinitionForm((v) => ({ ...v, displayNameEn: e.target.value }))} />
            <TextField label="Value type" value={definitionForm.valueType ?? ''} onChange={(e) => setDefinitionForm((v) => ({ ...v, valueType: e.target.value as CreateConfigurationDefinitionRequest['valueType'] }))} helperText="STRING, NUMBER, BOOLEAN, DATE, DURATION, JSON, REFERENCE, LIST" />
            <TextField label="Sensitivity" value={definitionForm.sensitivity ?? ''} onChange={(e) => setDefinitionForm((v) => ({ ...v, sensitivity: e.target.value as CreateConfigurationDefinitionRequest['sensitivity'] }))} helperText="PUBLIC, INTERNAL, RESTRICTED, SECRET_REFERENCE_ONLY" />
            <FormControlLabel control={<Switch checked={definitionForm.scoped ?? false} onChange={(e) => setDefinitionForm((v) => ({ ...v, scoped: e.target.checked }))} />} label="Scoped" />
            <FormControlLabel control={<Switch checked={definitionForm.requiresApproval ?? false} onChange={(e) => setDefinitionForm((v) => ({ ...v, requiresApproval: e.target.checked }))} />} label="Requires approval" />
            <TextField label="Default value" value={definitionForm.defaultValue ?? ''} onChange={(e) => setDefinitionForm((v) => ({ ...v, defaultValue: e.target.value }))} />
            <TextField label="Description" value={definitionForm.description ?? ''} onChange={(e) => setDefinitionForm((v) => ({ ...v, description: e.target.value }))} />
            <Button type="submit" variant="contained" disabled={!canCreateDefinition || definitionMutation.isPending}>Create definition</Button>
            {definitionMutation.isError ? <Alert severity="error">{errorMessage(definitionMutation.error, 'Definition creation failed.')}</Alert> : null}
            {definitionMutation.data ? <Alert severity="success">Definition {definitionMutation.data.id ?? '—'} recorded with status {definitionMutation.data.status ?? '—'}.</Alert> : null}
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack component="form" spacing={2} onSubmit={submitFlag}>
            <Typography component="h2" variant="h6">Create feature flag</Typography>
            {!flagPermission ? <Alert severity="warning">Feature-flag create route permission metadata is unavailable.</Alert> : null}
            {flagPermission && !canCreateFlag ? <Alert severity="warning">Your current grants do not allow feature-flag creation.</Alert> : null}
            <TextField label="Flag code" value={flagForm.code ?? ''} onChange={(e) => setFlagForm((v) => ({ ...v, code: e.target.value }))} />
            <TextField label="French flag name" value={flagForm.nameFr ?? ''} onChange={(e) => setFlagForm((v) => ({ ...v, nameFr: e.target.value }))} />
            <TextField label="Arabic flag name" value={flagForm.nameAr ?? ''} onChange={(e) => setFlagForm((v) => ({ ...v, nameAr: e.target.value }))} />
            <TextField label="English flag name" value={flagForm.nameEn ?? ''} onChange={(e) => setFlagForm((v) => ({ ...v, nameEn: e.target.value }))} />
            <TextField label="Owning module" value={flagForm.owningModule ?? ''} onChange={(e) => setFlagForm((v) => ({ ...v, owningModule: e.target.value }))} />
            <TextField label="Evaluation strategy" value={flagForm.evaluationStrategy ?? ''} onChange={(e) => setFlagForm((v) => ({ ...v, evaluationStrategy: e.target.value as CreateFeatureFlagRequest['evaluationStrategy'] }))} helperText="BOOLEAN, PERCENTAGE, RULE_BASED, ALLOW_LIST, DENY_LIST" />
            <FormControlLabel control={<Switch checked={flagForm.defaultEnabled ?? false} onChange={(e) => setFlagForm((v) => ({ ...v, defaultEnabled: e.target.checked }))} />} label="Default enabled" />
            <TextField label="Flag description" value={flagForm.description ?? ''} onChange={(e) => setFlagForm((v) => ({ ...v, description: e.target.value }))} />
            <Button type="submit" variant="contained" disabled={!canCreateFlag || flagMutation.isPending}>Create feature flag</Button>
            {flagMutation.isError ? <Alert severity="error">{errorMessage(flagMutation.error, 'Feature-flag creation failed.')}</Alert> : null}
            {flagMutation.data ? <Alert severity="success">Feature flag {flagMutation.data.id ?? '—'} recorded with status {flagMutation.data.status ?? '—'}.</Alert> : null}
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack component="form" spacing={2} onSubmit={submitValue}>
            <Typography component="h2" variant="h6">Set configuration value</Typography>
            {!valuePermission ? <Alert severity="warning">Set-value route permission metadata is unavailable.</Alert> : null}
            {valuePermission && !canSetValue ? <Alert severity="warning">Your current grants do not allow configuration value creation.</Alert> : null}
            <TextField label="Definition ID" value={valueForm.definitionId ?? ''} onChange={(e) => setValueForm((v) => ({ ...v, definitionId: e.target.value }))} />
            <TextField label="Definition version ID" value={valueForm.definitionVersionId ?? ''} onChange={(e) => setValueForm((v) => ({ ...v, definitionVersionId: e.target.value }))} />
            <TextField label="Environment" value={valueForm.environment ?? ''} onChange={(e) => setValueForm((v) => ({ ...v, environment: e.target.value }))} />
            <TextField label="Raw value" value={valueForm.rawValue ?? ''} onChange={(e) => setValueForm((v) => ({ ...v, rawValue: e.target.value }))} />
            <TextField label="JSON value" value={valueForm.jsonValue ?? ''} onChange={(e) => setValueForm((v) => ({ ...v, jsonValue: e.target.value }))} />
            <TextField label="Secret reference" value={valueForm.secretReference ?? ''} onChange={(e) => setValueForm((v) => ({ ...v, secretReference: e.target.value }))} />
            <TextField label="Effective from" value={valueForm.effectiveFrom ?? ''} onChange={(e) => setValueForm((v) => ({ ...v, effectiveFrom: e.target.value }))} />
            <TextField label="Effective to" value={valueForm.effectiveTo ?? ''} onChange={(e) => setValueForm((v) => ({ ...v, effectiveTo: e.target.value }))} />
            <TextField label="Created by actor ID" value={valueForm.createdByActorId ?? ''} onChange={(e) => setValueForm((v) => ({ ...v, createdByActorId: e.target.value }))} />
            <Button type="submit" variant="contained" disabled={!canSetValue || valueMutation.isPending}>Set configuration value</Button>
            {valueMutation.isError ? <Alert severity="error">{errorMessage(valueMutation.error, 'Configuration value creation failed.')}</Alert> : null}
            {valueMutation.data ? <Alert severity="success">Configuration value {valueMutation.data.id ?? '—'} recorded with status {valueMutation.data.status ?? '—'}.</Alert> : null}
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
