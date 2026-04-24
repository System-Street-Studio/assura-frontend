import { Component, inject } from '@angular/core';
import { SharedNavbarComponent } from '../../../../shared/components/shared-navbar/shared-navbar';
import { SharedSidebarComponent } from '../../../../shared/components/shared-sidebar/shared-sidebar';
import { HrAssignmentService } from '../../services/hr-assignment.service';

@Component({
  selector: 'app-hr-assigned',
  standalone: true,
  imports: [SharedNavbarComponent, SharedSidebarComponent],
  templateUrl: './assigned.html',
  styleUrls: ['./assigned.css'],
})
export class HrAssignedComponent {
  private hrAssignmentService = inject(HrAssignmentService);

  readonly assignedUsers = this.hrAssignmentService.assignedUsers;
}
