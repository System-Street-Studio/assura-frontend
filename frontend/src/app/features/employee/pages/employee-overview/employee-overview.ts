import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { AuthService } from '../../../../core/auth/auth.service';
import { AssetService, AssetRequest } from '../../services/asset-request.service';
import { DashboardService } from '../../../../features/inventory/services/dashboard.service';
import { DashboardData } from '../../../../features/inventory/models/dashboard.model';

interface RequestItem {
  id: number;
  item: string;
  requestDate: string;
  submittedBy: string;
  requestType: string;
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
  imports: [CommonModule, RouterModule, MatIcon],
  templateUrl: './employee-overview.html',
  styleUrls: ['./employee-overview.css']
})
export class EmployeeOverviewComponent implements OnInit {
  private authService = inject(AuthService);
  private assetService = inject(AssetService);
  private dashboardService = inject(DashboardService);

  isLoading = signal(true);
  pendingRequests = signal<RequestItem[]>([]);
  recentActivities = signal<Activity[]>([]);

  ngOnInit() {
    this.isLoading.set(true);
    const userId = this.authService.getUserId();
    if (!userId) {
      this.isLoading.set(false);
      return;
    }

    // Fetch Requests
    this.assetService.getEmployeeRequests(userId).subscribe({
      next: (data: AssetRequest[]) => {
        const pending = data
          .filter(r => r.status === 'Pending')
          .slice(0, 10) // Limit to latest 10 pending requests
          .map(r => ({
            id: r.id,
            item: r.assetName,
            requestDate: r.submittedDate,
            submittedBy: r.submittedBy,
            requestType: r.requestType,
            status: r.status,
            priority: (r.priority as any) || 'Medium'
          }));
        this.pendingRequests.set(pending);
         this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });

    // Fetch Dashboard Activity
  /*  this.dashboardService.getDashboardData().subscribe({
      next: (data: DashboardData) => {
        const activities = data.recentActivity.map(a => ({
          description: `${a.assetName} (${a.assetCode}) - ${a.action}`,
          timestamp: this.formatTimeAgo(new Date(a.timestamp))
        }));
        this.recentActivities.set(activities);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });*/
  }

  private formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }
}