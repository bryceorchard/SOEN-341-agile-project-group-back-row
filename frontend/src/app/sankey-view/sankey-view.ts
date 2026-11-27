import { Component, ElementRef, OnDestroy, effect, input, viewChild } from '@angular/core';
import { ChartHandle, SankeySpec, renderSankey } from '../chart-adapter';

@Component({
  selector: 'app-sankey-view',
  templateUrl: './sankey-view.html',
  styleUrl: './sankey-view.css',
})
export class SankeyView implements OnDestroy {
  spec = input.required<SankeySpec>();
  private canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private handle?: ChartHandle;

  constructor() {
    effect(() => {
      const spec = this.spec();
      this.handle?.destroy();
      this.handle = spec.flows.length ? renderSankey(this.canvas().nativeElement, spec) : undefined;
    });
  }
  ngOnDestroy() { this.handle?.destroy(); }
}
