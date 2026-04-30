// services/request.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { RequestItem } from '../models/request.model';
<<<<<<< HEAD
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
=======
import { Observable, forkJoin, throwError, of, timeout } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
>>>>>>> feature/division-head-part
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
<<<<<<< HEAD

  selectedRequest: RequestItem | null = null;

  // services/request.service.ts
  getAllRequests(isHead = false) {
    // Modern system handles isHead check via Role in token automatically
    return this.http.get<RequestItem[]>(`${this.baseUrl}/requests`);
=======
  
  selectedRequest: RequestItem | null = null;

  getAllRequests(isHead = false): Observable<RequestItem[]> {
    // Query string parameter
    return this.http.get<any[]>(`${this.baseUrl}/assetrequests?isDivisionHead=${isHead}`).pipe(
      map((apiData: any[]) => apiData.map(item => ({
        id: item.id,
        name: item.requesterName,
        employee: item.requesterId, // Legacy field for backward compatibility
        requesterId: item.requesterId, // Current user who made request
        employeeId: item.requesterId, // Alternative field name
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
>>>>>>> feature/division-head-part
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

<<<<<<< HEAD
  // services/requests.service.ts
  approveRequest(id: number): Observable<void> {
    return this.divisionHeadReview(id, true);
  }

  getSuggestedAssetsForRequest(id: number): Observable<SuggestedAsset[]> {
    return this.http.get<SuggestedAsset[]>(`${this.baseUrl}/requests/${id}/suggested-assets`);
  }

  divisionHeadReview(id: number, approve: boolean, remarks: string = ''): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/requests/${id}/division-head-review`, {
      id,
      approve,
      remarks,
    });
  }

  rejectRequest(id: number, remarks: string = ''): Observable<void> {
    return this.divisionHeadReview(id, false, remarks);
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
=======
  approveRequest(id: number): Observable<boolean> {
    return this.http.put<boolean>(`${this.baseUrl}/assetrequests/${id}/approve`, {}).pipe(
      map(result => {
        console.log(' New asset request approved successfully');
        return result;
      })
    );
  }

  rejectRequest(id: number): Observable<boolean> {
    return this.http.put<boolean>(`${this.baseUrl}/assetrequests/${id}/reject`, {});
  }

  getApprovedTransferRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/assetrequests?requestType=Transfer&status=Approved`);
  }

  getApprovedTransferRequestsForDropdown(): Observable<any[]> {
    console.log(' Loading approved transfer requests from assetrequests table...');
    
    return this.http.get<any[]>(`${this.baseUrl}/assetrequests`).pipe(
      map((requests: any[]) => {
        
        
        if (!requests || requests.length === 0) {
          console.log('No data received from assetrequests table');
          return [];
        }
        
        console.log('Total requests in table:', requests.length);
        
        // Simple filter for approved transfer requests
        const approvedTransfers = requests.filter(request => {
          const type = request.requestType;
          const status = request.status;
          console.log(` Filtering request ${request.id}: type="${type}", status="${status}"`);
          return type === 'Transfer' && status === 'Approved';
        });
        
        console.log('Found approved transfer requests:', approvedTransfers.length);
       
        
        return approvedTransfers;
      })
    );
  }

  

  getApprovedTransferRequestsFromAllData(): Observable<any[]> {
    console.log(' Getting approved transfer requests using same method as requests-page...');
    
    const isDivisionHead = true; // Same as requests-page
    
    return this.getAllRequests(isDivisionHead).pipe(
      map((allData: RequestItem[]) => {
        console.log(' All data from getAllRequests:', allData);
        console.log(' Total requests received:', allData.length);
        
        // Filter for transfer requests (same logic as requests-page)
        const transferFiltered = allData.filter(r => r.type?.toLowerCase() === 'transfer');
        console.log('Transfer requests filtered:', transferFiltered.length);
        
        // Further filter for approved status only
        const approvedTransferRequests = transferFiltered.filter(r => r.status === 'Approved');
        console.log('Approved transfer requests:', approvedTransferRequests.length);
        
        // Convert back to original format for dropdown
        const approvedTransfers = approvedTransferRequests.map(request => ({
          id: request.id,
          requesterName: request.name,
          requesterId: request.requesterId,
          assetName: request.assetName,
          requestType: request.type,
          status: request.status,
          reason: request.reason,
          submittedDate: request.date
        }));
        
        console.log('Final approved transfer requests for dropdown:', approvedTransfers);
        return approvedTransfers;
      })
    );
  }



  getAllTransferRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/assetrequests?requestType=Transfer`);
  }

  getAllAssetRequests(): Observable<any[]> {
    console.log('Fetching all asset requests...');
    return this.http.get<any[]>(`${this.baseUrl}/assetrequests`).pipe(
      map((apiData: any[]) => {
        console.log('Received asset requests:', apiData);
        return apiData;
      })
    );
  }

  
  
  

  
 

}
>>>>>>> feature/division-head-part
