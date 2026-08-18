import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { RequestsMainComponent } from './requests-main';
import { AssetRequest, AssetService } from '../../services/asset-request.service';
import { AuthService } from '../../../../core/auth/auth.service';

describe('RequestsMainComponent', () => {
  let component: RequestsMainComponent;
  let fixture: ComponentFixture<RequestsMainComponent>;
  // normalizeStatus/normalizePriority/normalizeRequestType are pure functions that
  // don't touch HttpClient, so the real service can be used directly in tests.
  let assetService: AssetService;

  beforeEach(async () => {
    assetService = new AssetService({} as any);

    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getUserId']);
    authServiceSpy.getUserId.and.returnValue('1');

    await TestBed.configureTestingModule({
      imports: [RequestsMainComponent],
      providers: [
        provideRouter([]),
        { provide: AssetService, useValue: assetService },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestsMainComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    spyOn(assetService, 'getEmployeeRequests').and.returnValue(of([]));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // Covers the BUGS.md finding: pendingCount/approvedCount/rejectedCount used a
  // strict `status === 'Pending'` check, so requests sitting in a granular backend
  // status (PendingStorekeeperReview, PendingProcurement, TemporaryAssigned) were
  // silently excluded from every count.
  it('should count granular backend statuses under their normalized bucket', () => {
    const base = { priority: 'Normal', requestType: 'NewAsset', assetName: 'Laptop', submittedDate: '2026-01-01' };
    const requests: AssetRequest[] = [
      { ...base, id: 1, status: 'Pending' } as AssetRequest,
      { ...base, id: 2, status: 'PendingStorekeeperReview' } as AssetRequest,
      { ...base, id: 3, status: 'PendingProcurement' } as AssetRequest,
      { ...base, id: 4, status: 'TemporaryAssigned' } as AssetRequest,
      { ...base, id: 5, status: 'Approved' } as AssetRequest,
      { ...base, id: 6, status: 'Rejected' } as AssetRequest,
    ];
    spyOn(assetService, 'getEmployeeRequests').and.returnValue(of(requests));

    fixture.detectChanges();

    expect(component.pendingCount()).toBe(3); // Pending + PendingStorekeeperReview + PendingProcurement
    expect(component.approvedCount()).toBe(2); // Approved + TemporaryAssigned
    expect(component.rejectedCount()).toBe(1);
  });
});
