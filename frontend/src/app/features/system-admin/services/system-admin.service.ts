import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface SystemAdminDashboardStats {
    totalDepartments: number;
    activeCategories: number;
    recentLogins: number;
    activeSessions: number;
    errorLogsCount: number;
    auditLogsCount: number;
    systemHealth: string;
}

@Injectable({ providedIn: 'root' })
export class SystemAdminService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/SystemAdmin`;

    getDashboardStats(): Observable<SystemAdminDashboardStats> {
        return this.http.get<SystemAdminDashboardStats>(`${this.apiUrl}/dashboard`);
    }
}
