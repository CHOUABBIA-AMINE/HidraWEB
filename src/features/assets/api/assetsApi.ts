import { hidraHttpClient } from '@/api/client/hidraHttpClient';
import type {
  AssetConditionResponse,
  CreateMaintenanceWorkOrderRequest,
  MaintenanceWorkOrderResponse,
  MaintainableAssetResponse,
  RecordAssetConditionRequest,
  RegisterMaintainableAssetRequest,
  UpdateMaintainableAssetRequest,
} from '@/api/generated/assets/model';

export type {
  CreateMaintenanceWorkOrderRequest,
  RecordAssetConditionRequest,
  RegisterMaintainableAssetRequest,
  UpdateMaintainableAssetRequest,
};

export function registerMaintainableAsset(request: RegisterMaintainableAssetRequest): Promise<MaintainableAssetResponse> {
  return hidraHttpClient<MaintainableAssetResponse>({ method: 'POST', url: '/api/v1/assets/maintainable-assets', data: request });
}

export function recordAssetCondition(request: RecordAssetConditionRequest): Promise<AssetConditionResponse> {
  return hidraHttpClient<AssetConditionResponse>({ method: 'POST', url: '/api/v1/assets/asset-conditions', data: request });
}

export function createMaintenanceWorkOrder(request: CreateMaintenanceWorkOrderRequest): Promise<MaintenanceWorkOrderResponse> {
  return hidraHttpClient<MaintenanceWorkOrderResponse>({ method: 'POST', url: '/api/v1/assets/maintenance-work-orders', data: request });
}

export function updateMaintainableAsset(assetId: string, request: UpdateMaintainableAssetRequest): Promise<MaintainableAssetResponse> {
  return hidraHttpClient<MaintainableAssetResponse>({
    method: 'PATCH',
    url: `/api/v1/assets/maintainable-assets/${encodeURIComponent(assetId)}`,
    data: request,
  });
}
