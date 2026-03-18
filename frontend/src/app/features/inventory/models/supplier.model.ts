export interface Supplier {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  category: SupplierCategory;
  status: SupplierStatus;
  rating: number;
  totalOrders: number;
  totalValue: number;
  contractExpiry: string;
  paymentTerms: string;
  notes?: string;
  createdAt: string;
  selected?: boolean;
}

export type SupplierCategory =
  | 'IT Equipment'
  | 'Office Supplies'
  | 'Furniture'
  | 'Networking'
  | 'Software'
  | 'Maintenance'
  | 'Electronics'
  | 'General';

export type SupplierStatus = 'Active' | 'Inactive' | 'Pending' | 'Blacklisted';
