import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HrAssignmentService } from '../../services/hr-assignment.service';

export interface AssignRoleForm {
  employeeId: string;
  employeeName: string;
  department: string;
  role: string;
  effectiveDate: string;
  note: string;
}

@Component({
  selector: 'app-hr-assign-role-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './form.html',
  styleUrls: ['./form.css'],
})
export class HrAssignRoleFormComponent implements OnInit {
  private router = inject(Router);
  private hrAssignmentService = inject(HrAssignmentService);

  readonly departments = [
    'Human Resource',
    'Finance',
    'Information Technology',
    'Procurement',
    'Stores',
    'Operations',
    'Communication Engineering',
  ];

  readonly roles = [
    'HR Manager',
    'HR Assistant',
    'Accountant',
    'System Analyst',
    'Network Technician',
    'Procurement Officer',
    'Storekeeper',
    'Intern',
  ];

  form: AssignRoleForm = {
    employeeId: '',
    employeeName: '',
    department: '',
    role: '',
    effectiveDate: '',
    note: '',
  };

  submitted = false;

  ngOnInit(): void {
    const selectedUser = this.hrAssignmentService.getSelectedPendingUser();

    if (!selectedUser) {
      return;
    }

    this.form = {
      employeeId: selectedUser.userId,
      employeeName: selectedUser.name,
      department: selectedUser.department,
      role: selectedUser.requestedRole,
      effectiveDate: this.getTodayDate(),
      note: '',
    };
  }

  assignRole(): void {
    this.hrAssignmentService.assignRole({
      employeeId: this.form.employeeId,
      employeeName: this.form.employeeName,
      department: this.form.department,
      role: this.form.role,
      effectiveDate: this.form.effectiveDate,
    });
    this.submitted = true;
  }

  closePopup(): void {
    this.submitted = false;
    this.router.navigate(['/hr-assigned']);
  }

  resetForm(): void {
    this.form = {
      employeeId: '',
      employeeName: '',
      department: '',
      role: '',
      effectiveDate: '',
      note: '',
    };
    this.submitted = false;
  }

  private getTodayDate(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
