import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AssetService } from '../../services/asset-request.service';
import { of } from 'rxjs';

import { AllRequestsComponent } from './all-emp-requests';

describe('AllRequestsComponent', () => {
  let component: AllRequestsComponent;
  let fixture: ComponentFixture<AllRequestsComponent>;
  let assetServiceSpy: jasmine.SpyObj<AssetService>;

  beforeEach(async () => {
    assetServiceSpy = jasmine.createSpyObj('AssetService', ['getEmployeeRequests']);
    assetServiceSpy.getEmployeeRequests.and.returnValue(of([]));

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
});
