import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../core/auth/auth.service';

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

    registerForm = this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        telephone: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    isLoading = false;
    isSuccess = false;

    passwordMatchValidator(g: any) {
        return g.get('password').value === g.get('confirmPassword').value
            ? null : { mismatch: true };
    }

    onSubmit() {
        if (this.registerForm.invalid) return;

        this.isLoading = true;
        const { firstName, lastName, email, password } = this.registerForm.value;

        // Combining names for specific API requirement if needed, or sending separately
        const registerData = {
            name: `${firstName} ${lastName}`,
            email: email!,
            password: password!,
            confirmPassword: this.registerForm.value.confirmPassword!
        };

        // For Frontend Visualization Only (as requested):
        setTimeout(() => {
            this.isLoading = false;
            this.isSuccess = true;
            // No longer navigating immediately, showing success UI
        }, 1500);

        /* 
        this.authService.register(registerData).subscribe({
          next: () => {
            this.isLoading = false;
            this.router.navigate(['/auth/login']);
          },
          error: () => {
            this.isLoading = false;
            // Handle error
          }
        });
        */
    }
}
