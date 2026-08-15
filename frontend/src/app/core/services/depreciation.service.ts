import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { DepreciationSummary, AssetDepreciationSchedule } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DepreciationService {
  private api = inject(ApiService);

  getDepreciationSummary(filters?: { categoryId?: number; divisionId?: number; targetYear?: number }): Observable<DepreciationSummary> {
    const params = new URLSearchParams();
    if (filters?.categoryId) {
      params.append('categoryId', filters.categoryId.toString());
    }
    if (filters?.divisionId) {
      params.append('divisionId', filters.divisionId.toString());
    }
    if (filters?.targetYear) {
      params.append('targetYear', filters.targetYear.toString());
    }

    const queryString = params.toString();
    const endpoint = queryString ? `depreciation?${queryString}` : 'depreciation';
    return this.api.get<DepreciationSummary>(endpoint);
  }

  getAssetSchedule(assetId: number): Observable<AssetDepreciationSchedule> {
    return this.api.get<AssetDepreciationSchedule>(`depreciation/schedule/${assetId}`);
  }
}
