import * as echarts from 'echarts';
import { createInstance } from 'i18next';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import { describe, expect, it } from 'vitest';

import { getFeatureCollectionBounds } from '@/components/map/mapBounds';
import type { HidraMapFeatureCollection } from '@/components/map/mapTypes';
import type { WorkbenchPage, WorkbenchResourceDescriptor } from '@/features/workbench/api/workbenchApi';
import { WorkbenchDataGrid } from '@/features/workbench/components/WorkbenchDataGrid';

function elapsedMs(start: number): number {
  return performance.now() - start;
}

function createWorkbenchFixture(): {
  descriptor: WorkbenchResourceDescriptor;
  page: WorkbenchPage;
} {
  const searchableFields = Array.from({ length: 24 }, (_, index) => `field-${index}`);
  const descriptor: WorkbenchResourceDescriptor = {
    module: 'performance',
    resource: 'records',
    entityName: 'PerformanceRecord',
    javaType: 'PerformanceRecord',
    tableName: 'performance_record',
    idField: 'id',
    searchableFields,
    listEndpoint: '/api/v1/workbench/performance/records',
    detailEndpoint: '/api/v1/workbench/performance/records/{id}',
    searchEndpoint: '/api/v1/workbench/performance/records/search',
  };

  const items = Array.from({ length: 200 }, (_, rowIndex) => ({
    module: descriptor.module,
    resource: descriptor.resource,
    id: `row-${rowIndex}`,
    attributes: Object.fromEntries([
      ['id', `row-${rowIndex}`],
      ...searchableFields.map((field, fieldIndex) => [field, `value-${rowIndex}-${fieldIndex}`]),
    ]),
  }));

  return {
    descriptor,
    page: {
      module: descriptor.module,
      resource: descriptor.resource,
      page: 0,
      size: 200,
      totalElements: 20_000,
      totalPages: 100,
      items,
    },
  };
}

function createTopologyFixture(featureCount: number): HidraMapFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: Array.from({ length: featureCount }, (_, index) => {
      const longitude = (index % 360) - 180;
      const latitude = (index % 180) - 90;
      const isLine = index % 2 === 0;

      return {
        type: 'Feature' as const,
        id: `feature-${index}`,
        geometry: isLine
          ? {
              type: 'LineString' as const,
              coordinates: [
                [longitude, latitude],
                [Math.min(longitude + 0.25, 180), Math.min(latitude + 0.25, 90)],
              ],
            }
          : {
              type: 'Point' as const,
              coordinates: [longitude, latitude],
            },
        properties: { layer: isLine ? 'pipeline-segments' : 'facilities' },
      };
    }),
  };
}

describe('HWEB-015-08 production performance budgets', () => {
  it('renders the maximum supported 200-row workbench page within the hosted-CI budget', async () => {
    const i18n = createInstance();
    await i18n.init({
      initImmediate: false,
      lng: 'en',
      resources: {
        en: {
          translation: {
            'workbench.inspect': 'Inspect',
            'workbench.rowsPerPage': 'Rows per page',
          },
        },
      },
    });
    const { descriptor, page } = createWorkbenchFixture();

    const startedAt = performance.now();
    const markup = renderToStaticMarkup(createElement(
      I18nextProvider,
      { i18n },
      createElement(WorkbenchDataGrid, {
        descriptor,
        page,
        detailEnabled: true,
        onInspect: () => undefined,
        onPageChange: () => undefined,
        onPageSizeChange: () => undefined,
      }),
    ));
    const duration = elapsedMs(startedAt);

    expect(markup).toContain('row-199');
    expect(markup).toContain('value-199-8');
    expect(duration).toBeLessThan(4_000);
  });

  it('computes bounds for 25,000 topology features within the hosted-CI budget', () => {
    const collection = createTopologyFixture(25_000);

    const startedAt = performance.now();
    const bounds = getFeatureCollectionBounds(collection);
    const duration = elapsedMs(startedAt);

    expect(bounds).toBeDefined();
    expect(bounds?.west).toBe(-180);
    expect(bounds?.south).toBe(-90);
    expect(bounds?.east).toBeGreaterThan(179);
    expect(bounds?.north).toBeGreaterThan(89);
    expect(duration).toBeLessThan(1_000);
  });

  it('renders a 10,000-point operational ECharts series within the hosted-CI budget', () => {
    const points = Array.from({ length: 10_000 }, (_, index) => [
      index,
      Math.sin(index / 50) * 100 + Math.cos(index / 17) * 20,
    ]);
    const chart = echarts.init(null, undefined, {
      renderer: 'svg',
      ssr: true,
      width: 1_600,
      height: 600,
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
    expect(duration).toBeLessThan(5_000);
  });
});
