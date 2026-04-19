import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintenanceDetailsComponent } from './maintenance-details';

describe('MaintenanceDetails', () => {
  let component: MaintenanceDetailsComponent;
  let fixture: ComponentFixture<MaintenanceDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaintenanceDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaintenanceDetailsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
