import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HrAssignmentService, Division } from '../../services/hr-assignment.service';
import { CommonModule } from '@angular/common';

export interface AssignRoleForm {
  dbId: number;
  employeeId: string;
  employeeName: string;
  divisionId: number | null;
  role: string;
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
  readonly roles = [
    'Admin',
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
    divisionId: null,
    role: '',
    effectiveDate: '',
    note: '',
    jobTitle: ''
  };

  isUpdate = false;
  submitted = false;

  ngOnInit(): void {
    // Load divisions
    this.hrAssignmentService.getDivisions().subscribe(divisions => {
      this.divisions.set(divisions);
    });

    const selectedUserId = this.hrAssignmentService.getSelectedPendingUserId();

    if (!selectedUserId) {
      this.router.navigate(['/hr/pending']);
      return;
    }

    this.hrAssignmentService.getUserById(selectedUserId).subscribe(user => {
      if (!user) {
        this.router.navigate(['/hr/pending']);
        return;
      }

      this.isUpdate = !!user.role; // If they already have a role, it's an update

      this.form = {
        dbId: user.id,
        employeeId: user.userId,
        employeeName: user.name,
        divisionId: user.divisionId || null,
        role: user.role || user.requestedRole || '',
        effectiveDate: this.getTodayDate(),
        note: '',
        jobTitle: user.jobTitle || ''
      };
    });
  }

  assignRole(): void {
    if (this.form.dbId === 0) return;

    const payload = {
      role: this.form.role,
      divisionId: this.form.divisionId || undefined,
      jobTitle: this.form.jobTitle,
      notes: this.form.note,
    };

    const request = this.isUpdate 
      ? this.hrAssignmentService.updateUser(this.form.dbId, payload)
      : this.hrAssignmentService.assignRole(this.form.dbId, payload);

    request.subscribe({
      next: () => {
        this.submitted = true;
      },
      error: (err) => {
        console.error('Error processing role:', err);
        alert('Failed to process request. Please try again.');
      }
    });
  }

  rejectRole(): void {
    if (this.form.dbId === 0) return;

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

