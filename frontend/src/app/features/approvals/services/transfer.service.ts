import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, forkJoin, of, timeout } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/auth/auth.service';

@Injectable({ providedIn: 'root' })
export class TransferService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private baseUrl = environment.apiUrl;

  // Create transfer record in the database
createTransferRecord(transferRequest: { assetId: number, assetRequestId: number }): Observable<any> {
   
    console.log(' Asset ID received:', transferRequest.assetId);
    console.log('Asset Request ID received:', transferRequest.assetRequestId);
    console.log(' Complete transfer request object:', transferRequest);
    
    // Get current user ID from AuthService
    const currentUserId = this.authService.getUserId();
    console.log(' Current user ID from AuthService:', currentUserId);
    
    if (!currentUserId) {
      console.error(' No user ID found - user may not be authenticated');
      return throwError(() => new Error('User not authenticated - no user ID available'));
    }
    
    // Create payload with user ID included
    const payload = {
      assetId: transferRequest.assetId,
      assetRequestId: transferRequest.assetRequestId,
      userId: parseInt(currentUserId, 10) // Convert string ID to number
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
        // ... detailed error analysis
        return throwError(() => error);
      })
    );
  }

 // Get incomingApprovals transfers for the current user
 /* getIncomingApprovals( userId: number | null = null): Observable<any> {
    console.log('  GETTING INCOMING APPROVALS ');
    console.log(' Fetching incoming transfers with status = 1');
    console.log(' API call: GET', `${this.baseUrl}/transfers/incomingApprovals`);
    console.log(' Query parameters:');
    console.log('  userId:', userId);
    
    let params = new HttpParams();
   
    if (userId) {
      params = params.set('userId', userId.toString());
    }
    
    return this.http.get(`${this.baseUrl}/transfers/incomingApprovals`, { params }).pipe(
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
        console.log(' INCOMING APPROVALS API ERROR ');
        
        
        return of([]);
      })
    );
  }
  */
 
/*
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
  } */

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
  }

  // Get incoming transfers where status=PendingOwnerDivisionHeadApproval & current user=currentHolder division head
  getIncomingTransfersForDivisionHeadApproval(): Observable<any> {
    console.log('=== GETTING INCOMING TRANSFERS FOR DIVISION HEAD APPROVAL ===');
    console.log('Fetching transfers where status=PendingOwnerDivisionHeadApproval AND current user=currentHolder division head');
    
    // Get current user ID from AuthService
    const currentUserId = this.authService.getUserId();
    console.log('Current user ID from AuthService:', currentUserId);
    
    if (!currentUserId) {
      console.error('No user ID found - user may not be authenticated');
      return of([]);
    }
    
    let params = new HttpParams()
      .set('status', 'PendingOwnerDivisionHeadApproval')
      .set('divisionHeadId', currentUserId);
    
    console.log('API call: GET', `${this.baseUrl}/transfers/approvals/incoming-division-head`);
    console.log('Query parameters:', { status: 'PendingOwnerDivisionHeadApproval', divisionHeadId: currentUserId });
    
    return this.http.get(`${this.baseUrl}/transfers/approvals/incoming-division-head`, { params }).pipe(
      map((response: any) => {
        console.log('=== INCOMING DIVISION HEAD TRANSFERS RESPONSE ===');
        
        if (response.success && response.data) {
          console.log(`SUCCESS: Found ${response.data.length} incoming transfers for division head approval`);
          response.data.forEach((transfer: any, index: number) => {
            console.log(`  ${index + 1}. ID:${transfer.id} | Asset:${transfer.assetId} | From:${transfer.fromDivisionName} | To:${transfer.toDivisionName} | Status:${transfer.status} | CurrentHolder:${transfer.currentHolderName}`);
          });
          return response.data;
        } else {
          console.log('No incoming transfers found for division head approval or API error');
          return [];
        }
      }),
      catchError((error: any) => {
        console.log('=== INCOMING DIVISION HEAD TRANSFERS API ERROR ===');
        console.log('Failed to load incoming division head transfers:', error);
        return of([]);
      })
    );
  }

  // Get active transfers for incoming division head (status=Active & current user=toDivision division head)
  getActiveIncomingTransfersForDivisionHead(): Observable<any> {
    console.log('=== GETTING ACTIVE INCOMING TRANSFERS FOR DIVISION HEAD ===');
    console.log('Fetching transfers where status=Active AND current user=toDivision division head');
    
    // Get current user ID from AuthService
    const currentUserId = this.authService.getUserId();
    console.log('Current user ID from AuthService:', currentUserId);
    
    if (!currentUserId) {
      console.error('No user ID found - user may not be authenticated');
      return of([]);
    }
    
    let params = new HttpParams()
      .set('status', 'Active')
      .set('divisionHeadId', currentUserId);
    
    console.log('API call: GET', `${this.baseUrl}/transfers/active/incoming-division-head`);
    console.log('Query parameters:', { status: 'Active', divisionHeadId: currentUserId });
    
    return this.http.get(`${this.baseUrl}/transfers/active/incoming-division-head`, { params }).pipe(
      map((response: any) => {
        console.log('=== ACTIVE INCOMING DIVISION HEAD TRANSFERS RESPONSE ===');
        
        if (response.success && response.data) {
          console.log(`SUCCESS: Found ${response.data.length} active incoming transfers for division head`);
          response.data.forEach((transfer: any, index: number) => {
            console.log(`  ${index + 1}. ID:${transfer.id} | Asset:${transfer.assetId} | From:${transfer.fromDivisionName} | To:${transfer.toDivisionName} | Status:${transfer.status}`);
          });
          return response.data;
        } else {
          console.log('No active incoming transfers found for division head or API error');
          return [];
        }
      }),
      catchError((error: any) => {
        console.log('=== ACTIVE INCOMING DIVISION HEAD TRANSFERS API ERROR ===');
        console.log('Failed to load active incoming division head transfers:', error);
        return of([]);
      })
    );
  }

  // Get active transfers for outgoing division head (status=Active & current user=fromDivision division head)
  getActiveOutgoingTransfersForDivisionHead(): Observable<any> {
    console.log('=== GETTING ACTIVE OUTGOING TRANSFERS FOR DIVISION HEAD ===');
    console.log('Fetching transfers where status=Active AND current user=fromDivision division head');
    
    // Get current user ID from AuthService
    const currentUserId = this.authService.getUserId();
    console.log('Current user ID from AuthService:', currentUserId);
    
    if (!currentUserId) {
      console.error('No user ID found - user may not be authenticated');
      return of([]);
    }
    
    let params = new HttpParams()
      .set('status', 'Active')
      .set('divisionHeadId', currentUserId);
    
    console.log('API call: GET', `${this.baseUrl}/transfers/active/outgoing-division-head`);
    console.log('Query parameters:', { status: 'Active', divisionHeadId: currentUserId });
    
    return this.http.get(`${this.baseUrl}/transfers/active/outgoing-division-head`, { params }).pipe(
      map((response: any) => {
        console.log('=== ACTIVE OUTGOING DIVISION HEAD TRANSFERS RESPONSE ===');
        
        if (response.success && response.data) {
          console.log(`SUCCESS: Found ${response.data.length} active outgoing transfers for division head`);
          response.data.forEach((transfer: any, index: number) => {
            console.log(`  ${index + 1}. ID:${transfer.id} | Asset:${transfer.assetId} | From:${transfer.fromDivisionName} | To:${transfer.toDivisionName} | Status:${transfer.status}`);
          });
          return response.data;
        } else {
          console.log('No active outgoing transfers found for division head or API error');
          return [];
        }
      }),
      catchError((error: any) => {
        console.log('=== ACTIVE OUTGOING DIVISION HEAD TRANSFERS API ERROR ===');
        console.log('Failed to load active outgoing division head transfers:', error);
        return of([]);
      })
    );
  }

}