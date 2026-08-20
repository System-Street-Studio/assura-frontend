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
        division: item.department || item.division,
        status: item.status,
        date: item.submittedDate,
        priority: item.priority,
        type: item.requestType,
        quantity: item.quantity,
        description: item.description,
        reason: item.reason,
        specs: item.description,
        justification: item.reason,
        attachments: item.attachments || [],
        assigneeName: item.assigneeName

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
        division: apiData.department || apiData.division,
        status: apiData.status,
        date: apiData.createdAt,
        priority: apiData.priority,
        type: apiData.type,
        quantity: apiData.quantity,
        description: apiData.description,
        reason: apiData.description,
        specs: apiData.description,
        justification: apiData.reason || apiData.description,
        attachments: apiData.attachments || [],
        assigneeName: apiData.assigneeName
      } as RequestItem))
    );
  }

  //map API data to RequestItem model(for a single AssetRequests-table row, by its own id —
  //used by new-asset-details, which only ever deals with AssetRequest-origin records and
  //must not go through the unified /requests/{id} lookup with a raw positive id, since that
  //endpoint treats positive ids as belonging to the separate Requests table)
  getAssetRequestById(id: number): Observable<RequestItem> {
    return this.http.get<any>(`${this.baseUrl}/assetrequests/${id}`).pipe(
      map((item: any) => ({
        id: item.id,
        name: item.requesterName,
        employee: item.requesterId,
        requesterId: item.requesterId,
        employeeId: item.requesterId,
        assetName: item.assetName,
        category: item.assetCategory,
        division: item.department || item.division,
        status: item.status,
        date: item.submittedDate,
        priority: item.priority,
        type: item.requestType,
        quantity: item.quantity,
        description: item.description,
        reason: item.reason,
        specs: item.description,
        justification: item.reason,
        attachments: item.attachments || [],
        assigneeName: item.assigneeName
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

  // `id` here is always the AssetRequests table's own (positive) id — this component only ever
  // shows new-asset requests, sourced from /assetrequests. The unified /requests endpoints below
  // key that same record by its *negative* id (the scheme GetRequestsQuery, ProcessRequestCommand
  // and ConfirmTemporaryAssignmentCommand already use to disambiguate it from the separate
  // Requests table). Sending the raw positive id here risked silently mutating an unrelated
  // Requests-table row that happened to share the same numeric id.
  processByStorekeeper(id: number, isInStock: boolean, assetId?: number, remarks?: string): Observable<void> {
    const unifiedId = -Math.abs(id);
    return this.http.post<void>(`${this.baseUrl}/requests/${unifiedId}/process`, {
      id: unifiedId,
      isInStock,
      assetId,
      remarks,
    });
  }

  confirmTemporaryAssignment(id: number, remarks?: string): Observable<void> {
    const unifiedId = -Math.abs(id);
    return this.http.post<void>(`${this.baseUrl}/requests/${unifiedId}/confirm-temporary-assignment`, {
      id: unifiedId,
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
