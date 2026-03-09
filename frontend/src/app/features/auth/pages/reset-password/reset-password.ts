import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink, MatIconModule],
    templateUrl: './reset-password.html',
    styleUrls: ['./reset-password.css']
})
export class ResetPasswordComponent implements OnInit {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    resetForm: FormGroup = this.fb.group({
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    token = '';
    email = '';
    isLoading = false;
    message = '';
    errorMessage = '';

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            this.token = params['token'] || '';
            this.email = params['email'] || '';

            if (!this.token || !this.email) {
                this.errorMessage = 'Invalid password reset link. Please request a new one.';
            }
        });
    }

    passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
        const password = control.get('newPassword');
        const confirm = control.get('confirmPassword');
        return password && confirm && password.value !== confirm.value ? { mismatch: true } : null;
    }

    onSubmit(): void {
        if (this.resetForm.invalid || !this.token || !this.email) return;

        this.isLoading = true;
        this.message = '';
        this.errorMessage = '';

        const data = {
            email: this.email,
            token: this.token,
            newPassword: this.resetForm.value.newPassword
        };

        this.authService.resetPassword(data).subscribe({
            next: (response) => {
                this.isLoading = false;
                this.message = response.message || 'Password has been successfully reset.';
                setTimeout(() => this.router.navigate(['/auth/login']), 3000);
            },
            error: (err) => {
                this.isLoading = false;
                this.errorMessage = err.error?.message || 'Failed to reset password. The link may have expired.';
            }
        });
    }
}
