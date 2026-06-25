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

function passwordValidator(group: AbstractControl): ValidationErrors | null {
    const currentPasswordCtrl = group.get('currentPassword');
    const passwordCtrl = group.get('password');
    const confirmPasswordCtrl = group.get('confirmPassword');

    const currentPassword = currentPasswordCtrl?.value;
    const password = passwordCtrl?.value;
    const confirmPassword = confirmPasswordCtrl?.value;

    let hasError = false;

    if (password || confirmPassword) {
        if (!currentPassword) {
            currentPasswordCtrl?.setErrors({ ...currentPasswordCtrl.errors, required: true });
            hasError = true;
        } else {
            if (currentPasswordCtrl?.hasError('required')) {
                const { required, ...otherErrors } = currentPasswordCtrl.errors || {};
                currentPasswordCtrl.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
            }
        }

        if (password !== confirmPassword) {
            confirmPasswordCtrl?.setErrors({ ...confirmPasswordCtrl.errors, mismatch: true });
            hasError = true;
        } else {
            if (confirmPasswordCtrl?.hasError('mismatch')) {
                const { mismatch, ...otherErrors } = confirmPasswordCtrl.errors || {};
                confirmPasswordCtrl.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
            }
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

    constructor() {
        this.profileForm = this.fb.group({
            username: ['', [Validators.required]],
            firstName: ['', [Validators.required]],
            lastName: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            phoneNumber: [''],
            currentPassword: [''],
            password: [''],
            confirmPassword: ['']
        }, { validators: passwordValidator });

        // Update form when profile data changes
        effect(() => {
            const data = this.profile();
            if (data && !this.isEditing) {
                this.profileForm.patchValue({
                    username: data.username,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    phoneNumber: data.phoneNumber,
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
        // Just call getProfile, the service handles caching and loading state signal
        this.profileService.getProfile().subscribe({
            error: (err: any) => {
                console.error('Error loading profile', err);
                this.toastService.show('Failed to load profile details', 'error');
            }
        });
    }

    toggleEdit(): void {
        this.isEditing = !this.isEditing;
        if (!this.isEditing && this.profile()) {
            const data = this.profile()!;
            this.profileForm.patchValue({
                username: data.username,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phoneNumber: data.phoneNumber,
                currentPassword: '',
                password: '',
                confirmPassword: ''
            });
        }
    }

    saveProfile(): void {
        const currentProfile = this.profile();
        if (this.profileForm.invalid || !currentProfile) return;

        this.saving = true;
        const request = {
            userId: currentProfile.id,
            ...this.profileForm.value
        };

        this.profileService.updateProfile(request).subscribe({
            next: () => {
                this.isEditing = false;
                this.saving = false;
                this.toastService.show('Profile updated successfully', 'success');
            },
            error: (err: any) => {
                console.error('Error updating profile', err);
                const errorMessage = typeof err.error === 'string' ? err.error : 'Failed to update profile';
                this.toastService.show(errorMessage, 'error');
                this.saving = false;
            }
        });
    }

    get initials(): string {
        const data = this.profile();
        if (!data) return 'U';
        return (data.firstName[0] || '') + (data.lastName[0] || '');
    }
}
