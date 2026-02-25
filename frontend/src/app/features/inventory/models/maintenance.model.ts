export type MaintenanceStatus = 'Pending' | 'In Progress' | 'Completed' | 'Forwarded' | 'Rejected';
export type MaintenancePriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type MaintenanceType = 'Repair' | 'Replace';

export interface MaintenanceRequest {
    id: string;
    assetId: string;
    assetName: string;
    category: string;
    requestedBy: string;
    department: string;
    issueType: string;
    description: string;
    priority: MaintenancePriority;
    status: MaintenanceStatus;
    type: MaintenanceType;
    requestDate: string;
    resolvedDate?: string;
    assignedTo?: string;
    storekeeperNotes?: string;
    replacementAssetId?: string;
    selected?: boolean;
}
