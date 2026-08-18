import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, forkJoin, of, timeout } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/auth/auth.service';


@Injectable({ providedIn: 'root' })
export class HeadTransferService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private baseUrl = environment.apiUrl;


  // Create transfer record in the database
  createTransferRecord(transferRequest: { assetId: number, assetRequestId: number, userId: number }): Observable<any> {
   
    console.log(' Complete transfer request object:', transferRequest);
     
    // Create payload with user ID included
    const payload = {
      assetId: transferRequest.assetId,
      assetRequestId: transferRequest.assetRequestId,
      userId: transferRequest.userId
    };
    
    console.log(' Final payload to backend:', JSON.stringify(payload, null, 2));
    
    const transferUrl = `${this.baseUrl}/transfers`;
    console.log(' Backend API endpoint:', transferUrl);
    
    return this.http.post(transferUrl, payload).pipe(
      tap((response) => {
        console.log(' Transfer record created successfully by backend:', response);
      }),
      catchError((error) => {
        // Comprehensive error handling
        console.error(' Error creating transfer record:', error);
        return throwError(() => error);
      })
    );
  }
  
  getTransferCounts(userId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/transfers/counts?userId=${userId}`);
  }
  getDivisionHeadTransfers(tab: string): Observable<any[]> {
    const cacheBuster = new Date().getTime().toString();
    const params = new HttpParams().set('tab', tab).set('_', cacheBuster); 

    return this.http.get<any[]>(`${this.baseUrl}/transfers/division-head`, { params });
  }

  cancelByHead(transferId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/transfers/${transferId}/cancel-head`, {});
  }

  approveByHead(transferId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/transfers/${transferId}/approve-head`, {});
  }


  confirmByHead(transferId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/transfers/${transferId}/confirm-head`, {});
  }


  rejectByHead(transferId: number, reason: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/transfers/${transferId}/reject-head`, { reason });
  }

  returnActiveTransfer(transferId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/transfers/${transferId}/return`, {});
  }
}