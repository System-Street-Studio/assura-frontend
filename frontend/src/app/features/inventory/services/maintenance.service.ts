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
            id: 'MNT-001',
            assetId: '100000',
            assetName: 'XPS 13"',
            category: 'Laptops',
            requestedBy: 'Elliott Nolan',
            department: 'Marketing',
            issueType: 'Hardware Failure',
            description: 'Laptop screen flickering intermittently, worsens under load.',
            priority: 'High',
            status: 'Pending',
            type: 'Repair',
            requestDate: '2026-02-20',
        },
        {
            id: 'MNT-002',
            assetId: '100002',
            assetName: 'iPhone 15 Pro Max',
            category: 'Mobile Devices',
            requestedBy: 'Esta K. Ortiz',
            department: 'Sales',
            issueType: 'Physical Damage',
            description: 'Cracked screen after accidental drop. Touch input unresponsive.',
            priority: 'Critical',
            status: 'In Progress',
            type: 'Replace',
            requestDate: '2026-02-18',
            assignedTo: 'TechFix Solutions',
        },
        {
            id: 'MNT-003',
            assetId: '100001',
            assetName: 'ThinkPad E15 G4',
            category: 'Laptops',
            requestedBy: 'Evelyn Lopez',
            department: 'HR',
            issueType: 'Software Issue',
            description: 'Operating system fails to boot after latest update. Blue screen error.',
            priority: 'Medium',
            status: 'Pending',
            type: 'Repair',
            requestDate: '2026-02-22',
        },
        {
            id: 'MNT-004',
            assetId: '100007',
            assetName: 'Yoga 7',
            category: 'Tablets',
            requestedBy: 'Michael Torres',
            department: 'Design',
            issueType: 'Hardware Failure',
            description: 'Battery drains within 30 minutes, device overheats during charging.',
            priority: 'High',
            status: 'Forwarded',
            type: 'Replace',
            requestDate: '2026-02-15',
            storekeeperNotes: 'No replacement tablets in stock. Forwarded to procurement for new purchase.',
        },
        {
            id: 'MNT-005',
            assetId: '100003',
            assetName: 'XPS 13"',
            category: 'Laptops',
            requestedBy: 'Richard K. Cornejo',
            department: 'IT',
            issueType: 'Hardware Failure',
            description: 'Keyboard keys are sticking. Multiple keys unresponsive.',
            priority: 'Low',
            status: 'Completed',
            type: 'Repair',
            requestDate: '2026-02-10',
            resolvedDate: '2026-02-14',
            assignedTo: 'Internal IT Team',
            storekeeperNotes: 'Keyboard replaced. Asset returned to employee.',
        },
        {
            id: 'MNT-006',
            assetId: '100005',
            assetName: 'iPhone 15 Pro Max',
            category: 'Mobile Devices',
            requestedBy: 'Sarah Chen',
            department: 'Finance',
            issueType: 'Software Issue',
            description: 'Apps crash repeatedly. Storage appearing full despite recent cleanup.',
            priority: 'Medium',
            status: 'Rejected',
            type: 'Repair',
            requestDate: '2026-02-19',
            storekeeperNotes: 'Issue resolved via remote troubleshooting. No physical maintenance needed.',
        },
        {
            id: 'MNT-007',
            assetId: '100001',
            assetName: 'ThinkPad E15 G4',
            category: 'Laptops',
            requestedBy: 'James Wilson',
            department: 'Operations',
            issueType: 'Physical Damage',
            description: 'Hinge broken, screen wobbles when opened beyond 90 degrees.',
            priority: 'Critical',
            status: 'Pending',
            type: 'Repair',
            requestDate: '2026-02-24',
        },
        {
            id: 'MNT-008',
            assetId: '100000',
            assetName: 'XPS 13"',
            category: 'Laptops',
            requestedBy: 'Anna Martinez',
            department: 'Marketing',
            issueType: 'Hardware Failure',
            description: 'USB-C port not detecting external devices. Charging works intermittently.',
            priority: 'Medium',
            status: 'In Progress',
            type: 'Repair',
            requestDate: '2026-02-17',
            assignedTo: 'Dell Authorized Service',
        },
        {
            id: 'MNT-009',
            assetId: '100007',
            assetName: 'Yoga 7',
            category: 'Tablets',
            requestedBy: 'David Kim',
            department: 'Design',
            issueType: 'Other',
            description: 'Stylus input drifts significantly. Calibration does not resolve the issue.',
            priority: 'Low',
            status: 'Completed',
            type: 'Repair',
            requestDate: '2026-02-08',
            resolvedDate: '2026-02-12',
            assignedTo: 'Internal IT Team',
            storekeeperNotes: 'Digitizer recalibrated and firmware updated. Working normally.',
        },
        {
            id: 'MNT-010',
            assetId: '100002',
            assetName: 'iPhone 15 Pro Max',
            category: 'Mobile Devices',
            requestedBy: 'Lisa Thompson',
            department: 'Sales',
            issueType: 'Physical Damage',
            description: 'Device fell into water. Not powering on.',
            priority: 'Critical',
            status: 'Pending',
            type: 'Replace',
            requestDate: '2026-02-23',
        },
    ];

    getAll(): Observable<MaintenanceRequest[]> {
        return of(this.requests.map((r) => ({ ...r })));
    }

    getById(id: string): Observable<MaintenanceRequest | undefined> {
        const req = this.requests.find((r) => r.id === id);
        return of(req ? { ...req } : undefined);
    }

    updateStatus(
        id: string,
        status: MaintenanceStatus,
        notes?: string
    ): Observable<MaintenanceRequest> {
        const idx = this.requests.findIndex((r) => r.id === id);
        if (idx !== -1) {
            this.requests[idx] = {
                ...this.requests[idx],
                status,
                storekeeperNotes: notes || this.requests[idx].storekeeperNotes,
                resolvedDate:
                    status === 'Completed' ? new Date().toISOString().split('T')[0] : this.requests[idx].resolvedDate,
            };
            return of({ ...this.requests[idx] });
        }
        return of({} as MaintenanceRequest);
    }

    assignReplacement(
        id: string,
        replacementAssetId: string,
        notes?: string
    ): Observable<MaintenanceRequest> {
        const idx = this.requests.findIndex((r) => r.id === id);
        if (idx !== -1) {
            this.requests[idx] = {
                ...this.requests[idx],
                status: 'Completed',
                replacementAssetId,
                storekeeperNotes: notes || this.requests[idx].storekeeperNotes,
                resolvedDate: new Date().toISOString().split('T')[0],
            };
            return of({ ...this.requests[idx] });
        }
        return of({} as MaintenanceRequest);
    }
}
