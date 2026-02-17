import { RoleName } from '../constants/roles';

// TODO: Expand interfaces as backend API contracts are finalized

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: RoleName;
  divisionId: number;
  isActive: boolean;
}

export interface Asset {
  id: number;
  name: string;
  assetCode: string;
  description: string;
  divisionId: number;
  status: string;
  purchaseDate: string;
  purchasePrice: number;
  depreciationRate: number;
  currentValue: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
