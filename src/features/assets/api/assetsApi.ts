import { hidraHttpClient } from '@/api/client/hidraHttpClient';

export interface RegisterMaintainableAssetRequest {
  assetNumber?: string;
  assetCode?: string;
  assetName?: string;
  assetTypeId?: string;
  topologyAssetTypeCode?: string;
  topologyAssetId?: string;
  topologyAssetCodeSnapshot?: string;
  topologyAssetNameSnapshot?: string;
  criticalityId?: string;
  ownerOrganizationUnitId?: string;
  ownerOrganizationUnitNameSnapshot?: string;
  manufacturerPartyId?: string;
  manufacturerNameSnapshot?: string;
  modelId?: string;
  serialIdentityId?: string;
  installedAt?: string;
  commissionedAt?: string;
  createdByActorId?: string;
}

export interface RecordAssetConditionRequest {
  maintainableAssetId?: string;
  conditionStatus?: string;
  conditionTypeId?: string;
  sourceModule?: string;
  sourceReferenceId?: string;
  summary?: string;
  conditionScore?: number;
  observedAt?: string;
  observedByActorId?: string;
}

export interface CreateMaintenanceWorkOrderRequest {
  workOrderNumber?: string;
  maintainableAssetId?: string;
  maintenancePlanId?: string;
  sourceRecommendationId?: string;
  workOrderTypeId?: string;
  priorityId?: string;
  title?: string;
  description?: string;
  assignedOrganizationUnitId?: string;
  assignedActorId?: string;
  plannedStartAt?: string;
  plannedEndAt?: string;
  workflowInstanceId?: string;
  createdByActorId?: string;
}

export interface UpdateMaintainableAssetRequest {
  expectedUpdatedAt: string;
  assetName: string;
}

export interface MaintainableAssetResponse {
  id?: string;
  assetNumber?: string;
  assetCode?: string;
  assetName?: string;
  assetTypeId?: string;
  topologyAssetTypeCode?: string;
  topologyAssetId?: string;
  status?: string;
  criticalityId?: string;
  registeredAt?: string;
  updatedAt?: string;
}

export function registerMaintainableAsset(request: RegisterMaintainableAssetRequest): Promise<Record<string, unknown>> {
  return hidraHttpClient<Record<string, unknown>>({ method: 'POST', url: '/api/v1/assets/maintainable-assets', data: request });
}

export function recordAssetCondition(request: RecordAssetConditionRequest): Promise<Record<string, unknown>> {
  return hidraHttpClient<Record<string, unknown>>({ method: 'POST', url: '/api/v1/assets/asset-conditions', data: request });
}

export function createMaintenanceWorkOrder(request: CreateMaintenanceWorkOrderRequest): Promise<Record<string, unknown>> {
  return hidraHttpClient<Record<string, unknown>>({ method: 'POST', url: '/api/v1/assets/maintenance-work-orders', data: request });
}

export function updateMaintainableAsset(assetId: string, request: UpdateMaintainableAssetRequest): Promise<MaintainableAssetResponse> {
  return hidraHttpClient<MaintainableAssetResponse>({
    method: 'PATCH',
    url: `/api/v1/assets/maintainable-assets/${encodeURIComponent(assetId)}`,
    data: request,
  });
}
