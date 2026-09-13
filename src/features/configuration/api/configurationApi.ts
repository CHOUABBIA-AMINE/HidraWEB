import { hidraHttpClient } from '@/api/client/hidraHttpClient';
import type {
  ConfigurationDefinitionResponse,
  ConfigurationValueResponse,
  CreateConfigurationDefinitionRequest,
  CreateFeatureFlagRequest,
  FeatureFlagResponse,
  SetConfigurationValueRequest,
} from '@/api/generated/configuration/model';

export function createConfigurationDefinition(
  request: CreateConfigurationDefinitionRequest,
): Promise<ConfigurationDefinitionResponse> {
  return hidraHttpClient<ConfigurationDefinitionResponse>({
    method: 'POST',
    url: '/api/v1/configuration/definitions',
    data: request,
  });
}

export function createFeatureFlag(request: CreateFeatureFlagRequest): Promise<FeatureFlagResponse> {
  return hidraHttpClient<FeatureFlagResponse>({
    method: 'POST',
    url: '/api/v1/configuration/feature-flags',
    data: request,
  });
}

export function setConfigurationValue(
  request: SetConfigurationValueRequest,
): Promise<ConfigurationValueResponse> {
  return hidraHttpClient<ConfigurationValueResponse>({
    method: 'POST',
    url: '/api/v1/configuration/values',
    data: request,
  });
}
