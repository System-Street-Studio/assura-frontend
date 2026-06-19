import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
    MaintenanceRequest,
    MaintenanceStats,
    SimilarAsset
} from '../models/maintenance.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MaintenanceService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/maintenances`;

    getAll(): Observable<MaintenanceRequest[]> {
        return this.http.get<MaintenanceRequest[]>(this.apiUrl);
    }

    getStats(): Observable<MaintenanceStats> {
        return this.http.get<MaintenanceStats>(`${this.apiUrl}/stats`);
    }

    getById(id: string | number): Observable<MaintenanceRequest> {
        return this.http.get<MaintenanceRequest>(`${this.apiUrl}/${id}`);
    }

    getSimilarAssets(id: string | number): Observable<SimilarAsset[]> {
        return this.http.get<SimilarAsset[]>(`${this.apiUrl}/${id}/similar-assets`);
    }

    create(request: Partial<MaintenanceRequest>): Observable<number> {
        return this.http.post<number>(this.apiUrl, request);
    }

    // Workflow actions
    approve(id: number): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/${id}/approve`, {});
    }

    start(id: number): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/${id}/start`, {});
    }

    assignTempAsset(id: number, replacementAssetId: number, notes?: string): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/${id}/assign-temp`, { replacementAssetId, notes });
    }

    sendForRepair(id: number, repairingFirmId?: number, notes?: string): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/${id}/send-for-repair`, { repairingFirmId, notes });
    }

    escalateToProcurement(id: number, notes?: string): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/${id}/escalate-procurement`, { notes });
    }

    complete(id: number): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/${id}/complete`, {});
    }

    reject(id: number, reason: string): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/${id}/reject`, { reason });
    }
}
