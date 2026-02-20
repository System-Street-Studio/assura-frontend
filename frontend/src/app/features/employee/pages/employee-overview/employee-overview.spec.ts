import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmployeeOverviewComponent} from './employee-overview';


describe('EmployeeOverviewComponent', () => {
  let component: EmployeeOverviewComponent;
  let fixture: ComponentFixture<EmployeeOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeOverviewComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
