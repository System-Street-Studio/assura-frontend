import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of } from 'rxjs';
import { MaintenanceFormComponent } from './maintenance-form';
import { AssetService as AssetRequestService } from '../../services/asset-request.service';
import { AssetService } from '../../../inventory/services/asset.service';
import { AuthService } from '../../../../core/auth/auth.service';

describe('MaintenanceFormComponent', () => {
  let component: MaintenanceFormComponent;
  let fixture: ComponentFixture<MaintenanceFormComponent>;
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
      imports: [MaintenanceFormComponent],
      providers: [
        { provide: AssetRequestService, useValue: assetRequestServiceSpy },
        { provide: AssetService, useValue: inventoryAssetServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Location, useValue: locationSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { data: {} } } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaintenanceFormComponent);
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
    component.asset.set('Laptop (AST-1)');
    component.issueType.set('Damaged');
    component.priority.set('Normal');

    component.onSubmit();

    expect(component.showResult()).toBeTrue();
    expect(component.resultType()).toBe('success');
    expect(locationSpy.back).not.toHaveBeenCalled();
  });

  it('should navigate back only when the result overlay is closed', () => {
    component.asset.set('Laptop (AST-1)');
    component.issueType.set('Damaged');
    component.priority.set('Normal');

    component.onSubmit();
    component.onResultClosed();

    expect(locationSpy.back).toHaveBeenCalledTimes(1);
  });

  it('should show a validation message when the required asset field is left empty', () => {
    const assetSelect = fixture.nativeElement.querySelector('select[name="asset"]');

    if (assetSelect) {
      assetSelect.value = '';
      assetSelect.dispatchEvent(new Event('blur'));
      assetSelect.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Please select an assigned asset.');
    }
  });
});
