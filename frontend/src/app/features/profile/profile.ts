import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProfileService } from '../../core/services/profile.service';
import { UserProfile } from './models/profile.models';
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
    private profileService = inject(ProfileService);
    private fb = inject(FormBuilder);
    private toastService = inject(ToastService);

    profile: UserProfile | null = null;
    profileForm: FormGroup;
    isEditing = false;
    loading = true;
    saving = false;

    constructor() {
        this.profileForm = this.fb.group({
            firstName: ['', [Validators.required]],
            lastName: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]]
        });
    }

    ngOnInit(): void {
        this.loadProfile();
    }

    loadProfile(): void {
        this.loading = true;
        this.profileService.getProfile().subscribe({
            next: (profile) => {
                this.profile = profile;
                this.profileForm.patchValue({
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    email: profile.email
                });
                this.loading = false;
            },
            error: (err: any) => {
                console.error('Error loading profile', err);
                this.toastService.show('Failed to load profile details', 'error');
                this.loading = false;
            }
        });
    }

    toggleEdit(): void {
        this.isEditing = !this.isEditing;
        if (!this.isEditing && this.profile) {
            this.profileForm.patchValue({
                firstName: this.profile.firstName,
                lastName: this.profile.lastName,
                email: this.profile.email
            });
        }
    }

    saveProfile(): void {
        if (this.profileForm.invalid || !this.profile) return;

        this.saving = true;
        const request = {
            userId: this.profile.id,
            ...this.profileForm.value
        };

        this.profileService.updateProfile(request).subscribe({
            next: () => {
                if (this.profile) {
                    this.profile.firstName = request.firstName;
                    this.profile.lastName = request.lastName;
                    this.profile.email = request.email;
                }
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
        if (!this.profile) return 'U';
        return (this.profile.firstName[0] || '') + (this.profile.lastName[0] || '');
    }
}
