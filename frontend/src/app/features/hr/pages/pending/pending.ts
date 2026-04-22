import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SharedNavbarComponent } from '../../../../shared/components/shared-navbar/shared-navbar';
import { SharedSidebarComponent } from '../../../../shared/components/shared-sidebar/shared-sidebar';
import { HrAssignmentService } from '../../services/hr-assignment.service';

@Component({
  selector: 'app-hr-pending',
  standalone: true,
  imports: [SharedNavbarComponent, SharedSidebarComponent],
  templateUrl: './pending.html',
  styleUrls: ['./pending.css'],
})
export class HrPendingComponent {
  private router = inject(Router);
  private hrAssignmentService = inject(HrAssignmentService);

  activeUserId = '';
  readonly pendingUsers = this.hrAssignmentService.pendingUsers;

  showDetails(userId: string): void {
    this.activeUserId = userId;
  }

  hideDetails(): void {
    this.activeUserId = '';
  }

  openAssignForm(userId: string): void {
    this.hrAssignmentService.selectPendingUser(userId);
    this.router.navigate(['/hr-assign-role']);
  }
}
