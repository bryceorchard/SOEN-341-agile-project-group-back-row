import { TestBed } from "@angular/core/testing";
import { ApplicationStats } from "./application-stats";

describe("ApplicationStats", () => {
  let service: ApplicationStats;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApplicationStats);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
