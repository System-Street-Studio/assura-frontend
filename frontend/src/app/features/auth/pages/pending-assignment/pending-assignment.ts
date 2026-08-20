import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
    selector: 'app-pending-assignment',
    standalone: true,
    imports: [MatIconModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './pending-assignment.html',
    styleUrls: ['../register/register.css'],
})
export class PendingAssignmentComponent {
    private authService = inject(AuthService);
    private router = inject(Router);

    firstName = this.authService.getFirstName();

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
    }
}
