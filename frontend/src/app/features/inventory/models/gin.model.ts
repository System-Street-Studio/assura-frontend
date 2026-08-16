export interface Gin {
    id: number;
    ginNumber: string;
    assignedDate: string;
    condition?: string;
    notes?: string;
    grnId: number;
    grnNumber: string;
    assetId: number;
    assetCode: string;
    productName: string;
    assignedUserName?: string;
    createdAt: string;
}

export interface CreateGinRequest {
    grnId: number;
    assetId: number;
    assignedDate: string;
    condition?: string;
    notes?: string;
}

export interface GrnOption {
    id: number;
    grnNumber: string;
    assetId: number;
    assetCode: string;
    productName: string;
}
