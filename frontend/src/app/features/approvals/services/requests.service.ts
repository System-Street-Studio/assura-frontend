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

  //map API data to RequestItem model
  getAllRequests(isHead = false): Observable<RequestItem[]> {
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

  //map API data to RequestItem model(for single request)
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

  //approve request
  approveRequest(id: number): Observable<boolean> {
    return this.http.put<boolean>(`${this.baseUrl}/assetrequests/${id}/approve`, {}).pipe(
      map(result => {
        console.log(' New asset request approved successfully');
        return result;
      })
    );
  }

  //reject request
  rejectRequest(id: number): Observable<boolean> {
    return this.http.put<boolean>(`${this.baseUrl}/assetrequests/${id}/reject`, {});
  }

   

  //get approved transfer requests
 getApprovedTransferRequests(headId?: number): Observable<any[]> {
    let url = `${this.baseUrl}/assetrequests/approved-transfers`;
    
    if (headId) {
      url += `?headId=${headId}`;
    }

    return this.http.get<any[]>(url);
  }


}
