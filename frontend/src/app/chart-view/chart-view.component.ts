import { Component, ElementRef, effect, input, viewChild, OnDestroy } from '@angular/core';
import { ChartHandle, ChartSpec, renderChart } from '../chart-adapter';

@Component({
  selector: 'app-chart-view',
  template: `
    <figure>
      <figcaption>{{ spec().title }}</figcaption>
      <!-- Same pattern as sankey-view: the image role is on the wrapper, not the canvas. -->
      <div role="img" [attr.aria-label]="spec().title"><canvas #canvas aria-hidden="true"></canvas></div>
      <table class="chart-data">
        <caption class="sr-only">{{ spec().title }} (values)</caption>
        <tbody>
          @for (label of spec().labels; track label; let i = $index) {
            <tr><th scope="row">{{ label }}</th><td>{{ spec().values[i] }}</td></tr>
          }
        </tbody>
      </table>
    </figure>
  `,
})
export class ChartView implements OnDestroy {
  spec = input.required<ChartSpec>();
  private canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private handle?: ChartHandle;

  constructor() {
    effect(() => {
      const spec = this.spec();
      this.handle?.destroy();
      this.handle = renderChart(this.canvas().nativeElement, spec);
    });
  }
  ngOnDestroy() { this.handle?.destroy(); }
}
