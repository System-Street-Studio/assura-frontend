import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface AuditStat {
  label: string;
  value: string;
  tone: 'blue' | 'green' | 'orange' | 'red';
}

interface AuditLogEntry {
  time: string;
  date: string;
  actor: string;
  role: string;
  action: string;
  asset: string;
  module: string;
  ip: string;
  status: 'Success' | 'Warning' | 'Failed';
  detail: string;
}

@Component({
  selector: 'app-reporting-auditlog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auditlog.html',
  styleUrls: ['./auditlog.css'],
})
export class ReportingAuditlogComponent {
  readonly stats: AuditStat[] = [
    { label: 'Total Events', value: '1,248', tone: 'blue' },
    { label: 'Successful Actions', value: '1,196', tone: 'green' },
    { label: 'Warnings', value: '41', tone: 'orange' },
    { label: 'Failed Attempts', value: '11', tone: 'red' },
  ];

  readonly logs: AuditLogEntry[] = [
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
      detail: 'Physical verification completed with matching serial number.',
    },
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
      detail: 'Changed report period from monthly to quarterly.',
    },
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
      detail: 'Asset was not found during department scan.',
    },
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
      detail: 'Export failed because selected report contained no rows.',
    },
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
      detail: 'New asset record created and assigned a tracking code.',
    },
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
      detail: 'Recurring monthly warranty report scheduled.',
    },
  ];
}
