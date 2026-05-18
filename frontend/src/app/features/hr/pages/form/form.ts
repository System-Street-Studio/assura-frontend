import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedNavbarComponent } from '../../../../shared/components/shared-navbar/shared-navbar';
import { SharedSidebarComponent } from '../../../../shared/components/shared-sidebar/shared-sidebar';
import { HrAssignmentService, PendingRoleUser } from '../../services/hr-assignment.service';

export interface AssignRoleForm {
  employeeId: string;
  employeeName: string;
  department: string;
  role: string;
  effectiveDate: string;
  accessLevel: string;
  employmentType: string;
  workLocation: string;
  supervisor: string;
  expiryDate: string;
  schedule: string;
  assignedDate: string;
  assignmentStatus: string;
  note: string;
}

@Component({
  selector: 'app-hr-assign-role-form',
  standalone: true,
  imports: [FormsModule, SharedNavbarComponent, SharedSidebarComponent],
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

  readonly accessLevels = ['Full Control', 'Edit Access', 'View Only', 'Approval Only'];
  readonly employmentTypes = ['Permanent', 'Contract', 'Probation', 'Internship'];
  readonly workLocations = [
    'Colombo - Head Office',
    'Chennai - Head Office',
    'Remote',
    'Branch Office',
  ];
  readonly supervisors = ['HR Manager', 'Finance Manager', 'IT Manager', 'Operations Manager'];
  readonly schedules = [
    'General Shift (9 AM - 6 PM)',
    'Morning Shift',
    'Evening Shift',
    'Flexible',
  ];
  readonly assignmentStatuses = ['Active', 'Pending', 'Temporary'];

  readonly permissionModules = [
    { name: 'Dashboard', description: 'View dashboard', selected: false },
    { name: 'Assets', description: 'Manage assets', selected: false },
    { name: 'Inventory', description: 'Manage inventory', selected: false },
    { name: 'Procurement', description: 'Manage procurement', selected: false },
    { name: 'Audit', description: 'Audit and compliance', selected: false },
    { name: 'HR', description: 'Human resource', selected: false },
    { name: 'Reports', description: 'View reports', selected: false },
    { name: 'Settings', description: 'System settings', selected: false },
  ];

  form: AssignRoleForm = {
    employeeId: '',
    employeeName: '',
    department: '',
    role: '',
    effectiveDate: '',
    accessLevel: '',
    employmentType: '',
    workLocation: '',
    supervisor: '',
    expiryDate: '',
    schedule: '',
    assignedDate: '',
    assignmentStatus: '',
    note: '',
  };

  selectedPendingUser?: PendingRoleUser;
  submitted = false;

  ngOnInit(): void {
    const selectedUser = this.hrAssignmentService.getSelectedPendingUser();

    if (!selectedUser) {
      return;
    }

    this.selectedPendingUser = selectedUser;
    this.form = {
      ...this.form,
      employeeId: selectedUser.userId,
      employeeName: selectedUser.name,
      department: selectedUser.department,
      role: selectedUser.requestedRole,
      effectiveDate: this.toDateInputValue(selectedUser.joinedDate),
      assignmentStatus: 'Pending',
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
      accessLevel: '',
      employmentType: '',
      workLocation: '',
      supervisor: '',
      expiryDate: '',
      schedule: '',
      assignedDate: '',
      assignmentStatus: '',
      note: '',
    };
    this.permissionModules.forEach((module) => {
      module.selected = false;
    });
    this.selectedPendingUser = undefined;
    this.submitted = false;
  }

  backToList(): void {
    this.router.navigate(['/hr-pending']);
  }

  private toDateInputValue(dateValue: string): string {
    const parsedDate = new Date(dateValue);

    if (Number.isNaN(parsedDate.getTime())) {
      return '';
    }

    return parsedDate.toISOString().slice(0, 10);
  }
}
