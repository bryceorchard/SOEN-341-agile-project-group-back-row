import { ComponentFixture, TestBed } from "@angular/core/testing";
import { SankeyView } from "./sankey-view";

describe("SankeyView", () => {
  let component: SankeyView;
  let fixture: ComponentFixture<SankeyView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SankeyView],
    }).compileComponents();

    fixture = TestBed.createComponent(SankeyView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
