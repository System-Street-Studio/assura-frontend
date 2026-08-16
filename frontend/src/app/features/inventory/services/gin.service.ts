import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { CreateGinRequest, Gin, GrnOption } from '../models/gin.model';
import { Grn } from '../models/grn.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GinService {
    private http = inject(HttpClient);
    private ginsApiUrl = `${environment.apiUrl}/gins`;
    private grnsApiUrl = `${environment.apiUrl}/grns`;

    getAll(): Observable<Gin[]> {
        return this.http.get<Gin[] | null>(this.ginsApiUrl).pipe(
            map((gins) => Array.isArray(gins) ? gins : [])
        );
    }

    getById(id: number): Observable<Gin> {
        return this.http.get<Gin>(`${this.ginsApiUrl}/${id}`);
    }

    create(request: CreateGinRequest): Observable<Gin> {
        return this.http.post<Gin>(this.ginsApiUrl, request);
    }

    // GIN issues out the exact asset a GRN brought in, so the picker offers GRNs
    // rather than assets directly — picking a GRN determines the asset.
    getGrnOptions(): Observable<GrnOption[]> {
        return this.http.get<Grn[] | null>(this.grnsApiUrl).pipe(
            map((grns) => Array.isArray(grns)
                ? grns.map((g) => ({
                    id: g.id,
                    grnNumber: g.grnNumber,
                    assetId: g.assetId,
                    assetCode: g.assetCode,
                    productName: g.productName,
                }))
                : [])
        );
    }
}
