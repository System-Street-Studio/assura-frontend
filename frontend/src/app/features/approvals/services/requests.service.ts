// services/request.service.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { RequestItem } from '../models/request.model';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface SuggestedAsset {
  id: number;
  assetCode: string;
  productName: string;
  categoryName: string;
  serialNumber?: string;
  score: number;
}

@Injectable({ providedIn: 'root' })
export class RequestService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;


  selectedRequest: RequestItem | null = null;

  // services/request.service.ts
  getAllRequests(isHead = false) {
    // Query string parameter
    return this.http.get<RequestItem[]>(`${this.baseUrl}/assetrequests?isDivisionHead=${isHead}`);
  }

  getRequestById(id: number): Observable<RequestItem> {
    return this.http.get<RequestItem>(`${this.baseUrl}/requests/${id}`);
  }

  getSuggestedAssetsForRequest(id: number): Observable<SuggestedAsset[]> {
    return this.http.get<SuggestedAsset[]>(`${this.baseUrl}/requests/${id}/suggested-assets`);
  }

  approveRequest(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/requests/${id}/division-head-review`, {
      id,
      approve: true,
    });
  }

  rejectRequest(id: number, remarks?: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/requests/${id}/division-head-review`, {
      id,
      approve: false,
      remarks,
    });
  }

  processByStorekeeper(id: number, isInStock: boolean, assetId?: number, remarks?: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/requests/${id}/process`, {
      id,
      isInStock,
      assetId,
      remarks,
    });
  }

  confirmTemporaryAssignment(id: number, remarks?: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/requests/${id}/confirm-temporary-assignment`, {
      id,
      remarks,
    });
  }

}