import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProfileService } from '../../core/services/profile.service';
import { ToastService } from '../../shared/services/toast.service';
import { UpdateProfileRequest } from './models/profile.models';

function optionalPasswordValidator(control: AbstractControl): ValidationErrors | null {
    const val = control.value;
    if (!val || (typeof val === 'string' && val.trim() === '')) {
        return null;
    }
    if (val.length < 8) {
        return { minlength: { requiredLength: 8, actualLength: val.length } };
    }
    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!pattern.test(val)) {
        return { pattern: true };
    }
    return null;
}

function passwordValidator(group: AbstractControl): ValidationErrors | null {
    const currentPasswordCtrl = group.get('currentPassword');
    const passwordCtrl = group.get('password');
    const confirmPasswordCtrl = group.get('confirmPassword');

    const currentPassword = (currentPasswordCtrl?.value || '').trim();
    const password = (passwordCtrl?.value || '').trim();
    const confirmPassword = (confirmPasswordCtrl?.value || '').trim();

    let hasError = false;

    if (password || confirmPassword) {
        if (!currentPassword) {
            currentPasswordCtrl?.setErrors({ ...currentPasswordCtrl.errors, required: true });
            hasError = true;
        } else if (currentPasswordCtrl?.hasError('required')) {
            const { required, ...otherErrors } = currentPasswordCtrl.errors || {};
            currentPasswordCtrl.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
        }

        if (password !== confirmPassword) {
            confirmPasswordCtrl?.setErrors({ ...confirmPasswordCtrl.errors, mismatch: true });
            hasError = true;
        } else if (confirmPasswordCtrl?.hasError('mismatch')) {
            const { mismatch, ...otherErrors } = confirmPasswordCtrl.errors || {};
            confirmPasswordCtrl.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
        }
    } else {
        // Clear errors if neither password nor confirmPassword has a value
        if (currentPasswordCtrl?.hasError('required')) {
            const { required, ...otherErrors } = currentPasswordCtrl.errors || {};
            currentPasswordCtrl.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
        }
        if (confirmPasswordCtrl?.hasError('mismatch')) {
            const { mismatch, ...otherErrors } = confirmPasswordCtrl.errors || {};
            confirmPasswordCtrl.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
        }
    }

    return hasError ? { formError: true } : null;
}

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatIconModule,
        MatButtonModule,
        MatInputModule,
        MatFormFieldModule,
        MatCardModule,
        MatDividerModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './profile.html',
    styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
    public profileService = inject(ProfileService);
    private fb = inject(FormBuilder);
    private toastService = inject(ToastService);
    private location = inject(Location);

    // Signals from service
    profile = this.profileService.profile;
    loading = this.profileService.loading;

    profileForm: FormGroup;
    isEditing = false;
    saving = false;
    showCurrentPassword = false;
    showNewPassword = false;
    showConfirmPassword = false;

    constructor() {
        this.profileForm = this.fb.group({
            username: ['', [Validators.required]],
            firstName: ['', [Validators.required]],
            lastName: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            phoneNumber: [''],
            currentPassword: [''],
            password: ['', [optionalPasswordValidator]],
            confirmPassword: ['']
        }, { validators: passwordValidator });

        // Update form when profile data changes
        effect(() => {
            const data = this.profile();
            if (data && !this.isEditing) {
                this.profileForm.patchValue({
                    username: data.username || '',
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    email: data.email || '',
                    phoneNumber: data.phoneNumber || '',
                    currentPassword: '',
                    password: '',
                    confirmPassword: ''
                });
            }
        });
    }

    ngOnInit(): void {
        this.loadProfile();
    }

    goBack(): void {
        this.location.back();
    }

    loadProfile(): void {
        this.profileService.getProfile().subscribe({
            error: (err: any) => {
                console.error('Error loading profile', err);
                this.toastService.show('Failed to load profile details', 'error');
            }
        });
    }

    toggleEdit(): void {
        this.isEditing = !this.isEditing;
        this.showCurrentPassword = false;
        this.showNewPassword = false;
        this.showConfirmPassword = false;

        const data = this.profile();
        if (data) {
            this.profileForm.patchValue({
                username: data.username || '',
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                email: data.email || '',
                phoneNumber: data.phoneNumber || '',
                currentPassword: '',
                password: '',
                confirmPassword: ''
            });
            this.profileForm.get('currentPassword')?.setErrors(null);
            this.profileForm.get('password')?.setErrors(null);
            this.profileForm.get('confirmPassword')?.setErrors(null);
            this.profileForm.markAsPristine();
            this.profileForm.markAsUntouched();
        }
    }

    saveProfile(): void {
        const currentProfile = this.profile();
        if (!currentProfile) {
            this.toastService.show('Profile data not loaded', 'error');
            return;
        }

        if (this.profileForm.invalid) {
            this.profileForm.markAllAsTouched();
            
            if (this.profileForm.get('firstName')?.invalid || this.profileForm.get('lastName')?.invalid) {
                this.toastService.show('Please provide a valid first and last name', 'error');
            } else if (this.profileForm.get('email')?.invalid) {
                this.toastService.show('Please provide a valid email address', 'error');
            } else if (this.profileForm.get('username')?.invalid) {
                this.toastService.show('Please provide a valid username', 'error');
            } else if (this.profileForm.get('currentPassword')?.hasError('required')) {
                this.toastService.show('Current password is required to set a new password', 'error');
            } else if (this.profileForm.get('confirmPassword')?.hasError('mismatch')) {
                this.toastService.show('New passwords do not match', 'error');
            } else if (this.profileForm.get('password')?.invalid) {
                this.toastService.show('Password must be 8+ chars and contain uppercase, lowercase, number & special char', 'error');
            } else {
                this.toastService.show('Please check all fields and try again', 'error');
            }
            return;
        }

        this.saving = true;
        const formVal = this.profileForm.value;
        const request: UpdateProfileRequest = {
            userId: currentProfile.id,
            username: formVal.username?.trim() || '',
            firstName: formVal.firstName?.trim() || '',
            lastName: formVal.lastName?.trim() || '',
            email: formVal.email?.trim() || '',
            phoneNumber: formVal.phoneNumber?.trim() || ''
        };

        if (formVal.password && formVal.password.trim().length > 0) {
            request.currentPassword = formVal.currentPassword;
            request.password = formVal.password;
        }

        this.profileService.updateProfile(request).subscribe({
            next: () => {
                this.isEditing = false;
                this.saving = false;
                this.showCurrentPassword = false;
                this.showNewPassword = false;
                this.showConfirmPassword = false;
                this.toastService.show('Profile updated successfully', 'success');
            },
            error: (err: any) => {
                console.error('Error updating profile', err);
                const errorMessage = typeof err.error === 'string' ? err.error : (err.error?.message || 'Failed to update profile');
                this.toastService.show(errorMessage, 'error');
                this.saving = false;
            }
        });
    }

    get initials(): string {
        const data = this.profile();
        if (!data) return 'U';
        return (data.firstName?.[0] || '') + (data.lastName?.[0] || '');
    }
}
