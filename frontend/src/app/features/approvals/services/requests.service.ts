// services/request.service.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { RequestItem } from '../models/request.model';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

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
    return this.http.get<any>(`${this.baseUrl}/assetrequests/${id}`).pipe(
      map((apiData: any) => ({
        id: apiData.id,
        name: apiData.requesterName,
        employee: apiData.requesterId,
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

  // services/requests.service.ts
approveRequest(id: number): Observable<boolean> {
  return this.http.put<boolean>(`${this.baseUrl}/assetrequests/${id}/approve`, {}).pipe(
    map(result => {
      console.log('✅ Request approved, triggering inventory refresh');
      return result;
    })
  );
}

rejectRequest(id: number): Observable<boolean> {
  return this.http.put<boolean>(`${this.baseUrl}/assetrequests/${id}/reject`, {});
}

/*rejectRequest(id: number, reason: string): Observable<boolean> {
  return this.http.put<boolean>(`${this.baseUrl}/assetrequests/${id}/reject`, { reason });
}*/


}