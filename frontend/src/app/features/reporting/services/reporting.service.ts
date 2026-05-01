import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ReportingDashboard {
  metrics: any[];
  categoryLegend: any[];
  statusBars: any[];
  divisionBars: any[];
  valueBars: any[];
  anomalies: any;
}

export interface ReportingAuditLogPage {
  stats: any[];
  logs: any[];
}

export interface ReportingAssetsPage {
  selectedCount: number;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  assets: any[];
}

export interface ReportingReportsPage {
  summaries: any[];
  reportItems: any[];
  insights: any[];
}

@Injectable({
  providedIn: 'root',
})
export class ReportingService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reporting`;

  getDashboard(): Observable<ReportingDashboard> {
    return this.http.get<ReportingDashboard>(`${this.apiUrl}/dashboard`);
  }

  getAuditLogs(): Observable<ReportingAuditLogPage> {
    return this.http.get<ReportingAuditLogPage>(`${this.apiUrl}/audit-logs`);
  }

  getAssets(pageNumber: number = 1, pageSize: number = 20): Observable<ReportingAssetsPage> {
    return this.http.get<ReportingAssetsPage>(`${this.apiUrl}/assets?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  }

  getReports(): Observable<ReportingReportsPage> {
    return this.http.get<ReportingReportsPage>(`${this.apiUrl}/reports`);
  }

  verifyAsset(id: number): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/assets/${id}/verify`, {});
  }
}
