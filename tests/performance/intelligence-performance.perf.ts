import * as echarts from 'echarts';
import { describe, expect, it } from 'vitest';

type MetricRecord = {
  metricCode: string;
  value: number;
};

type ScenarioValue = {
  key: string;
  value: number;
};

function elapsedMs(start: number): number {
  return performance.now() - start;
}

function aggregateMetrics(records: MetricRecord[]): Map<string, { count: number; total: number }> {
  const aggregates = new Map<string, { count: number; total: number }>();

  for (const record of records) {
    const current = aggregates.get(record.metricCode);
    if (current) {
      current.count += 1;
      current.total += record.value;
    } else {
      aggregates.set(record.metricCode, { count: 1, total: record.value });
    }
  }

  return aggregates;
}

function compareScenarios(baseline: ScenarioValue[], scenarios: ScenarioValue[][]): number[][] {
  const baselineByKey = new Map(baseline.map((item) => [item.key, item.value]));

  return scenarios.map((scenario) => scenario.map((item) => item.value - (baselineByKey.get(item.key) ?? 0)));
}

describe('HWEB-013-07 intelligence performance budgets', () => {
  it('renders a 5,000-point ECharts series within the hosted-CI budget', () => {
    const points = Array.from({ length: 5_000 }, (_, index) => [index, Math.sin(index / 50) * 100]);
    const chart = echarts.init(null, undefined, {
      renderer: 'svg',
      ssr: true,
      width: 1_200,
      height: 500,
    });

    const startedAt = performance.now();
    chart.setOption({
      animation: false,
      xAxis: { type: 'value' },
      yAxis: { type: 'value' },
      series: [{ type: 'line', showSymbol: false, data: points }],
    });
    const svg = chart.renderToSVGString();
    const duration = elapsedMs(startedAt);
    chart.dispose();

    expect(svg).toContain('<svg');
    expect(duration).toBeLessThan(3_000);
  });

  it('aggregates 100,000 analytic result records within the hosted-CI budget', () => {
    const records = Array.from({ length: 100_000 }, (_, index) => ({
      metricCode: `METRIC-${index % 100}`,
      value: index % 1_000,
    }));

    const startedAt = performance.now();
    const aggregates = aggregateMetrics(records);
    const duration = elapsedMs(startedAt);

    expect(aggregates.size).toBe(100);
    expect(aggregates.get('METRIC-0')?.count).toBe(1_000);
    expect(duration).toBeLessThan(1_500);
  });

  it('compares 40 scenarios with 1,500 result values each within the hosted-CI budget', () => {
    const baseline = Array.from({ length: 1_500 }, (_, index) => ({
      key: `target-${index}`,
      value: index,
    }));
    const scenarios = Array.from({ length: 40 }, (_, scenarioIndex) => baseline.map((item) => ({
      key: item.key,
      value: item.value + scenarioIndex + 1,
    })));

    const startedAt = performance.now();
    const comparisons = compareScenarios(baseline, scenarios);
    const duration = elapsedMs(startedAt);

    expect(comparisons).toHaveLength(40);
    expect(comparisons[39]).toHaveLength(1_500);
    expect(comparisons[39][1_499]).toBe(40);
    expect(duration).toBeLessThan(1_500);
  });
});
