import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AssetService } from '../../services/asset-request.service';
import { of, throwError } from 'rxjs';

import { AllRequestsComponent } from './all-emp-requests';

describe('AllRequestsComponent', () => {
  let component: AllRequestsComponent;
  let fixture: ComponentFixture<AllRequestsComponent>;
  let assetServiceSpy: jasmine.SpyObj<AssetService>;

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

    await TestBed.configureTestingModule({
      imports: [AllRequestsComponent],
      providers: [
        provideRouter([]),
        { provide: AssetService, useValue: assetServiceSpy }
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

  // Covers the BUGS.md finding: cancelRequest only mutated local state via console.log
  // and never called the backend, so a "cancelled" request reverted on refresh.
  it('should call the backend to cancel a request and update local state on success', () => {
    component.requests.set([
      { id: 42, employeeId: '1', submittedBy: 'Emp', assetName: 'Laptop', assetCategory: 'IT', quantity: 1, priority: 'Normal', reason: 'r', status: 'Pending', submittedDate: '2026-01-01', requestType: 'NewAsset' } as any
    ]);

    component.cancelRequest(42);

    expect(assetServiceSpy.cancelRequest).toHaveBeenCalledWith(42);
    expect(component.requests()[0].status).toBe('Cancelled');
  });

  it('should not update local state if the backend cancel call fails', () => {
    assetServiceSpy.cancelRequest.and.returnValue(throwError(() => new Error('fail')));
    component.requests.set([
      { id: 42, employeeId: '1', submittedBy: 'Emp', assetName: 'Laptop', assetCategory: 'IT', quantity: 1, priority: 'Normal', reason: 'r', status: 'Pending', submittedDate: '2026-01-01', requestType: 'NewAsset' } as any
    ]);

    component.cancelRequest(42);

    expect(component.requests()[0].status).toBe('Pending');
  });

  // Covers the BUGS.md finding: the status filter dropdown compared the raw backend
  // status directly, so requests sitting in a granular status like
  // PendingStorekeeperReview never matched the "Pending" filter and disappeared.
  it('should include granular backend statuses when filtering by their normalized bucket', () => {
    component.requests.set([
      { id: 1, status: 'Pending', requestType: 'NewAsset' } as any,
      { id: 2, status: 'PendingStorekeeperReview', requestType: 'NewAsset' } as any,
      { id: 3, status: 'Approved', requestType: 'NewAsset' } as any,
    ]);

    component.setStatus('Pending');

    expect(component.filteredRequests().map(r => r.id)).toEqual([1, 2]);
  });
});
