import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AssetRequest } from '../models/request.model';
import { environment } from '../../../../environments/environment';

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
        department: 'N/A', // These would normally come from backend
        email: 'N/A',
        category: 'N/A',
        quantity: 1
      } as AssetRequest)))
    );
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
