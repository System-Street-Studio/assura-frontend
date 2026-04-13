export interface MaintenanceDto {
    id: number;
    maintenanceNumber: string;
    type: string;
    maintenanceDate: string;
    description?: string;
    cost: number;
    status?: string;
    assetId: number;
    assetName: string;
    repairingFirmId?: number;
    repairingFirmName?: string;
}

export interface CreateMaintenanceRequest {
    maintenanceNumber: string;
    type: number;
    maintenanceDate: string;
    description?: string;
    cost: number;
    status?: string;
    assetId: number;
    repairingFirmId?: number;
}

export interface AssetSummaryDto {
    id: number;
    assetCode: string;
    assetName: string;
    productName: string;
    categoryName: string;
    divisionName: string;
    serialNumber?: string;
}

export interface RepairingFirmDto {
    id: number;
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;
}

export interface CreateRepairingFirmRequest {
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;
}
