import { Injectable, signal } from '@angular/core';

// PendingRoleUser represents employees waiting for HR to approve their system role.
export interface PendingRoleUser {
  userId: string;
  name: string;
  joinedDate: string;
  email: string;
  department: string;
  requestedRole: string;
  phone: string;
  status: string;
}

// AssignedUser is the smaller shape needed by screens that only display confirmed roles.
export interface AssignedUser {
  userId: string;
  name: string;
  role: string;
  division: string;
  joinedDate: string;
}

// The form submits only the fields needed to create or replace an assigned role row.
export interface RoleAssignmentPayload {
  employeeId: string;
  employeeName: string;
  department: string;
  role: string;
  effectiveDate: string;
}

// localStorage keys let this prototype keep assigned roles after a browser refresh.
const ASSIGNED_USERS_KEY = 'hrAssignedUsers';
const SELECTED_PENDING_USER_KEY = 'hrSelectedPendingUserId';
// Old demo rows are filtered out so stale browser data does not reintroduce removed examples.
const REMOVED_PLACEHOLDER_USER_IDS = new Set(['E977', 'E899', 'E900']);

@Injectable({
  providedIn: 'root',
})
export class HrAssignmentService {
  // Demo pending data drives the pending list until the backend endpoint is connected.
  readonly pendingUsers: PendingRoleUser[] = [
    {
      userId: 'E1223',
      name: 'Tharindu Shirashadana',
      joinedDate: '12 Jan 2020',
      email: 'tharindu.shirashadana@assura.lk',
      department: 'Information Technology',
      requestedRole: 'System Analyst',
      phone: '+94 77 120 4521',
      status: 'Waiting for HR approval',
    },
    {
      userId: 'E1224',
      name: 'Amarabandu Roopasinghe',
      joinedDate: '12 Jan 2026',
      email: 'amarabandu.roopasinghe@assura.lk',
      department: 'Finance',
      requestedRole: 'Accountant',
      phone: '+94 77 220 4310',
      status: 'Documents verified',
    },
    {
      userId: 'E1225',
      name: 'Nayana',
      joinedDate: '10 Jan 2026',
      email: 'nayana@assura.lk',
      department: 'Human Resource',
      requestedRole: 'HR Assistant',
      phone: '+94 77 330 8122',
      status: 'Role review pending',
    },
    {
      userId: 'E1226',
      name: 'Chamari de Silva',
      joinedDate: '09 Jan 2026',
      email: 'chamari.desilva@assura.lk',
      department: 'Procurement',
      requestedRole: 'Procurement Officer',
      phone: '+94 77 450 9021',
      status: 'Manager approval pending',
    },
    {
      userId: 'E1227',
      name: 'Harsha Silva',
      joinedDate: '09 Jan 2026',
      email: 'harsha.silva@assura.lk',
      department: 'Stores',
      requestedRole: 'Storekeeper',
      phone: '+94 77 540 1130',
      status: 'Waiting for HR approval',
    },
  ];

  // Default rows give the assigned screen useful content even before HR submits a new assignment.
  readonly defaultAssignedUsers: AssignedUser[] = [
    {
      userId: 'EMP001',
      name: 'Amanda Lee',
      role: 'HR Assistant',
      division: 'Human Resource',
      joinedDate: '09 Jan 2026',
    },
    {
      userId: 'EMP002',
      name: 'David Fernando',
      role: 'Network Technician',
      division: 'Information Technology',
      joinedDate: '12 Jan 2026',
    },
    {
      userId: 'EMP003',
      name: 'Lisa Perera',
      role: 'Operations Intern',
      division: 'Operations',
      joinedDate: '15 Jan 2026',
    },
    {
      userId: 'EMP004',
      name: 'Nimal Wijesinghe',
      role: 'Procurement Officer',
      division: 'Procurement',
      joinedDate: '18 Jan 2026',
    },
    {
      userId: 'EMP005',
      name: 'Kavindi Silva',
      role: 'Accountant',
      division: 'Finance',
      joinedDate: '21 Jan 2026',
    },
  ];

  // Signals notify every HR page immediately when the assigned-role list changes.
  readonly assignedUsers = signal<AssignedUser[]>(this.loadAssignedUsers());

  // Finds one pending employee so the assign form can be pre-filled from the selected row.
  getPendingUser(userId: string): PendingRoleUser | undefined {
    return this.pendingUsers.find((user) => user.userId === userId);
  }

  // Stores the row the HR user clicked before navigating to the assign form.
  selectPendingUser(userId: string): void {
    localStorage.setItem(SELECTED_PENDING_USER_KEY, userId);
  }

  // Reads the selected row back after route navigation creates the form component.
  getSelectedPendingUser(): PendingRoleUser | undefined {
    const userId = localStorage.getItem(SELECTED_PENDING_USER_KEY);
    return userId ? this.getPendingUser(userId) : undefined;
  }

  // Adds the new assignment first and removes any older row for the same employee.
  assignRole(payload: RoleAssignmentPayload): void {
    const assignedUser: AssignedUser = {
      userId: payload.employeeId,
      name: payload.employeeName,
      role: payload.role,
      division: payload.department,
      joinedDate: this.formatDate(payload.effectiveDate),
    };

    const nextUsers = [
      assignedUser,
      ...this.assignedUsers().filter((user) => user.userId !== assignedUser.userId),
    ];

    this.assignedUsers.set(nextUsers);
    // Persisting mirrors the signal state so a refresh does not lose the submitted role.
    localStorage.setItem(ASSIGNED_USERS_KEY, JSON.stringify(nextUsers));
  }

  private loadAssignedUsers(): AssignedUser[] {
    const savedUsers = localStorage.getItem(ASSIGNED_USERS_KEY);

    if (!savedUsers) {
      return this.defaultAssignedUsers;
    }

    try {
      // Keep user-created rows, then append current defaults so demo data can evolve safely.
      const parsedUsers = (JSON.parse(savedUsers) as AssignedUser[]).filter(
        (user) => !REMOVED_PLACEHOLDER_USER_IDS.has(user.userId),
      );
      const defaultUserIds = new Set(this.defaultAssignedUsers.map((user) => user.userId));
      const savedCustomUsers = parsedUsers.filter((user) => !defaultUserIds.has(user.userId));

      return [...savedCustomUsers, ...this.defaultAssignedUsers];
    } catch {
      // Bad browser storage should not break the HR pages; fall back to the known seed data.
      return this.defaultAssignedUsers;
    }
  }

  private formatDate(dateValue: string): string {
    if (!dateValue) {
      return 'Joined Date';
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      // If the browser sends an unexpected value, preserve it instead of hiding the data.
      return dateValue;
    }

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
