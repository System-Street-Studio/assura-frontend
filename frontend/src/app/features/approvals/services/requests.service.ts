// services/request.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { RequestItem } from '../models/request.model';
import { Observable} from 'rxjs';
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

// Define the AttachmentFile interface
export interface AttachmentFile {
  id?: string;
  fileName: string;
  fileSize?: number;
  fileType?: string;
  uploadedDate?: string;
  fileUrl?: string;
  file?: File;
}



@Injectable({ providedIn: 'root' })
export class RequestService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  selectedRequest: RequestItem | null = null;

  //map API data to RequestItem model
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
        justification: item.reason,
        attachments: item.attachments || []
        
      } as RequestItem)))
    );
  }

  //map API data to RequestItem model(for single request)
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
        justification: apiData.reason || apiData.description,
        attachments: apiData.attachments || []
      } as RequestItem))
    );
  }

  approveRequest(id: number): Observable<boolean> {
    return this.http.put<boolean>(`${this.baseUrl}/assetrequests/${id}/approve`, {}).pipe(
      map(result => {
        console.log(' New asset request approved successfully');
        return result;
      })
    );
  }

  rejectRequest(id: number, remarks: string = ''): Observable<boolean> {
    return this.http.put<boolean>(`${this.baseUrl}/assetrequests/${id}/reject`, { reason: remarks });
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


  getAllAssetRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/assetrequests`);
  }

  //get approved transfer requests (backend scopes this to the caller's own division via the JWT)
 getApprovedTransferRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/assetrequests/approved-transfers`);
  }

  getPendingRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/assetrequests/pending`);
  }
}
