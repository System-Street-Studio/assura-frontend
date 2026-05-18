export type MaintenanceStatus = 'Pending' | 'In Progress' | 'Completed' | 'Forwarded' | 'Rejected';
export type MaintenanceType = 'Repair' | 'Replace';

export interface MaintenanceRequest {
    maintenanceNumber: string;
    assetId: string;
    assetName: string;
    category: string;
    description: string;
    status: MaintenanceStatus;
    type: MaintenanceType;
    maintenanceDate: string;
    cost: number;
    repairingFirmId?: string;
    selected?: boolean;
}
