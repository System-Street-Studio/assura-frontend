export interface Product {
  id: number | string;
  name: string;
  manufacturer?: string;
  modelNumber?: string;
  description?: string;
  selected?: boolean;
}
