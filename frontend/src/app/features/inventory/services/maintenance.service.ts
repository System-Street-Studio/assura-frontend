import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
    MaintenanceRequest,
    MaintenanceStatus,
} from '../models/maintenance.model';

@Injectable({ providedIn: 'root' })
export class MaintenanceService {
    private requests: MaintenanceRequest[] = [
        {
            maintenanceNumber: 'MNT-001',
            assetId: '1',
            assetName: 'XPS 13"',
            category: 'Laptops',
            description: 'Screen flickering.',
            status: 'Pending',
            type: 'Repair',
            maintenanceDate: '2026-02-20',
            cost: 0,
        },
        {
            maintenanceNumber: 'MNT-002',
            assetId: '3',
            assetName: 'iPhone 15 Pro Max',
            category: 'Mobile Devices',
            description: 'Cracked screen.',
            status: 'In Progress',
            type: 'Replace',
            maintenanceDate: '2026-02-18',
            cost: 150,
        },
    ];

    getAll(): Observable<MaintenanceRequest[]> {
        return of(this.requests);
    }

    getById(id: string): Observable<MaintenanceRequest | undefined> {
        return of(this.requests.find((r) => r.maintenanceNumber === id));
    }

    updateStatus(
        id: string,
        status: MaintenanceStatus
    ): Observable<MaintenanceRequest> {
        const idx = this.requests.findIndex((r) => r.maintenanceNumber === id);
        if (idx !== -1) {
            this.requests[idx].status = status;
            return of(this.requests[idx]);
        }
        return of({} as MaintenanceRequest);
    }
}
