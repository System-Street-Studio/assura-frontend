import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { Kpi, ChartDatasets, RecentActivity, WarrantyAlert, DashboardData } from '../models/dashboard.model';
import { environment } from '../../../../environments/environment';

// Helper: recursively convert PascalCase keys to camelCase
function toCamelCaseKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCaseKeys);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc: any, key: string) => {
      const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
      acc[camelKey] = toCamelCaseKeys(obj[key]);
      return acc;
    }, {});
  }
  return obj;
}

const DEFAULT_DASHBOARD: DashboardData = {
  kpis: {
    totalAssets: 0,
    checkedOut: 0,
    available: 0,
    totalAssetValue: '$0',
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

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/dashboard`;

  getDashboardData(): Observable<DashboardData> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(raw => {
        // Normalize PascalCase from .NET backend to camelCase
        const data = toCamelCaseKeys(raw);
        return {
          kpis: data.kpis ?? DEFAULT_DASHBOARD.kpis,
          charts: data.charts ? {
            ...data.charts,
            assetsByDivision: data.charts.assetsByDivision || data.charts.assetsByDepartment
          } : DEFAULT_DASHBOARD.charts,
          recentActivity: data.recentActivity ?? [],
          warrantyAlerts: data.warrantyAlerts ?? [],
        } as DashboardData;
      }),
      catchError(err => {
        console.error('Dashboard API error:', err);
        return of(DEFAULT_DASHBOARD);
      })
    );
  }

  // Maintaining old methods for compatibility if needed, or refactoring component to use getDashboardData()
  getKpis(): Observable<Kpi> {
    return this.getDashboardData().pipe(map(d => d.kpis));
  }

  getCharts(): Observable<ChartDatasets> {
    return this.getDashboardData().pipe(map(d => d.charts));
  }

  getRecentActivity(): Observable<RecentActivity[]> {
    return this.getDashboardData().pipe(map(d => d.recentActivity));
  }

  getWarrantyAlerts(): Observable<WarrantyAlert[]> {
    return this.getDashboardData().pipe(map(d => d.warrantyAlerts));
  }
}
