import { Component } from '@angular/core';
import { SharedNavbarComponent } from '../../../../shared/components/shared-navbar/shared-navbar';
import { SharedSidebarComponent } from '../../../../shared/components/shared-sidebar/shared-sidebar';

export type AuditResult = 'Success' | 'Rejected' | 'Pending';
export type AuditFilterMode = 'department' | 'role';

export interface AuditLogEntry {
  date: string;
  time: string;
  officer: string;
  action: string;
  employee: string;
  department: string;
  role: string;
  device: string;
  notes: string;
  result: AuditResult;
}

@Component({
  selector: 'app-hr-myasset',
  standalone: true,
  imports: [SharedNavbarComponent, SharedSidebarComponent],
  templateUrl: './myasset.html',
  styleUrls: ['./myasset.css'],
})
export class HrMyAssetComponent {
  searchTerm = '';
  filterMode: AuditFilterMode = 'department';
  selectedFilter = '';

  readonly auditLogs: AuditLogEntry[] = [
    {
      date: '2026-02-13',
      time: '10:15 AM',
      officer: 'HR Manager',
      action: 'Approved Registration',
      employee: 'Amanda Lee',
      department: 'HR',
      role: 'HR Assistant',
      device: '192.168.1.6 Chrome',
      notes: 'All documents verified',
      result: 'Success',
    },
    {
      date: '2026-02-03',
      time: '11:30 AM',
      officer: 'HR Manager',
      action: 'Assigned Role',
      employee: 'John Pereira',
      department: 'Finance',
      role: 'Accountant',
      device: '192.168.1.5 Chrome',
      notes: 'Role assigned after approval',
      result: 'Success',
    },
    {
      date: '2026-02-25',
      time: '09:45 AM',
      officer: 'HR Manager',
      action: 'Rejected Registration',
      employee: 'Unknown User',
      department: 'IT',
      role: '-',
      device: '192.168.1.8 Chrome',
      notes: 'Incomplete documentation',
      result: 'Rejected',
    },
    {
      date: '2026-02-20',
      time: 'PM',
      officer: 'Officer Jane',
      action: 'Updated Employee Details',
      employee: 'David Fernando',
      department: 'IT',
      role: 'Network Technician',
      device: '192.168.1.20 Firefox',
      notes: 'Updated phone number and address',
      result: 'Success',
    },
    {
      date: '2026-02-05',
      time: '09:00 AM',
      officer: 'HR Manager',
      action: 'Pending Approval',
      employee: 'Lisa Perera',
      department: 'Operations',
      role: 'Intern',
      device: '192.168.1.5 Chrome',
      notes: 'Awaiting verification',
      result: 'Pending',
    },
  ];

  get filteredAuditLogs(): AuditLogEntry[] {
    const term = this.searchTerm.trim().toLowerCase();
    const selectedFilter = this.selectedFilter.trim().toLowerCase();

    return this.auditLogs.filter(
      (entry) =>
        (!selectedFilter || entry[this.filterMode].toLowerCase() === selectedFilter) &&
        (!term ||
          [
            entry.date,
            entry.time,
            entry.officer,
            entry.action,
            entry.employee,
            entry.department,
            entry.role,
            entry.device,
            entry.notes,
            entry.result,
          ]
            .join(' ')
            .toLowerCase()
            .includes(term)),
    );
  }

  get filterOptions(): string[] {
    const options = this.auditLogs.map((entry) => entry[this.filterMode]).filter(Boolean);

    return Array.from(new Set(options)).sort((first, second) => first.localeCompare(second));
  }

  updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
  }

  updateFilterMode(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.filterMode = select.value as AuditFilterMode;
    this.selectedFilter = '';
  }

  updateSelectedFilter(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedFilter = select.value;
  }
}
