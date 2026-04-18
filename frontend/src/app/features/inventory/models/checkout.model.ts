export type CheckoutStatus = 'Checked Out' | 'Returned' | 'Overdue';

export interface CheckoutRecord {
    id: string;
    assetId: string;
    assetName: string;
    category: string;
    serial: string;
    checkedOutTo: string;
    department: string;
    email: string;
    checkoutDate: string;
    dueDate: string;
    returnDate?: string;
    condition?: 'Good' | 'Fair' | 'Damaged';
    damageSeverity?: 'Low' | 'Medium' | 'High' | 'Critical';
    repairNeeded?: boolean;
    acknowledged?: boolean;
    evidenceFileName?: string;
    maintenanceNumber?: string;
    checkoutNotes?: string;
    checkinNotes?: string;
    status: CheckoutStatus;
    checkedOutBy: string;
    checkedInBy?: string;
    selected?: boolean;
}

export interface CheckoutFormData {
    assetId: string;
    checkedOutToUserId: string;
    checkedOutTo: string;
    department: string;
    email: string;
    dueDate: string;
    notes: string;
}

export interface CheckinFormData {
    condition: 'Good' | 'Fair' | 'Damaged';
    damageSeverity?: 'Low' | 'Medium' | 'High' | 'Critical';
    repairNeeded: boolean;
    acknowledged: boolean;
    evidenceFileName?: string;
    notes: string;
}

export interface CheckoutEmployee {
    id: string;
    name: string;
    department: string;
    email: string;
}
