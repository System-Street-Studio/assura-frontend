import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Asset, AssetDetail, AvailableCheckoutAsset } from '../models/asset.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AssetService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/assets`;

  getAll(): Observable<AssetDetail[]> {
    return this.http.get<AssetDetail[]>(this.apiUrl);
  }

  getAssetById(id: number | string): Observable<AssetDetail> {
    return this.http.get<AssetDetail>(`${this.apiUrl}/${id}`);
  }

  getAvailableForCheckout(): Observable<AvailableCheckoutAsset[]> {
    return this.http.get<AvailableCheckoutAsset[]>(`${this.apiUrl}/available-for-checkout`);
  }

  deleteAsset(id: number | string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`);
  }

  updateAsset(asset: Asset): Observable<AssetDetail> {
    return this.http.put<AssetDetail>(`${this.apiUrl}/${asset.id}`, asset);
  }

  createAsset(asset: Asset): Observable<AssetDetail> {
    return this.http.post<AssetDetail>(this.apiUrl, asset);
  }

  checkinAsset(
    id: number | string,
    condition: string,
    notes: string,
    damageSeverity?: string,
    repairNeeded = false,
    acknowledged = false,
    evidenceFileName?: string
  ): Observable<AssetDetail> {
    return this.http.post<AssetDetail>(`${this.apiUrl}/${id}/checkin`, {
      condition,
      notes,
      damageSeverity,
      repairNeeded,
      acknowledged,
      evidenceFileName,
    });
  }
}
