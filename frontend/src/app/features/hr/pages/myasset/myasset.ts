import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { HrAssignmentService } from '../../services/hr-assignment.service';

export type AuditResult = 'Success' | 'Rejected' | 'Pending';

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
  imports: [],
  templateUrl: './myasset.html',
  styleUrls: ['./myasset.css'],
})
export class HrMyAssetComponent implements OnInit {
  private hrService = inject(HrAssignmentService);

  searchTerm = signal('');
  readonly auditLogs = signal<AuditLogEntry[]>([]);

  readonly filteredAuditLogs = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const logs = this.auditLogs();

    if (!term) {
      return logs;
    }

    return logs.filter((entry) =>
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
        .includes(term),
    );
  });

  ngOnInit(): void {
    this.hrService.getActivityLogs().subscribe(logs => {
      this.auditLogs.set(logs as AuditLogEntry[]);
    });
  }

  updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }
}
