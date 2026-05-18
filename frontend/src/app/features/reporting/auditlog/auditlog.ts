import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { downloadCsv, downloadPdf, type ExportColumn } from '../export-download';

/* =========================================================
   AUDIT STAT INTERFACE
   Defines the structure of dashboard statistic cards.
========================================================= */
interface AuditStat {

  /* Statistic title */
  label: string;

  /* Statistic value */
  value: string;

  /* Card color theme */
  tone: 'blue' | 'green' | 'orange' | 'red';
}

/* =========================================================
   AUDIT LOG ENTRY INTERFACE
   Defines the structure of each audit log record.
========================================================= */
interface AuditLogEntry {

  /* Event time */
  time: string;

  /* Event date */
  date: string;

  /* User/actor name */
  actor: string;

  /* User role */
  role: string;

  /* Performed action */
  action: string;

  /* Related asset or reference */
  asset: string;

  /* System module */
  module: string;

  /* User IP address */
  ip: string;

  /* Event status */
  status: 'Success' | 'Warning' | 'Failed';

  /* Detailed explanation of activity */
  detail: string;
}

/* =========================================================
   COMPONENT DECORATOR
   Defines Angular standalone component configuration.
========================================================= */
@Component({

  /* Component selector */
  selector: 'app-reporting-auditlog',

  /* Standalone Angular component */
  standalone: true,

  /* Angular modules used */
  imports: [CommonModule],

  /* HTML template path */
  templateUrl: './auditlog.html',

  /* CSS stylesheet path */
  styleUrls: ['./auditlog.css'],
})

/* =========================================================
   AUDIT LOG COMPONENT CLASS
========================================================= */
export class ReportingAuditlogComponent {

  /* =========================================================
     DASHBOARD STATISTICS
     Top summary cards shown in audit page.
  ========================================================= */
  readonly stats: AuditStat[] = [

    /* Total audit events */
    {
      label: 'Total Events',
      value: '1,248',
      tone: 'blue'
    },

    /* Successfully completed actions */
    {
      label: 'Successful Actions',
      value: '1,196',
      tone: 'green'
    },

    /* Warning events */
    {
      label: 'Warnings',
      value: '41',
      tone: 'orange'
    },

    /* Failed actions or attempts */
    {
      label: 'Failed Attempts',
      value: '11',
      tone: 'red'
    },
  ];

  /* =========================================================
     AUDIT LOG RECORDS
     Main audit trail data shown in table and timeline.
  ========================================================= */
  readonly logs: AuditLogEntry[] = [

    /* Asset verification log */
    {
      time: '09:42 AM',
      date: 'Apr 22, 2026',
      actor: 'Nathan Miller',
      role: 'Auditor',
      action: 'Verified asset',
      asset: 'T00001 - XPS 13"',
      module: 'Asset',
      ip: '192.168.1.24',
      status: 'Success',

      detail:
        'Physical verification completed with matching serial number.',
    },

    /* Report filter update log */
    {
      time: '09:18 AM',
      date: 'Apr 22, 2026',
      actor: 'Evelyn Harper',
      role: 'Admin',
      action: 'Updated report filter',
      asset: 'RPT-2402',
      module: 'Report',
      ip: '192.168.1.18',
      status: 'Success',

      detail:
        'Changed report period from monthly to quarterly.',
    },

    /* Missing asset warning log */
    {
      time: '08:56 AM',
      date: 'Apr 22, 2026',
      actor: 'Derek Winston',
      role: 'Manager',
      action: 'Missing asset flagged',
      asset: 'T00023 - XPS 13"',
      module: 'Audit',
      ip: '192.168.1.51',
      status: 'Warning',

      detail:
        'Asset was not found during department scan.',
    },

    /* Failed export log */
    {
      time: '04:22 PM',
      date: 'Apr 21, 2026',
      actor: 'Richard Carson',
      role: 'Manager',
      action: 'Export attempted',
      asset: 'Retired Asset Export',
      module: 'Export',
      ip: '192.168.1.33',
      status: 'Failed',

      detail:
        'Export failed because selected report contained no rows.',
    },

    /* Asset creation log */
    {
      time: '02:15 PM',
      date: 'Apr 21, 2026',
      actor: 'Admin User',
      role: 'Admin',
      action: 'Created asset',
      asset: 'T00040 - Mega 27',
      module: 'Asset',
      ip: '192.168.1.10',
      status: 'Success',

      detail:
        'New asset record created and assigned a tracking code.',
    },

    /* Scheduled report log */
    {
      time: '11:04 AM',
      date: 'Apr 21, 2026',
      actor: 'Evelyn Harper',
      role: 'Admin',
      action: 'Scheduled report',
      asset: 'Warranty Expiry Report',
      module: 'Report',
      ip: '192.168.1.18',
      status: 'Success',

      detail:
        'Recurring monthly warranty report scheduled.',
    },
  ];

  searchQuery = '';
  selectedDateRange = 'All Dates';
  selectedModule = 'All Modules';

  private readonly auditExportColumns: ExportColumn<AuditLogEntry>[] = [
    { header: 'Date', value: (log) => log.date },
    { header: 'Time', value: (log) => log.time },
    { header: 'Actor', value: (log) => log.actor },
    { header: 'Role', value: (log) => log.role },
    { header: 'Action', value: (log) => log.action },
    { header: 'Reference', value: (log) => log.asset },
    { header: 'Module', value: (log) => log.module },
    { header: 'IP Address', value: (log) => log.ip },
    { header: 'Status', value: (log) => log.status },
    { header: 'Detail', value: (log) => log.detail },
  ];

  get uniqueModules(): string[] {
    const modules = new Set(this.logs.map((l) => l.module));
    return ['All Modules', ...Array.from(modules).sort()];
  }

  get uniqueDateRanges(): string[] {
    return ['All Dates', 'Today', 'This Week', 'This Month', 'Last 3 Months'];
  }

  get filteredLogs(): AuditLogEntry[] {
    let result = this.logs;
    const query = this.searchQuery.trim().toLowerCase();

    if (this.selectedModule !== 'All Modules') {
      result = result.filter((log) => log.module === this.selectedModule);
    }

    result = result.filter((log) => this.matchesDateRange(log));

    if (query) {
      result = result.filter((log) =>
        [
          log.time,
          log.date,
          log.actor,
          log.role,
          log.action,
          log.asset,
          log.module,
          log.ip,
          log.status,
          log.detail,
        ].some((value) => value.toLowerCase().includes(query)),
      );
    }

    return result;
  }

  searchLogs(query: string): void {
    this.searchQuery = query;
    console.log('Searching audit logs for', query);
  }

  changeDateRange(): void {
    const nextIndex = (this.uniqueDateRanges.indexOf(this.selectedDateRange) + 1) % this.uniqueDateRanges.length;
    this.selectedDateRange = this.uniqueDateRanges[nextIndex];
  }

  changeModuleFilter(): void {
    const nextIndex = (this.uniqueModules.indexOf(this.selectedModule) + 1) % this.uniqueModules.length;
    this.selectedModule = this.uniqueModules[nextIndex];
  }

  exportLogs(): void {
    downloadCsv('audit-log.csv', this.auditExportColumns, this.filteredLogs);
  }

  refreshTimeline(): void {
    alert('Refreshing recent activity timeline.');
  }

  filterStatus(): void {
    alert('Filtering audit logs by status.');
  }

  filterActor(): void {
    alert('Filtering audit logs by actor.');
  }

  downloadLogs(): void {
    downloadPdf(
      'audit-log.pdf',
      'Audit Log Export',
      this.filteredLogs.map(
        (log) =>
          `${log.date} ${log.time} | ${log.actor} (${log.role}) | ${log.action} | ${log.asset} | ${log.module} | ${log.ip} | ${log.status} | ${log.detail}`,
      ),
    );
  }

  openHelp(): void {
    alert('Opening audit log help guide.');
  }

  private matchesDateRange(log: AuditLogEntry): boolean {
    if (this.selectedDateRange === 'All Dates') {
      return true;
    }

    const logDate = new Date(log.date);

    if (Number.isNaN(logDate.getTime())) {
      return true;
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfLogDay = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate());
    const ageInDays = Math.floor(
      (startOfToday.getTime() - startOfLogDay.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (this.selectedDateRange === 'Today') {
      return ageInDays === 0;
    }

    if (this.selectedDateRange === 'This Week') {
      return ageInDays >= 0 && ageInDays < 7;
    }

    if (this.selectedDateRange === 'This Month') {
      return logDate.getFullYear() === now.getFullYear() && logDate.getMonth() === now.getMonth();
    }

    return ageInDays >= 0 && ageInDays <= 93;
  }
}
