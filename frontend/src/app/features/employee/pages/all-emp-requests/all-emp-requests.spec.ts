import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllRequestsComponent } from './all-emp-requests';

describe('AllRequestsComponent', () => {
  let component: AllRequestsComponent;
  let fixture: ComponentFixture<AllRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllRequestsComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AllRequestsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
