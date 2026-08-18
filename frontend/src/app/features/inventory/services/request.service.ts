import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, Subject } from 'rxjs';
import { of } from 'rxjs';
import { AssetRequest } from '../models/request.model';
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
  private apiUrl = `${this.baseUrl}/requests`;

  // Signal for when requests are approved (for cross-component communication)
  requestsUpdated$ = new Subject<void>();

  getAll(): Observable<AssetRequest[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(requests => requests.map(r => ({
        id: r.id,
        requestNumber: r.requestNumber,
        requestedBy: r.requesterName || r.requestedBy,
        requesterName: r.requesterName,
        assetName: r.assetName || r.description || 'N/A',
        description: r.description,
        reason: r.description || '',
        priority: r.priority,
        status: r.status,  // pass through the raw backend status (PendingStorekeeperReview, TemporaryAssigned, etc.)
        requestDate: r.createdAt,
        createdAt: r.createdAt,
        division: r.department || r.division || 'N/A',
        email: 'N/A',
        category: r.type || r.assetCategory || 'N/A',
        assetCategory: r.assetCategory || r.type || 'N/A',
        quantity: 1
      } as AssetRequest)))
    );
  }

  process(id: number | string, command: any): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/process`, command);
  }

  confirmTemporaryAssignment(id: number | string, remarks?: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/confirm-temporary-assignment`, {
      id: Number(id),
      remarks: remarks || null,
    });
  }

  getSuggestedAssets(requestId: number | string): Observable<SuggestedAsset[]> {
    return this.http.get<SuggestedAsset[]>(`${this.apiUrl}/${requestId}/suggested-assets`);
  }

  getById(id: number | string): Observable<AssetRequest> {
    return this.http.get<AssetRequest>(`${this.apiUrl}/${id}`);
  }

  create(request: Partial<AssetRequest>): Observable<number> {
    return this.http.post<number>(this.apiUrl, request);
  }

  approve(id: number | string, notes: string): Observable<AssetRequest> {
    return this.http.put<AssetRequest>(`${this.apiUrl}/${id}/status`, { status: 'Approved', notes });
  }

  reject(id: number | string, notes: string): Observable<AssetRequest> {
    return this.http.put<AssetRequest>(`${this.apiUrl}/${id}/status`, { status: 'Rejected', notes });
  }

  fulfill(id: number | string): Observable<AssetRequest> {
    return this.http.put<AssetRequest>(`${this.apiUrl}/${id}/status`, { status: 'Fulfilled' });
  }

  // Fetch approved new asset requests from division head (assetrequests endpoint)
  // NOTE: This is kept for legacy compatibility but returns empty - all requests
  // are now served by the main getAll() endpoint
  getApprovedNewAssetRequests(): Observable<AssetRequest[]> {
    return of([]);
  }
}
