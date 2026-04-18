import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { DashboardService } from '../../services/dashboard.service';
import { Kpi, ChartDatasets, RecentActivity, WarrantyAlert, DashboardData } from '../../models/dashboard.model';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent implements OnInit {
  private svc = inject(DashboardService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  loading = true;
  kpis: Kpi = {
    totalAssets: 0,
    checkedOut: 0,
    available: 0,
    totalAssetValue: '$0',
    pendingRequests: 0,
    maintenanceDue: 0,
    temporaryAssignedAssets: 0,
    awaitingPickupConfirmations: 0,
    procurementEscalations: 0,
  };
  charts: ChartDatasets = {
    assetsByCategory: { labels: [], data: [], colors: [] },
    assetsByStatus: { labels: [], data: [], colors: [] },
    assetsByDivision: { labels: [], data: [], colors: [] },
    checkoutTrend: { labels: [], data: [] },
    anomalies: { ghostAssets: 0, missingAssets: 0, maintenanceDue: 0 },
  };
  recentActivity: RecentActivity[] = [];
  warrantyAlerts: WarrantyAlert[] = [];
  anomalies = { ghostAssets: 0, missingAssets: 0, maintenanceDue: 0 };

  today = new Date();

  get utilizationRate(): number {
    return this.kpis.totalAssets > 0
      ? Math.round((this.kpis.checkedOut / this.kpis.totalAssets) * 100)
      : 0;
  }

  get availableRate(): number {
    return this.kpis.totalAssets > 0
      ? Math.round((this.kpis.available / this.kpis.totalAssets) * 100)
      : 0;
  }

  doughnutData: ChartConfiguration<'doughnut'>['data'] = { labels: [], datasets: [{ data: [] }] };
  doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: { position: 'right', labels: { boxWidth: 12, padding: 14, font: { family: 'Jost' } } },
    },
  };

  barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { display: false }, ticks: { color: '#6b7b7b', font: { family: 'Jost' } } },
      y: { grid: { color: '#f0f4f4' }, ticks: { color: '#6b7b7b', font: { family: 'Jost' } } },
    },
    plugins: { legend: { display: false } },
  };

  lineData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [{ data: [] }] };
  lineOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { display: false }, ticks: { color: '#6b7b7b', font: { family: 'Jost' } } },
      y: { grid: { color: '#f0f4f4' }, ticks: { color: '#6b7b7b', font: { family: 'Jost' } } },
    },
    plugins: { legend: { display: false } },
    elements: {
      line: { tension: 0.4 },
      point: { radius: 4, hoverRadius: 6 },
    },
  };

  assetsByStatusData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [{ data: [] }] };
  assetsByDivisionData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [{ data: [] }] };

  ngOnInit(): void {
    this.svc.getDashboardData().subscribe({
      next: (data: DashboardData) => {
        try {
          this.kpis = data.kpis || this.kpis;
          this.charts = data.charts || this.charts;
          this.recentActivity = (data.recentActivity || []).map(a => ({ ...a, timestamp: new Date(a.timestamp) }));
          this.warrantyAlerts = data.warrantyAlerts || [];
          this.anomalies = this.charts.anomalies || this.anomalies;
          this.prepareCharts();
        } catch (err) {
          console.error('Error processing dashboard data:', err);
          this.toast.error('Error rendering dashboard components');
        } finally {
          this.loading = false;
          this.cdr.detectChanges(); // Force UI update in case we dropped out of zone
        }
      },
      error: (err) => {
        console.error('API Error:', err);
        this.loading = false;
        this.cdr.detectChanges();
        this.toast.error('Failed to load dashboard data');
      },
    });
  }

  formatTimeAgo(date: Date): string {
    const now = Date.now();
    const diff = now - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  formatActionLabel(action: string): string {
    const map: Record<string, string> = {
      checked_out: 'Checked Out',
      checked_in: 'Checked In',
      registered: 'Registered',
      maintenance: 'Sent to Maintenance',
      disposed: 'Disposed',
      transferred: 'Transferred',
    };
    return map[action] || action;
  }

  getSeverityLabel(severity: string): string {
    const map: Record<string, string> = { critical: 'Expiring Soon', warning: 'Upcoming', info: 'Scheduled' };
    return map[severity] || severity;
  }

  private prepareCharts(): void {
    const cat = this.charts?.assetsByCategory;
    const status = this.charts?.assetsByStatus;
    const dept = this.charts?.assetsByDivision;
    const trend = this.charts?.checkoutTrend;

    this.doughnutData = {
      labels: cat?.labels || [],
      datasets: [{
        data: cat?.data || [],
        backgroundColor: cat?.colors || [],
        hoverOffset: 8,
        borderWidth: 2,
        borderColor: '#fff',
      }],
    };

    this.assetsByStatusData = {
      labels: status?.labels || [],
      datasets: [{
        data: status?.data || [],
        backgroundColor: status?.colors || [],
        borderRadius: 6,
      }],
    };

    this.assetsByDivisionData = {
      labels: dept?.labels || [],
      datasets: [{
        data: dept?.data || [],
        backgroundColor: dept?.colors || [],
        borderRadius: 6,
      }],
    };

    this.lineData = {
      labels: trend?.labels || [],
      datasets: [{
        data: trend?.data || [],
        borderColor: '#0b6c78',
        backgroundColor: 'rgba(11, 108, 120, 0.08)',
        fill: true,
        pointBackgroundColor: '#0b6c78',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      }],
    };
  }
}
