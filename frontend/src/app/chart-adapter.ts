// chart.js plus the sankey controller; registered once, when the analytics chunk loads.
import { Chart, registerables } from 'chart.js';
import { SankeyController, Flow } from 'chartjs-chart-sankey';
Chart.register(...registerables, SankeyController, Flow);

export interface ChartSpec {
  kind: 'doughnut' | 'bar';
  title: string;
  labels: string[];
  values: number[];
}

export interface SankeyFlow { from: string; to: string; value: number; }
export interface SankeySpec { title: string; flows: SankeyFlow[]; }

export interface ChartHandle { destroy(): void; }

export function renderChart(canvas: HTMLCanvasElement, spec: ChartSpec): ChartHandle {
  return new Chart(canvas, {
    type: spec.kind,
    data: { labels: spec.labels, datasets: [{ label: spec.title, data: spec.values }] },
    options: { responsive: true, plugins: { legend: { display: spec.kind === 'doughnut' } } },
  });
}

export function renderSankey(canvas: HTMLCanvasElement, spec: SankeySpec): ChartHandle {
  return new Chart(canvas, {
    type: 'sankey',
    data: {
      datasets: [{
        label: spec.title,
        data: spec.flows.map((f) => ({ from: f.from, to: f.to, flow: f.value })),
        size: 'max',
      }],
    },
    options: { responsive: true, maintainAspectRatio: false },
  } as any);
}
