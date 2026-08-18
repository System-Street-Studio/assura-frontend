import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AssetOption, CreateGrnRequest, Grn, PurchasingOrderOption } from '../models/grn.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GrnService {
    private http = inject(HttpClient);
    private grnsApiUrl = `${environment.apiUrl}/grns`;
    private purchasingOrdersApiUrl = `${environment.apiUrl}/purchasingorders`;
    private assetsApiUrl = `${environment.apiUrl}/assets`;

    getAll(): Observable<Grn[]> {
        return this.http.get<Grn[] | null>(this.grnsApiUrl).pipe(
            map((grns) => Array.isArray(grns) ? grns : [])
        );
    }

    getById(id: number): Observable<Grn> {
        return this.http.get<Grn>(`${this.grnsApiUrl}/${id}`);
    }

    create(request: CreateGrnRequest): Observable<Grn> {
        return this.http.post<Grn>(this.grnsApiUrl, request);
    }

    getPurchasingOrderOptions(): Observable<PurchasingOrderOption[]> {
        return this.http
            .get<{ id: number; orderNumber: string; supplierName: string; issuedDate: string }[]>(
                this.purchasingOrdersApiUrl
            )
            .pipe(map((orders) => Array.isArray(orders) ? orders : []));
    }

    getAssetOptions(): Observable<AssetOption[]> {
        return this.http
            .get<{ id: number; assetCode: string; productName: string }[]>(this.assetsApiUrl)
            .pipe(map((assets) => Array.isArray(assets) ? assets : []));
    }
}
