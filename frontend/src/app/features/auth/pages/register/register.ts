import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../core/auth/auth.service';
import { RegisterRequest } from '../../models/auth.models';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink, MatIconModule],
    templateUrl: './register.html',
    styleUrls: ['./register.css']
})
export class RegisterComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);
    private toastService = inject(ToastService);

    registerForm = this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        username: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    isLoading = false;
    isSuccess = false;
    errorMessage = '';

    passwordMatchValidator(g: any) {
        return g.get('password').value === g.get('confirmPassword').value
            ? null : { mismatch: true };
    }

    onSubmit() {
        if (this.registerForm.invalid) return;

        this.isLoading = true;
        this.errorMessage = '';
        const { firstName, lastName, username, email, password } = this.registerForm.value;

        const registerData: RegisterRequest = {
            firstName: firstName!,
            lastName: lastName!,
            username: username!,
            email: email!,
            password: password!
        };

        this.authService.register(registerData).subscribe({
            next: () => {
                this.isLoading = false;
                this.toastService.success('Account Created Successfully! Please wait for an administrator to assign your role.');
                setTimeout(() => {
                    this.router.navigate(['/auth/login']);
                }, 3000);
            },
            error: (err) => {
                this.isLoading = false;
                this.errorMessage = err.error?.message || 'Registration failed. Username or email might already exist.';
                this.toastService.error(this.errorMessage);
                console.error('Registration failed', err);
            }
        });
    }
}
