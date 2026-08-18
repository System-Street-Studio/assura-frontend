import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { NewAssetDetailsComponent } from './new-asset-details';
import { RequestService } from '../../services/requests.service';
import { AuthService } from '../../../../core/auth/auth.service';

describe('NewAssetDetailsComponent', () => {
  let component: NewAssetDetailsComponent;
  let fixture: ComponentFixture<NewAssetDetailsComponent>;
  let mockRequestService: jasmine.SpyObj<RequestService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    mockRequestService = jasmine.createSpyObj('RequestService', [
      'getRequestById',
      'getSuggestedAssetsForRequest',
      'approveRequest',
      'rejectRequest',
      'processByStorekeeper',
      'confirmTemporaryAssignment'
    ]);
    mockRequestService.getRequestById.and.returnValue(of({} as any));
    mockRequestService.getSuggestedAssetsForRequest.and.returnValue(of([]));

    mockAuthService = jasmine.createSpyObj('AuthService', ['hasRole']);
    mockAuthService.hasRole.and.returnValue(true);

    await TestBed.configureTestingModule({
      imports: [NewAssetDetailsComponent],
      providers: [
        provideRouter([]),
        { provide: RequestService, useValue: mockRequestService },
        { provide: AuthService, useValue: mockAuthService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: () => null },
              queryParamMap: { get: () => null }
            }
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewAssetDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
