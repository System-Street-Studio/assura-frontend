
export interface RequestItem {
  id: number;
  name?: string;
  employee?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'In Progress';
  assetName: string;
  category?: string;
  date: string;
  reason?: string;
  quantity?: number;
  description?: string;
  priority: 'High' | 'Normal' | 'Low';
  type: 'NewAsset' | 'Transfer' | 'Maintenance' | 'Discard'; 
}