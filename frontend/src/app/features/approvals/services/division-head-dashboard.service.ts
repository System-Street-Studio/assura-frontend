import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';


export interface DivisionOverviewSummary {
  assetsCount: number;
  assetsPurchaseValue: number;
  pendingRequestsCount: number;
  transferredAssetsCount: number;
}

@Injectable({ providedIn: 'root' })
export class DivisionHeadDashboardService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

 
  totalAssetsCount = signal<number>(0);

  /**
   * GET: api/divisions/{divisionId}/overview-summary
   */
  getDivisionOverviewSummary(divisionId: number): Observable<DivisionOverviewSummary> {
    return this.http.get<DivisionOverviewSummary>(`${this.baseUrl}/divisions/${divisionId}/overview-summary`)
      .pipe(
        catchError((error) => {
          console.error('Error fetching division summary:', error);
         
          return of({
            assetsCount: 0,
            assetsPurchaseValue: 0,
            pendingRequestsCount: 0,
            transferredAssetsCount: 0
          });
        })
      );
  }

  
  updateAssetCount(count: number) {
    this.totalAssetsCount.set(count);
  }
}