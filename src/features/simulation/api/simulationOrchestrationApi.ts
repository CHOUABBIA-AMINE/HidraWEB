import type {
  CreateSimulationModelRequest,
  CreateSimulationScenarioRequest,
  PublishSimulationRecommendationRequest,
  QueueSimulationRunRequest,
  SimulationModelResponse,
  SimulationRecommendationResponse,
  SimulationRunResponse,
  SimulationScenarioResponse,
} from '@/api/generated/simulation/model';
import { hidraHttpClient } from '@/api/client/hidraHttpClient';

export function createSimulationModel(request: CreateSimulationModelRequest): Promise<SimulationModelResponse> {
  return hidraHttpClient<SimulationModelResponse>({ method: 'POST', url: '/api/v1/simulation/models', data: request });
}

export function createSimulationScenario(request: CreateSimulationScenarioRequest): Promise<SimulationScenarioResponse> {
  return hidraHttpClient<SimulationScenarioResponse>({ method: 'POST', url: '/api/v1/simulation/scenarios', data: request });
}

export function queueSimulationRun(request: QueueSimulationRunRequest): Promise<SimulationRunResponse> {
  return hidraHttpClient<SimulationRunResponse>({ method: 'POST', url: '/api/v1/simulation/runs', data: request });
}

export function publishSimulationRecommendation(request: PublishSimulationRecommendationRequest): Promise<SimulationRecommendationResponse> {
  return hidraHttpClient<SimulationRecommendationResponse>({ method: 'POST', url: '/api/v1/simulation/recommendations', data: request });
}
