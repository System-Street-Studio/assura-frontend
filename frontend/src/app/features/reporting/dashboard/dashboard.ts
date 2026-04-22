import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface MetricCard {
  label: string;
  value: string;
  accent?: string;
}

interface BarItem {
  label: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-reporting-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class ReportingDashboardComponent {
  readonly metrics: MetricCard[] = [
    { label: 'Total assets', value: '4,500' },
    { label: 'Ghost Assets', value: '12' },
    { label: 'Missing Assets', value: '8' },
    { label: 'Total Asset Value', value: '$5.3M', accent: 'trend-up' },
  ];

  readonly categoryLegend = [
    { label: 'Furniture', color: '#006095' },
    { label: 'Electronics', color: '#ff7a00' },
    { label: 'Office Supplies', color: '#11a143' },
    { label: 'Machinery', color: '#d71920' },
    { label: 'Vehicles', color: '#66727b' },
  ];

  readonly statusBars: BarItem[] = [
    { label: 'In Use', value: 100, color: '#00527c' },
    { label: 'Available', value: 58, color: '#16b51f' },
    { label: 'Maintenance', value: 6, color: '#ff7a00' },
    { label: 'Retired', value: 4, color: '#e3242b' },
  ];

  readonly departmentBars: BarItem[] = [
    { label: 'ICT', value: 92, color: '#00527c' },
    { label: 'HR', value: 38, color: '#ff7a00' },
    { label: 'Finance', value: 56, color: '#14b63b' },
    { label: 'Stores', value: 72, color: '#d71920' },
    { label: 'OPS', value: 86, color: '#59616b' },
  ];

  readonly valueBars: BarItem[] = [
    { label: 'Furniture', value: 100, color: '#00527c' },
    { label: 'Electronics', value: 18, color: '#ff7a00' },
    { label: 'Office Supplies', value: 8, color: '#14b63b' },
    { label: 'Machinery', value: 26, color: '#d71920' },
    { label: 'Vehicles', value: 12, color: '#59616b' },
  ];
}
