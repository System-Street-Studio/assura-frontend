import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink, MatIconModule],
    templateUrl: './forgot-password.html',
    styleUrls: ['./forgot-password.css']
})
export class ForgotPasswordComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);

    forgotForm: FormGroup = this.fb.group({
        email: ['', [Validators.required, Validators.email]]
    });

    isLoading = false;
    message = '';
    errorMessage = '';

    onSubmit(): void {
        if (this.forgotForm.invalid) return;

        this.isLoading = true;
        this.message = '';
        this.errorMessage = '';

        this.authService.forgotPassword(this.forgotForm.value).subscribe({
            next: (response) => {
                this.isLoading = false;
                this.message = response.message || 'If an account exists, a reset link has been sent.';
                // Optional: show token in console for development if needed, but the backend already returns it in my implementation
                if (response.token) {
                    console.log('Reset Token (Dev only):', response.token);
                }
            },
            error: (err) => {
                this.isLoading = false;
                this.errorMessage = err.error?.message || 'Something went wrong. Please try again.';
            }
        });
    }
}
