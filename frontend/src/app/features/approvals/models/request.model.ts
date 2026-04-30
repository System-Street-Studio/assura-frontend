export interface RequestItem {
  id: number;
  requestNumber?: string;
  name?: string;
  employee?: string;
  requesterId?: string;
  employeeId?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'In Progress';
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