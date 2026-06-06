import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, forkJoin, of, timeout } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';


@Injectable({ providedIn: 'root' })
export class TransferService {
  private http = inject(HttpClient);
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
<<<<<<< HEAD

  // Get incoming transfers for the current user
  getIncomingTransfers(userId: number | null = null): Observable<any> {
    console.log('--- GETTING INCOMING TRANSFERS ---');
    let params = new HttpParams();
    if (userId) {
      params = params.set('userId', userId.toString());
    }
    
    return this.http.get(`${this.baseUrl}/transfers/incomingApprovals`, { params }).pipe(
      map((response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        return [];
      }),
      catchError((error: any) => {
        console.error('Error fetching incoming transfers:', error);
        return of([]);
      })
    );
  }

  getUserTransfers(): Observable<any> {
    console.log('--- GETTING ALL USER TRANSFERS ---');
    return this.http.get(`${this.baseUrl}/transfers`).pipe(
      map((response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        return [];
      }),
      catchError((error: any) => {
        console.error('Error fetching user transfers:', error);
        return of([]);
      })
    );
  }


  // Get outgoing transfers where status=PendingOwnerApproval & current user=transferredBy
  getOutgoingTransfersForApproval(): Observable<any> {
    console.log('=== GETTING OUTGOING TRANSFERS FOR APPROVAL ===');
    console.log('Fetching transfers where status=PendingOwnerApproval AND current user=transferredBy');
    
    // Get current user ID from AuthService
    const currentUserId = this.authService.getUserId();
    console.log('Current user ID from AuthService:', currentUserId);
    
    if (!currentUserId) {
      console.error('No user ID found - user may not be authenticated');
      return of([]);
    }
    
    let params = new HttpParams()
      .set('status', 'PendingOwnerApproval')
      .set('transferredBy', currentUserId);
    
    console.log('API call: GET', `${this.baseUrl}/transfers/approvals/outgoing`);
    console.log('Query parameters:', { status: 'PendingOwnerApproval', transferredBy: currentUserId });
    
    return this.http.get(`${this.baseUrl}/transfers/approvals/outgoing`, { params }).pipe(
      map((response: any) => {
        console.log('=== OUTGOING TRANSFERS RESPONSE ===');
        
        if (response.success && response.data) {
          console.log(`SUCCESS: Found ${response.data.length} outgoing transfers for approval`);
          response.data.forEach((transfer: any, index: number) => {
            console.log(`  ${index + 1}. ID:${transfer.id} | Asset:${transfer.assetId} | From:${transfer.fromDivisionName} | To:${transfer.toDivisionName} | Status:${transfer.status} | TransferredBy:${transfer.transferredByName}`);
          });
          return response.data;
        } else {
          console.log('No outgoing transfers found for approval or API error');
          return [];
        }
      }),
      catchError((error: any) => {
        console.log('=== OUTGOING TRANSFERS API ERROR ===');
        console.log('Failed to load outgoing transfers:', error);
        return of([]);
      })
    );
=======
 

  
  getDivisionHeadTransfers(tab: string): Observable<any[]> {
    const params = new HttpParams().set('tab', tab);
    return this.http.get<any[]>(`${this.baseUrl}/transfers/division-head`, { params });
>>>>>>> feature/division-head-part
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

 

}