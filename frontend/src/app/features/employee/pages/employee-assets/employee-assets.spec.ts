import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmployeeAssetsComponent } from './employee-assets';
import { provideRouter } from '@angular/router';
import { AssetService } from '../../../../features/inventory/services/asset.service';
import { of } from 'rxjs';

describe('EmployeeAssetsComponent', () => {
  let component: EmployeeAssetsComponent;
  let fixture: ComponentFixture<EmployeeAssetsComponent>;
  let assetServiceSpy: jasmine.SpyObj<AssetService>;

  const mockAssets = [
    { id: 1, assetCode: 'AST-1', productName: 'Dell Laptop 1', categoryName: 'IT', status: 'InUse' },
    { id: 2, assetCode: 'AST-2', productName: 'Dell Laptop 2', categoryName: 'IT', status: 'InUse' },
    { id: 3, assetCode: 'AST-3', productName: 'Dell Monitor 1', categoryName: 'IT', status: 'InUse' },
    { id: 4, assetCode: 'AST-4', productName: 'Dell Monitor 2', categoryName: 'IT', status: 'InUse' },
    { id: 5, assetCode: 'AST-5', productName: 'Chair 1', categoryName: 'Furniture', status: 'InUse' },
    { id: 6, assetCode: 'AST-6', productName: 'Chair 2', categoryName: 'Furniture', status: 'InUse' }
  ];

  beforeEach(async () => {
    assetServiceSpy = jasmine.createSpyObj('AssetService', ['getAll']);
    assetServiceSpy.getAll.and.returnValue(of(mockAssets as any));

    await TestBed.configureTestingModule({
      imports: [EmployeeAssetsComponent],
      providers: [
        provideRouter([]),
        { provide: AssetService, useValue: assetServiceSpy }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(EmployeeAssetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should paginate assets correctly', () => {
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