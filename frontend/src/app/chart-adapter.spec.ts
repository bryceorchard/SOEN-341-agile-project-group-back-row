import { renderChart, ChartSpec } from './chart-adapter';

describe('renderChart', () => {
  it('returns a handle that can be destroyed', () => {
    const canvas = document.createElement('canvas');
    const spec: ChartSpec = {
      kind: 'bar',
      title: 'Applications per week',
      labels: ['Week 1', 'Week 2'],
      values: [1, 2],
    };

    const handle = renderChart(canvas, spec);

    expect(handle).toBeTruthy();
    expect(() => handle.destroy()).not.toThrow();
  });
});