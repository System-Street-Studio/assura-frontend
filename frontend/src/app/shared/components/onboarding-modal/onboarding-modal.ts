import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-onboarding-modal',
    standalone: true,
    imports: [ReactiveFormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './onboarding-modal.html',
    styleUrls: ['./onboarding-modal.css'],
})
export class OnboardingModalComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private toastService = inject(ToastService);

    loading = signal(false);
    errorMessage = signal<string | null>(null);
    showPassword = false;
    showConfirmPassword = false;

    form = this.fb.group({
        newUsername: ['', Validators.required],
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phoneNumber: [''],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
    }, { validators: this.passwordMatchValidator });

    private passwordMatchValidator(g: any) {
        return g.get('newPassword').value === g.get('confirmPassword').value
            ? null : { mismatch: true };
    }

    onSubmit(): void {
        if (this.form.invalid) return;
        this.loading.set(true);
        this.errorMessage.set(null);

        const { newUsername, firstName, lastName, email, phoneNumber, newPassword } = this.form.value;
        this.authService.completeOnboarding({
            newUsername: newUsername!,
            firstName: firstName!,
            lastName: lastName!,
            email: email!,
            phoneNumber: phoneNumber || undefined,
            newPassword: newPassword!,
        }).subscribe({
            next: () => {
                this.loading.set(false);
                this.toastService.success('Your account is all set up.');
                // Reload so every guard/component re-reads the fresh token (role, division,
                // requiresOnboarding all changed) instead of relying on stale in-memory state.
                window.location.reload();
            },
            error: (err) => {
                this.loading.set(false);
                this.errorMessage.set(err.error?.Message || err.error?.message || 'Failed to complete setup. Please try again.');
            },
        });
    }
}
