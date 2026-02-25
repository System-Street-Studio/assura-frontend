export interface AssetRequest {
  id: string;
  requestedBy: string;
  department: string;
  email: string;
  assetName: string;
  category: string;
  quantity: number;
  reason: string;
  priority: RequestPriority;
  status: RequestStatus;
  requestDate: string;
  responseDate?: string;
  respondedBy?: string;
  approverNotes?: string;
  selected?: boolean;
}

export type RequestPriority = 'Urgent' | 'High' | 'Medium' | 'Low';

export type RequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'Fulfilled' | 'Cancelled';
