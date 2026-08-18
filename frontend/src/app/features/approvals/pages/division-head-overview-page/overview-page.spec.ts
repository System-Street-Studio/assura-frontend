import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { DivisionHeadOverviewComponent } from './overview-page';
import { ProfileService } from '../../../../core/services/profile.service';
import { DivisionHeadDashboardService } from '../../services/division-head-dashboard.service';
import { RequestService } from '../../services/requests.service';

describe('DivisionHeadOverviewComponent', () => {
  let component: DivisionHeadOverviewComponent;
  let fixture: ComponentFixture<DivisionHeadOverviewComponent>;
  let mockProfileService: jasmine.SpyObj<ProfileService>;
  let mockDashboardService: jasmine.SpyObj<DivisionHeadDashboardService>;
  let mockRequestService: jasmine.SpyObj<RequestService>;

  beforeEach(async () => {
    mockProfileService = jasmine.createSpyObj('ProfileService', ['getProfile']);
    mockProfileService.getProfile.and.returnValue(of({ divisionId: 1 } as any));

    mockDashboardService = jasmine.createSpyObj('DivisionHeadDashboardService', ['getDivisionOverviewSummary', 'updateAssetCount']);
    mockDashboardService.getDivisionOverviewSummary.and.returnValue(of({
      assetsCount: 10,
      assetsPurchaseValue: 500000,
      pendingRequestsCount: 2,
      transferredAssetsCount: 1
    }));

    mockRequestService = jasmine.createSpyObj('RequestService', ['getPendingRequests']);
    mockRequestService.getPendingRequests.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [DivisionHeadOverviewComponent],
      providers: [
        provideRouter([]),
        { provide: ProfileService, useValue: mockProfileService },
        { provide: DivisionHeadDashboardService, useValue: mockDashboardService },
        { provide: RequestService, useValue: mockRequestService }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DivisionHeadOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
