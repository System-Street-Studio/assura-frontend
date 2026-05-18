import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DivisionHeadOverviewComponent } from './overview-page';

describe('DivisionHeadOverviewComponent', () => {
  let component: DivisionHeadOverviewComponent;
  let fixture: ComponentFixture<DivisionHeadOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DivisionHeadOverviewComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DivisionHeadOverviewComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
