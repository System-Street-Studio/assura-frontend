import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
    selector: 'app-forgot-password',
    imports: [CommonModule, ReactiveFormsModule, RouterLink, MatIconModule],
    templateUrl: './forgot-password.html',
    styleUrls: ['./forgot-password.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotPasswordComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);

    forgotForm: FormGroup = this.fb.group({
        email: ['', [Validators.required, Validators.email]]
    });

    isLoading = signal(false);
    message = signal('');
    errorMessage = signal('');
    resendCooldownSeconds = signal(0);
    private cooldownIntervalId?: ReturnType<typeof setInterval>;
    private static readonly RESEND_COOLDOWN_SECONDS = 30;

    onSubmit(): void {
        if (this.forgotForm.invalid || this.resendCooldownSeconds() > 0) return;

        this.isLoading.set(true);
        this.message.set('');
        this.errorMessage.set('');

        this.authService.forgotPassword(this.forgotForm.value).subscribe({
            next: (response) => {
                this.isLoading.set(false);
                this.message.set(response.message || 'If an account exists, a reset link has been sent.');
                this.startResendCooldown();
            },
            error: (err) => {
                this.isLoading.set(false);
                this.errorMessage.set(err.error?.message || 'Something went wrong. Please try again.');
            }
        });
    }

    private startResendCooldown(): void {
        this.resendCooldownSeconds.set(ForgotPasswordComponent.RESEND_COOLDOWN_SECONDS);
        clearInterval(this.cooldownIntervalId);
        this.cooldownIntervalId = setInterval(() => {
            this.resendCooldownSeconds.update(seconds => seconds - 1);
            if (this.resendCooldownSeconds() <= 0) {
                clearInterval(this.cooldownIntervalId);
            }
        }, 1000);
    }
}
