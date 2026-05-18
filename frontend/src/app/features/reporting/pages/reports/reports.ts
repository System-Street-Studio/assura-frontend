import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.html',
  styleUrls: ['../reporting-shared.css', './reports.css'],
})
export class ReportsComponent {
  readonly summaries = [
    { label: 'Generated Today', value: '18', tone: 'success' },
    { label: 'Scheduled Reports', value: '7', tone: 'neutral' },
    { label: 'Needs Review', value: '5', tone: 'warning' },
    { label: 'Export Failures', value: '1', tone: 'danger' },
  ];

  readonly reportItems = [
    {
      id: 'RPT-2041',
      title: 'Monthly Asset Verification',
      owner: 'Aster M.',
      type: 'Audit',
      period: 'Apr 2026',
      generated: 'Apr 26, 2026',
      status: 'Completed',
      size: '3.2 MB',
    },
    {
      id: 'RPT-2037',
      title: 'Department Variance Register',
      owner: 'Naomi K.',
      type: 'Exception',
      period: 'Q2 2026',
      generated: 'Apr 25, 2026',
      status: 'Pending',
      size: '1.1 MB',
    },
    {
      id: 'RPT-2028',
      title: 'Lifecycle Disposal Summary',
      owner: 'Lina P.',
      type: 'Lifecycle',
      period: 'FY 2026',
      generated: 'Apr 24, 2026',
      status: 'Completed',
      size: '4.9 MB',
    },
    {
      id: 'RPT-2014',
      title: 'Export Compliance Snapshot',
      owner: 'Brian O.',
      type: 'Compliance',
      period: 'Apr 2026',
      generated: 'Apr 23, 2026',
      status: 'Failed',
      size: '850 KB',
    },
  ];

  readonly insights = [
    {
      title: 'High variance in field devices',
      detail: 'Mobile inventory still shows the largest audit delta this cycle.',
      tone: 'warning',
    },
    {
      title: 'Verification cadence improved',
      detail: 'Average turnaround from scan to report dropped by 14 percent.',
      tone: 'success',
    },
    {
      title: 'One export queue needs attention',
      detail: 'Retry the compliance snapshot pipeline before end-of-day archive.',
      tone: 'danger',
    },
  ];
}
