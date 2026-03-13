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
}
