import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

export interface ReportingMetric {
  label: string;
  value: string;
  accent: boolean;
}

export interface ReportingLegendItem {
  label: string;
  color: string;
  count: number;
  percentage?: number;
}

export interface ReportingBarItem {
  label: string;
  rawValue: number;
  value: number;
  color: string;
}

export interface ReportingAnomalies {
  ghostAssetsDetected: number;
  missingPhysicalVerification: number;
}

export interface ReportingDashboard {
  metrics: ReportingMetric[];
  categoryLegend: ReportingLegendItem[];
  statusBars: ReportingBarItem[];
  divisionBars: ReportingBarItem[];
  valueBars: ReportingBarItem[];
  anomalies: ReportingAnomalies;
}

export interface ReportingStatCard {
  label: string;
  value: string;
  tone: string;
}

export interface ReportingAuditLogEntry {
  time: string;
  date: string;
  actor: string;
  role: string;
  action: string;
  detail: string;
  asset: string;
  module: string;
  ip: string;
  status: string;
}

export interface ReportingAuditLogPage {
  stats: ReportingStatCard[];
  logs: ReportingAuditLogEntry[];
}

export interface ReportingAssetRow {
  id: number;
  assetId: string;
  swatch: string;
  imageClass: string;
  product: string;
  status: string;
  checkedBy: string | null;
  checkedRole: string | null;
  assuraName: string;
  serial: string;
  warranty: string;
  endOfLife: string;
  codeNumber: string;
}

export interface ReportingAssetsPage {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  assets: ReportingAssetRow[];
}

export interface ReportingReportItem {
  id: string;
  title: string;
  owner: string;
  type: string;
  period: string;
  generated: string;
  status: string;
  size: string;
  isSystemGenerated: boolean;
}

export interface ReportingInsight {
  title: string;
  detail: string;
  tone: string;
}

export interface ReportingReportsPage {
  summaries: ReportingStatCard[];
  reportItems: ReportingReportItem[];
  insights: ReportingInsight[];
}

export interface CreateReportPayload {
  title: string;
  type: string;
  isScheduled?: boolean;
  scheduleFrequency?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReportingService {
  private apiService = inject(ApiService);
  private basePath = 'reporting';

  getDashboard(): Observable<ReportingDashboard> {
    return this.apiService.get<ReportingDashboard>(`${this.basePath}/dashboard`);
  }

  getAuditLogs(): Observable<ReportingAuditLogPage> {
    return this.apiService.get<ReportingAuditLogPage>(`${this.basePath}/audit-logs`);
  }

  getAssets(pageNumber: number = 1, pageSize: number = 20, searchTerm?: string): Observable<ReportingAssetsPage> {
    const params = new URLSearchParams({ pageNumber: String(pageNumber), pageSize: String(pageSize) });
    if (searchTerm) params.set('searchTerm', searchTerm);
    return this.apiService.get<ReportingAssetsPage>(`${this.basePath}/assets?${params.toString()}`);
  }

  getReports(): Observable<ReportingReportsPage> {
    return this.apiService.get<ReportingReportsPage>(`${this.basePath}/reports`);
  }

  verifyAsset(id: number): Observable<boolean> {
    return this.apiService.post<boolean>(`${this.basePath}/assets/${id}/verify`, {});
  }

  markReportCompleted(id: string): Observable<boolean> {
    return this.apiService.post<boolean>(`${this.basePath}/reports/${id}/complete`, {});
  }

  createReport(data: CreateReportPayload): Observable<{ id: string }> {
    return this.apiService.post<{ id: string }>(`${this.basePath}/reports`, data);
  }

  getReportData(type: string, startDate?: string, endDate?: string, divisionId?: number): Observable<Record<string, unknown>[]> {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    if (divisionId) params.set('divisionId', divisionId.toString());

    const query = params.toString();
    return this.apiService.get<Record<string, unknown>[]>(`${this.basePath}/reports/${type}/data${query ? `?${query}` : ''}`);
  }
}
