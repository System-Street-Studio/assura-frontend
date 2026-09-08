import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MaintenanceComponent } from './maintenance.component';
import { SystemAdminService, SystemAdminUser } from '../../services/system-admin.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { ConfirmationService } from '../../../../shared/services/confirmation.service';

describe('MaintenanceComponent', () => {
  let component: MaintenanceComponent;
  let fixture: ComponentFixture<MaintenanceComponent>;
  let systemAdminServiceSpy: jasmine.SpyObj<SystemAdminService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let confirmationServiceSpy: jasmine.SpyObj<ConfirmationService>;

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
    confirmationServiceSpy = jasmine.createSpyObj('ConfirmationService', ['confirmPasswordReset']);

    await TestBed.configureTestingModule({
      imports: [MaintenanceComponent],
      providers: [
        { provide: SystemAdminService, useValue: systemAdminServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: ConfirmationService, useValue: confirmationServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MaintenanceComponent);
    component = fixture.componentInstance;
  });

  it('should show success toast when password reset succeeds and email is sent', () => {
    confirmationServiceSpy.confirmPasswordReset.and.returnValue(of(true));
    systemAdminServiceSpy.resetUserPassword.and.returnValue(of({ success: true, emailSent: true }));

    component.resetPassword(user);

    expect(systemAdminServiceSpy.resetUserPassword).toHaveBeenCalledWith(user.id);
    expect(toastServiceSpy.show).toHaveBeenCalledWith(
      jasmine.stringMatching(/Password reset for jdoe.*sent to jdoe@assura.com/),
      'success'
    );
  });

  it('should not call the backend if the confirmation dialog is dismissed', () => {
    confirmationServiceSpy.confirmPasswordReset.and.returnValue(of(false));

    component.resetPassword(user);

    expect(systemAdminServiceSpy.resetUserPassword).not.toHaveBeenCalled();
  });

  it('should show an error toast if the reset call fails', () => {
    confirmationServiceSpy.confirmPasswordReset.and.returnValue(of(true));
    systemAdminServiceSpy.resetUserPassword.and.returnValue(throwError(() => new Error('network error')));

    component.resetPassword(user);

    expect(toastServiceSpy.show).toHaveBeenCalledWith(jasmine.stringMatching(/Failed to reset password/), 'error');
  });
});
