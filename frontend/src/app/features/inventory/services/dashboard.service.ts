import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, shareReplay, tap, finalize, catchError, map } from 'rxjs';
import { DashboardData } from '../models/dashboard.model';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/auth/auth.service';

/** How long a fetched payload is considered fresh. Mirrors the server-side cache window. */
const CACHE_TTL_MS = 60_000;

/** Recursively converts PascalCase keys from the .NET API to camelCase. */
function toCamelCaseKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(toCamelCaseKeys);
  }
  if (value !== null && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>(
      (acc, [key, val]) => {
        acc[key.charAt(0).toLowerCase() + key.slice(1)] = toCamelCaseKeys(val);
        return acc;
      },
      {},
    );
  }
  return value;
}

const DEFAULT_DASHBOARD: DashboardData = {
  kpis: {
    totalAssets: 0,
    checkedOut: 0,
    available: 0,
    totalAssetValue: 'LKR 0',
    pendingRequests: 0,
    maintenanceDue: 0,
    temporaryAssignedAssets: 0,
    awaitingPickupConfirmations: 0,
    procurementEscalations: 0,
  },
  charts: {
    assetsByCategory: { labels: [], data: [], colors: [] },
    assetsByStatus: { labels: [], data: [], colors: [] },
    assetsByDivision: { labels: [], data: [], colors: [] },
    checkoutTrend: { labels: [], data: [] },
    anomalies: { ghostAssets: 0, missingAssets: 0, maintenanceDue: 0 },
  },
  recentActivity: [],
  warrantyAlerts: [],
};

/** Last successful payload plus when it landed and who it belongs to. */
export interface DashboardSnapshot {
  data: DashboardData;
  fetchedAt: Date;
}

/**
 * Fetches the inventory dashboard payload.
 *
 * The API sits in front of a remote database, so this service keeps a small in-memory
 * cache to keep repeat visits instant:
 *
 * - **TTL cache** — a payload younger than {@link CACHE_TTL_MS} is replayed without a request,
 *   so navigating away and back does not re-hit the network.
 * - **Request de-duplication** — concurrent subscribers share one in-flight request via
 *   `shareReplay`, instead of each firing their own.
 * - **Stale-while-revalidate** — {@link snapshot} exposes the last payload even once it has
 *   expired, letting the page paint real numbers immediately while a refresh runs behind it.
 *
 * The cache is scoped to the signed-in user id and dropped as soon as that changes, so a
 * re-login in the same tab can never show the previous account's figures. It lives in memory
 * only, so a full page reload always starts from a clean state.
 */
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/dashboard`;

  private cached: DashboardSnapshot | null = null;
  private cachedFor: string | null = null;
  private inFlight: Observable<DashboardData> | null = null;

  /**
   * Returns the last payload received, fresh or stale, or `null` if nothing has loaded yet.
   * Use it to paint the page instantly, then subscribe to {@link getDashboardData} for the
   * up-to-date numbers.
   */
  snapshot(): DashboardSnapshot | null {
    this.discardIfUserChanged();
    return this.cached;
  }

  /** True when {@link snapshot} exists but has aged past the TTL. */
  isStale(): boolean {
    const snap = this.snapshot();
    return !!snap && Date.now() - snap.fetchedAt.getTime() >= CACHE_TTL_MS;
  }

  /**
   * Emits the dashboard payload, served from cache when it is still fresh.
   * @param forceRefresh Bypass the cache and always go to the network.
   */
  getDashboardData(forceRefresh = false): Observable<DashboardData> {
    this.discardIfUserChanged();

    if (!forceRefresh && this.cached && Date.now() - this.cached.fetchedAt.getTime() < CACHE_TTL_MS) {
      return of(this.cached.data);
    }

    // A request is already on the wire: join it rather than starting a second one.
    if (this.inFlight && !forceRefresh) {
      return this.inFlight;
    }

    this.inFlight = this.http.get<unknown>(this.apiUrl).pipe(
      map((raw) => this.normalise(raw)),
      tap((data) => {
        this.cached = { data, fetchedAt: new Date() };
        this.cachedFor = this.auth.getUserId();
      }),
      catchError((err: unknown) => {
        console.error('Dashboard API error:', err);
        // Prefer showing the last known numbers over wiping the page to zeroes.
        return of(this.cached?.data ?? DEFAULT_DASHBOARD);
      }),
      finalize(() => {
        this.inFlight = null;
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    return this.inFlight;
  }

  /** Drops the cache so the next read goes to the network. */
  invalidate(): void {
    this.cached = null;
    this.cachedFor = null;
  }

  private normalise(raw: unknown): DashboardData {
    const data = toCamelCaseKeys(raw) as Partial<DashboardData> & {
      charts?: DashboardData['charts'] & { assetsByDepartment?: DashboardData['charts']['assetsByDivision'] };
    };

    return {
      kpis: data.kpis ?? DEFAULT_DASHBOARD.kpis,
      charts: data.charts
        ? {
            ...data.charts,
            // The API still emits the legacy `assetsByDepartment` name alongside the current one.
            assetsByDivision: data.charts.assetsByDivision ?? data.charts.assetsByDepartment ??
              DEFAULT_DASHBOARD.charts.assetsByDivision,
          }
        : DEFAULT_DASHBOARD.charts,
      recentActivity: data.recentActivity ?? [],
      warrantyAlerts: data.warrantyAlerts ?? [],
    };
  }

  /** Clears cached figures that belong to a different account. */
  private discardIfUserChanged(): void {
    const currentUser = this.auth.getUserId();
    if (this.cached && this.cachedFor !== currentUser) {
      this.invalidate();
    }
  }
}
