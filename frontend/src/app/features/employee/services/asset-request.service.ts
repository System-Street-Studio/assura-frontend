import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  constructor(private http: HttpClient) {}

  createRequest(data: any): Observable<AssetRequest> {
    return this.http.post<AssetRequest>(this.apiUrl, data);
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