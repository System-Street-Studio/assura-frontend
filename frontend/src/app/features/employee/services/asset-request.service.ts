import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

// Define the AttachmentFile interface
export interface AttachmentFile {
  id?: string;
  fileName: string;
  fileSize?: number;
  fileType?: string;
  uploadedDate?: string;
  fileUrl?: string;
  file?: File;
}

// Define the AssetRequest interface
export interface AssetRequest {
  id: number;
  employeeId: string;
  submittedBy: string;
  assetName: string;
  assetCategory: string;
  quantity: number;
  priority: string;
  reason: string;
  description?: string;
  status: string;
  submittedDate: string;
  requestType: string;
  attachments?: AttachmentFile[];
}



// Service to handle asset requests
@Injectable({ providedIn: 'root' })
export class AssetService {
  private apiUrl = `${environment.apiUrl}/AssetRequests`;
  private unifiedApiUrl = `${environment.apiUrl}/requests`;

  constructor(private http: HttpClient) { }

  //create request with file attachments
  createRequest(data: any, files?: File[]): Observable<AssetRequest> {
    const formData = new FormData();

    Object.keys(data).forEach(key => {
      const value = data[key];
      if (value !== null && value !== undefined) {
        if (value instanceof Date) {
          formData.append(key, value.toISOString());
        } else {
          formData.append(key, String(value));
        }
      }
    });

    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file, file.name);
      });
    }

    // Debug: Log FormData contents
    console.log('FormData contents:');
    (formData as any).forEach((value: any, key: string) => {
      console.log(`${key}:`, value instanceof File ? `${value.name} (${value.size} bytes)` : value);
    });

    return this.http.post<AssetRequest>(this.apiUrl, formData);
  }

  //Posts to the unified /api/requests endpoint which Division Heads can see and approve 
  createUnifiedRequest(payload: { type: number; priority: number; description?: string; assetId?: number }): Observable<number> {
    return this.http.post<number>(this.unifiedApiUrl, payload);
  }

  // Get requests for a specific employee
 getEmployeeRequests(empId: string): Observable<AssetRequest[]> {
    return this.http.get<any[]>(`${this.apiUrl}/employee/${empId}`).pipe(
      map((apiData: any[]) => apiData.map(item => ({
        ...item
      }) as AssetRequest))
    );
  }

  // Get pending requests for the logged-in employee
  getPendingRequests(): Observable<AssetRequest[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pending`).pipe(
      map((apiData: any[]) => apiData.map(item => ({
        ...item
      }) as AssetRequest))
    );
  }

  //cancel request by employee
  cancelRequest(requestId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${requestId}/cancel`, {});
  }

  // Get request details by ID
  getRequestById(requestId: number): Observable<AssetRequest> {
    return this.http.get<any>(`${this.apiUrl}/${requestId}`).pipe(
      map((item: any) => ({
        ...item
      }) as AssetRequest)
    );
  }

  
  normalizeStatus(status: string): string {
    switch (status) {
      case 'PendingDivisionHeadApproval':
      case 'PendingStorekeeperReview':
      case 'PendingProcurement':
        return 'Pending';
      case 'TemporaryAssigned':
        return 'Approved';
      default:
        return status;
    }
  }

  private normalizePriority(priority: any): string {
    const priorityMap: Record<string, string> = {
      1: 'Low',
      2: 'Normal',
      3: 'Medium',
      4: 'High',
      5: 'Urgent',
    };

    return priorityMap[String(priority)] || priority || 'Normal';
  }

  private normalizeRequestType(type: any): string {
    if (typeof type === 'string') {
      return type;
    }

    const requestTypeMap: Record<string, string> = {
      1: 'New Asset',
      2: 'Maintenance',
      3: 'Discard',
      4: 'Transfer',
    };

    return requestTypeMap[String(type)] || 'Request';
  }
}