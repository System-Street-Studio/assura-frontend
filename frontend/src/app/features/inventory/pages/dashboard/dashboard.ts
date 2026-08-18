import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

// ng2-charts: Angular wrapper around Chart.js for declarative canvas charts.
// BaseChartDirective is applied to <canvas baseChart ...> elements in the template.
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

import { DashboardService } from '../../services/dashboard.service';
import { ChartDatasets, DashboardData, Kpi, RecentActivity, WarrantyAlert } from '../../models/dashboard.model';
import { ToastService } from '../../../../shared/services/toast.service';
import { AuthService } from '../../../../core/auth/auth.service';

/** Shared axis/tick styling so every chart reads as one system on the dark surface. */
const AXIS_TICK = { color: '#94a3b8', font: { family: 'Jost', size: 12 } } as const;
const GRID_LINE = 'rgba(148, 163, 184, 0.14)';

const EMPTY_KPI: Kpi = {
  totalAssets: 0,
  checkedOut: 0,
  available: 0,
  totalAssetValue: 'LKR 0',
  pendingRequests: 0,
  maintenanceDue: 0,
  temporaryAssignedAssets: 0,
  awaitingPickupConfirmations: 0,
  procurementEscalations: 0,
};

const EMPTY_CHARTS: ChartDatasets = {
  assetsByCategory: { labels: [], data: [], colors: [] },
  assetsByStatus: { labels: [], data: [], colors: [] },
  assetsByDivision: { labels: [], data: [], colors: [] },
  checkoutTrend: { labels: [], data: [] },
  anomalies: { ghostAssets: 0, missingAssets: 0, maintenanceDue: 0 },
};

const ACTION_LABELS: Record<string, string> = {
  checked_out: 'Checked Out',
  checked_in: 'Checked In',
  registered: 'Registered',
  maintenance: 'Sent to Maintenance',
  disposed: 'Disposed',
  transferred: 'Transferred',
};

const SEVERITY_LABELS: Record<string, string> = {
  critical: 'Expiring Soon',
  warning: 'Upcoming',
  info: 'Scheduled',
};

const SEVERITY_ICONS: Record<string, string> = {
  critical: 'error',
  warning: 'warning',
  info: 'info',
};

/**
 * Inventory dashboard — the Storekeeper landing page.
 *
 * All figures come from one `DashboardService.getDashboardData()` call. The service keeps a
 * short-lived cache, so on a repeat visit this component paints the previous payload straight
 * away and quietly refreshes in the background instead of showing a skeleton again.
 */
@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, DecimalPipe, RouterLink, MatIconModule, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private readonly svc = inject(DashboardService);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);

  /** True only for a first-ever load, when there is nothing cached to show. */
  readonly loading = signal(true);

  /** True while a background refresh runs over already-visible data. */
  readonly refreshing = signal(false);

  /** Set when the last fetch failed and no cached data could be shown. */
  readonly loadFailed = signal(false);

  /** When the currently displayed numbers were fetched. */
  readonly lastUpdated = signal<Date | null>(null);

  readonly kpis = signal<Kpi>(EMPTY_KPI);
  readonly charts = signal<ChartDatasets>(EMPTY_CHARTS);
  readonly recentActivity = signal<RecentActivity[]>([]);
  readonly warrantyAlerts = signal<WarrantyAlert[]>([]);

  readonly anomalies = computed(() => this.charts().anomalies ?? EMPTY_CHARTS.anomalies);

  readonly today = new Date();
  readonly greeting = signal('Welcome');
  readonly firstName = signal('there');

  /** Placeholder rows for the skeleton view; `@for` needs a real collection to iterate. */
  readonly skeletonKpis = [0, 1, 2, 3, 4, 5, 6];
  readonly skeletonCharts = [0, 1, 2, 3];

  /** Share of the fleet currently checked out, used by the utilisation meter. */
  readonly utilizationRate = computed(() => this.rate(this.kpis().checkedOut));

  /** Share of the fleet sitting in store and ready to issue. */
  readonly availableRate = computed(() => this.rate(this.kpis().available));

  /** Share of the fleet held in maintenance. */
  readonly maintenanceRate = computed(() => this.rate(this.kpis().maintenanceDue));

  // ── Chart.js data & options ────────────────────────────────────────────────

  readonly doughnutData = computed<ChartConfiguration<'doughnut'>['data']>(() => {
    const cat = this.charts().assetsByCategory;
    return {
      labels: cat?.labels ?? [],
      datasets: [
        {
          data: cat?.data ?? [],
          backgroundColor: cat?.colors ?? [],
          hoverOffset: 10,
          borderWidth: 2,
          borderColor: '#0f172a', // Matches the card surface, so segments read as separated.
        },
      ],
    };
  });

  readonly doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'right',
        labels: { boxWidth: 10, boxHeight: 10, padding: 14, color: '#cbd5e1', font: { family: 'Jost', size: 12 } },
      },
      tooltip: { backgroundColor: '#1e293b', titleFont: { family: 'Jost' }, bodyFont: { family: 'Jost' } },
    },
  };

  readonly barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { display: false }, border: { display: false }, ticks: AXIS_TICK },
      y: {
        beginAtZero: true,
        grid: { color: GRID_LINE },
        border: { display: false },
        ticks: { ...AXIS_TICK, precision: 0 },
      },
    },
    plugins: {
      legend: { display: false }, // Labels already sit on the X axis.
      tooltip: { backgroundColor: '#1e293b', titleFont: { family: 'Jost' }, bodyFont: { family: 'Jost' } },
    },
  };

  readonly assetsByStatusData = computed<ChartConfiguration<'bar'>['data']>(() =>
    this.toBarData(this.charts().assetsByStatus),
  );

  readonly assetsByDivisionData = computed<ChartConfiguration<'bar'>['data']>(() =>
    this.toBarData(this.charts().assetsByDivision),
  );

  readonly lineData = computed<ChartConfiguration<'line'>['data']>(() => {
    const trend = this.charts().checkoutTrend;
    return {
      labels: trend?.labels ?? [],
      datasets: [
        {
          data: trend?.data ?? [],
          borderColor: '#38bdf8',
          backgroundColor: 'rgba(56, 189, 248, 0.16)',
          fill: true,
          borderWidth: 2,
          pointBackgroundColor: '#38bdf8',
          pointBorderColor: '#0f172a',
          pointBorderWidth: 2,
        },
      ],
    };
  });

  readonly lineOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { display: false }, border: { display: false }, ticks: AXIS_TICK },
      y: {
        beginAtZero: true,
        grid: { color: GRID_LINE },
        border: { display: false },
        ticks: { ...AXIS_TICK, precision: 0 },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#1e293b', titleFont: { family: 'Jost' }, bodyFont: { family: 'Jost' } },
    },
    elements: {
      line: { tension: 0.4 }, // Smooth curve rather than straight segments.
      point: { radius: 3, hoverRadius: 6 },
    },
  };

  ngOnInit(): void {
    const hour = new Date().getHours();
    this.greeting.set(hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening');
    this.firstName.set(this.auth.getFirstName() ?? 'there');

    // Paint whatever the service already holds, so a repeat visit shows real numbers
    // immediately and only the "refreshing" hint moves.
    const snapshot = this.svc.snapshot();
    if (snapshot) {
      this.apply(snapshot.data, snapshot.fetchedAt);
      this.loading.set(false);
    }

    this.load();
  }

  /** Re-fetches from the API, bypassing the cache. */
  refresh(): void {
    if (this.refreshing()) return;
    this.load(true);
  }

  formatActionLabel(action: string): string {
    return ACTION_LABELS[action] ?? action;
  }

  getSeverityLabel(severity: string): string {
    return SEVERITY_LABELS[severity] ?? severity;
  }

  getSeverityIcon(severity: string): string {
    return SEVERITY_ICONS[severity] ?? 'info';
  }

  /** Converts a past date into a short relative string: 'Just now', '5m ago', '3d ago'. */
  formatTimeAgo(date: Date): string {
    const time = new Date(date).getTime();
    if (Number.isNaN(time)) return '';
    const mins = Math.floor((Date.now() - time) / 60_000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  /**
   * Machine-readable timestamp for the <time> element.
   * Returns null on an unparseable date, because `toISOString()` throws on one and an
   * exception raised from the template would take the whole page down.
   */
  toIso(date: Date): string | null {
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }

  /** Translucent tint of an activity/severity colour, used for icon and badge backgrounds. */
  tint(color: string): string {
    return `${color}1f`;
  }

  private load(forceRefresh = false): void {
    const hasVisibleData = !this.loading();
    if (hasVisibleData) {
      this.refreshing.set(true);
    }

    this.svc.getDashboardData(forceRefresh).subscribe({
      next: (data) => {
        try {
          this.apply(data, new Date());
          this.loadFailed.set(false);
        } catch (err) {
          console.error('Error processing dashboard data:', err);
          this.toast.error('Error rendering dashboard components');
        } finally {
          this.loading.set(false);
          this.refreshing.set(false);
        }
      },
      error: (err: unknown) => {
        console.error('API Error:', err);
        this.loading.set(false);
        this.refreshing.set(false);
        this.loadFailed.set(true);
        this.toast.error('Failed to load dashboard data');
      },
    });
  }

  private apply(data: DashboardData, fetchedAt: Date): void {
    this.kpis.set(data.kpis ?? EMPTY_KPI);
    this.charts.set(data.charts ?? EMPTY_CHARTS);
    // Timestamps arrive as ISO strings; parse them so formatTimeAgo can do arithmetic.
    this.recentActivity.set((data.recentActivity ?? []).map((a) => ({ ...a, timestamp: new Date(a.timestamp) })));
    this.warrantyAlerts.set(data.warrantyAlerts ?? []);
    this.lastUpdated.set(fetchedAt);
  }

  private rate(part: number): number {
    const total = this.kpis().totalAssets;
    return total > 0 ? Math.round((part / total) * 100) : 0;
  }

  private toBarData(source: { labels: string[]; data: number[]; colors: string[] } | undefined) {
    return {
      labels: source?.labels ?? [],
      datasets: [
        {
          data: source?.data ?? [],
          backgroundColor: source?.colors ?? [],
          borderRadius: 6,
          maxBarThickness: 44,
        },
      ],
    };
  }
}
