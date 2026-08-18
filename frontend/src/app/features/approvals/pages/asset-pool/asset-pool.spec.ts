import { ComponentFixture, TestBed } from '@angular/core/testing';
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
