import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of } from 'rxjs';
import { DiscardFormComponent } from './discard-form';
import { AssetService as AssetRequestService } from '../../services/asset-request.service';
import { AssetService } from '../../../inventory/services/asset.service';
import { AuthService } from '../../../../core/auth/auth.service';

describe('DiscardFormComponent', () => {
  let component: DiscardFormComponent;
  let fixture: ComponentFixture<DiscardFormComponent>;
  let assetRequestServiceSpy: jasmine.SpyObj<AssetRequestService>;
  let locationSpy: jasmine.SpyObj<Location>;

  beforeEach(async () => {
    assetRequestServiceSpy = jasmine.createSpyObj('AssetRequestService', ['createRequest']);
    assetRequestServiceSpy.createRequest.and.returnValue(of({ message: 'ok' } as any));

    const inventoryAssetServiceSpy = jasmine.createSpyObj('AssetService', ['getAll']);
    inventoryAssetServiceSpy.getAll.and.returnValue(of([]));

    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getUserId', 'getUserName']);
    authServiceSpy.getUserId.and.returnValue('1');
    authServiceSpy.getUserName.and.returnValue('Emp One');

    locationSpy = jasmine.createSpyObj('Location', ['back']);

    await TestBed.configureTestingModule({
      imports: [DiscardFormComponent],
      providers: [
        { provide: AssetRequestService, useValue: assetRequestServiceSpy },
        { provide: AssetService, useValue: inventoryAssetServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Location, useValue: locationSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { data: {} } } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscardFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Covers the BUGS.md finding: the success overlay was dismissed before the user
  // could see it, because onSubmit() called location.back() immediately after
  // showing it, instead of leaving navigation to onResultClosed().
  it('should show the success overlay without navigating away immediately on submit', () => {
    component.asset.set('Chair (AST-2)');
    component.reason.set('End of life');

    component.onSubmit();

    expect(component.showResult()).toBeTrue();
    expect(component.resultType()).toBe('success');
    expect(locationSpy.back).not.toHaveBeenCalled();
  });

  it('should navigate back only when the result overlay is closed', () => {
    component.asset.set('Chair (AST-2)');
    component.reason.set('End of life');

    component.onSubmit();
    component.onResultClosed();

    expect(locationSpy.back).toHaveBeenCalledTimes(1);
  });
});
