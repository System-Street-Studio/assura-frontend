export interface Asset {
    id: number;
    assetCode: string;
    assetTag?: string;
    assetDate: Date;
    status: string;
    serialNumber?: string;
    purchaseValue: number;
    warranty?: string;
    notes?: string;
    qrCode?: string;

    categoryId: number;
    categoryName: string;

    divisionId: number;
    divisionName: string;

    productId: number;
    productName: string;

    supplierId: number;
    supplierName: string;

    assignedUserId?: number;
    assignedUserName?: string;
}
