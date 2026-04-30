// services/request.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { RequestItem } from '../models/request.model';
import { Observable, forkJoin, throwError, of, timeout } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
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

  getAllRequests(isHead = false): Observable<RequestItem[]> {
    return this.http.get<any[]>(`${this.baseUrl}/assetrequests?isDivisionHead=${isHead}`).pipe(
      map((apiData: any[]) => apiData.map(item => ({
        id: item.id,
        name: item.requesterName,
        employee: item.requesterId,
        requesterId: item.requesterId,
        employeeId: item.requesterId,
        assetName: item.assetName,
        category: item.assetCategory,
        status: item.status,
        date: item.submittedDate,
        priority: item.priority,
        type: item.requestType,
        quantity: item.quantity,
        description: item.description,
        reason: item.reason,
        specs: item.description,
        justification: item.reason
      } as RequestItem)))
    );
  }

  getRequestById(id: number): Observable<RequestItem> {
    return this.http.get<any>(`${this.baseUrl}/requests/${id}`).pipe(
      map((apiData: any) => ({
        id: apiData.id,
        name: apiData.requesterName,
        employee: apiData.requesterId,
        requesterId: apiData.requesterId,
        employeeId: apiData.requesterId,
        assetName: apiData.assetName,
        category: apiData.type || 'Asset',
        status: apiData.status,
        date: apiData.createdAt,
        priority: apiData.priority,
        type: apiData.type,
        quantity: apiData.quantity,
        description: apiData.description,
        reason: apiData.description,
        specs: apiData.description,
        justification: apiData.description
      } as RequestItem))
    );
  }

  approveRequest(id: number): Observable<void> {
    return this.divisionHeadReview(id, true);
  }

  rejectRequest(id: number, remarks: string = ''): Observable<void> {
    return this.divisionHeadReview(id, false, remarks);
  }

  divisionHeadReview(id: number, approve: boolean, remarks: string = ''): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/requests/${id}/division-head-review`, {
      id,
      approve,
      remarks,
    });
  }

  getSuggestedAssetsForRequest(id: number): Observable<SuggestedAsset[]> {
    return this.http.get<SuggestedAsset[]>(`${this.baseUrl}/requests/${id}/suggested-assets`);
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

  getApprovedTransferRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/assetrequests?requestType=Transfer&status=Approved`);
  }

  getApprovedTransferRequestsForDropdown(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/assetrequests`).pipe(
      map((requests: any[]) => {
        if (!requests || requests.length === 0) return [];
        return requests.filter(request => request.requestType === 'Transfer' && request.status === 'Approved');
      })
    );
  }

  getApprovedTransferRequestsFromAllData(): Observable<any[]> {
    const isDivisionHead = true;
    return this.getAllRequests(isDivisionHead).pipe(
      map((allData: RequestItem[]) => {
        const transferFiltered = allData.filter(r => r.type?.toLowerCase() === 'transfer');
        const approvedTransferRequests = transferFiltered.filter(r => r.status === 'Approved');
        return approvedTransferRequests.map(request => ({
          id: request.id,
          requesterName: request.name,
          requesterId: request.requesterId,
          assetName: request.assetName,
          requestType: request.type,
          status: request.status,
          reason: request.reason,
          submittedDate: request.date
        }));
      })
    );
  }

  getAllTransferRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/assetrequests?requestType=Transfer`);
  }

  getAllAssetRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/assetrequests`);
  }
}
