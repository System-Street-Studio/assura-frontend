/**
 * Data required to create a new Purchasing Order (Request)
 */
export interface CreatePurchasingOrderRequest {
    supplierName: string;
    items: CreatePurchasingOrderItemDto[];
    requestId?: number;
    divisionId?: number;
}

/**
 * Data for a single item in a create-order request
 */
export interface CreatePurchasingOrderItemDto {
    itemName: string;
    model?: string;
    warranty?: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    vatPercentage: number;
    specialNote?: string;
}

/**
 * Full details of a Purchasing Order (Response)
 */
export interface PurchasingOrderDto {
    id: number;
    orderNumber: string;
    orderDate: string;
    totalAmount: number;
    status?: string;
    supplierName: string;
    divisionId?: number;
    divisionName?: string;
    items: PurchasingOrderItemDto[];
}

/**
 * Details of a single item within a Purchasing Order (Response)
 */
export interface PurchasingOrderItemDto {
    id: number;
    itemName: string;
    model?: string;
    warranty?: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    discount: number;
    discountedPrice: number;
    vatPercentage: number;
    vatAmount: number;
    totalPrice: number;
    specialNote?: string;
}

/**
 * Summary information for a Purchasing Order (Table view)
 */
export interface PurchasingOrderSummaryDto {
    id: number;
    orderNumber: string;
    issuedDate: Date | string;
    divisionId?: number;
    divisionName?: string;
    totalAmount?: number;
    status?: string;
    supplierName?: string;
}

/**
 * Data for a pending asset request (Table view)
 */
export interface AssetRequestDto {
    id: number;
    employeeName: string;
    divisionName: string;
    date: Date | string;
    specifications?: string;
    specialNote?: string;
    type?: string;
    description?: string;
    assetId?: number;
    assetName?: string;
}
