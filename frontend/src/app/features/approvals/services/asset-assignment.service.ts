import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface AssetWithAssignment {
  id: number;
  assetTag: string;
  assetCode: string;
  productName: string;
  divisionName: string;
  status: string;
  assignedUserName?: string;
  assignedUserEmail?: string;
  assignedUserId?: number;
  serialNumber?: string;
  purchaseValue: number;
  assetDate: string;
  notes?: string;
  qrCode?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AssetAssignmentService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  constructor() {}

  getAllAssetsWithAssignments(): Observable<AssetWithAssignment[]> {
    return this.http.get<AssetWithAssignment[]>(`${this.apiUrl}/assets/all-with-assignments`);
  }
}
