import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { MaintenanceDetailsComponent } from './maintenance-details';
import { RequestService } from '../../services/requests.service';
import { AuthService } from '../../../../core/auth/auth.service';

// Covers the BUGS.md Division Head finding: "Maintenance/Discard approve-reject
// buttons have no status or role gating in the UI" — they rendered unconditionally
// regardless of request status or viewer role, unlike New-Asset/Transfer detail pages
// which gate via canDivisionHeadAct()/isReadOnly(). This adds the same gate here.
describe('MaintenanceDetailsComponent', () => {
  let component: MaintenanceDetailsComponent;
  let fixture: ComponentFixture<MaintenanceDetailsComponent>;
  let requestServiceSpy: jasmine.SpyObj<RequestService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  function setup(queryParams: Record<string, string> = {}) {
    requestServiceSpy = jasmine.createSpyObj('RequestService', ['approveRequest', 'rejectRequest', 'getRequestById']);
    requestServiceSpy.selectedRequest = null;
    requestServiceSpy.getRequestById.and.returnValue(of({} as any));

    authServiceSpy = jasmine.createSpyObj('AuthService', ['hasRole']);
    authServiceSpy.hasRole.and.returnValue(true);

    TestBed.configureTestingModule({
      imports: [MaintenanceDetailsComponent],
      providers: [
        { provide: RequestService, useValue: requestServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: () => null },
              queryParamMap: { get: (key: string) => queryParams[key] ?? null }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MaintenanceDetailsComponent);
    component = fixture.componentInstance;
  }

  it('should create', () => {
    setup();
    expect(component).toBeTruthy();
  });

  it('canDivisionHeadAct is true for a Division Head on a pending request', () => {
    setup();
    authServiceSpy.hasRole.and.returnValue(true);
    component.request.set({ id: 1, status: 'PendingDivisionHeadApproval' });

    expect(component.canDivisionHeadAct()).toBeTrue();
  });

  it('canDivisionHeadAct is false once the request has already been approved', () => {
    setup();
    authServiceSpy.hasRole.and.returnValue(true);
    component.request.set({ id: 1, status: 'Approved' });

    expect(component.canDivisionHeadAct()).toBeFalse();
  });

  it('canDivisionHeadAct is false for a role other than Division Head/Admin', () => {
    setup();
    authServiceSpy.hasRole.and.returnValue(false);
    component.request.set({ id: 1, status: 'PendingDivisionHeadApproval' });

    expect(component.canDivisionHeadAct()).toBeFalse();
  });

  it('honors the readOnly query param, same as transfer-details', () => {
    setup({ readOnly: 'true' });
    component.ngOnInit();

    expect(component.isReadOnly()).toBeTrue();
  });

  it('approveRequest does nothing without a request id', () => {
    setup();
    component.request.set({});

    component.approveRequest();

    expect(requestServiceSpy.approveRequest).not.toHaveBeenCalled();
  });

  it('approveRequest calls the backend and updates local status on success', () => {
    setup();
    requestServiceSpy.approveRequest.and.returnValue(of(true));
    component.request.set({ id: 5, status: 'PendingDivisionHeadApproval' });

    component.approveRequest();

    expect(requestServiceSpy.approveRequest).toHaveBeenCalledWith(5);
    expect(component.request().status).toBe('Approved');
    expect(component.showPopup()).toBeTrue();
  });

  it('rejectRequest prompts for a reason and forwards it to the backend', () => {
    setup();
    spyOn(window, 'prompt').and.returnValue('Not eligible for maintenance');
    requestServiceSpy.rejectRequest.and.returnValue(of(true));
    component.request.set({ id: 5, status: 'PendingDivisionHeadApproval' });

    component.rejectRequest();

    expect(window.prompt).toHaveBeenCalledWith('Reason for rejection (optional):');
    expect(requestServiceSpy.rejectRequest).toHaveBeenCalledWith(5, 'Not eligible for maintenance');
    expect(component.request().status).toBe('Rejected');
  });

  it('rejectRequest forwards undefined when the reason prompt is dismissed', () => {
    setup();
    spyOn(window, 'prompt').and.returnValue(null);
    requestServiceSpy.rejectRequest.and.returnValue(of(true));
    component.request.set({ id: 5, status: 'PendingDivisionHeadApproval' });

    component.rejectRequest();

    expect(requestServiceSpy.rejectRequest).toHaveBeenCalledWith(5, undefined);
  });
});
