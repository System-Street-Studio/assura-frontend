import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HrAssignRoleFormComponent } from './form';
import { HrAssignmentService } from '../../services/hr-assignment.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { ConfirmationService } from '../../../../shared/services/confirmation.service';

describe('HrAssignRoleFormComponent', () => {
  let component: HrAssignRoleFormComponent;
  let fixture: ComponentFixture<HrAssignRoleFormComponent>;
  let hrAssignmentServiceSpy: jasmine.SpyObj<HrAssignmentService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let confirmationServiceSpy: jasmine.SpyObj<ConfirmationService>;

  const pendingUser = {
    id: 7,
    username: 'jdoe',
    name: 'Jane Doe',
    divisionId: 1,
    assignedRole: null,
    requestedRole: 'Employee',
    assignments: [],
    jobTitle: ''
  };

  beforeEach(async () => {
    hrAssignmentServiceSpy = jasmine.createSpyObj('HrAssignmentService', [
      'getDivisions',
      'getSelectedUserIdForAssignment',
      'getUserById',
      'assignRole',
      'updateUser',
      'rejectUser',
      'markRecentlyAssignedUser'
    ]);
    hrAssignmentServiceSpy.getDivisions.and.returnValue(of([{ id: 1, name: 'Finance' }]));
    hrAssignmentServiceSpy.getSelectedUserIdForAssignment.and.returnValue(7);
    hrAssignmentServiceSpy.getUserById.and.returnValue(of(pendingUser));
    hrAssignmentServiceSpy.rejectUser.and.returnValue(of({}));

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['success', 'error', 'info', 'warning']);
    confirmationServiceSpy = jasmine.createSpyObj('ConfirmationService', ['confirm']);
    confirmationServiceSpy.confirm.and.returnValue(of(true));

    await TestBed.configureTestingModule({
      imports: [HrAssignRoleFormComponent],
      providers: [
        { provide: HrAssignmentService, useValue: hrAssignmentServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: ConfirmationService, useValue: confirmationServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HrAssignRoleFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Covers the BUGS.md finding: rejectRole() existed but had no way to reach the
  // backend without a note, since RejectHrUserCommandValidator requires Notes to be
  // non-empty — clicking Reject with a blank note previously surfaced only a generic
  // "Failed to reject user" error from the backend's 400 response.
  it('should block rejection and alert when no note is provided', () => {
    spyOn(window, 'alert');
    component.form.note = '   ';

    component.rejectRole();

    expect(window.alert).toHaveBeenCalledWith('Please add a note explaining the reason for rejection.');
    expect(confirmationServiceSpy.confirm).not.toHaveBeenCalled();
    expect(hrAssignmentServiceSpy.rejectUser).not.toHaveBeenCalled();
  });

  it('should reject the pending user and navigate to the pending list on confirm', fakeAsync(() => {
    confirmationServiceSpy.confirm.and.returnValue(of(true));
    component.form.note = 'Incomplete documentation';

    component.rejectRole();
    tick(1000);

    expect(hrAssignmentServiceSpy.rejectUser).toHaveBeenCalledWith(7, 'Incomplete documentation');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/hr/pending']);
  }));

  it('should not call the backend if rejection is not confirmed', () => {
    confirmationServiceSpy.confirm.and.returnValue(of(false));
    component.form.note = 'Incomplete documentation';

    component.rejectRole();

    expect(hrAssignmentServiceSpy.rejectUser).not.toHaveBeenCalled();
  });

  // Covers the BUGS.md finding: getUserById() had no error handler, so a failed
  // lookup (e.g. network failure) silently left the form blank with no feedback.
  it('should show a load error when fetching the user fails', () => {
    hrAssignmentServiceSpy.getUserById.and.returnValue(throwError(() => new Error('network error')));

    component.ngOnInit();

    expect(component.loadError).toBeTrue();
  });

  it('should clear the load error on a successful lookup', () => {
    expect(component.loadError).toBeFalse();
  });

  // Covers the BUGS.md finding: AssignHrRoleCommand/UpdateHrUserCommand silently
  // dropped invalid assignments with no way for the caller to know part of the
  // request was ignored. The backend now returns skippedAssignments on the response.
  it('should alert with details when some assignments were skipped by the backend', () => {
    spyOn(window, 'alert');
    hrAssignmentServiceSpy.assignRole.and.returnValue(of({
      message: 'Role assigned, but some assignments were skipped.',
      skippedAssignments: [{ divisionId: 5, role: 'BogusRole' }]
    }));
    component.form.assignments = [{ divisionId: 1, role: 'Employee' }];

    component.assignRole();

    expect(component.submitted).toBeTrue();
    expect(window.alert).toHaveBeenCalled();
    expect((window.alert as jasmine.Spy).calls.mostRecent().args[0]).toContain('Division 5');
  });

  it('should not alert when no assignments were skipped', () => {
    spyOn(window, 'alert');
    hrAssignmentServiceSpy.assignRole.and.returnValue(of({ message: 'ok', skippedAssignments: [] }));
    component.form.assignments = [{ divisionId: 1, role: 'Employee' }];

    component.assignRole();

    expect(component.submitted).toBeTrue();
    expect(window.alert).not.toHaveBeenCalled();
  });
});
