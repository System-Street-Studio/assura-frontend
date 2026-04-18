
export interface RequestItem {
  id: number;
  requesterId?: number;
  requestNumber?: string;
  name?: string;
  employee?: string;
  status: string;
  assetName: string;
  category?: string;
  division?: string;
  date: string;
  reason?: string;
  quantity?: number;
  description?: string;
  priority: string;
  type: string;
}