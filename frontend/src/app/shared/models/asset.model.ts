export interface Asset {
    id: string;
    assetCode: string;
    assetTag?: string;
    assetDate: Date;
    status: string; 
    categoryName: string;
    divisionName: string;
    productName: string;
    assignedUserName?: string;
}
