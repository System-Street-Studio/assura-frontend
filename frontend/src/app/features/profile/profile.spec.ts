import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ProfileService } from '../../core/services/profile.service';
import { ToastService } from '../../shared/services/toast.service';
import { of } from 'rxjs';
import { signal } from '@angular/core';

describe('ProfileComponent - Password Validation', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let mockProfileService: any;
  let mockToastService: any;

  beforeEach(async () => {
    // Mock the services
    mockProfileService = {
      profile: signal({ id: 1, username: 'test', firstName: 'Test', lastName: 'User', email: 'test@example.com' }),
      loading: signal(false),
      getProfile: jasmine.createSpy('getProfile').and.returnValue(of({})),
      updateProfile: jasmine.createSpy('updateProfile').and.returnValue(of({}))
    };

    mockToastService = {
      show: jasmine.createSpy('show')
    };

    await TestBed.configureTestingModule({
      imports: [ ProfileComponent, ReactiveFormsModule ],
      providers: [
        FormBuilder,
        { provide: ProfileService, useValue: mockProfileService },
        { provide: ToastService, useValue: mockToastService }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should invalidate password if it does not contain a special character', () => {
    // Arrange: Set a new password without special characters
    const weakPassword = 'Password123';
    
    // Act: Assign to the form control
    component.profileForm.controls['password'].setValue(weakPassword);
    component.profileForm.controls['password'].markAsTouched();
    
    // Assert: The form control should be invalid and regex pattern should fail
    expect(component.profileForm.controls['password'].valid).toBeFalsy();
    expect(component.profileForm.controls['password'].hasError('pattern')).toBeTruthy();
  });
});
