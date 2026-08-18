export interface Product {
  id: number | string;
  name: string;
  manufacturer?: string;
  modelNumber?: string;
  description?: string;
  imageUrl?: string;
  selected?: boolean;
}

export interface ProductCreateRequest {
  name: string;
  manufacturer?: string;
  modelNumber?: string;
  description?: string;
}

export interface ProductUpdateRequest extends ProductCreateRequest {
  id: number;
}
