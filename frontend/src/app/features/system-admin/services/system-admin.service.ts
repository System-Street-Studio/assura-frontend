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

export interface SystemAdminUser {
    id: number;
    username: string;
    email: string;
    role?: string;
    isLocked: boolean;
    isActive: boolean;
    employmentStatus: string;
}

export interface SystemAdminAuditLog {
    id: number;
    entityName: string;
    action: string;
    ipAddress?: string;
    createdAt: string;
    createdBy?: string;
    oldValues?: string;
    newValues?: string;
}

@Injectable({ providedIn: 'root' })
export class SystemAdminService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/SystemAdmin`;

    getDashboardStats(): Observable<SystemAdminDashboardStats> {
        return this.http.get<SystemAdminDashboardStats>(`${this.apiUrl}/dashboard`);
    }

    getUsers(): Observable<SystemAdminUser[]> {
        return this.http.get<SystemAdminUser[]>(`${this.apiUrl}/users`);
    }

    getSecurityLogs(): Observable<SystemAdminAuditLog[]> {
        return this.http.get<SystemAdminAuditLog[]>(`${this.apiUrl}/security-logs`);
    }

    toggleUserLock(userId: number): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/users/${userId}/toggle-lock`, {});
    }

    downloadSqlBackup(): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/backup-sql`, { responseType: 'blob' });
    }

    getSystemErrorLogs(): Observable<SystemAdminAuditLog[]> {
        return this.http.get<SystemAdminAuditLog[]>(`${this.apiUrl}/error-logs`);
    }

    resetUserPassword(userId: number): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/users/${userId}/reset-password`, {});
    }
}
