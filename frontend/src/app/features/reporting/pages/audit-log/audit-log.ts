import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit-log.html',
  styleUrls: ['../reporting-shared.css', './audit-log.css'],
})
export class AuditLogComponent {
  readonly stats = [
    { label: 'Successful Events', value: '184', tone: 'success' },
    { label: 'Flagged Reviews', value: '12', tone: 'warning' },
    { label: 'Failed Exports', value: '4', tone: 'danger' },
    { label: 'Active Monitors', value: '9', tone: 'neutral' },
  ];

  readonly logs = [
    {
      time: '09:12 AM',
      date: 'Apr 26, 2026',
      actor: 'Aster M.',
      role: 'Auditor',
      action: 'Monthly audit report generated',
      detail: 'Asset audit package exported for Q2 operations review.',
      asset: 'RPT-2041',
      module: 'Reports',
      ip: '10.12.41.18',
      status: 'Completed',
    },
    {
      time: '08:44 AM',
      date: 'Apr 26, 2026',
      actor: 'Naomi K.',
      role: 'Admin',
      action: 'Physical verification logged',
      detail: 'Store inventory bin B-12 validated against scan results.',
      asset: 'AST-8832',
      module: 'Assets',
      ip: '10.12.33.5',
      status: 'Active',
    },
    {
      time: '07:58 AM',
      date: 'Apr 26, 2026',
      actor: 'Daniel T.',
      role: 'Auditor',
      action: 'Exception review escalated',
      detail: 'Mismatch found between serial tag and assigned owner.',
      asset: 'AST-1994',
      module: 'Audit',
      ip: '10.12.99.40',
      status: 'Flagged',
    },
    {
      time: '07:32 AM',
      date: 'Apr 26, 2026',
      actor: 'Lina P.',
      role: 'Auditor',
      action: 'Export job retried',
      detail: 'CSV export completed after initial storage timeout.',
      asset: 'EXP-7710',
      module: 'Exports',
      ip: '10.12.41.21',
      status: 'Completed',
    },
    {
      time: '06:48 AM',
      date: 'Apr 26, 2026',
      actor: 'Brian O.',
      role: 'Auditor',
      action: 'Report delivery failed',
      detail: 'Scheduled archive upload rejected by downstream endpoint.',
      asset: 'RPT-2038',
      module: 'Reports',
      ip: '10.12.41.55',
      status: 'Failed',
    },
  ];
}
