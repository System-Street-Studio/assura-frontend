import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
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
  private apiUrl = `${environment.apiUrl}/requests`;

  getAll(): Observable<AssetRequest[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(requests => requests.map(r => ({
        id: r.id,
        requestNumber: r.requestNumber,
        requestedBy: r.requesterName,
        requesterName: r.requesterName,
        assetName: r.assetName || 'N/A',
        description: r.description,
        reason: r.description || '',
        priority: r.priority,
        status: r.status,
        requestDate: r.createdAt,
        createdAt: r.createdAt,
        department: r.department || 'N/A',
        email: 'N/A',
        category: r.type || 'N/A',
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
}
