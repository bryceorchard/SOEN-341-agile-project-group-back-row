import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MetricTile } from './metric-tile';

describe('MetricTile', () => {
  let fixture: ComponentFixture<MetricTile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [MetricTile] }).compileComponents();
    fixture = TestBed.createComponent(MetricTile);
    fixture.componentRef.setInput('label', 'Total applications');
    fixture.componentRef.setInput('value', 4);
  });

  it('shows the label and value, and no hint by default', async () => {
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.tile-label')?.textContent).toBe('Total applications');
    expect(el.querySelector('.tile-value')?.textContent).toBe('4');
    expect(el.querySelector('.tile-hint')).toBeNull();
  });

  it('shows the hint when given one', async () => {
    fixture.componentRef.setInput('hint', '2 of 4 got a reply');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.tile-hint')?.textContent).toBe('2 of 4 got a reply');
  });
});
