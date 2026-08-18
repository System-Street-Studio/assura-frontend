import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AssetService } from '../../services/asset-request.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { of, throwError } from 'rxjs';

import { AllRequestsComponent } from './all-emp-requests';

describe('AllRequestsComponent', () => {
  let component: AllRequestsComponent;
  let fixture: ComponentFixture<AllRequestsComponent>;
  let assetServiceSpy: jasmine.SpyObj<AssetService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    assetServiceSpy = jasmine.createSpyObj('AssetService', ['getEmployeeRequests', 'cancelRequest', 'normalizeStatus']);
    assetServiceSpy.getEmployeeRequests.and.returnValue(of([]));
    assetServiceSpy.cancelRequest.and.returnValue(of({}));
    assetServiceSpy.normalizeStatus.and.callFake((status: string) => {
      switch (status) {
        case 'PendingStorekeeperReview':
        case 'PendingProcurement':
          return 'Pending';
        case 'TemporaryAssigned':
          return 'Approved';
        default:
          return status;
      }
    });

    authServiceSpy = jasmine.createSpyObj('AuthService', ['getUserId']);
    authServiceSpy.getUserId.and.returnValue('1');

    await TestBed.configureTestingModule({
      imports: [AllRequestsComponent],
      providers: [
        provideRouter([]),
        { provide: AssetService, useValue: assetServiceSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AllRequestsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reset page on search', () => {
    component.currentPage.set(2);
    component.onSearchChange('REQ');
    expect(component.currentPage()).toBe(1);
  });

  it('should reset page on status change', () => {
    component.currentPage.set(2);
    component.setStatus('Approved');
    expect(component.currentPage()).toBe(1);
  });

  it('should update currentPage on onPageChange', () => {
    component.onPageChange(3);
    expect(component.currentPage()).toBe(3);
  });

  it('should toggle menu state', () => {
    expect(component.isMenuOpen()).toBeFalse();
    component.toggleMenu();
    expect(component.isMenuOpen()).toBeTrue();
  });

  it('should set error on load failure', () => {
    assetServiceSpy.getEmployeeRequests.and.returnValue(throwError(() => new Error('Network error')));
    component.ngOnInit();
    expect(component.error()).toBe('Failed to load requests. Please try again later.');
    expect(component.isLoading()).toBeFalse();
  });
});
