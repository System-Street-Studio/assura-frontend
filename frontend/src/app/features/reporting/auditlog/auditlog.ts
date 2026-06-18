import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReportingService } from '../services/reporting.service';

@Component({
  selector: 'app-reporting-auditlog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auditlog.html',
  styleUrls: ['./auditlog.css'],
})
export class ReportingAuditlogComponent implements OnInit {
  private reportingService = inject(ReportingService);

  readonly stats = signal<any[]>([]);
  readonly logs = signal<any[]>([]);

  // Filtering states
  readonly searchTerm = signal<string>('');
  readonly selectedModule = signal<string>('All');
  readonly selectedDateRange = signal<string>('All');

  // UI Dropdown states
  readonly showModuleDropdown = signal<boolean>(false);
  readonly showDateRangeDropdown = signal<boolean>(false);
  readonly showExportDropdown = signal<boolean>(false);

  // Computed list of unique modules dynamically extracted from loaded logs
  readonly availableModules = computed(() => {
    const list = this.logs().map(log => log.module).filter(Boolean);
    return ['All', ...Array.from(new Set(list))];
  });

  // Computed filtered list of logs
  readonly filteredLogs = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const mod = this.selectedModule();
    const range = this.selectedDateRange();
    let result = this.logs();

    // 1. Module filter
    if (mod !== 'All') {
      result = result.filter(log => log.module?.toLowerCase() === mod.toLowerCase());
    }

    // 2. Date range filter
    if (range !== 'All') {
      const now = new Date();
      result = result.filter(log => {
        if (!log.date) return false;
        // Parse date (supports both YYYY-MM-DD and MM/DD/YYYY formats)
        const logDate = new Date(log.date);
        if (isNaN(logDate.getTime())) return true;

        const diffTime = Math.abs(now.getTime() - logDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (range === 'Today') {
          return logDate.toDateString() === now.toDateString();
        } else if (range === 'Last 7 Days') {
          return diffDays <= 7;
        } else if (range === 'Last 30 Days') {
          return diffDays <= 30;
        }
        return true;
      });
    }

    // 3. Search text filter
    if (term) {
      result = result.filter(log => 
        (log.actor && log.actor.toLowerCase().includes(term)) ||
        (log.action && log.action.toLowerCase().includes(term)) ||
        (log.asset && log.asset.toLowerCase().includes(term)) ||
        (log.module && log.module.toLowerCase().includes(term)) ||
        (log.ip && log.ip.toLowerCase().includes(term)) ||
        (log.role && log.role.toLowerCase().includes(term)) ||
        (log.status && log.status.toLowerCase().includes(term)) ||
        (log.time && log.time.toLowerCase().includes(term)) ||
        (log.date && log.date.toLowerCase().includes(term))
      );
    }

    return result;
  });

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.reportingService.getAuditLogs().subscribe({
      next: (data) => {
        this.stats.set(data.stats);
        this.logs.set(data.logs);
      },
      error: (err) => {
        console.error('Failed to load audit logs:', err);
      }
    });
  }

  // Toggle Dropdowns
  toggleModuleDropdown(): void {
    this.showModuleDropdown.set(!this.showModuleDropdown());
    this.showDateRangeDropdown.set(false);
    this.showExportDropdown.set(false);
  }

  toggleDateRangeDropdown(): void {
    this.showDateRangeDropdown.set(!this.showDateRangeDropdown());
    this.showModuleDropdown.set(false);
    this.showExportDropdown.set(false);
  }

  toggleExportDropdown(): void {
    this.showExportDropdown.set(!this.showExportDropdown());
    this.showModuleDropdown.set(false);
    this.showDateRangeDropdown.set(false);
  }

  selectModule(moduleName: string): void {
    this.selectedModule.set(moduleName);
    this.showModuleDropdown.set(false);
  }

  selectDateRange(range: string): void {
    this.selectedDateRange.set(range);
    this.showDateRangeDropdown.set(false);
  }

  // Export options
  exportToCsv(): void {
    const data = this.filteredLogs();
    if (!data.length) return;

    const headers = ['Time', 'Date', 'Actor', 'Role', 'Action', 'Reference', 'Module', 'IP Address', 'Status'];
    const rows = data.map(log => [
      log.time || '',
      log.date || '',
      log.actor || '',
      log.role || '',
      log.action || '',
      log.asset || '',
      log.module || '',
      log.ip || '',
      log.status || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Audit_Log_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showExportDropdown.set(false);
  }

  triggerPrint(): void {
    this.showExportDropdown.set(false);
    window.print();
  }
}


