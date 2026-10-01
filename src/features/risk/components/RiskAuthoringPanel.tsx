import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import type {
  AddRiskEvidenceRequest,
  CreateRiskAssessmentRequest,
  CreateRiskRegisterRequest,
} from '@/api/generated/risk/model';
import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import { usePermissions } from '@/features/permissions/usePermissions';
import { addRiskEvidence, createRiskAssessment, createRiskRegister } from '@/features/risk/api/riskAuthoringApi';

const REGISTER_ROUTE = '/api/v1/risk/registers';
const ASSESSMENT_ROUTE = '/api/v1/risk/assessments';
const EVIDENCE_ROUTE = '/api/v1/risk/evidence';

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

function mutationError(error: unknown): string {
  const normalized = normalizeHidraApiError(error);
  return normalized.status === 403
    ? 'HidraAPI refused this Risk authoring operation.'
    : normalized.message || 'The Risk authoring operation failed.';
}

type RegisterForm = Record<
  'code' | 'nameAr' | 'nameFr' | 'nameEn' | 'description' | 'registerTypeId' | 'ownerOrganizationUnitId'
  | 'ownerOrganizationUnitNameSnapshot' | 'scopeType' | 'scopeId' | 'scopeCodeSnapshot' | 'scopeLabelSnapshot'
  | 'reviewFrequencyId' | 'effectiveFrom' | 'effectiveTo' | 'createdByActorId' | 'createdByDisplayNameSnapshot',
  string
>;

type AssessmentForm = Record<
  'riskRegisterId' | 'assessmentNumber' | 'title' | 'description' | 'assessmentTypeId' | 'methodologyId' | 'scopeId'
  | 'riskScenarioId' | 'assessmentDate' | 'validFrom' | 'validTo' | 'assessedByActorId' | 'assessedByDisplayNameSnapshot',
  string
>;

type EvidenceForm = Record<
  'riskAssessmentId' | 'evidenceModule' | 'evidenceType' | 'evidenceId' | 'evidenceCodeSnapshot' | 'evidenceLabelSnapshot'
  | 'evidenceTimestamp' | 'evidenceHash' | 'evidenceSummary',
  string
>;

const emptyRegister: RegisterForm = {
  code: '', nameAr: '', nameFr: '', nameEn: '', description: '', registerTypeId: '', ownerOrganizationUnitId: '',
  ownerOrganizationUnitNameSnapshot: '', scopeType: '', scopeId: '', scopeCodeSnapshot: '', scopeLabelSnapshot: '',
  reviewFrequencyId: '', effectiveFrom: '', effectiveTo: '', createdByActorId: '', createdByDisplayNameSnapshot: '',
};
const emptyAssessment: AssessmentForm = {
  riskRegisterId: '', assessmentNumber: '', title: '', description: '', assessmentTypeId: '', methodologyId: '',
  scopeId: '', riskScenarioId: '', assessmentDate: '', validFrom: '', validTo: '', assessedByActorId: '',
  assessedByDisplayNameSnapshot: '',
};
const emptyEvidence: EvidenceForm = {
  riskAssessmentId: '', evidenceModule: '', evidenceType: '', evidenceId: '', evidenceCodeSnapshot: '',
  evidenceLabelSnapshot: '', evidenceTimestamp: '', evidenceHash: '', evidenceSummary: '',
};

function Fields<T extends Record<string, string>>({
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
          InputLabelProps={dateFields.includes(key) ? { shrink: true } : undefined}
        />
      ))}
    </Box>
  );
}

export function RiskAuthoringPanel() {
  const permissions = usePermissions();
  const queryClient = useQueryClient();
  const [register, setRegister] = useState<RegisterForm>(emptyRegister);
  const [assessment, setAssessment] = useState<AssessmentForm>(emptyAssessment);
  const [evidence, setEvidence] = useState<EvidenceForm>(emptyEvidence);

  const registerPermission = permissionForPost(permissions.routes, REGISTER_ROUTE);
  const assessmentPermission = permissionForPost(permissions.routes, ASSESSMENT_ROUTE);
  const evidencePermission = permissionForPost(permissions.routes, EVIDENCE_ROUTE);

  const refreshRiskReads = () => queryClient.invalidateQueries({ queryKey: ['hidra', 'workbench', 'risk'] });

  const registerMutation = useMutation({
    mutationFn: createRiskRegister,
    onSuccess: async () => { setRegister(emptyRegister); await refreshRiskReads(); },
  });
  const assessmentMutation = useMutation({
    mutationFn: createRiskAssessment,
    onSuccess: async () => { setAssessment(emptyAssessment); await refreshRiskReads(); },
  });
  const evidenceMutation = useMutation({
    mutationFn: addRiskEvidence,
    onSuccess: async () => { setEvidence(emptyEvidence); await refreshRiskReads(); },
  });

  const canCreateRegister = Boolean(registerPermission && permissions.can(registerPermission));
  const canCreateAssessment = Boolean(assessmentPermission && permissions.can(assessmentPermission));
  const canAddEvidence = Boolean(evidencePermission && permissions.can(evidencePermission));

  const submitRegister = () => {
    const request: CreateRiskRegisterRequest = {
      code: optional(register.code),
      nameAr: optional(register.nameAr),
      nameFr: optional(register.nameFr),
      nameEn: optional(register.nameEn),
      description: optional(register.description),
      registerTypeId: optional(register.registerTypeId),
      ownerOrganizationUnitId: optional(register.ownerOrganizationUnitId),
      ownerOrganizationUnitNameSnapshot: optional(register.ownerOrganizationUnitNameSnapshot),
      scopeType: optional(register.scopeType),
      scopeId: optional(register.scopeId),
      scopeCodeSnapshot: optional(register.scopeCodeSnapshot),
      scopeLabelSnapshot: optional(register.scopeLabelSnapshot),
      reviewFrequencyId: optional(register.reviewFrequencyId),
      effectiveFrom: instant(register.effectiveFrom),
      effectiveTo: instant(register.effectiveTo),
      createdByActorId: optional(register.createdByActorId),
      createdByDisplayNameSnapshot: optional(register.createdByDisplayNameSnapshot),
    };
    registerMutation.mutate(request);
  };

  const submitAssessment = () => {
    const request: CreateRiskAssessmentRequest = {
      riskRegisterId: optional(assessment.riskRegisterId),
      assessmentNumber: optional(assessment.assessmentNumber),
      title: optional(assessment.title),
      description: optional(assessment.description),
      assessmentTypeId: optional(assessment.assessmentTypeId),
      methodologyId: optional(assessment.methodologyId),
      scopeId: optional(assessment.scopeId),
      riskScenarioId: optional(assessment.riskScenarioId),
      assessmentDate: instant(assessment.assessmentDate),
      validFrom: instant(assessment.validFrom),
      validTo: instant(assessment.validTo),
      assessedByActorId: optional(assessment.assessedByActorId),
      assessedByDisplayNameSnapshot: optional(assessment.assessedByDisplayNameSnapshot),
    };
    assessmentMutation.mutate(request);
  };

  const submitEvidence = () => {
    const request: AddRiskEvidenceRequest = {
      riskAssessmentId: optional(evidence.riskAssessmentId),
      evidenceModule: optional(evidence.evidenceModule),
      evidenceType: optional(evidence.evidenceType),
      evidenceId: optional(evidence.evidenceId),
      evidenceCodeSnapshot: optional(evidence.evidenceCodeSnapshot),
      evidenceLabelSnapshot: optional(evidence.evidenceLabelSnapshot),
      evidenceTimestamp: instant(evidence.evidenceTimestamp),
      evidenceHash: optional(evidence.evidenceHash),
      evidenceSummary: optional(evidence.evidenceSummary),
    };
    evidenceMutation.mutate(request);
  };

  return (
    <Stack spacing={2}>
      <Alert severity="info">
        Risk authoring submits HidraAPI-owned records only. Scores, ratings, calculations, lifecycle transitions, and assessment semantics are not calculated in the browser.
      </Alert>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Typography component="h2" variant="h6">Create risk register</Typography>
          {!registerPermission ? <Alert severity="warning">HidraAPI did not publish route-permission metadata for risk-register creation.</Alert> : null}
          <Fields value={register} onChange={(key, value) => setRegister((current) => ({ ...current, [key]: value }))} dateFields={['effectiveFrom', 'effectiveTo']} />
          {registerMutation.isError ? <Alert severity="error">{mutationError(registerMutation.error)}</Alert> : null}
          {registerMutation.isSuccess ? <Alert severity="success">Risk register created by HidraAPI.</Alert> : null}
          <Button variant="contained" disabled={!canCreateRegister || registerMutation.isPending} onClick={submitRegister}>
            Create risk register
          </Button>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Typography component="h2" variant="h6">Create risk assessment</Typography>
          {!assessmentPermission ? <Alert severity="warning">HidraAPI did not publish route-permission metadata for risk-assessment creation.</Alert> : null}
          <Fields value={assessment} onChange={(key, value) => setAssessment((current) => ({ ...current, [key]: value }))} dateFields={['assessmentDate', 'validFrom', 'validTo']} />
          {assessmentMutation.isError ? <Alert severity="error">{mutationError(assessmentMutation.error)}</Alert> : null}
          {assessmentMutation.isSuccess ? <Alert severity="success">Risk assessment created by HidraAPI.</Alert> : null}
          <Button variant="contained" disabled={!canCreateAssessment || assessmentMutation.isPending} onClick={submitAssessment}>
            Create risk assessment
          </Button>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Typography component="h2" variant="h6">Attach risk evidence</Typography>
          {!evidencePermission ? <Alert severity="warning">HidraAPI did not publish route-permission metadata for risk-evidence attachment.</Alert> : null}
          <Fields value={evidence} onChange={(key, value) => setEvidence((current) => ({ ...current, [key]: value }))} dateFields={['evidenceTimestamp']} />
          {evidenceMutation.isError ? <Alert severity="error">{mutationError(evidenceMutation.error)}</Alert> : null}
          {evidenceMutation.isSuccess ? <Alert severity="success">Risk evidence attached by HidraAPI.</Alert> : null}
          <Button variant="contained" disabled={!canAddEvidence || evidenceMutation.isPending} onClick={submitEvidence}>
            Attach risk evidence
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
