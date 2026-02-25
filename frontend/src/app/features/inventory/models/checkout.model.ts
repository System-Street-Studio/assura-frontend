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
  checkoutNotes?: string;
  checkinNotes?: string;
  status: CheckoutStatus;
  checkedOutBy: string;
  checkedInBy?: string;
  selected?: boolean;
}

export interface CheckoutFormData {
  assetId: string;
  checkedOutTo: string;
  department: string;
  email: string;
  dueDate: string;
  notes: string;
}

export interface CheckinFormData {
  condition: 'Good' | 'Fair' | 'Damaged';
  notes: string;
}
