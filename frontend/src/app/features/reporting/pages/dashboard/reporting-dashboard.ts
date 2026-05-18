import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-reporting-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reporting-dashboard.html',
  styleUrls: ['../reporting-shared.css', './reporting-dashboard.css'],
})
export class ReportingDashboardComponent {
  readonly metrics = [
    { label: 'Total Assets', value: '2,846', accent: true },
    { label: 'Audited This Month', value: '412' },
    { label: 'Flagged Exceptions', value: '20', accent: true },
    { label: 'Verified Locations', value: '31' },
  ];

  readonly categoryLegend = [
    { label: 'Computing', color: '#0f766e' },
    { label: 'Peripheral', color: '#f59e0b' },
    { label: 'Networking', color: '#2563eb' },
    { label: 'Furniture', color: '#7c3aed' },
  ];

  readonly statusBars = [
    { label: 'Active', value: 88, color: '#0f766e' },
    { label: 'Pending', value: 52, color: '#f59e0b' },
    { label: 'Repair', value: 36, color: '#f97316' },
    { label: 'Disposed', value: 22, color: '#64748b' },
  ];

  readonly departmentBars = [
    { label: 'IT', value: 94, color: '#0f766e' },
    { label: 'Finance', value: 64, color: '#2563eb' },
    { label: 'HR', value: 48, color: '#f59e0b' },
    { label: 'Ops', value: 72, color: '#7c3aed' },
  ];

  readonly valueBars = [
    { label: 'Laptop', value: 86, color: '#0f766e' },
    { label: 'Phone', value: 44, color: '#f97316' },
    { label: 'Network', value: 68, color: '#2563eb' },
    { label: 'Other', value: 38, color: '#7c3aed' },
  ];
}
