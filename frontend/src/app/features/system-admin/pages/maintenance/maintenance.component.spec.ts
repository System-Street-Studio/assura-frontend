import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MaintenanceComponent } from './maintenance.component';
import { SystemAdminService, SystemAdminUser } from '../../services/system-admin.service';
import { ToastService } from '../../../../shared/services/toast.service';

// Covers the BUGS.md Admin finding: "Password reset silently sets a hardcoded default
// password with no notification" — ResetUserPasswordCommand now generates a random
// temporary password and returns it in the response instead of resetting everyone to the
// literal "Password@123". These tests confirm the UI surfaces that returned password to the
// admin (who must relay it out-of-band) instead of just showing a generic success toast.
describe('MaintenanceComponent', () => {
  let component: MaintenanceComponent;
  let fixture: ComponentFixture<MaintenanceComponent>;
  let systemAdminServiceSpy: jasmine.SpyObj<SystemAdminService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  const user: SystemAdminUser = {
    id: 5,
    username: 'jdoe',
    email: 'jdoe@assura.com',
    role: 'Employee',
    isLocked: false
  } as SystemAdminUser;

  beforeEach(async () => {
    systemAdminServiceSpy = jasmine.createSpyObj('SystemAdminService', [
      'resetUserPassword',
      'getSystemErrorLogs',
      'getUsers'
    ]);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['show']);

    await TestBed.configureTestingModule({
      imports: [MaintenanceComponent],
      providers: [
        { provide: SystemAdminService, useValue: systemAdminServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MaintenanceComponent);
    component = fixture.componentInstance;
  });

  it('should show the returned temporary password in the success toast', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    systemAdminServiceSpy.resetUserPassword.and.returnValue(of({ temporaryPassword: 'Xy9!zQmR2@Kp' }));

    component.resetPassword(user);

    expect(systemAdminServiceSpy.resetUserPassword).toHaveBeenCalledWith(user.id);
    expect(toastServiceSpy.show).toHaveBeenCalledWith(
      jasmine.stringMatching(/Xy9!zQmR2@Kp/),
      'success'
    );
  });

  it('should not call the backend if the confirmation dialog is dismissed', () => {
    spyOn(window, 'confirm').and.returnValue(false);

    component.resetPassword(user);

    expect(systemAdminServiceSpy.resetUserPassword).not.toHaveBeenCalled();
  });

  it('should show an error toast if the reset call fails', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    systemAdminServiceSpy.resetUserPassword.and.returnValue(throwError(() => new Error('network error')));

    component.resetPassword(user);

    expect(toastServiceSpy.show).toHaveBeenCalledWith(jasmine.stringMatching(/Failed to reset password/), 'error');
  });
});
