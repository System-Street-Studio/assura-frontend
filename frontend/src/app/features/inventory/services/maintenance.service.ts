import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
    MaintenanceRequest,
    MaintenanceStatus,
} from '../models/maintenance.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MaintenanceService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/Maintenances`;

    getAll(): Observable<MaintenanceRequest[]> {
        return this.http.get<MaintenanceRequest[]>(this.apiUrl);
    }

    getById(id: string | number): Observable<MaintenanceRequest> {
        return this.http.get<MaintenanceRequest>(`${this.apiUrl}/${id}`);
    }

    create(request: Partial<MaintenanceRequest>): Observable<number> {
        return this.http.post<number>(this.apiUrl, request);
    }

    updateStatus(
        id: string | number,
        status: MaintenanceStatus
    ): Observable<MaintenanceRequest> {
        return this.http.patch<MaintenanceRequest>(`${this.apiUrl}/${id}/status`, { status });
    }
}
