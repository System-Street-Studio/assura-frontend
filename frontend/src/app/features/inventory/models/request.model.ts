export interface AssetRequest {
  id: number | string;
  requestNumber?: string;
  requestedBy: string;
  requesterName?: string;
  department: string;
  email: string;
  assetName: string;
  category?: string;
  assetCategory?: string;
  quantity: number;
  reason: string;
  description?: string;
  priority: RequestPriority;
  status: RequestStatus;
  requestDate: string;
  createdAt?: string;
  responseDate?: string;
  respondedBy?: string;
  approverNotes?: string;
  selected?: boolean;
}

export type RequestPriority = 'Urgent' | 'High' | 'Medium' | 'Normal' | 'Low';

export type RequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'Fulfilled' | 'Cancelled';
