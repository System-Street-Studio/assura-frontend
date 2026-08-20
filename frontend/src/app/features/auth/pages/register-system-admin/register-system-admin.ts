import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CreatePrivilegedUserFormComponent, CreatePrivilegedUserFormValue } from '../../../../shared/components/create-privileged-user-form/create-privileged-user-form';
import { SystemAdminService } from '../../../system-admin/services/system-admin.service';
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
    private systemAdminService = inject(SystemAdminService);
    private toastService = inject(ToastService);
    private router = inject(Router);

    loading = signal(false);
    errorMessage = signal<string | null>(null);

    onSubmit(value: CreatePrivilegedUserFormValue): void {
        this.loading.set(true);
        this.errorMessage.set(null);

        this.systemAdminService.createSystemAdminUser(value).subscribe({
            next: () => {
                this.loading.set(false);
                this.toastService.success('System Administrator account created successfully.');
                this.router.navigate(['/system-admin/security']);
            },
            error: (err) => {
                this.loading.set(false);
                this.errorMessage.set(err.error || 'Failed to create System Administrator account. Username or email might already exist.');
            },
        });
    }
}
