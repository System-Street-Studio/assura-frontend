import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

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
    return this.http.get<AssetRequest[]>(`${this.apiUrl}/employee/${empId}`);
  }

  getPendingRequests(): Observable<AssetRequest[]> {
    return this.http.get<AssetRequest[]>(`${this.apiUrl}/pending`);
  }

  getRequestById(requestId: number): Observable<AssetRequest> {
    return this.http.get<AssetRequest>(`${this.apiUrl}/${requestId}`);
  }
}