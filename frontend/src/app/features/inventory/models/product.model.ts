export interface Product {
  id: string;
  name: string;
  image?: string;
  category: string;
  manufacturer: string;
  modelNumber: string;
  totalAssets: number;
  availableAssets: number;
  minQuantity: number;
  unitCost: number;
  depreciation: DepreciationMethod;
  eolMonths: number;
  notes?: string;
  createdAt: string;
  selected?: boolean;
}

export type DepreciationMethod = 'Straight Line' | 'Declining Balance' | 'Sum of Years' | 'None';

export type ProductCategory =
  | 'Laptops'
  | 'Mobile Devices'
  | 'Tablets'
  | 'Monitors'
  | 'Accessories'
  | 'Networking'
  | 'Printers'
  | 'Desktops';
