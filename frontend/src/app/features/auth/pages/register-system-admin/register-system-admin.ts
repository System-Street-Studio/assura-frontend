import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CreatePrivilegedUserFormComponent, CreatePrivilegedUserFormValue } from '../../../../shared/components/create-privileged-user-form/create-privileged-user-form';
import { AuthService } from '../../../../core/auth/auth.service';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
    selector: 'app-register-system-admin',
    standalone: true,
    imports: [RouterLink, CreatePrivilegedUserFormComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './register-system-admin.html',
    styleUrls: ['../register/register.css'],
})
export class RegisterSystemAdminComponent {
    private authService = inject(AuthService);
    private toastService = inject(ToastService);
    private router = inject(Router);

    loading = signal(false);
    errorMessage = signal<string | null>(null);

    onSubmit(value: CreatePrivilegedUserFormValue): void {
        this.loading.set(true);
        this.errorMessage.set(null);

        this.authService.registerSystemAdmin(value).subscribe({
            next: () => {
                this.loading.set(false);
                this.toastService.success('System Administrator account created successfully. Please log in.');
                this.router.navigate(['/auth/login']);
            },
            error: (err) => {
                this.loading.set(false);
                this.errorMessage.set(err.error?.Message || err.error?.message || 'Failed to create System Administrator account. Username or email might already exist.');
            },
        });
    }
}
