import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Asset } from '../../shared/models/asset.model';

@Injectable({
    providedIn: 'root'
})
export class AssetService {
    private api = inject(ApiService);

    getAssets(): Observable<Asset[]> {
        return this.api.get<Asset[]>('assets');
    }

    getAsset(id: number): Observable<Asset> {
        return this.api.get<Asset>(`assets/${id}`);
    }

    updateAssets(id: number, assetData: any): Observable<Asset> {
        return this.api.put<Asset>(`assets/${id}`, assetData);
    }

    updateAssetStatus(id: number, status: number): Observable<any> {
        return this.api.patch(`assets/${id}/status`, { status });
    }
}