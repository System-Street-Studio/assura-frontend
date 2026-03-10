import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AssetRequest {
  Id?: number;
  employeeId: string;
  divisionHeadId?: number;
  assetName: string;
  assetDescription: string;
  reason: string;
  quantity: number;
  assetCategory: string;
  priority: string;
  status?: string;
  submittedDate?: string;
}

@Injectable({ providedIn: 'root' })
export class AssetService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

/*
  //-- get assets ---
  getAssets(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/assets`);
  }*/
 createRequest(requestData: any) {
  return this.http.post('/api/asset-requests', requestData);
}
/*
  createRequest(request: AssetRequest): Observable<AssetRequest> {
    return this.http.post<AssetRequest>(this.apiUrl, request);
  }

  getPendingRequests(): Observable<AssetRequest[]> {
    return this.http.get<AssetRequest[]>(`${this.apiUrl}/pending`);
  }

  approveRequest(requestId: number, divisionHeadId: number): Observable<AssetRequest> {
    return this.http.put<AssetRequest>(`${this.apiUrl}/${requestId}/approve/${divisionHeadId}`, {});
  }

  rejectRequest(requestId: number, divisionHeadId: number): Observable<AssetRequest> {
    return this.http.put<AssetRequest>(`${this.apiUrl}/${requestId}/reject/${divisionHeadId}`, {});
  }

  getEmployeeRequests(employeeId: number): Observable<AssetRequest[]> {
    return this.http.get<AssetRequest[]>(`${this.apiUrl}/employee/${employeeId}`);
  }*/

  }



