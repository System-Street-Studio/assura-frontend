import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { NewAssetRequestComponent } from './new-asset-request';
import { AssetService } from '../../services/asset-request.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { CategoryService } from '../../../inventory/services/category.service';
import { ToastService } from '../../../../shared/services/toast.service';

describe('NewAssetRequestComponent', () => {
  let component: NewAssetRequestComponent;
  let fixture: ComponentFixture<NewAssetRequestComponent>;
  let mockAssetService: jasmine.SpyObj<AssetService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockCategoryService: jasmine.SpyObj<CategoryService>;
  let mockToastService: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    mockAssetService = jasmine.createSpyObj('AssetService', ['createRequest']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getUserId', 'getUserName']);
    mockAuthService.getUserId.and.returnValue('1');
    mockAuthService.getUserName.and.returnValue('Test User');

    mockCategoryService = jasmine.createSpyObj('CategoryService', ['getAll']);
    mockCategoryService.getAll.and.returnValue(of([]));

    mockToastService = jasmine.createSpyObj('ToastService', ['success', 'error', 'warning']);

    await TestBed.configureTestingModule({
      imports: [NewAssetRequestComponent],
      providers: [
        provideRouter([]),
        { provide: AssetService, useValue: mockAssetService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: CategoryService, useValue: mockCategoryService },
        { provide: ToastService, useValue: mockToastService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewAssetRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
