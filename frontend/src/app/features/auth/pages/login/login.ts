
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../core/auth/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink, MatIconModule],
    templateUrl: './login.html', // Updated to match file name
    styleUrls: ['./login.css']    // Updated to match file name
})
export class LoginComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);

    loginForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required]]
    });

    errorMessage: string | null = null;
    isLoading = false;

    onSubmit(): void {
        if (this.loginForm.invalid) return;

        this.isLoading = true;
        this.errorMessage = null;

        const credentials = {
            email: this.loginForm.value.email!,
            password: this.loginForm.value.password!
        };

        this.authService.login(credentials).subscribe({
            next: () => {
                this.isLoading = false;
                this.router.navigate(['/']); // Redirect to Shell
            },
            error: (err: HttpErrorResponse) => {
                this.isLoading = false;
                this.errorMessage = err.error?.message || 'Login failed. Please check your credentials.';
            }
        });
    }
}
