import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { AssetDetail } from '../../inventory/models/asset.model';
import { Division } from '../../inventory/models/division.model';

export interface PoolAsset extends AssetDetail {
  assignedTo?: string;
  empId?: string;
}

@Injectable({ providedIn: 'root' })
export class AssetPoolService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Get all assets from all divisions with assignments (real data from API)
   * Only returns assets that have assigned employees
   */
  getAllAssignedAssets(): Observable<PoolAsset[]> {
    return this.http.get<any[]>(`${this.apiUrl}/assets/all-with-assignments`).pipe(
      map(assets => {
        // Filter to only include assets that are assigned to someone
        const assignedAssets = assets.filter(asset => asset.assignedUserId && asset.assignedUserName);
        
        // Transform the data to match PoolAsset interface
        return assignedAssets.map(asset => ({
          id: asset.id,
          assetTag: asset.assetTag,
          assetCode: asset.assetCode,
          productName: asset.productName,
          divisionName: asset.divisionName,
          status: asset.status,
          assignedUserName: asset.assignedUserName,
          assignedUserEmail: asset.assignedUserEmail,
          assignedUserId: asset.assignedUserId,
          serialNumber: asset.serialNumber,
          purchaseValue: asset.purchaseValue,
          assetDate: asset.assetDate,
          notes: asset.notes,
          qrCode: asset.qrCode,
          assignedTo: asset.assignedUserName || 'Unassigned',
          empId: asset.assignedUserId?.toString() || '',
          // Add required properties from AssetDetail interface
          categoryName: 'Unknown', // Will be updated if available
          supplierName: 'Unknown', // Will be updated if available
          categoryId: 0,
          divisionId: 0,
          supplierId: 0,
          productId: 0,
          specifications: asset.notes || 'N/A'
        }));
      })
    );
  }

  /**
   * Get all divisions from the API
   */
  getDivisions(): Observable<Division[]> {
    return this.http.get<Division[]>(`${this.apiUrl}/divisions`);
  }

  /**
   * Create a transfer request for an asset
   */
  

  /**
   * Get all data needed for the asset pool page at once
   */
  getAssetPoolData(): Observable<{ assets: PoolAsset[]; divisions: Division[] }> {
    return forkJoin({
      assets: this.getAllAssignedAssets(),
      divisions: this.getDivisions()
    });
  }
}
