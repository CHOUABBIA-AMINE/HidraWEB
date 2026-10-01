import { beforeEach, describe, expect, it, vi } from 'vitest';

const httpClient = vi.hoisted(() => vi.fn());
vi.mock('@/api/client/hidraHttpClient', () => ({ hidraHttpClient: httpClient }));

import {
  createSimulationModel,
  createSimulationScenario,
  publishSimulationRecommendation,
  queueSimulationRun,
} from '@/features/simulation/api/simulationOrchestrationApi';

describe('simulation orchestration API', () => {
  beforeEach(() => httpClient.mockReset());

  it('uses the canonical simulation orchestration endpoints', async () => {
    httpClient.mockResolvedValue({});

    const model = { code: 'HYD-01', nameFr: 'Modele hydraulique' };
    const scenario = { code: 'SC-01', modelId: 'model-1', scenarioTypeId: 'what-if' };
    const run = { scenarioId: 'scenario-1', runTypeId: 'steady-state' };
    const recommendation = { runId: 'run-1', title: 'Review operating window', targetModule: 'planning' };

    await createSimulationModel(model);
    await createSimulationScenario(scenario);
    await queueSimulationRun(run);
    await publishSimulationRecommendation(recommendation);

    expect(httpClient).toHaveBeenNthCalledWith(1, { method: 'POST', url: '/api/v1/simulation/models', data: model });
    expect(httpClient).toHaveBeenNthCalledWith(2, { method: 'POST', url: '/api/v1/simulation/scenarios', data: scenario });
    expect(httpClient).toHaveBeenNthCalledWith(3, { method: 'POST', url: '/api/v1/simulation/runs', data: run });
    expect(httpClient).toHaveBeenNthCalledWith(4, { method: 'POST', url: '/api/v1/simulation/recommendations', data: recommendation });
  });
});
