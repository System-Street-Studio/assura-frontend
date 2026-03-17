import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllEmpRequests } from './all-emp-requests';

describe('AllEmpRequests', () => {
  let component: AllEmpRequests;
  let fixture: ComponentFixture<AllEmpRequests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllEmpRequests]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllEmpRequests);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
