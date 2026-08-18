import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Asset, AssetDetail, AvailableCheckoutAsset } from '../models/asset.model';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/auth/auth.service';
import { RequestCache } from '../../../core/services/request-cache';

@Injectable({ providedIn: 'root' })
export class AssetService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/assets`;

  /**
   * TTL is 0 on purpose: the asset list is something users create, edit and delete, so it is
   * always revalidated. The cache still earns its keep by de-duplicating concurrent calls and
   * by backing {@link peekAll}, which lets a page render instantly while the refresh runs.
   */
  private readonly listCache = new RequestCache<AssetDetail[]>(0);

  /** The API filters by role and by `onlyMine`, so both belong in the key. */
  private cacheKey(onlyMine: boolean): string {
    return `${this.auth.getUserId() ?? 'anon'}:${onlyMine}`;
  }

  /**
   * The last asset list received, or `undefined` on a first visit. Render it immediately and
   * subscribe to {@link getAll} for the authoritative version.
   */
  peekAll(onlyMine = false): AssetDetail[] | undefined {
    return this.listCache.snapshot(this.cacheKey(onlyMine));
  }

  getAll(onlyMine = false): Observable<AssetDetail[]> {
    const url = onlyMine ? `${this.apiUrl}?onlyMine=true` : this.apiUrl;
    return this.listCache.get(this.cacheKey(onlyMine), () => this.http.get<AssetDetail[]>(url));
  }

  /** Drops the cached list; the next {@link getAll} refetches. */
  invalidateList(): void {
    this.listCache.invalidate();
  }

  getAssetById(id: number | string): Observable<AssetDetail> {
    return this.http.get<AssetDetail>(`${this.apiUrl}/${id}`);
  }

  getAvailableForCheckout(): Observable<AvailableCheckoutAsset[]> {
    return this.http.get<AvailableCheckoutAsset[]>(`${this.apiUrl}/available-for-checkout`);
  }

  // Every mutation below drops the cached list so a stale snapshot is never shown after a write.

  deleteAsset(id: number | string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`).pipe(tap(() => this.invalidateList()));
  }

  updateAsset(asset: Asset): Observable<AssetDetail> {
    return this.http
      .put<AssetDetail>(`${this.apiUrl}/${asset.id}`, asset)
      .pipe(tap(() => this.invalidateList()));
  }

  createAsset(asset: Asset): Observable<AssetDetail> {
    return this.http.post<AssetDetail>(this.apiUrl, asset).pipe(tap(() => this.invalidateList()));
  }

  checkinAsset(
    id: number | string,
    condition: string,
    notes: string,
    damageSeverity?: string,
    repairNeeded = false,
    acknowledged = false,
    evidenceFileName?: string,
  ): Observable<AssetDetail> {
    return this.http
      .post<AssetDetail>(`${this.apiUrl}/${id}/checkin`, {
        condition,
        notes,
        damageSeverity,
        repairNeeded,
        acknowledged,
        evidenceFileName,
      })
      .pipe(tap(() => this.invalidateList()));
  }
}
