import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface PendingRoleUser {
  id: number;
  userId: string;
  name: string;
  joinedDate: string;
  email: string;
  division: string;
  requestedRole: string;
  phone: string;
  status: string;
}

export interface AssignedUser {
  id: number;
  userId: string;
  name: string;
  role: string;
  division: string;
  joinedDate: string;
  jobTitle?: string;
  status?: string;
}

export interface DivisionRoleAssignment {
  divisionId: number;
  role: string;
}

export interface RoleAssignmentPayload {
  assignments: DivisionRoleAssignment[];
  jobTitle?: string;
  notes?: string;
}

export interface HrOverviewStat {
  label: string;
  value: number;
}

export interface HrDivisionCount {
  division: string;
  users: number;
}

export interface HrOverview {
  stats: HrOverviewStat[];
  usersByDivision: HrDivisionCount[];
}

const SELECTED_PENDING_USER_ID_KEY = 'hrSelectedPendingUserId_dbId';

export interface Division {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class HrAssignmentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/hr`;

  readonly assignedUsers = signal<AssignedUser[]>([]);
  readonly pendingUsers = signal<PendingRoleUser[]>([]);
  readonly overview = signal<HrOverview | null>(null);

  getDivisions(): Observable<Division[]> {
    return this.http.get<Division[]>(`${environment.apiUrl}/divisions`);
  }

  getOverview(): Observable<HrOverview> {
    return this.http.get<HrOverview>(`${this.apiUrl}/overview`).pipe(
      tap(data => this.overview.set(data))
    );
  }

  getPendingUsers(search?: string): Observable<PendingRoleUser[]> {
    const params: any = {};
    if (search) params.search = search;
    return this.http.get<PendingRoleUser[]>(`${this.apiUrl}/pending-users`, { params }).pipe(
      tap(users => this.pendingUsers.set(users))
    );
  }

  getAssignedUsers(search?: string, division?: string, role?: string): Observable<AssignedUser[]> {
    const params: any = {};
    if (search) params.search = search;
    if (division) params.division = division;
    if (role) params.role = role;

    return this.http.get<AssignedUser[]>(`${this.apiUrl}/assigned-users`, { params }).pipe(
      tap(users => this.assignedUsers.set(users))
    );
  }

  getUserById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/${id}`);
  }

  selectPendingUser(id: number): void {
    localStorage.setItem(SELECTED_PENDING_USER_ID_KEY, id.toString());
  }

  getSelectedPendingUserId(): number | null {
    const id = localStorage.getItem(SELECTED_PENDING_USER_ID_KEY);
    return id ? parseInt(id, 10) : null;
  }

  assignRole(userId: number, payload: RoleAssignmentPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${userId}/assign-role`, payload);
  }

  updateUser(userId: number, payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}`, payload);
  }

  rejectUser(userId: number, notes?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${userId}/reject`, { notes });
  }

  getActivityLogs(search?: string): Observable<any[]> {
    const params: any = {};
    if (search) params.search = search;
    return this.http.get<any[]>(`${this.apiUrl}/activity-logs`, { params });
  }
}

