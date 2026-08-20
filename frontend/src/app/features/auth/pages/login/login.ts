import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
export class LoginComponent implements OnInit {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private cdr = inject(ChangeDetectorRef);

    loginForm = this.fb.group({
        username: ['', [Validators.required]],
        password: ['', [Validators.required]]
    });

    errorMessage: string | null = null;
    infoMessage: string | null = null;
    isLoading = false;
    showPassword = false;
    private returnUrl: string | null = null;

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            if (params['sessionExpired'] === 'true') {
                this.errorMessage = 'You have been logged out because this account was logged into on another device.';
                this.cdr.detectChanges();
            }
            if (params['returnUrl']) {
                this.returnUrl = params['returnUrl'];
                this.infoMessage = 'Please log in to continue to that page.';
                this.cdr.detectChanges();
            }
        });
    }

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
                    // If they were bounced here from a guarded page (e.g. /register-system-admin),
                    // send them back there — the route's own guards re-validate the role, so this
                    // is safe even if they don't actually have access to that page.
                    const destination = this.returnUrl || this.authService.getDashboardUrl();
                    this.router.navigateByUrl(destination);
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
