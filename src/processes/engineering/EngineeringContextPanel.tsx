import { Alert, Chip, Paper, Stack, Typography } from '@mui/material';

export type EngineeringContextKind = 'Topology' | 'Document' | 'Risk' | 'Incident';

export interface EngineeringContextReference {
  kind: EngineeringContextKind;
  id: string;
  label?: string;
  sourceField: string;
}

const DIRECT_FIELD_RULES: ReadonlyArray<{
  kind: EngineeringContextKind;
  idFields: readonly string[];
  labelFields: readonly string[];
}> = [
  {
    kind: 'Topology',
    idFields: ['topologyAssetId'],
    labelFields: ['topologyAssetNameSnapshot', 'topologyAssetCodeSnapshot', 'topologyAssetCode', 'topologyAssetTypeCode'],
  },
  {
    kind: 'Document',
    idFields: ['documentReferenceId'],
    labelFields: ['documentTitleSnapshot', 'documentCodeSnapshot'],
  },
  {
    kind: 'Risk',
    idFields: ['riskAssessmentId'],
    labelFields: ['riskAssessmentTitleSnapshot', 'riskCodeSnapshot'],
  },
  {
    kind: 'Incident',
    idFields: ['sourceIncidentId'],
    labelFields: [],
  },
];

const MODULE_CONTEXT_KIND: Readonly<Record<string, EngineeringContextKind>> = {
  topology: 'Topology',
  documents: 'Document',
  risk: 'Risk',
  incident: 'Incident',
};

const QUALIFIED_REFERENCE_RULES: ReadonlyArray<{
  moduleField: string;
  idField: string;
}> = [
  { moduleField: 'sourceModule', idField: 'sourceReferenceId' },
  { moduleField: 'targetModule', idField: 'targetReferenceId' },
];

function text(attributes: Record<string, unknown>, field: string): string | undefined {
  const value = attributes[field];
  if (value === null || value === undefined) return undefined;
  const normalized = String(value).trim();
  return normalized || undefined;
}

function directReferences(attributes: Record<string, unknown>): EngineeringContextReference[] {
  return DIRECT_FIELD_RULES.flatMap((rule) => {
    const idField = rule.idFields.find((field) => text(attributes, field));
    if (!idField) return [];

    const labelField = rule.labelFields.find((field) => text(attributes, field));
    return [{
      kind: rule.kind,
      id: text(attributes, idField)!,
      label: labelField ? text(attributes, labelField) : undefined,
      sourceField: idField,
    }];
  });
}

function qualifiedReferences(attributes: Record<string, unknown>): EngineeringContextReference[] {
  return QUALIFIED_REFERENCE_RULES.flatMap((rule) => {
    const module = text(attributes, rule.moduleField);
    const id = text(attributes, rule.idField);
    const kind = module ? MODULE_CONTEXT_KIND[module] : undefined;
    if (!kind || !id) return [];

    return [{
      kind,
      id,
      sourceField: `${rule.moduleField}/${rule.idField}`,
    }];
  });
}

export function collectEngineeringContext(attributes: Record<string, unknown>): EngineeringContextReference[] {
  const references = [...directReferences(attributes), ...qualifiedReferences(attributes)];
  const unique = new Map<string, EngineeringContextReference>();

  references.forEach((reference) => {
    const key = `${reference.kind}:${reference.id}`;
    if (!unique.has(key)) unique.set(key, reference);
  });

  return Array.from(unique.values());
}

interface EngineeringContextPanelProps {
  attributes?: Record<string, unknown>;
}

export function EngineeringContextPanel({ attributes }: EngineeringContextPanelProps) {
  if (!attributes) return null;

  const references = collectEngineeringContext(attributes);

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={2}>
        <div>
          <Typography variant="h6">Cross-module engineering context</Typography>
          <Typography variant="body2" color="text.secondary">
            Neutral references are shown only when the selected HidraAPI record publishes them. No relationship is inferred from names, status, timestamps, or local UI state.
          </Typography>
        </div>

        {references.length === 0 ? (
          <Alert severity="info">
            The selected record does not publish a topology, document, risk, or incident relationship that HidraWEB can compose safely.
          </Alert>
        ) : (
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {references.map((reference) => (
              <Chip
                key={`${reference.kind}-${reference.sourceField}-${reference.id}`}
                variant="outlined"
                label={`${reference.kind}: ${reference.label ? `${reference.label} · ` : ''}${reference.id}`}
                title={`Published by backend field ${reference.sourceField}`}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
