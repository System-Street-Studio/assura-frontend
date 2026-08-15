export interface Grn {
    id: number;
    grnNumber: string;
    receivedDate: string;
    receivedBy?: string;
    notes?: string;
    purchasingOrderId: number;
    purchasingOrderNumber: string;
    supplierName: string;
    assetId: number;
    assetCode: string;
    productName: string;
    createdAt: string;
}

export interface CreateGrnRequest {
    purchasingOrderId: number;
    assetId: number;
    receivedDate: string;
    receivedBy?: string;
    notes?: string;
}

export interface PurchasingOrderOption {
    id: number;
    orderNumber: string;
    supplierName: string;
    issuedDate: string;
}

export interface AssetOption {
    id: number;
    assetCode: string;
    productName: string;
}
