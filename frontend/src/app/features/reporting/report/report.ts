import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface ReportSummary {
  label: string;
  value: string;
  tone: 'blue' | 'green' | 'orange' | 'red';
}

interface ReportItem {
  id: string;
  title: string;
  owner: string;
  type: string;
  period: string;
  generated: string;
  status: 'Ready' | 'Pending' | 'Review' | 'Failed';
  size: string;
}

interface InsightItem {
  title: string;
  detail: string;
  tone: 'info' | 'warning' | 'success';
}

@Component({
  selector: 'app-reporting-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report.html',
  styleUrls: ['./report.css'],
})
export class ReportingReportComponent {
  readonly summaries: ReportSummary[] = [
    { label: 'Generated Reports', value: '128', tone: 'blue' },
    { label: 'Scheduled Reports', value: '24', tone: 'green' },
    { label: 'Pending Review', value: '7', tone: 'orange' },
    { label: 'Failed Exports', value: '2', tone: 'red' },
  ];

  readonly reportItems: ReportItem[] = [
    {
      id: 'RPT-2401',
      title: 'Asset Register Summary',
      owner: 'Nathan Miller',
      type: 'Asset',
      period: 'Jan 2026',
      generated: 'Today, 09:24 AM',
      status: 'Ready',
      size: '2.4 MB',
    },
    {
      id: 'RPT-2402',
      title: 'Missing Asset Audit',
      owner: 'Evelyn Harper',
      type: 'Audit',
      period: 'Q1 2026',
      generated: 'Today, 08:10 AM',
      status: 'Review',
      size: '1.8 MB',
    },
    {
      id: 'RPT-2403',
      title: 'Department Asset Value',
      owner: 'Richard Carson',
      type: 'Finance',
      period: 'Mar 2026',
      generated: 'Yesterday, 04:45 PM',
      status: 'Ready',
      size: '3.1 MB',
    },
    {
      id: 'RPT-2404',
      title: 'Warranty Expiry Report',
      owner: 'Derek Winston',
      type: 'Lifecycle',
      period: 'Next 90 days',
      generated: 'Yesterday, 01:20 PM',
      status: 'Pending',
      size: '940 KB',
    },
    {
      id: 'RPT-2405',
      title: 'Retired Asset Export',
      owner: 'Admin User',
      type: 'Export',
      period: 'All time',
      generated: 'Apr 20, 2026',
      status: 'Failed',
      size: '0 KB',
    },
  ];

  readonly insights: InsightItem[] = [
    {
      title: '12 assets need verification',
      detail: 'The latest audit report found assets without a physical confirmation.',
      tone: 'warning',
    },
    {
      title: 'Finance value report is ready',
      detail: 'The department valuation report was generated successfully.',
      tone: 'success',
    },
    {
      title: '2 exports should be retried',
      detail: 'Failed export jobs can be regenerated from the report queue.',
      tone: 'info',
    },
  ];
}
