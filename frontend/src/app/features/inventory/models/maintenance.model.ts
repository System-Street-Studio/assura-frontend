export type MaintenanceStatus = 'PendingApproval' | 'Approved' | 'InProgress' | 'TempAssigned' | 'SentForRepair' | 'EscalatedToProcurement' | 'Completed' | 'Submitted' | 'Rejected';
export type MaintenanceType = 'Preventive' | 'Corrective' | 'Routine' | 'Emergency';

export interface MaintenanceRequest {
    id: number;
    maintenanceNumber: string;
    type: string;
    maintenanceDate: string;
    description?: string;
    cost: number;
    status: MaintenanceStatus;
    priority?: string;
    issueType?: string;
    notes?: string;

    // Asset info
    assetId: number;
    assetName: string;
    assetCode?: string;
    categoryId?: number;
    categoryName?: string;

    // Requester info
    requestedByUserId?: number;
    requestedByName?: string;
    requesterDivision?: string;

    // Approver info
    approvedByUserId?: number;
    approvedByName?: string;

    // Storekeeper info
    storekeeperUserId?: number;
    storekeeperName?: string;

    // Replacement asset info
    replacementAssetId?: number;
    replacementAssetCode?: string;
    replacementAssetName?: string;

    // Repairing firm
    repairingFirmId?: number;
    repairingFirmName?: string;

    // Timestamps
    approvedAt?: string;
    startedAt?: string;
    completedAt?: string;
    escalatedToProcurementAt?: string;
    
    // UI state
    selected?: boolean;
}

export interface MaintenanceStats {
    total: number;
    pendingApproval: number;
    approved: number;
    inProgress: number;
    tempAssigned: number;
    sentForRepair: number;
    escalatedToProcurement: number;
    completed: number;
    rejected: number;
    submitted: number;
}

export interface SimilarAsset {
    id: number;
    assetCode: string;
    productName: string;
    categoryName: string;
    serialNumber?: string;
    status: string;
    purchaseValue: number;
}
