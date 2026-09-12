import { EngineeringAssetsPage } from '@/features/assets';
import { EngineeringIntegrityPage } from '@/features/integrity';
import { EngineeringContextPanel } from '@/processes/engineering/EngineeringContextPanel';

function renderEngineeringContext(attributes?: Record<string, unknown>) {
  return <EngineeringContextPanel attributes={attributes} />;
}

export function EngineeringIntegrityProcessPage() {
  return <EngineeringIntegrityPage renderSelectedContext={renderEngineeringContext} />;
}

export function EngineeringAssetsProcessPage() {
  return <EngineeringAssetsPage renderSelectedContext={renderEngineeringContext} />;
}
