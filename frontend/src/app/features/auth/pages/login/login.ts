import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../core/auth/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink, MatIconModule],
    templateUrl: './login.html',
    styleUrls: ['./login.css']
})
export class LoginComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);
    private cdr = inject(ChangeDetectorRef);

    loginForm = this.fb.group({
        username: ['', [Validators.required]],
        password: ['', [Validators.required]]
    });

    errorMessage: string | null = null;
    isLoading = false;

    onSubmit(): void {
        if (this.loginForm.invalid) return;

        this.isLoading = true;
        this.errorMessage = null;
        this.cdr.detectChanges(); // Force update to show loading overlay

        const credentials = {
            username: this.loginForm.value.username!,
            password: this.loginForm.value.password!
        };

        this.authService.login(credentials)
            .pipe(
                finalize(() => {
                    this.isLoading = false;
                    this.cdr.detectChanges(); // Force update to hide loading overlay
                })
            )
            .subscribe({
                next: (response) => {
                    const dashboardUrl = this.authService.getDashboardUrl();
                    this.router.navigate([dashboardUrl]);
                },
                error: (err: HttpErrorResponse) => {
                    const backendMessage = err.error?.message || err.error?.Message;

                    if (backendMessage) {
                        this.errorMessage = backendMessage;
                    } else if (typeof err.error === 'string' && err.error.length < 100) {
                        this.errorMessage = err.error;
                    } else {
                        this.errorMessage = 'Login failed. Please check your credentials and try again.';
                    }
                    this.cdr.detectChanges(); // Ensure error message is rendered
                }
            });
    }
}
