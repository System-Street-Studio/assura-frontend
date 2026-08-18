export interface AssetInformingDto {
    id: number;
    itemName: string;
    model?: string;
    warranty?: string;
    quantity: number;
    purchasedDate: string;
    purchasedPrice: number;
    status: string;
    divisionId: number;
    divisionName: string;
    targetEmployeeId?: number;
    targetEmployeeName?: string;
    remarks?: string;
    createdAt: string;
}

export interface InformStoresRequest {
    itemName: string;
    model?: string;
    warranty?: string;
    quantity: number;
    purchasedDate: string;
    purchasedPrice: number;
    divisionId: number;
    purchasingOrderId?: number;
}
export interface InformStakeholdersRequest {
    informingId: number;
    employeeId: number;
    divisionHeadNotify: boolean;
    remarks?: string;
}
