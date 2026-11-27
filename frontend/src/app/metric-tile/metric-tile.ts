import { Component, input } from '@angular/core';

@Component({
  selector: 'app-metric-tile',
  templateUrl: './metric-tile.html',
  styleUrl: './metric-tile.css',
})
export class MetricTile {
  label = input.required<string>();
  value = input.required<string | number>();
  hint = input<string>('');
}
