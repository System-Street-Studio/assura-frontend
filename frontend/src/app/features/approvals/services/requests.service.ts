// services/request.service.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { RequestItem } from '../models/request.model';
import { Observable, forkJoin, throwError, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
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

getEmployeeDivisionInfo(employeeId: string): Observable<any> {
  console.log('🔍 Fetching user division info for userId:', employeeId);
  console.log('🔗 API call: GET', `${this.baseUrl}/user/${employeeId}`);
  
  return this.http.get(`${this.baseUrl}/user/${employeeId}`).pipe(
    catchError((error) => {
      console.log('❌ User API failed, using mock division data for testing');
      console.log('🔍 Error:', error.status, error.message);
      
      // Mock user data with division information for testing
      const mockUserData = {
        id: parseInt(employeeId),
        name: `User ${employeeId}`,
        divisionId: this.getMockDivisionId(employeeId),
        division: {
          id: this.getMockDivisionId(employeeId),
          name: this.getMockDivisionName(employeeId),
          divisionName: this.getMockDivisionName(employeeId)
        }
      };
      
      console.log('📋 Mock user data with division:', mockUserData);
      return of(mockUserData);
    })
  );
}

// Helper method to get mock division ID based on user ID
private getMockDivisionId(userId: string): number {
  const userDivisions: { [key: string]: number } = {
    '65': 1,  // emp_it -> IT Division
    '66': 2,  // emp_hr -> HR Division  
    '67': 3,  // emp_finance -> Finance Division
    '68': 4   // emp_ops -> Operations Division
  };
  return userDivisions[userId] || 5; // Default division
}

// Helper method to get mock division name based on user ID
private getMockDivisionName(userId: string): string {
  const userDivisions: { [key: string]: string } = {
    '65': 'Information Technology',
    '66': 'Human Resources', 
    '67': 'Finance',
    '68': 'Operations'
  };
  return userDivisions[userId] || 'General Division';
}

testDivisionFromUserTable(userId: string): Observable<any> {
  console.log('🧪 === TESTING DIVISION RETRIEVAL FROM USER TABLE ===');
  console.log('🔍 Testing with userId:', userId);
  console.log('🔗 API call: GET', `${this.baseUrl}/user/${userId}`);
  
  return this.http.get(`${this.baseUrl}/user/${userId}`).pipe(
    map((user: any) => {
      console.log('📋 === USER RESPONSE ANALYSIS ===');
      console.log('✅ User data received successfully');
      console.log('📊 User data keys:', Object.keys(user));
      console.log('📄 Complete user data:', user);
      
      console.log('🔍 === DIVISION FIELD CHECK ===');
      console.log('  user.divisionId:', user.divisionId);
      console.log('  user.divisionName:', user.divisionName);
      console.log('  user.division?.id:', user.division?.id);
      console.log('  user.division?.name:', user.division?.name);
      console.log('  user.division?.divisionName:', user.division?.divisionName);
      
      console.log('🔍 === EXTRACTED DIVISION INFO ===');
      const divisionId = user.divisionId || user.division?.id;
      const divisionName = user.divisionName || user.division?.name || user.division?.divisionName;
      
      console.log('  ✅ Extracted divisionId:', divisionId);
      console.log('  ✅ Extracted divisionName:', divisionName);
      
      if (divisionId && divisionName) {
        console.log('🎉 SUCCESS: Division info retrieved from user table');
      } else {
        console.log('❌ ISSUE: Division info missing or incomplete');
        console.log('⚠️  Possible issues:');
        console.log('    - User table does not have division information');
        console.log('    - Division field names are different');
        console.log('    - User with this ID does not exist');
      }
      
      return user;
    }),
    catchError((error) => {
      console.log('❌ === API ERROR ===');
      console.log('❌ Failed to fetch user data');
      console.log('🔍 Error details:', error);
      console.log('⚠️  Possible issues:');
      console.log('    - API endpoint does not exist');
      console.log('    - User ID does not exist');
      console.log('    - Permission issues');
      console.log('    - Network connectivity');
      
      return throwError(() => error);
    })
  );
}

createTransferRecordWithDivisionInfo(assetData: any, requestData: any, toDivisionId: any, toDivision: any, targetUserId: any, targetUser: any): Observable<any> {
  console.log('🔄 Creating transfer record with division info...');
  
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
    toDivisionId: toDivisionId,
    toDivision: toDivision,
    targetUserId: targetUserId,
    targetUser: targetUser,
    
    // Transfer metadata
    transferDate: new Date().toISOString(),
    status: 'PendingOwnerApproval',
    createdBy: requestData.requesterId
  };
  
  console.log('🔄 Creating transfer record with the following data:');
  console.log('📋 Transfer table data being inserted:');
  console.log('From assets table:');
  console.log('  assetId:', transferPayload.assetId);
  console.log('  assetTag:', transferPayload.assetTag);
  console.log('  fromDivisionId:', transferPayload.fromDivisionId);
  console.log('  fromDivision:', transferPayload.fromDivision);
  console.log('  currentHolderId:', transferPayload.currentHolderId);
  console.log('  currentHolder:', transferPayload.currentHolder);
  console.log('');
  console.log('From assetrequests table:');
  console.log('  assetRequestId:', transferPayload.assetRequestId);
  console.log('  reason:', transferPayload.reason);
  console.log('  toDivisionId:', transferPayload.toDivisionId);
  console.log('  toDivision:', transferPayload.toDivision);
  console.log('  targetUserId:', transferPayload.targetUserId);
  console.log('  targetUser:', transferPayload.targetUser);
  console.log('');
  console.log('Transfer metadata:');
  console.log('  transferDate:', transferPayload.transferDate);
  console.log('  status:', transferPayload.status);
  console.log('  createdBy:', transferPayload.createdBy);
  console.log('');
  console.log('📄 Complete transfer record data:');
  console.log(transferPayload);
  
  return this.http.post(`${this.baseUrl}/transfers`, transferPayload).pipe(
      catchError((error) => {
        console.log('❌ === TRANSFERS API ERROR ===');
        console.log('❌ Failed to create transfer record');
        console.log('🔍 Error status:', error.status);
        console.log('🔍 Error message:', error.message);
        console.log('📋 Transfer data that failed to save:', transferPayload);
        
        if (error.status === 404) {
          console.log('⚠️  Transfers endpoint not found (404). Backend endpoint may not be implemented yet.');
          console.log('🔄 Alternative: Transfer record data prepared but not saved to database.');
          console.log('📄 Transfer record data (ready for backend implementation):');
          console.log(JSON.stringify(transferPayload, null, 2));
          
          // Return mock success response for testing purposes
          return of({
            success: true,
            message: 'Transfer record created successfully (mock response - endpoint not implemented)',
            data: transferPayload,
            id: Date.now() // Mock ID
          });
        } else {
          console.log('❌ Other error occurred:', error);
          return throwError(() => error);
        }
      })
    );
}

createTransferRecord(assetData: any, requestData: any): Observable<any> {
  console.log('🔍 === COMPREHENSIVE TRANSFER DEBUGGING ===');
  console.log('📋 Step 1: Asset Data Analysis');
  console.log('  Asset data keys:', Object.keys(assetData));
  console.log('  Asset data:', assetData);
  console.log('  ✅ assetId:', assetData.assetId);
  console.log('  ✅ assetTag:', assetData.assetTag || assetData.assetCode);
  console.log('  ✅ fromDivisionId:', assetData.divisionId);
  console.log('  ✅ fromDivision:', assetData.divisionName);
  console.log('  ✅ currentHolderId:', assetData.assignedUserId);
  console.log('  ✅ currentHolder:', assetData.assignedUserName);
  
  console.log('📋 Step 2: Request Data Analysis');
  console.log('  Request data keys:', Object.keys(requestData));
  console.log('  Request data:', requestData);
  console.log('  ✅ requesterId:', requestData.requesterId);
  console.log('  ✅ requesterName:', requestData.requesterName);
  console.log('  ✅ assetRequestId:', requestData.id);
  console.log('  ✅ reason:', requestData.reason);
  
  // Check all possible target user fields
  console.log('📋 Step 3: Target User Identification');
  const possibleTargetUserIds = [
    {field: 'targetUserId', value: requestData.targetUserId},
    {field: 'toUserId', value: requestData.toUserId},
    {field: 'assignToUserId', value: requestData.assignToUserId},
    {field: 'requesterId', value: requestData.requesterId}
  ];
  console.log('  Possible target user IDs:', possibleTargetUserIds);
  
  const targetUserId = requestData.targetUserId || requestData.toUserId || requestData.assignToUserId || requestData.requesterId;
  const targetUser = requestData.targetUser || requestData.toUser || requestData.assignTo || requestData.requesterName;
  console.log('  ✅ Selected targetUserId:', targetUserId);
  console.log('  ✅ Selected targetUser:', targetUser);
  
  // Check all possible division fields
  console.log('📋 Step 4: Division Field Analysis');
  const possibleDivisionIds = [
    {field: 'divisionId', value: requestData.divisionId},
    {field: 'requesterDivisionId', value: requestData.requesterDivisionId},
    {field: 'userDivisionId', value: requestData.userDivisionId},
    {field: 'user.divisionId', value: requestData.user?.divisionId},
    {field: 'user.division.id', value: requestData.user?.division?.id}
  ];
  console.log('  Possible division IDs:', possibleDivisionIds);
  
  const possibleDivisionNames = [
    {field: 'division', value: requestData.division},
    {field: 'divisionName', value: requestData.divisionName},
    {field: 'requesterDivision', value: requestData.requesterDivision},
    {field: 'user.divisionName', value: requestData.user?.divisionName},
    {field: 'user.division.name', value: requestData.user?.division?.name},
    {field: 'user.division.divisionName', value: requestData.user?.division?.divisionName}
  ];
  console.log('  Possible division names:', possibleDivisionNames);
  
  const requestDivisionId = requestData.divisionId || 
                          requestData.requesterDivisionId || 
                          requestData.userDivisionId ||
                          requestData.user?.divisionId ||
                          requestData.user?.division?.id;
                          
  const requestDivision = requestData.division || 
                         requestData.divisionName || 
                         requestData.requesterDivision ||
                         requestData.user?.divisionName ||
                         requestData.user?.division?.name ||
                         requestData.user?.division?.divisionName;
  
  console.log('  ✅ Found requestDivisionId:', requestDivisionId);
  console.log('  ✅ Found requestDivision:', requestDivision);
  
  let toDivisionId = requestData.toDivisionId || requestData.toDivision || requestData.targetDivisionId || requestData.destinationDivisionId;
  let toDivision = requestData.toDivision || requestData.targetDivision || requestData.destinationDivision;
  
  if (requestDivisionId && requestDivision) {
    // Use division info from request data if available
    toDivisionId = requestDivisionId;
    toDivision = requestDivision;
    console.log('� Step 5A: Using division info from request data');
    console.log('  ✅ toDivisionId:', toDivisionId);
    console.log('  ✅ toDivision:', toDivision);
    
    return this.createTransferRecordWithDivisionInfo(assetData, requestData, toDivisionId, toDivision, targetUserId, targetUser);
  } else {
    // Fetch division info from user table using requesterId
    console.log('� Step 5B: Fetching division from user table');
    console.log('  🔍 RequesterId for user lookup:', requestData.requesterId);
    console.log('  🔗 Will call: GET', `${this.baseUrl}/user/${requestData.requesterId}`);
    
    return this.getEmployeeDivisionInfo(requestData.requesterId).pipe(
      map((user: any) => {
        console.log('📋 Step 6: User Response Analysis');
        console.log('  User data keys:', Object.keys(user));
        console.log('  User data:', user);
        
        // Check all possible division fields in user response
        const userDivisionIds = [
          {field: 'divisionId', value: user.divisionId},
          {field: 'division.id', value: user.division?.id}
        ];
        console.log('  User division IDs:', userDivisionIds);
        
        const userDivisionNames = [
          {field: 'divisionName', value: user.divisionName},
          {field: 'division.name', value: user.division?.name},
          {field: 'division.divisionName', value: user.division?.divisionName}
        ];
        console.log('  User division names:', userDivisionNames);
        
        toDivisionId = user.divisionId || user.division?.id || requestData.requesterId;
        toDivision = user.divisionName || user.division?.name || user.division?.divisionName || 'Unknown Division';
        
        console.log('  ✅ Final toDivisionId:', toDivisionId);
        console.log('  ✅ Final toDivision:', toDivision);
        
        console.log('📋 Step 7: Creating Transfer Record');
        console.log('  ✅ Final transfer data:');
        console.log('    - assetId:', assetData.assetId);
        console.log('    - assetRequestId:', requestData.id);
        console.log('    - requesterId:', requestData.requesterId);
        console.log('    - targetUserId:', targetUserId);
        console.log('    - toDivisionId:', toDivisionId);
        console.log('    - toDivision:', toDivision);
        
        return this.createTransferRecordWithDivisionInfo(assetData, requestData, toDivisionId, toDivision, targetUserId, targetUser);
      }),
      catchError((error) => {
        console.log('❌ === USER API ERROR ===');
        console.log('❌ Failed to fetch user data for division info');
        console.log('🔍 Error status:', error.status);
        console.log('🔍 Error message:', error.message);
        
        if (error.status === 404) {
          console.log('⚠️  User endpoint not found (404). Using fallback division info.');
          console.log('🔄 Creating transfer record with fallback division info...');
          
          // Use fallback division info
          const fallbackDivisionId = requestData.requesterId;
          const fallbackDivisionName = `${requestData.requesterName} Division`;
          
          console.log('  ✅ Fallback toDivisionId:', fallbackDivisionId);
          console.log('  ✅ Fallback toDivision:', fallbackDivisionName);
          
          return this.createTransferRecordWithDivisionInfo(
            assetData, 
            requestData, 
            fallbackDivisionId, 
            fallbackDivisionName, 
            targetUserId, 
            targetUser
          );
        } else {
          console.log('❌ Other error occurred:', error);
          return throwError(() => error);
        }
      })
    );
  }
}

}