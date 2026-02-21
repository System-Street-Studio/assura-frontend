import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaintenanceFormComponent } from './maintenance-form';

describe('MaintenanceFormComponent', () => {
  let component: MaintenanceFormComponent;
  let fixture: ComponentFixture<MaintenanceFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaintenanceFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaintenanceFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
