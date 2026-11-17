import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MetricTile } from "./metric-tile";

describe("MetricTile", () => {
  let component: MetricTile;
  let fixture: ComponentFixture<MetricTile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetricTile],
    }).compileComponents();

    fixture = TestBed.createComponent(MetricTile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
