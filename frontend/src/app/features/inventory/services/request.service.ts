import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AssetRequest } from '../models/request.model';

@Injectable({ providedIn: 'root' })
export class RequestService {
  private requests: AssetRequest[] = [
    {
      id: 'REQ-001',
      requestedBy: 'Elliott Nolan',
      department: 'Marketing',
      email: 'e.nolan@company.com',
      assetName: 'MacBook Pro 16"',
      category: 'Laptops',
      quantity: 1,
      reason: 'Current laptop is over 4 years old and unable to run design software efficiently.',
      priority: 'High',
      status: 'Pending',
      requestDate: '2025-01-10',
    },
    {
      id: 'REQ-002',
      requestedBy: 'Sarah Kim',
      department: 'Engineering',
      email: 's.kim@company.com',
      assetName: 'Dell UltraSharp 27" Monitor',
      category: 'Monitors',
      quantity: 2,
      reason: 'Dual monitor setup needed for development work.',
      priority: 'Medium',
      status: 'Pending',
      requestDate: '2025-01-09',
    },
    {
      id: 'REQ-003',
      requestedBy: 'James Carter',
      department: 'Sales',
      email: 'j.carter@company.com',
      assetName: 'iPad Pro 12.9"',
      category: 'Tablets',
      quantity: 3,
      reason: 'Sales team needs tablets for client presentations and demos on the road.',
      priority: 'Urgent',
      status: 'Pending',
      requestDate: '2025-01-11',
    },
    {
      id: 'REQ-004',
      requestedBy: 'Lisa Zhang',
      department: 'HR',
      email: 'l.zhang@company.com',
      assetName: 'Logitech MX Keys + MX Master 3',
      category: 'Accessories',
      quantity: 5,
      reason: 'Ergonomic keyboard and mouse for new hires starting next month.',
      priority: 'Low',
      status: 'Approved',
      requestDate: '2025-01-05',
      responseDate: '2025-01-07',
      respondedBy: 'Admin',
      approverNotes: 'Approved — order placed with Logitech supplier.',
    },
    {
      id: 'REQ-005',
      requestedBy: 'Robert Nguyen',
      department: 'Engineering',
      email: 'r.nguyen@company.com',
      assetName: 'Cisco Catalyst Switch',
      category: 'Networking',
      quantity: 1,
      reason: 'Lab environment needs a managed switch for testing network configurations.',
      priority: 'High',
      status: 'Approved',
      requestDate: '2025-01-03',
      responseDate: '2025-01-04',
      respondedBy: 'Admin',
      approverNotes: 'Approved — check with Cisco supplier for availability.',
    },
    {
      id: 'REQ-006',
      requestedBy: 'Emily Watson',
      department: 'Finance',
      email: 'e.watson@company.com',
      assetName: 'HP LaserJet Pro',
      category: 'Printers',
      quantity: 1,
      reason: 'Finance department printer is broken beyond repair.',
      priority: 'Medium',
      status: 'Fulfilled',
      requestDate: '2024-12-20',
      responseDate: '2024-12-22',
      respondedBy: 'Admin',
      approverNotes: 'Fulfilled — asset AST-100045 assigned.',
    },
    {
      id: 'REQ-007',
      requestedBy: 'Michael Brown',
      department: 'Marketing',
      email: 'm.brown@company.com',
      assetName: 'iPhone 15 Pro',
      category: 'Mobile Devices',
      quantity: 1,
      reason: 'Need a company phone for social media content creation.',
      priority: 'Low',
      status: 'Rejected',
      requestDate: '2024-12-18',
      responseDate: '2024-12-20',
      respondedBy: 'Admin',
      approverNotes: 'Rejected — existing company phone is still functional. Re-request when current device fails.',
    },
    {
      id: 'REQ-008',
      requestedBy: 'Anna Martinez',
      department: 'Operations',
      email: 'a.martinez@company.com',
      assetName: 'Standing Desk Converter',
      category: 'Furniture',
      quantity: 10,
      reason: 'Wellness initiative — providing ergonomic desk options for the ops floor.',
      priority: 'Medium',
      status: 'Pending',
      requestDate: '2025-01-08',
    },
    {
      id: 'REQ-009',
      requestedBy: 'Tom Harris',
      department: 'Engineering',
      email: 't.harris@company.com',
      assetName: 'ThinkPad X1 Carbon',
      category: 'Laptops',
      quantity: 1,
      reason: 'Replacement needed — current device has a cracked screen and keyboard issues.',
      priority: 'Urgent',
      status: 'Approved',
      requestDate: '2025-01-11',
      responseDate: '2025-01-11',
      respondedBy: 'Admin',
      approverNotes: 'Urgent approval — assign from available stock.',
    },
    {
      id: 'REQ-010',
      requestedBy: 'Karen Lee',
      department: 'Design',
      email: 'k.lee@company.com',
      assetName: 'Wacom Cintiq 22"',
      category: 'Accessories',
      quantity: 1,
      reason: 'Design team lead needs a drawing tablet for illustration and UI work.',
      priority: 'High',
      status: 'Cancelled',
      requestDate: '2024-12-15',
      responseDate: '2024-12-28',
      approverNotes: 'Cancelled by requester — purchased personally.',
    },
    {
      id: 'REQ-011',
      requestedBy: 'David Park',
      department: 'IT',
      email: 'd.park@company.com',
      assetName: 'Dell PowerEdge Server',
      category: 'IT Equipment',
      quantity: 2,
      reason: 'Data center expansion — two additional rack servers needed for Q1 migration.',
      priority: 'Urgent',
      status: 'Pending',
      requestDate: '2025-01-12',
    },
    {
      id: 'REQ-012',
      requestedBy: 'Evelyn Lopez',
      department: 'Customer Support',
      email: 'e.lopez@company.com',
      assetName: 'Jabra Evolve2 85 Headset',
      category: 'Accessories',
      quantity: 8,
      reason: 'Support team needs noise-cancelling headsets for the open-plan office.',
      priority: 'Medium',
      status: 'Pending',
      requestDate: '2025-01-10',
    },
  ];

  getAll(): Observable<AssetRequest[]> {
    return of(this.requests.map((r) => ({ ...r })));
  }

  getById(id: string): Observable<AssetRequest | undefined> {
    return of(this.requests.find((r) => r.id === id));
  }

  approve(id: string, notes: string): Observable<AssetRequest> {
    const idx = this.requests.findIndex((r) => r.id === id);
    if (idx !== -1) {
      this.requests[idx] = {
        ...this.requests[idx],
        status: 'Approved',
        responseDate: new Date().toISOString().split('T')[0],
        respondedBy: 'Storekeeper',
        approverNotes: notes,
      };
    }
    return of(this.requests[idx]);
  }

  reject(id: string, notes: string): Observable<AssetRequest> {
    const idx = this.requests.findIndex((r) => r.id === id);
    if (idx !== -1) {
      this.requests[idx] = {
        ...this.requests[idx],
        status: 'Rejected',
        responseDate: new Date().toISOString().split('T')[0],
        respondedBy: 'Storekeeper',
        approverNotes: notes,
      };
    }
    return of(this.requests[idx]);
  }

  fulfill(id: string): Observable<AssetRequest> {
    const idx = this.requests.findIndex((r) => r.id === id);
    if (idx !== -1) {
      this.requests[idx] = {
        ...this.requests[idx],
        status: 'Fulfilled',
        responseDate: new Date().toISOString().split('T')[0],
      };
    }
    return of(this.requests[idx]);
  }
}
