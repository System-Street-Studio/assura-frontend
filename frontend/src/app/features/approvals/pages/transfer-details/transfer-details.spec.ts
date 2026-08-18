import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { TransferDetailsComponent } from './transfer-details';
import { RequestService } from '../../services/requests.service';
import { AuthService } from '../../../../core/auth/auth.service';

describe('TransferDetailsComponent', () => {
  let component: TransferDetailsComponent;
  let fixture: ComponentFixture<TransferDetailsComponent>;
  let requestServiceSpy: jasmine.SpyObj<RequestService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  function setup(queryParams: Record<string, string> = {}) {
    requestServiceSpy = jasmine.createSpyObj('RequestService', ['approveRequest', 'rejectRequest', 'getRequestById']);
    requestServiceSpy.selectedRequest = null;
    requestServiceSpy.getRequestById.and.returnValue(of({} as any));

    authServiceSpy = jasmine.createSpyObj('AuthService', ['hasRole']);
    authServiceSpy.hasRole.and.returnValue(true);

    TestBed.configureTestingModule({
      imports: [TransferDetailsComponent],
      providers: [
        provideRouter([]),
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

    fixture = TestBed.createComponent(TransferDetailsComponent);
    component = fixture.componentInstance;
  }

  it('should create', () => {
    setup();
    expect(component).toBeTruthy();
  });

  it('approveRequest updates local status to Approved, matching the real backend status', () => {
    setup();
    requestServiceSpy.approveRequest.and.returnValue(of(true));
    component.request.set({ id: 5, status: 'PendingDivisionHeadApproval' });

    component.approveRequest();

    expect(requestServiceSpy.approveRequest).toHaveBeenCalledWith(5);
    expect(component.request().status).toBe('Approved');
    expect(component.showPopup()).toBeTrue();
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

  it('the dead storekeeper-reservation methods no longer exist on the component', () => {
    setup();
    expect((component as any).canStorekeeperProcess).toBeUndefined();
    expect((component as any).canStorekeeperConfirm).toBeUndefined();
    expect((component as any).processInStock).toBeUndefined();
    expect((component as any).processOutOfStock).toBeUndefined();
    expect((component as any).confirmTemporaryAssignment).toBeUndefined();
  });

  it('rejectRequest prompts for a reason and forwards it to the backend', () => {
    setup();
    spyOn(window, 'prompt').and.returnValue('Not needed anymore');
    requestServiceSpy.rejectRequest.and.returnValue(of(true));
    component.request.set({ id: 5, status: 'PendingDivisionHeadApproval' });

    component.rejectRequest();

    expect(window.prompt).toHaveBeenCalledWith('Reason for rejection (optional):');
    expect(requestServiceSpy.rejectRequest).toHaveBeenCalledWith(5, 'Not needed anymore');
    expect(component.request().status).toBe('Rejected');
  });
});
