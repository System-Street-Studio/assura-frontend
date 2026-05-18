import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SharedNavbarComponent } from '../../../../shared/components/shared-navbar/shared-navbar';
import { SharedSidebarComponent } from '../../../../shared/components/shared-sidebar/shared-sidebar';
import { HrAssignmentService, PendingRoleUser } from '../../services/hr-assignment.service';

interface PendingRoleView extends PendingRoleUser {
  designation: string;
  suggestedRole: string;
  priority: 'High' | 'Medium' | 'Low';
  statusLabel: 'Pending' | 'Review';
}

@Component({
  selector: 'app-hr-pending',
  standalone: true,
  imports: [RouterLink, SharedNavbarComponent, SharedSidebarComponent],
  templateUrl: './pending.html',
  styleUrls: ['./pending.css'],
})
export class HrPendingComponent {
  private router = inject(Router);
  private hrAssignmentService = inject(HrAssignmentService);

  searchTerm = '';
  selectedDepartment = '';
  selectedStatus = '';
  selectedRole = '';
  selectedDate = '';

  readonly pendingUsers: PendingRoleView[] = this.hrAssignmentService.pendingUsers.map(
    (user, index) => ({
      ...user,
      designation: this.getDesignation(user),
      suggestedRole: user.requestedRole,
      priority: this.getPriority(index),
      statusLabel: index === 2 || index === 5 || index === 8 ? 'Review' : 'Pending',
    }),
  );

  get departments(): string[] {
    return this.uniqueSorted(this.pendingUsers.map((user) => user.department));
  }

  get statuses(): string[] {
    return this.uniqueSorted(this.pendingUsers.map((user) => user.statusLabel));
  }

  get requestedRoles(): string[] {
    return this.uniqueSorted(this.pendingUsers.map((user) => user.requestedRole));
  }

  get filteredUsers(): PendingRoleView[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.pendingUsers.filter((user) => {
      const matchesSearch =
        !term ||
        [
          user.userId,
          user.name,
          user.department,
          user.designation,
          user.requestedRole,
          user.suggestedRole,
          user.statusLabel,
          user.priority,
        ]
          .join(' ')
          .toLowerCase()
          .includes(term);

      const matchesDepartment =
        !this.selectedDepartment || user.department === this.selectedDepartment;
      const matchesStatus = !this.selectedStatus || user.statusLabel === this.selectedStatus;
      const matchesRole = !this.selectedRole || user.requestedRole === this.selectedRole;
      const matchesDate =
        !this.selectedDate || this.toDateInputValue(user.joinedDate) === this.selectedDate;

      return matchesSearch && matchesDepartment && matchesStatus && matchesRole && matchesDate;
    });
  }

  get pendingCount(): number {
    return this.pendingUsers.filter((user) => user.statusLabel === 'Pending').length;
  }

  updateSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
  }

  updateDepartment(event: Event): void {
    this.selectedDepartment = (event.target as HTMLSelectElement).value;
  }

  updateStatus(event: Event): void {
    this.selectedStatus = (event.target as HTMLSelectElement).value;
  }

  updateRole(event: Event): void {
    this.selectedRole = (event.target as HTMLSelectElement).value;
  }

  updateDate(event: Event): void {
    this.selectedDate = (event.target as HTMLInputElement).value;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedDepartment = '';
    this.selectedStatus = '';
    this.selectedRole = '';
    this.selectedDate = '';
  }

  openAssignForm(userId: string): void {
    this.hrAssignmentService.selectPendingUser(userId);
    this.router.navigate(['/hr-assign-role']);
  }

  private getDesignation(user: PendingRoleUser): string {
    const designations: Record<string, string> = {
      Finance: 'Account Executive',
      'Human Resource': 'HR Executive',
      'Information Technology': 'System Analyst',
      Procurement: 'Procurement Assistant',
      Stores: 'Store Assistant',
      Operations: 'Operations Officer',
    };

    return designations[user.department] || 'Employee';
  }

  private getPriority(index: number): 'High' | 'Medium' | 'Low' {
    const priorities: Array<'High' | 'Medium' | 'Low'> = [
      'High',
      'Medium',
      'Medium',
      'High',
      'Low',
    ];

    return priorities[index % priorities.length];
  }

  private uniqueSorted(values: string[]): string[] {
    return Array.from(new Set(values)).sort((first, second) => first.localeCompare(second));
  }

  private toDateInputValue(dateValue: string): string {
    const parsedDate = new Date(dateValue);

    if (Number.isNaN(parsedDate.getTime())) {
      return '';
    }

    return parsedDate.toISOString().slice(0, 10);
  }
}
