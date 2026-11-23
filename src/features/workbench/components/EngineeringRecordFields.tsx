import { Box, Typography } from '@mui/material';

const registerColumns: Readonly<Record<string, readonly string[]>> = {
  IntegrityAssessmentJpaEntity: ['assessmentNumber', 'title', 'status', 'assessmentDate'],
  InspectionFindingJpaEntity: ['findingNumber', 'severity', 'description'],
  IntegrityEvidenceLinkJpaEntity: ['evidenceCodeSnapshot', 'evidenceLabelSnapshot', 'evidenceType', 'evidenceTimestamp'],
  MaintainableAssetJpaEntity: ['assetNumber', 'assetCode', 'assetName', 'status'],
  AssetConditionJpaEntity: ['maintainableAssetId', 'conditionStatus', 'summary', 'observedAt'],
  MaintenanceWorkOrderJpaEntity: ['workOrderNumber', 'maintainableAssetId', 'title', 'status'],
};

export function EngineeringRegisterSummary({ javaType, attributes }: {
  javaType?: string;
  attributes: Record<string, unknown>;
}) {
  const entity = javaType?.split('.').pop();
  const keys = entity ? registerColumns[entity] : undefined;
  const values = (keys ?? Object.keys(attributes)).flatMap(key => {
    const value = attributes[key];
    return typeof value === 'number' || (typeof value === 'string' && value.trim())
      ? [String(value)] : [];
  });
  return values.slice(0, 4).join(' · ') || '—';
}

export function EngineeringRecordFields({ attributes }: { attributes: Record<string, unknown> }) {
  if (!Object.keys(attributes).length) return <Typography>No fields returned.</Typography>;
  return <Box component="dl" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(10rem, 1fr) 3fr' }, columnGap: 2, my: 1 }}>
    {Object.entries(attributes).map(([name, value]) => (
      <Box key={name} sx={{ display: 'contents' }}>
        <Typography component="dt" sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>{name}</Typography>
        <Typography component="dd" sx={{ m: 0, mb: 1, overflowWrap: 'anywhere' }}>
          {value == null ? '—' : typeof value === 'object' ? JSON.stringify(value) : String(value)}
        </Typography>
      </Box>
    ))}
  </Box>;
}
