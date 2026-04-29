// services/request.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { RequestItem } from '../models/request.model';
import { Observable, forkJoin, throwError, of, timeout } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RequestService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;
  
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
  }

  getRequestById(id: number): Observable<RequestItem> {
    return this.http.get<any>(`${this.baseUrl}/assetrequests/${id}`).pipe(
      map((apiData: any) => ({
        id: apiData.id,
        name: apiData.requesterName,
        employee: apiData.requesterId,
        requesterId: apiData.requesterId,
        employeeId: apiData.requesterId,
        assetName: apiData.assetName,
        category: apiData.assetCategory,
        status: apiData.status,
        date: apiData.submittedDate,
        priority: apiData.priority,
        type: apiData.requestType,
        quantity: apiData.quantity,
        description: apiData.description,
        reason: apiData.reason,
        specs: apiData.description,
        justification: apiData.reason
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
