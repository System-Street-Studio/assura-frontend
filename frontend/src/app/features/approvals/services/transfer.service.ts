import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, forkJoin, of, timeout } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TransferService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

getAllApprovedTransferRequests(): Observable<any[]> {
    console.log('Getting all approved transfer requests from assetrequests table...');
    console.log('API URL being called:', `${this.baseUrl}/assetrequests`);
    
    
    return this.http.get<any[]>(`${this.baseUrl}/assetrequests`).pipe(
      map((requests: any[]) => {
        console.log(' Raw response from assetrequests:', requests);
        console.log(' Response type:', typeof requests);
        
        
        if (!requests || requests.length === 0) {
          console.log(' No data received from assetrequests table');
        
          return [];
        }
        
        console.log(' Total requests in table:', requests.length);
        
        // Simple filter for approved transfer requests
        const approvedTransfers = requests.filter(request => 
          request.requestType === 'Transfer' && request.status === 'Approved'
        );
        
        console.log(' Found approved transfer requests:', approvedTransfers.length);
        return approvedTransfers;
      })
    );
  }

  getUserTransfers(): Observable<any> {
    console.log(' GETTING ALL TRANSFERS ');
    console.log(' Fetching all transfers from transfer table');
    console.log(' API call: GET', `${this.baseUrl}/transfers`);
    
    
    return this.http.get(`${this.baseUrl}/transfers`).pipe(
      timeout(3000), // Reduced timeout for faster feedback
      map((response: any) => {
        console.log('  USER TRANSFERS RESPONSE ');
        console.log(' API response received successfully');
        
        
        if (response.success && response.data) {
          console.log(` SUCCESS: Found ${response.data.length} transfers for user`);
          console.log(' User transfers:');
          response.data.forEach((transfer: any, index: number) => {
            console.log(`  ${index + 1}. ID:${transfer.id} | ${transfer.transferNumber} | Asset:${transfer.assetId} | From:${transfer.fromDivisionName} | To:${transfer.toDivisionName} | Status:${transfer.status} | CurrentHolder:${transfer.currentHolderName}`);
          });

          return response.data;
        } else {
          console.log(' No transfers found for this user or API error');
          return [];
        }
      }),
      catchError((error: any) => {
        console.log(' USER TRANSFERS API ERROR ');
       
        
        // Get mock transfers from localStorage for testing
        const mockTransfers = JSON.parse(localStorage.getItem('mockTransfers') || '[]');
        console.log(' Found mock transfers in localStorage:', mockTransfers.length);
        
        if (mockTransfers.length > 0) {
          console.log(' Returning mock transfers for testing:');
          mockTransfers.forEach((transfer: any, index: number) => {
            console.log(`  ${index + 1}. ID:${transfer.id} | Asset:${transfer.assetId} | From:${transfer.fromDivision} | To:${transfer.toDivision} | Status:${transfer.status} | Reason:${transfer.reason}`);
          });
          return of(mockTransfers);
        } else {
          console.log(' No mock transfers found - returning empty array');
          return of([]);
        }
      })
    );
  } 

  getIncomingTransfers( userId: number | null = null): Observable<any> {
    console.log('  GETTING INCOMING TRANSFERS ');
    console.log(' Fetching incoming transfers with status = 1');
    console.log(' API call: GET', `${this.baseUrl}/transfers/incoming`);
    console.log(' Query parameters:');
    console.log('  userId:', userId);
    
    let params = new HttpParams();
   
    if (userId) {
      params = params.set('userId', userId.toString());
    }
    
    return this.http.get(`${this.baseUrl}/transfers/incoming`, { params }).pipe(
      map((response: any) => {
       
        console.log(' API response received successfully');
      
        
        if (response.success && response.data) {
          
          console.log('📋 Incoming transfers:');
          response.data.forEach((transfer: any, index: number) => {
            console.log(`  ${index + 1}. ID:${transfer.id} | ${transfer.transferNumber} | Asset:${transfer.assetId} | From:${transfer.fromDivisionName} | To:${transfer.toDivisionName} | Target:${transfer.targetUserName} | Status:${transfer.status}`);
          });
          
          return response.data;
        } else {
          console.log(' No incoming transfers found or API error');
          return [];
        }
      }),
      catchError((error: any) => {
        console.log(' INCOMING TRANSFERS API ERROR ');
        
        
        return of([]);
      })
    );
  }

  createTransferRecord(transferRequest: { assetId: number, assetRequestId: number }): Observable<any> {
   
    console.log(' Asset ID received:', transferRequest.assetId);
    console.log('Asset Request ID received:', transferRequest.assetRequestId);
    console.log(' Complete transfer request object:', transferRequest);
    
    // Only pass the two IDs to backend - let backend handle all the logic
    const transferUrl = `${this.baseUrl}/transfers`;
    console.log(' Backend API endpoint:', transferUrl);
    console.log('POST request payload to backend:', JSON.stringify(transferRequest, null, 2));
    
    return this.http.post(transferUrl, transferRequest).pipe(
      tap((response) => {
        console.log(' Transfer record created successfully by backend:', response);
      }),
      catchError((error) => {
        // Comprehensive error handling
        console.error(' Error creating transfer record:', error);
        // ... detailed error analysis
        return throwError(() => error);
      })
    );
  }

  
}