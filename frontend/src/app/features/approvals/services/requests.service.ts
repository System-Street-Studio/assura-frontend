// services/request.service.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { RequestItem } from '../models/request.model';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({ providedIn: 'root' })
export class RequestService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5000/api'; 

  
  selectedRequest: RequestItem | null = null;

  // services/request.service.ts
  getAllRequests(isHead: boolean = false) {
    // Query string parameter
    return this.http.get<RequestItem[]>(`${this.baseUrl}/assetrequests?isDivisionHead=${isHead}`);
  }

  // services/requests.service.ts
approveRequest(id: number): Observable<boolean> {
  return this.http.put<boolean>(`${this.baseUrl}/assetrequests/${id}/approve`, {});
}

rejectRequest(id: number, reason: string): Observable<boolean> {
  return this.http.put<boolean>(`${this.baseUrl}/assetrequests/${id}/reject`, { reason });
}
}