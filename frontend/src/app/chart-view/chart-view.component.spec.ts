import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChartView } from './chart-view.component';

describe('ChartView', () => {
  let fixture: ComponentFixture<ChartView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ChartView] }).compileComponents();
    fixture = TestBed.createComponent(ChartView);
    fixture.componentRef.setInput('spec', {
      kind: 'bar',
      title: 'Applications per week',
      labels: ['2026-11-16', '2026-11-23'],
      values: [1, 3],
    });
    await fixture.whenStable();
  });

  it('renders the title and a data table with one row per label', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('figcaption')?.textContent).toBe('Applications per week');
    const img = el.querySelector('[role="img"]')!;
    expect(img.getAttribute('aria-label')).toBe('Applications per week');
    expect(img.querySelector('canvas')).not.toBeNull();
    const rows = [...el.querySelectorAll('.chart-data tbody tr')].map((r) =>
      [...r.children].map((c) => c.textContent),
    );
    expect(rows).toEqual([
      ['2026-11-16', '1'],
      ['2026-11-23', '3'],
    ]);
  });
});
