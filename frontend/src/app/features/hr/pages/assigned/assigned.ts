import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SharedNavbarComponent } from '../../../../shared/components/shared-navbar/shared-navbar';
import { SharedSidebarComponent } from '../../../../shared/components/shared-sidebar/shared-sidebar';
import { AssignedUser, HrAssignmentService } from '../../services/hr-assignment.service';

interface AssignedRoleView extends AssignedUser {
  accessLevel: 'Full Access' | 'Edit Access' | 'Read Only';
  status: 'Active' | 'Temporary' | 'Under Review' | 'Expired';
  expiryDate: string;
}

@Component({
  selector: 'app-hr-assigned',
  standalone: true,
  imports: [RouterLink, SharedNavbarComponent, SharedSidebarComponent],
  templateUrl: './assigned.html',
  styleUrls: ['./assigned.css'],
})
export class HrAssignedComponent {
  private hrAssignmentService = inject(HrAssignmentService);

  readonly assignedUsers = this.hrAssignmentService.assignedUsers;

  searchTerm = '';
  selectedDivision = '';
  selectedRole = '';
  selectedStatus = '';
  selectedDate = '';

  get assignedRoleRows(): AssignedRoleView[] {
    return this.assignedUsers().map((user, index) => ({
      ...user,
      accessLevel: this.getAccessLevel(user, index),
      status: this.getStatus(index),
      expiryDate: this.getExpiryDate(user.joinedDate, index),
    }));
  }

  get filteredAssignedUsers(): AssignedRoleView[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.assignedRoleRows.filter((user) => {
      const matchesSearch =
        !term ||
        [user.userId, user.name, user.role, user.division, user.accessLevel, user.status]
          .join(' ')
          .toLowerCase()
          .includes(term);
      const matchesDivision = !this.selectedDivision || user.division === this.selectedDivision;
      const matchesRole = !this.selectedRole || user.role === this.selectedRole;
      const matchesStatus = !this.selectedStatus || user.status === this.selectedStatus;
      const matchesDate =
        !this.selectedDate || this.toDateInputValue(user.joinedDate) === this.selectedDate;

      return matchesSearch && matchesDivision && matchesRole && matchesStatus && matchesDate;
    });
  }

  get divisions(): string[] {
    return this.uniqueSorted(this.assignedRoleRows.map((user) => user.division));
  }

  get roles(): string[] {
    return this.uniqueSorted(this.assignedRoleRows.map((user) => user.role));
  }

  get statuses(): string[] {
    return this.uniqueSorted(this.assignedRoleRows.map((user) => user.status));
  }

  get activeCount(): number {
    return this.assignedRoleRows.filter((user) => user.status === 'Active').length;
  }

  get expiredCount(): number {
    return this.assignedRoleRows.filter((user) => user.status === 'Expired').length;
  }

  updateSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
  }

  updateDivision(event: Event): void {
    this.selectedDivision = (event.target as HTMLSelectElement).value;
  }

  updateRole(event: Event): void {
    this.selectedRole = (event.target as HTMLSelectElement).value;
  }

  updateStatus(event: Event): void {
    this.selectedStatus = (event.target as HTMLSelectElement).value;
  }

  updateDate(event: Event): void {
    this.selectedDate = (event.target as HTMLInputElement).value;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedDivision = '';
    this.selectedRole = '';
    this.selectedStatus = '';
    this.selectedDate = '';
  }

  private getAccessLevel(user: AssignedUser, index: number): AssignedRoleView['accessLevel'] {
    if (user.role.includes('Intern') || user.role.includes('Driver')) {
      return 'Read Only';
    }

    return index % 5 === 3 ? 'Edit Access' : 'Full Access';
  }

  private getStatus(index: number): AssignedRoleView['status'] {
    const statuses: Array<AssignedRoleView['status']> = [
      'Active',
      'Active',
      'Active',
      'Temporary',
      'Active',
      'Active',
      'Under Review',
      'Active',
      'Expired',
    ];

    return statuses[index % statuses.length];
  }

  private getExpiryDate(joinedDate: string, index: number): string {
    const date = new Date(joinedDate);

    if (Number.isNaN(date.getTime())) {
      return index % 4 === 0 ? '30 Apr 2026' : '09 Jan 2027';
    }

    date.setFullYear(date.getFullYear() + 1);

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
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
