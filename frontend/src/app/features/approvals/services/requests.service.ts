// services/request.service.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { RequestItem } from '../models/request.model';
import { Observable, forkJoin } from 'rxjs';
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

  // services/requests.service.ts
approveRequest(id: number): Observable<boolean> {
  return this.http.put<boolean>(`${this.baseUrl}/assetrequests/${id}/approve`, {}).pipe(
    map(result => {
      console.log('✅ New asset request approved successfully');
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

getApprovedTransferRequests(): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/assetrequests?requestType=Transfer&status=Approved`);
}

getApprovedTransferRequestsForDropdown(): Observable<any[]> {
  console.log('🔍 Loading approved transfer requests from assetrequests table...');
  
  return this.http.get<any[]>(`${this.baseUrl}/assetrequests`).pipe(
    map((requests: any[]) => {
      console.log('📡 Raw response from assetrequests:', requests);
      
      if (!requests || requests.length === 0) {
        console.log('⚠️ No data received from assetrequests table');
        return [];
      }
      
      console.log('📊 Total requests in table:', requests.length);
      
      // Filter for approved transfer requests
      const approvedTransfers = requests.filter(request => {
        const type = request.requestType || request.type || request.RequestType;
        const status = request.status || request.Status || request.requestStatus;
        
        console.log(`🔍 Filtering request ${request.id}: type="${type}", status="${status}"`);
        
        return type === 'Transfer' && status === 'Approved';
      });
      
      console.log('✅ Found approved transfer requests:', approvedTransfers.length);
      console.log('📋 Approved transfer requests:', approvedTransfers);
      
      return approvedTransfers;
    })
  );
}

getAllApprovedTransferRequests(): Observable<any[]> {
  console.log('🔍 Getting all approved transfer requests from assetrequests table...');
  console.log('🌐 API URL being called:', `${this.baseUrl}/assetrequests`);
  console.log('🌐 Base URL:', this.baseUrl);
  
  return this.http.get<any[]>(`${this.baseUrl}/assetrequests`).pipe(
    map((requests: any[]) => {
      console.log('📡 Raw response from assetrequests:', requests);
      console.log('📊 Response type:', typeof requests);
      console.log('📏 Response length:', requests?.length);
      
      if (!requests || requests.length === 0) {
        console.log('⚠️ No data received from assetrequests table');
        console.log('🔍 Possible issues:');
        console.log('  1. Table is empty');
        console.log('  2. API endpoint is wrong');
        console.log('  3. Table name is different');
        console.log('  4. Permission issues');
        return [];
      }
      
      console.log('📊 Total requests in table:', requests.length);
      
      // Simple filter for approved transfer requests
      const approvedTransfers = requests.filter(request => 
        request.requestType === 'Transfer' && request.status === 'Approved'
      );
      
      console.log('✅ Found approved transfer requests:', approvedTransfers.length);
      return approvedTransfers;
    })
  );
}

getApprovedTransferRequestsFromAllData(): Observable<any[]> {
  console.log('🔍 Getting approved transfer requests using same method as requests-page...');
  
  const isDivisionHead = true; // Same as requests-page
  
  return this.getAllRequests(isDivisionHead).pipe(
    map((allData: RequestItem[]) => {
      console.log('📡 All data from getAllRequests:', allData);
      console.log('📊 Total requests received:', allData.length);
      
      // Filter for transfer requests (same logic as requests-page)
      const transferFiltered = allData.filter(r => r.type?.toLowerCase() === 'transfer');
      console.log('📋 Transfer requests filtered:', transferFiltered.length);
      
      // Further filter for approved status only
      const approvedTransferRequests = transferFiltered.filter(r => r.status === 'Approved');
      console.log('✅ Approved transfer requests:', approvedTransferRequests.length);
      
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
      
      console.log('📋 Final approved transfer requests for dropdown:', approvedTransfers);
      return approvedTransfers;
    })
  );
}

getAssetDataForMatching(): Observable<any[]> {
  console.log('🔍 Loading asset data for matching...');
  
  return this.http.get<any[]>(`${this.baseUrl}/assets`).pipe(
    map((assets: any[]) => {
      console.log('📡 Raw response from assets table:', assets);
      
      if (!assets || assets.length === 0) {
        console.log('⚠️ No data received from assets table');
        return [];
      }
      
      console.log('📊 Total assets in table:', assets.length);
      
      return assets;
    })
  );
}

loadAndMatchTransferData(): Observable<any[]> {
  console.log('🔄 Loading and matching transfer data...');
  
  return forkJoin({
    requests: this.getApprovedTransferRequestsForDropdown(),
    assets: this.getAssetDataForMatching()
  }).pipe(
    map(({ requests, assets }) => {
      console.log('📊 Approved transfer requests:', requests.length);
      console.log('📊 Available assets:', assets.length);
      
      // Match requests with assets
      const matchedData = requests.map(request => {
        // Try to find matching asset by various fields
        let matchedAsset = null;
        
        // Try matching by assetName
        matchedAsset = assets.find(asset => 
          asset.productName === request.assetName || 
          asset.assetName === request.assetName ||
          asset.name === request.assetName
        );
        
        // Try matching by assetId if available
        if (!matchedAsset && request.assetId) {
          matchedAsset = assets.find(asset => asset.id === request.assetId);
        }
        
        // Try matching by assetTag/assetCode
        if (!matchedAsset && request.assetTag) {
          matchedAsset = assets.find(asset => 
            asset.assetTag === request.assetTag || 
            asset.assetCode === request.assetTag
          );
        }
        
        console.log(`🔗 Request ${request.id}:`, {
          requestAssetName: request.assetName,
          matchedAsset: matchedAsset ? matchedAsset.id : null,
          matchedAssetName: matchedAsset ? matchedAsset.productName : 'No match'
        });
        
        return {
          ...request,
          matchedAsset: matchedAsset,
          hasMatchingAsset: !!matchedAsset
        };
      });
      
      console.log('✅ Matched data prepared:', matchedData.length);
      console.log('📋 Matched data:', matchedData);
      
      return matchedData;
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

testSimpleApiCall(): Observable<any[]> {
  console.log(' Testing simple API call to assetrequests...');
  console.log(' API URL:', `${this.baseUrl}/assetrequests`);
  
  return this.http.get<any[]>(`${this.baseUrl}/assetrequests`).pipe(
    map((response) => {
      console.log(' Raw API response:', response);
      console.log(' Response type:', typeof response);
      console.log(' Response length:', response?.length);
      console.log(' Response is array:', Array.isArray(response));
      
      if (response && response.length > 0) {
        console.log(' First item structure:', response[0]);
        console.log(' Available fields:', Object.keys(response[0]));
        
        // Look for transfer requests
        const transferRequests = response.filter(item => {
          const type = item.requestType || item.type || item.RequestType;
          const status = item.status || item.Status || item.requestStatus;
          console.log(` Item ${item.id}: type="${type}", status="${status}"`);
          return type === 'Transfer' && status === 'Approved';
        });
        
        console.log(' Found transfer requests:', transferRequests.length);
        console.log(' Transfer request samples:', transferRequests.slice(0, 2));
      }
      
      return response;
    })
  );
}

createTransferRecord(assetData: any, requestData: any): Observable<any> {
  const transferPayload = {
    // From assets table
    assetId: assetData.assetId,
    assetTag: assetData.assetTag || assetData.assetCode,
    fromDivisionId: assetData.divisionId,
    fromDivision: assetData.divisionName,
    currentHolderId: assetData.assignedUserId,
    currentHolder: assetData.assignedUserName,
    
    // From assetrequests table
    assetRequestId: requestData.id,
    reason: requestData.reason,
    toDivisionId: requestData.toDivisionId,
    toDivision: requestData.toDivision,
    targetUserId: requestData.targetUserId,
    targetUser: requestData.targetUser,
    
    // Transfer metadata
    transferDate: new Date().toISOString(),
    status: 'Pending',
    createdBy: requestData.requesterId
  };
  
  console.log(' Transfer table data being inserted:', transferPayload);
  
  return this.http.post(`${this.baseUrl}/transfers`, transferPayload);
}

}