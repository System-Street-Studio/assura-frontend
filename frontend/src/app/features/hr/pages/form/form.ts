import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HrAssignmentService, Division } from '../../services/hr-assignment.service';
import { CommonModule } from '@angular/common';

interface RoleAssignmentResponse {
  message?: string;
  skippedAssignments?: { divisionId: number; role: string }[];
}

export interface AssignRoleForm {
  dbId: number;
  employeeId: string;
  employeeName: string;
  assignments: { divisionId: number | null, role: string }[];
  effectiveDate: string;
  note: string;
  jobTitle: string;
}

@Component({
  selector: 'app-hr-assign-role-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './form.html',
  styleUrls: ['./form.css'],
})
export class HrAssignRoleFormComponent implements OnInit {
  private router = inject(Router);
  private hrAssignmentService = inject(HrAssignmentService);

  divisions = signal<Division[]>([]);
  // Admin and SystemAdmin are deliberately excluded — HR may only assign operational
  // roles, matching the backend allow-list in Assura.Domain.Constants.Roles.HrAssignableRoles.
  readonly roles = [
    'Procurement',
    'Maintenance',
    'Superintendent',
    'Storekeeper',
    'HR',
    'Employee',
    'DivisionHead',
    'Accountant',
    'Auditor'
  ];

  form: AssignRoleForm = {
    dbId: 0,
    employeeId: '',
    employeeName: '',
    assignments: [{ divisionId: null, role: '' }],
    effectiveDate: '',
    note: '',
    jobTitle: ''
  };

  isUpdate = false;
  submitted = false;
  loadError = false;

  ngOnInit(): void {
    // Load divisions
    this.hrAssignmentService.getDivisions().subscribe(divisions => {
      this.divisions.set(divisions);
    });

    const selectedUserId = this.hrAssignmentService.getSelectedUserIdForAssignment();

    if (!selectedUserId) {
      this.router.navigate(['/hr/pending']);
      return;
    }

    this.loadError = false;
    this.hrAssignmentService.getUserById(selectedUserId).subscribe({
      next: (user) => {
        if (!user) {
          this.router.navigate(['/hr/pending']);
          return;
        }

        this.isUpdate = !!(user.assignedRole || (user.assignments && user.assignments.length > 0));

        this.form = {
          dbId: user.id,
          employeeId: user.username,
          employeeName: user.name,
          assignments: user.assignments && user.assignments.length > 0
            ? user.assignments.map((a: any) => ({ divisionId: a.divisionId, role: a.role }))
            : [{ divisionId: user.divisionId || null, role: user.assignedRole || user.requestedRole || '' }],
          effectiveDate: this.getTodayDate(),
          note: '',
          jobTitle: user.jobTitle || ''
        };
      },
      error: (err) => {
        console.error('Error loading user for role assignment:', err);
        this.loadError = true;
      }
    });
  }

  addAssignment(): void {
    this.form.assignments.push({ divisionId: null, role: '' });
  }

  removeAssignment(index: number): void {
    if (this.form.assignments.length > 1) {
      this.form.assignments.splice(index, 1);
    }
  }

  assignRole(): void {
    if (this.form.dbId === 0) return;

    // Filter out incomplete assignments
    const validAssignments = this.form.assignments
      .filter(a => a.divisionId && a.role)
      .map(a => ({ divisionId: a.divisionId as number, role: a.role }));

    if (validAssignments.length === 0) {
      alert('Please add at least one valid division and role assignment.');
      return;
    }

    const payload = {
      assignments: validAssignments,
      jobTitle: this.form.jobTitle,
      notes: this.form.note,
    };

    const request = this.isUpdate 
      ? this.hrAssignmentService.updateUser(this.form.dbId, payload)
      : this.hrAssignmentService.assignRole(this.form.dbId, payload);

    request.subscribe({
      next: (response: RoleAssignmentResponse) => {
        this.submitted = true;
        const skipped = response?.skippedAssignments;
        if (skipped && skipped.length > 0) {
          const details = skipped.map(a => `- Division ${a.divisionId}, Role "${a.role}"`).join('\n');
          alert(`Some assignments were skipped because their role or division was invalid:\n${details}`);
        }
      },
      error: (err) => {
        console.error('Error processing role:', err);
        alert('Failed to process request. Please try again.');
      }
    });
  }

  rejectRole(): void {
    if (this.form.dbId === 0) return;

    if (!this.form.note.trim()) {
      alert('Please add a note explaining the reason for rejection.');
      return;
    }

    if (!confirm('Are you sure you want to reject this role request?')) return;

    this.hrAssignmentService.rejectUser(this.form.dbId, this.form.note).subscribe({
      next: () => {
        alert('User rejected successfully.');
        this.router.navigate(['/hr/pending']);
      },
      error: (err) => {
        console.error('Error rejecting user:', err);
        alert('Failed to reject user.');
      }
    });
  }

  closePopup(): void {
    this.submitted = false;
    this.router.navigate(['/hr/assigned']);
  }

  resetForm(): void {
    this.ngOnInit();
    this.submitted = false;
  }

  private getTodayDate(): string {
    return new Date().toISOString().slice(0, 10);
  }
}

