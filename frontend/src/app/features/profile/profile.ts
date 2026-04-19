import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProfileService } from '../../core/services/profile.service';
import { ToastService } from '../../shared/services/toast.service';

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
            password: ['']
        });

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
                    password: ''
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
                password: ''
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
                this.toastService.show('Failed to update profile', 'error');
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
