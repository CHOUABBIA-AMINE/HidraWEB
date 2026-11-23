import { z } from 'zod';

import type { SectionView } from '@/api/generated/topology/model';

const optionalText = z.string().nullish().transform(value => value ?? undefined);
const optionalNumber = z.number().finite().nullish().transform(value => value ?? undefined);
const source = z.object({ ownerEntityId: optionalText, sourceKind: optionalText, revision: optionalText, recordedAt: optionalText });
const quantity = z.object({
  availability: optionalText, value: optionalNumber, unit: optionalText, basis: optionalText,
  source: source.nullish().transform(value => value ?? undefined),
});
const sectionDetail = z.object({
  id: z.string(), code: optionalText, type: optionalText, flowDirection: optionalText,
  startKilometerPoint: quantity.nullish().transform(value => value ?? undefined),
  endKilometerPoint: quantity.nullish().transform(value => value ?? undefined),
  length: quantity.nullish().transform(value => value ?? undefined),
  source: source.nullish().transform(value => value ?? undefined),
});

// The section endpoint's 200 has no schema. Decode the displayed fields and check the requested ID.
export function readSectionDetail(response: unknown, expectedId: string): SectionView {
  const section = sectionDetail.parse(response);
  if (section.id !== expectedId) throw new Error('Unexpected pipeline section');
  return section;
}

const constraint = z.object({ status: z.string() });
const qualified = z.object({
  restrictionClass: z.literal('UPPER_OPERATING_PRESSURE'),
  scopeType: z.enum(['PIPELINE', 'SECTION']),
  pipelineId: z.string(), sectionId: z.string().nullish(), conditionCode: z.string(),
  upperPressure: z.number().finite().positive(), pressureUnit: z.string().min(1), pressureBasis: z.string().min(1),
  effectiveFrom: z.string().min(1), effectiveUntil: optionalText, revisionId: z.string().min(1),
  engineeringSourceRevision: z.string().min(1), sourceBaselineReceiptId: z.string().min(1),
  sourceManifestDigest: optionalText, decisionReference: optionalText,
});

export function qualifiedPressure(response: unknown, pipelineId: string, sectionId: string | undefined, conditionCode: string) {
  const state = constraint.safeParse(response);
  if (state.data?.status === 'CONFLICT') return 'CONFLICT';
  if (state.data?.status !== 'QUALIFIED') return 'UNAVAILABLE';
  const parsed = qualified.safeParse(response);
  if (!parsed.success) return 'UNAVAILABLE';
  const value = parsed.data;
  if (value.pipelineId !== pipelineId || value.conditionCode !== conditionCode ||
      value.scopeType !== (sectionId ? 'SECTION' : 'PIPELINE') || (value.sectionId ?? undefined) !== sectionId) return 'UNAVAILABLE';
  return [`${value.upperPressure} ${value.pressureUnit}`, value.pressureBasis,
    value.effectiveFrom, value.effectiveUntil, value.revisionId, value.engineeringSourceRevision,
    value.sourceBaselineReceiptId, value.sourceManifestDigest, value.decisionReference].filter(Boolean).join(' · ');
}
