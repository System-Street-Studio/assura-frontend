import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { EmployeeOverviewComponent } from './employee-overview';
import { AuthService } from '../../../../core/auth/auth.service';
import { AssetService as EmpAssetService } from '../../services/asset-request.service';
import { AssetService as InvAssetService } from '../../../../features/inventory/services/asset.service';
import { NotificationService } from '../../../../shared/services/notification.service';

describe('EmployeeOverviewComponent', () => {
  let component: EmployeeOverviewComponent;
  let fixture: ComponentFixture<EmployeeOverviewComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockEmpAssetService: jasmine.SpyObj<EmpAssetService>;
  let mockInvAssetService: jasmine.SpyObj<InvAssetService>;
  let mockNotifService: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['getFirstName', 'getUserId', 'getDivisionId', 'getRoles']);
    mockAuthService.getFirstName.and.returnValue('John');
    mockAuthService.getUserId.and.returnValue('1');
    mockAuthService.getDivisionId.and.returnValue(1);
    mockAuthService.getRoles.and.returnValue(['Employee']);

    mockEmpAssetService = jasmine.createSpyObj('EmpAssetService', ['getArrivedAssets', 'getEmployeeRequests', 'confirmArrival']);
    mockEmpAssetService.getArrivedAssets.and.returnValue(of([]));
    mockEmpAssetService.getEmployeeRequests.and.returnValue(of([]));

    mockInvAssetService = jasmine.createSpyObj('InvAssetService', ['getAll']);
    mockInvAssetService.getAll.and.returnValue(of([]));

    mockNotifService = jasmine.createSpyObj('NotificationService', ['fetchNotifications']);

    await TestBed.configureTestingModule({
      imports: [EmployeeOverviewComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: EmpAssetService, useValue: mockEmpAssetService },
        { provide: InvAssetService, useValue: mockInvAssetService },
        { provide: NotificationService, useValue: mockNotifService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
