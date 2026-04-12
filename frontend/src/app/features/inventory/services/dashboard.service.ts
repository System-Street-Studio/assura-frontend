import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Kpi, ChartDatasets, RecentActivity, WarrantyAlert, DashboardData } from '../models/dashboard.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/dashboard`;

  getDashboardData(): Observable<DashboardData> {
    return this.http.get<DashboardData>(this.apiUrl);
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
