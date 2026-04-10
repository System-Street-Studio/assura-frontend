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
}