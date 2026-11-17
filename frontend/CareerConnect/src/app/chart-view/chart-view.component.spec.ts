import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ChartView } from "./chart-view.component";

describe("ChartView", () => {
  let component: ChartView;
  let fixture: ComponentFixture<ChartView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartView],
    }).compileComponents();

    fixture = TestBed.createComponent(ChartView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
