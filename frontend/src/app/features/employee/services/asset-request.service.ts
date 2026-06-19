import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface AssetRequest {
  id: number;
  employeeId: string;
  submittedBy: string;
  assetName: string;
  assetCategory: string;
  quantity: number;
  priority: string;
  reason: string;
  description?: string;
  status: string;
  submittedDate: string;
  requestType: string;
}

import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AssetService {
  private apiUrl = `${environment.apiUrl}/AssetRequests`;
  private unifiedApiUrl = `${environment.apiUrl}/requests`;

  constructor(private http: HttpClient) { }

  createRequest(data: any): Observable<AssetRequest> {
    return this.http.post<AssetRequest>(this.apiUrl, data);
  }

  /** Posts to the unified /api/requests endpoint which Division Heads can see and approve */
  createUnifiedRequest(payload: { type: number; priority: number; description?: string; assetId?: number }): Observable<number> {
    return this.http.post<number>(this.unifiedApiUrl, payload);
  }

  getEmployeeRequests(empId: string): Observable<AssetRequest[]> {
    return this.http.get<any[]>(this.unifiedApiUrl).pipe(
      map(requests => requests.map(request => ({
          id: request.id,
          employeeId: String(request.requesterId || empId),
          submittedBy: request.requesterName || 'Employee',
          assetName: request.assetName || request.assetCode || 'N/A',
          assetCategory: request.assetDivisionName || request.department || 'N/A',
          quantity: request.quantity || 1,
          priority: this.normalizePriority(request.priority),
          reason: request.description || '',
          description: request.description || '',
          status: this.normalizeStatus(request.status),
          submittedDate: request.createdAt || new Date().toISOString(),
          requestType: this.normalizeRequestType(request.type),
        } as AssetRequest))
      )
    );
  }

  getPendingRequests(): Observable<AssetRequest[]> {
    return this.http.get<AssetRequest[]>(`${this.apiUrl}/pending`);
  }

  getRequestById(requestId: number): Observable<AssetRequest> {
    return this.http.get<AssetRequest>(`${this.apiUrl}/${requestId}`);
  }

  normalizeStatus(status: string): string {
    switch (status) {
      case 'PendingDivisionHeadApproval':
      case 'PendingStorekeeperReview':
      case 'PendingProcurement':
        return 'Pending';
      case 'TemporaryAssigned':
        return 'Approved';
      default:
        return status;
    }
  }

  private normalizePriority(priority: any): string {
    const priorityMap: Record<string, string> = {
      1: 'Low',
      2: 'Normal',
      3: 'Medium',
      4: 'High',
      5: 'Urgent',
    };

    return priorityMap[String(priority)] || priority || 'Normal';
  }

  private normalizeRequestType(type: any): string {
    if (typeof type === 'string') {
      return type;
    }

    const requestTypeMap: Record<string, string> = {
      1: 'New Asset',
      2: 'Maintenance',
      3: 'Discard',
      4: 'Transfer',
    };

    return requestTypeMap[String(type)] || 'Request';
  }
}