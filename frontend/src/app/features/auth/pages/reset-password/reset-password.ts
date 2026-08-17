import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
    selector: 'app-reset-password',
    imports: [CommonModule, ReactiveFormsModule, RouterLink, MatIconModule],
    templateUrl: './reset-password.html',
    styleUrls: ['./reset-password.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetPasswordComponent implements OnInit {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    resetForm: FormGroup = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        token: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    isLoading = signal(false);
    message = signal('');
    errorMessage = signal('');
    showNewPassword = signal(false);
    showConfirmPassword = signal(false);

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            const token = params['token'] || '';
            const email = params['email'] || '';

            // Patch whichever of the two survived - an email client stripping or
            // truncating the link's query string shouldn't leave the form fully
            // blank with no indication that autofill was attempted.
            if (token) {
                this.resetForm.patchValue({ token });
            }
            if (email) {
                this.resetForm.patchValue({ email });
            }
        });
    }

    passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
        const password = control.get('newPassword');
        const confirm = control.get('confirmPassword');
        return password && confirm && password.value !== confirm.value ? { mismatch: true } : null;
    }

    onSubmit(): void {
        if (this.resetForm.invalid) return;

        this.isLoading.set(true);
        this.message.set('');
        this.errorMessage.set('');

        const data = {
            email: this.resetForm.value.email,
            token: this.resetForm.value.token,
            newPassword: this.resetForm.value.newPassword
        };

        this.authService.resetPassword(data).subscribe({
            next: (response) => {
                this.isLoading.set(false);
                this.message.set(response.message || 'Password has been successfully reset.');
                setTimeout(() => this.router.navigate(['/auth/login']), 3000);
            },
            error: (err) => {
                this.isLoading.set(false);
                this.errorMessage.set(err.error?.message || 'Failed to reset password. The link may have expired.');
            }
        });
    }
}
