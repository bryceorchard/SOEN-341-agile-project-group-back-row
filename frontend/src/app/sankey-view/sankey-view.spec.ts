import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SankeyView } from './sankey-view';

describe('SankeyView', () => {
  let fixture: ComponentFixture<SankeyView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SankeyView] }).compileComponents();
    fixture = TestBed.createComponent(SankeyView);
  });

  it('shows one table row per flow', async () => {
    fixture.componentRef.setInput('spec', {
      title: 'Last 7 days (3 applications)',
      flows: [
        { from: 'Submitted', to: 'Applied', value: 2 },
        { from: 'Submitted', to: 'Interview', value: 1 },
      ],
    });
    await fixture.whenStable();
    const rows = fixture.nativeElement.querySelectorAll('.chart-data tbody tr');
    expect(rows.length).toBe(2);
    expect(fixture.nativeElement.textContent).not.toContain('No applications in this period.');
  });

  it('exposes the diagram as one labelled image, with the canvas itself presentational', async () => {
    fixture.componentRef.setInput('spec', { title: 'Last 7 days (1 application)', flows: [{ from: 'Submitted', to: 'Applied', value: 1 }] });
    await fixture.whenStable();
    const img = fixture.nativeElement.querySelector('[role="img"]') as HTMLElement;
    expect(img.getAttribute('aria-label')).toBe('Sankey diagram: Last 7 days (1 application)');
    expect(img.querySelector('canvas')?.getAttribute('aria-hidden')).toBe('true');
    expect(fixture.nativeElement.querySelector('canvas[role]')).toBeNull();
  });

  it('shows an empty message when the period has no applications', async () => {
    fixture.componentRef.setInput('spec', { title: 'Last 7 days (0 applications)', flows: [] });
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('No applications in this period.');
    expect(fixture.nativeElement.querySelector('.chart-data')).toBeNull();
  });
});
