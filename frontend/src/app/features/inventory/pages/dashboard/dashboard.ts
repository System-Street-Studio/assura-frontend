// ─────────────────────────────────────────────────────────────────────────────
// Angular core imports
// ─────────────────────────────────────────────────────────────────────────────
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

// ng2-charts: Angular wrapper around Chart.js for declarative canvas charts.
// BaseChartDirective is applied to <canvas baseChart ...> elements in the template.
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

// ─────────────────────────────────────────────────────────────────────────────
// Feature services & models
// ─────────────────────────────────────────────────────────────────────────────
import { DashboardService } from '../../services/dashboard.service';
import { Kpi, ChartDatasets, RecentActivity, WarrantyAlert, DashboardData } from '../../models/dashboard.model';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  // BaseChartDirective must be imported to use <canvas baseChart> elements in the template
  imports: [CommonModule, RouterLink, MatIconModule, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
/**
 * DashboardComponent is the main landing page for the Storekeeper role.
 * It fetches all KPIs, chart data, recent activity, and warranty alerts
 * from a single `DashboardService.getDashboardData()` call, then distributes
 * the response into separate data structures consumed by individual
 * Chart.js canvas elements and UI sections.
 */
export class DashboardComponent implements OnInit {
  // ── Dependency injection ──
  private svc   = inject(DashboardService);   // Fetches all dashboard data in one API call
  private toast = inject(ToastService);       // Non-blocking toast notifications
  private cdr   = inject(ChangeDetectorRef);  // Manual change detection after async updates

  /** True while the API call is in-flight; the template shows skeleton cards during this period. */
  loading = true;

  /**
   * Key Performance Indicators shown in the card grid at the top of the page.
   * Initialised with zero-state defaults so the template never crashes on undefined access.
   */
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

  /**
   * Raw chart datasets returned by the API.
   * These are processed by `prepareCharts()` into Chart.js-compatible data structures.
   */
  charts: ChartDatasets = {
    assetsByCategory: { labels: [], data: [], colors: [] },
    assetsByStatus:   { labels: [], data: [], colors: [] },
    assetsByDivision: { labels: [], data: [], colors: [] },
    checkoutTrend:    { labels: [], data: [] },
    anomalies:        { ghostAssets: 0, missingAssets: 0, maintenanceDue: 0 },
  };

  /** Timeline feed shown in the "Recent Activity" panel. Timestamps are parsed to Date objects on load. */
  recentActivity: RecentActivity[] = [];

  /** Warranties expiring soon, shown in the right-side panel with severity indicators. */
  warrantyAlerts: WarrantyAlert[] = [];

  /** Asset anomaly counts displayed in the bottom anomaly cards. Sourced from `charts.anomalies`. */
  anomalies = { ghostAssets: 0, missingAssets: 0, maintenanceDue: 0 };

  /** Used in the welcome banner to show a time-of-day greeting and the current date. */
  today = new Date();
  greeting = 'Welcome';
  firstName = 'Inventory Manager';

  // ── Computed KPI ratios used by the progress bars on KPI cards ──

  /**
   * Percentage of total assets that are currently checked out.
   * Guards against division-by-zero when totalAssets is 0.
   */
  get utilizationRate(): number {
    return this.kpis.totalAssets > 0
      ? Math.round((this.kpis.checkedOut / this.kpis.totalAssets) * 100)
      : 0;
  }

  /**
   * Percentage of total assets that are currently available (in store).
   * Guards against division-by-zero when totalAssets is 0.
   */
  get availableRate(): number {
    return this.kpis.totalAssets > 0
      ? Math.round((this.kpis.available / this.kpis.totalAssets) * 100)
      : 0;
  }

  // ── Chart.js data & option objects ──
  // Each chart binds to a separate `[data]` and `[options]` input on its <canvas baseChart> element.

  /** Data for the "Assets by Category" doughnut chart — populated in prepareCharts(). */
  doughnutData: ChartConfiguration<'doughnut'>['data'] = { labels: [], datasets: [{ data: [] }] };

  /** Options for the doughnut chart: 65% cutout gives it the "ring" appearance; legend on the right. */
  doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: { position: 'right', labels: { boxWidth: 12, padding: 14, font: { family: 'Jost' } } },
    },
  };

  /**
   * Shared options for all bar charts (Assets by Status, Assets by Division).
   * Grid lines only on Y axis; X axis labels use the Jost font to match the design system.
   */
  barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { display: false }, ticks: { color: '#6b7b7b', font: { family: 'Jost' } } },
      y: { grid: { color: '#f0f4f4' }, ticks: { color: '#6b7b7b', font: { family: 'Jost' } } },
    },
    plugins: { legend: { display: false } }, // No legend needed; labels are on the X axis
  };

  /** Data for the "Checkout Trend" line chart — populated in prepareCharts(). */
  lineData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [{ data: [] }] };

  /**
   * Options for the line chart. `tension: 0.4` creates smooth bezier curves.
   * Point radius is small by default (4px) but expands on hover (6px).
   */
  lineOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { display: false }, ticks: { color: '#6b7b7b', font: { family: 'Jost' } } },
      y: { grid: { color: '#f0f4f4' }, ticks: { color: '#6b7b7b', font: { family: 'Jost' } } },
    },
    plugins: { legend: { display: false } },
    elements: {
      line:  { tension: 0.4 },              // Smooth curve instead of straight lines
      point: { radius: 4, hoverRadius: 6 },
    },
  };

  /** Data for the "Assets by Status" bar chart. */
  assetsByStatusData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [{ data: [] }] };

  /** Data for the "Assets by Division" bar chart. */
  assetsByDivisionData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [{ data: [] }] };

  /**
   * Lifecycle hook — fetches all dashboard data on component init.
   * A try/catch inside the `next` handler ensures that a bug in chart processing
   * does not prevent the loading state from being cleared.
   */
  ngOnInit(): void {
    const hour = new Date().getHours();
    this.greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    this.svc.getDashboardData().subscribe({
      next: (data: DashboardData) => {
        try {
          this.kpis           = data.kpis || this.kpis;
          this.charts         = data.charts || this.charts;
          // Parse timestamp strings to Date objects so `formatTimeAgo()` can do math on them
          this.recentActivity = (data.recentActivity || []).map(a => ({ ...a, timestamp: new Date(a.timestamp) }));
          this.warrantyAlerts = data.warrantyAlerts || [];
          this.anomalies      = this.charts.anomalies || this.anomalies;
          this.prepareCharts();  // Transform raw API data into Chart.js dataset structures
        } catch (err) {
          console.error('Error processing dashboard data:', err);
          this.toast.error('Error rendering dashboard components');
        } finally {
          this.loading = false;
          this.cdr.detectChanges(); // Force UI update — needed when running outside Angular zone
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

  /**
   * Converts a past Date into a human-readable relative time string.
   * Examples: 'Just now', '5m ago', '2h ago', '3d ago'.
   * @param date - A Date object representing when the activity occurred.
   */
  formatTimeAgo(date: Date): string {
    const now  = Date.now();
    const diff = now - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  /**
   * Maps internal action enum strings (e.g. 'checked_out') to user-friendly labels
   * (e.g. 'Checked Out') for display in the Recent Activity feed.
   * Falls back to the raw action string if no mapping is found.
   */
  formatActionLabel(action: string): string {
    const map: Record<string, string> = {
      checked_out: 'Checked Out',
      checked_in:  'Checked In',
      registered:  'Registered',
      maintenance: 'Sent to Maintenance',
      disposed:    'Disposed',
      transferred: 'Transferred',
    };
    return map[action] || action;
  }

  /**
   * Maps warranty severity codes to human-readable labels shown in the Warranty panel badge.
   * @param severity - 'critical' | 'warning' | 'info'
   */
  getSeverityLabel(severity: string): string {
    const map: Record<string, string> = { critical: 'Expiring Soon', warning: 'Upcoming', info: 'Scheduled' };
    return map[severity] || severity;
  }

  /**
   * Transforms the raw API `ChartDatasets` into Chart.js `ChartConfiguration` data objects.
   * Must be called after `this.charts` is populated.
   *
   * Patterns used:
   * - `|| []` / `|| 0` guards handle the case where the backend returns partial data.
   * - `borderRadius: 6` on bar datasets gives rounded bar tops.
   * - `fill: true` on the line dataset adds the shaded area beneath the line.
   */
  private prepareCharts(): void {
    const cat    = this.charts?.assetsByCategory;
    const status = this.charts?.assetsByStatus;
    const dept   = this.charts?.assetsByDivision;
    const trend  = this.charts?.checkoutTrend;

    // Doughnut: Assets by Category
    this.doughnutData = {
      labels: cat?.labels || [],
      datasets: [{
        data:            cat?.data || [],
        backgroundColor: cat?.colors || [],
        hoverOffset:     8,       // Segment pops out slightly on hover
        borderWidth:     2,
        borderColor:     '#fff',  // White gap between segments
      }],
    };

    // Bar: Assets by Status
    this.assetsByStatusData = {
      labels: status?.labels || [],
      datasets: [{
        data:            status?.data || [],
        backgroundColor: status?.colors || [],
        borderRadius:    6,
      }],
    };

    // Bar: Assets by Division
    this.assetsByDivisionData = {
      labels: dept?.labels || [],
      datasets: [{
        data:            dept?.data || [],
        backgroundColor: dept?.colors || [],
        borderRadius:    6,
      }],
    };

    // Line: Checkout Trend (monthly volume)
    this.lineData = {
      labels: trend?.labels || [],
      datasets: [{
        data:                trend?.data || [],
        borderColor:         '#0b6c78',
        backgroundColor:     'rgba(11, 108, 120, 0.08)', // Translucent fill under the line
        fill:                true,
        pointBackgroundColor:'#0b6c78',
        pointBorderColor:    '#fff',
        pointBorderWidth:    2,
      }],
    };
  }
}
