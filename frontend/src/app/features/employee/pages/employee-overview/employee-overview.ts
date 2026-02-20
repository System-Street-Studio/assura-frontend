import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge';

interface RequestItem {
  item: string;
  date: string;
  status: string;
  priority: 'High' | 'Medium' | 'Low';
}

interface Activity {
  description: string;
  timestamp: string;
}

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent],
  templateUrl: './employee-overview.html',
  styleUrls: ['./employee-overview.css']
})
export class EmployeeOverviewComponent {
  
  pendingRequests = signal<RequestItem[]>([
    { item: 'Office Chair', date: '2025-05-20', status: 'Pending', priority: 'High' },
    { item: 'New Monitor', date: '2025-05-18', status: 'Pending', priority: 'Medium' },
    { item: 'Table', date: '2025-05-15', status: 'Pending', priority: 'Low' }
  ]);

  recentActivities = signal<Activity[]>([
    { description: 'New Laptop Pro 15 (ID: LPT-2023-001) assigned to you.', timestamp: '2 hours ago' },
    { description: 'Request for "External Monitor" status updated to "Pending Approval".', timestamp: 'Yesterday' },
    { description: 'Asset transfer of "Desktop PC" to j.perera is completed.', timestamp: '3 days ago' },
  
  ]);
}