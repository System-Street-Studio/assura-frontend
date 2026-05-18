import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SharedNavbarComponent } from '../../../../shared/components/shared-navbar/shared-navbar';
import { SharedSidebarComponent } from '../../../../shared/components/shared-sidebar/shared-sidebar';
import { HrAssignmentService, PendingRoleUser } from '../../services/hr-assignment.service';

// PendingRoleView adds UI-only values that help HR prioritize each pending employee.
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

  // Native input/select values are mirrored here so filtering is instant and local to the page.
  searchTerm = '';
  selectedDepartment = '';
  selectedStatus = '';
  selectedRole = '';
  selectedDate = '';

  // The pending list is seed data enriched with status and priority badges for the table.
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
    // Options are generated from the visible data so new departments appear automatically.
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

    // Text search and dropdown filters are combined so HR can narrow long request lists quickly.
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
    // The dashboard card counts the same pending records shown in the table.
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
    // Clearing restores the unfiltered queue before HR starts another review pass.
    this.searchTerm = '';
    this.selectedDepartment = '';
    this.selectedStatus = '';
    this.selectedRole = '';
    this.selectedDate = '';
  }

  openAssignForm(userId: string): void {
    // Save the selected pending row, then the form page reads it back and pre-fills fields.
    this.hrAssignmentService.selectPendingUser(userId);
    this.router.navigate(['/hr-assign-role']);
  }

  private getDesignation(user: PendingRoleUser): string {
    // Designations are mapped from departments for demo data until this comes from the API.
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
    // Cycling priority values lets the table show the different badge styles.
    const priorities: ('High' | 'Medium' | 'Low')[] = [
      'High',
      'Medium',
      'Medium',
      'High',
      'Low',
    ];

    return priorities[index % priorities.length];
  }

  private uniqueSorted(values: string[]): string[] {
    // Set removes duplicates; localeCompare gives stable alphabetical dropdowns.
    return Array.from(new Set(values)).sort((first, second) => first.localeCompare(second));
  }

  private toDateInputValue(dateValue: string): string {
    // Convert display dates into the yyyy-mm-dd value used by native date inputs.
    const parsedDate = new Date(dateValue);

    if (Number.isNaN(parsedDate.getTime())) {
      return '';
    }

    return parsedDate.toISOString().slice(0, 10);
  }
}
