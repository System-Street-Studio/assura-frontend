import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AssetPoolComponent } from './asset-pool';
import { AssetPoolService } from '../../services/asset-pool.service';
import { RequestService } from '../../services/requests.service';
import { HeadTransferService } from '../../services/transfer.service';
import { AuthService } from '../../../../core/auth/auth.service';

describe('AssetPoolComponent', () => {
  let component: AssetPoolComponent;
  let fixture: ComponentFixture<AssetPoolComponent>;
  let mockAssetPoolService: jasmine.SpyObj<AssetPoolService>;
  let mockRequestService: jasmine.SpyObj<RequestService>;
  let mockTransferService: jasmine.SpyObj<HeadTransferService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    mockAssetPoolService = jasmine.createSpyObj('AssetPoolService', [
      'getCategories',
      'getAssignedDivisions',
      'getAssignedEmployees',
      'getFilteredAssets',
      'getSpecificationsByCategory'
    ]);
    mockAssetPoolService.getCategories.and.returnValue(of([]));
    mockAssetPoolService.getAssignedDivisions.and.returnValue(of([]));
    mockAssetPoolService.getAssignedEmployees.and.returnValue(of([]));
    mockAssetPoolService.getFilteredAssets.and.returnValue(of({ success: true, data: { assets: [], totalCount: 0 } }));

    mockRequestService = jasmine.createSpyObj('RequestService', ['getApprovedTransferRequests']);
    mockRequestService.getApprovedTransferRequests.and.returnValue(of([]));

    mockTransferService = jasmine.createSpyObj('HeadTransferService', ['createTransferRecord']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getUserId']);

    await TestBed.configureTestingModule({
      imports: [AssetPoolComponent],
      providers: [
        { provide: AssetPoolService, useValue: mockAssetPoolService },
        { provide: RequestService, useValue: mockRequestService },
        { provide: HeadTransferService, useValue: mockTransferService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AssetPoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

// Covers the BUGS.md finding: "View in Pool" navigation state was sent by
// transfer-details.ts (router.navigate(['/approvals/asset-pool'], { state: {
// transferRequestId } })) but never read here, so the Division Head always landed
// with the dropdown unset and had to manually re-find the request. The component now
// captures router.getCurrentNavigation()?.extras.state['transferRequestId'] at
// construction time and pre-selects it once the approved-request list loads.
describe('AssetPoolComponent — incoming transfer request pre-selection', () => {
  function setup(incomingTransferRequestId: number | null, approvedRequests: any[]) {
    const mockAssetPoolService = jasmine.createSpyObj('AssetPoolService', [
      'getCategories', 'getAssignedDivisions', 'getAssignedEmployees', 'getFilteredAssets', 'getSpecificationsByCategory'
    ]);
    mockAssetPoolService.getCategories.and.returnValue(of([]));
    mockAssetPoolService.getAssignedDivisions.and.returnValue(of([]));
    mockAssetPoolService.getAssignedEmployees.and.returnValue(of([]));
    mockAssetPoolService.getFilteredAssets.and.returnValue(of({ success: true, data: { assets: [], totalCount: 0 } }));

    const mockRequestService = jasmine.createSpyObj('RequestService', ['getApprovedTransferRequests']);
    mockRequestService.getApprovedTransferRequests.and.returnValue(of(approvedRequests));

    const mockTransferService = jasmine.createSpyObj('HeadTransferService', ['createTransferRecord']);
    const mockAuthService = jasmine.createSpyObj('AuthService', ['getUserId']);

    const mockRouter = jasmine.createSpyObj('Router', ['getCurrentNavigation']);
    mockRouter.getCurrentNavigation.and.returnValue(
      incomingTransferRequestId == null ? null : { extras: { state: { transferRequestId: incomingTransferRequestId } } }
    );

    TestBed.configureTestingModule({
      imports: [AssetPoolComponent],
      providers: [
        { provide: AssetPoolService, useValue: mockAssetPoolService },
        { provide: RequestService, useValue: mockRequestService },
        { provide: HeadTransferService, useValue: mockTransferService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    });

    const fixture = TestBed.createComponent(AssetPoolComponent);
    return fixture;
  }

  afterEach(() => TestBed.resetTestingModule());

  it('pre-selects the transfer request passed via navigation state once the list loads', () => {
    const fixture = setup(7, [{ id: 5, requesterName: 'A' }, { id: 7, requesterName: 'B' }]);
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedTransferRequest()?.id).toBe(7);
  });

  it('leaves the selection unset when no navigation state was passed', () => {
    const fixture = setup(null, [{ id: 5, requesterName: 'A' }]);
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedTransferRequest()).toBeNull();
  });

  it('leaves the selection unset when the passed id is not among the approved requests', () => {
    const fixture = setup(999, [{ id: 5, requesterName: 'A' }]);
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedTransferRequest()).toBeNull();
  });
});
