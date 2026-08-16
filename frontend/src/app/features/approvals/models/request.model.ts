export interface RequestItem {
  id: number;
  requestNumber?: string;
  name?: string;
  employee?: string;
  requesterId?: string;
  employeeId?: string;
  status: string; // Using string to allow all workflow statuses like PendingDivisionHeadApproval, etc.
  assetName: string;
  category?: string;
  division?: string;
  date: string;
  reason?: string;
  quantity?: number;
  description?: string;
  priority: string;
  type: string;
  assigneeName?: string;
}

