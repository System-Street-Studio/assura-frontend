import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmployeeAssetsComponent } from './employee-assets';

describe('EmployeeAssetsComponent', () => {
  let component: EmployeeAssetsComponent;
  let fixture: ComponentFixture<EmployeeAssetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeAssetsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeAssetsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});