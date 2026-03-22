import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmployeeAssetsComponent } from './employee-assets';
import { provideRouter } from '@angular/router';

describe('EmployeeAssetsComponent', () => {
  let component: EmployeeAssetsComponent;
  let fixture: ComponentFixture<EmployeeAssetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeAssetsComponent],
      providers: [provideRouter([])]
    })
      .compileComponents();

    fixture = TestBed.createComponent(EmployeeAssetsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should paginate assets correctly', () => {
    // There are 6 mock assets, pageSize is 6.
    expect(component.paginatedAssets().length).toBe(6);
    expect(component.totalPages()).toBe(1);
  });

  it('should reset page on search', () => {
    component.currentPage.set(2);
    component.onSearchChange('Dell');
    expect(component.currentPage()).toBe(1);
  });

  it('should update currentPage on onPageChange', () => {
    component.onPageChange(2);
    expect(component.currentPage()).toBe(2);
  });
});