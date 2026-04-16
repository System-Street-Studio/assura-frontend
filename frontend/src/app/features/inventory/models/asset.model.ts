export type AssetStatus = 'InUse' | 'InStore' | 'UnderMaintenance' | 'Discarded' | 'Transferred' | 'Lost' | 'Deployed'; // Added 'Deployed' for compatibility

export interface Asset {
  id: number | string; // Internal frontend ID
  assetCode: string;
  assetId?: string; // Alias for assetCode
  name?: string;     // Alias for productName or custom name
  assetTag?: string;
  assetDate: string;
  status: AssetStatus;
  serialNumber?: string;
  serial?: string;      // Alias for serialNumber
  purchaseValue: number;
  purchaseCost?: number; // Alias for purchaseValue
  warranty?: string;
  notes?: string;
  categoryId: number;
  divisionId: number;
  productId: number;
  supplierId: number;
  assignedUserId?: number;
  qrCode?: string;
  selected?: boolean;

  // Compatibility fields for old pages if any
  orderNumber?: string;
  purchaseDate?: string;
  endOfLife?: string;
  album?: string;
  scheduleAudit?: string;
  category?: string;
  supplier?: string;
  department?: string;
  location?: string;
  value?: string;
  checkedOutTo?: string;
  dueBack?: string;
  owner?: any;
}

export interface AssetDetail extends Asset {
  productName: string;
  categoryName: string;
  divisionName: string;
  supplierName: string;
  assignedUserName?: string;
  checkedInBy?: string;
  checkedOutBy?: string;
  checkoutDate?: string;
  checkoutNotes?: string;
  checkinNotes?: string;
}

export interface AvailableCheckoutAsset {
  id: number;
  assetCode: string;
  productName: string;
  categoryName: string;
  serialNumber?: string;
}
